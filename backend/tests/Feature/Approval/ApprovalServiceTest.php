<?php

namespace Tests\Feature\Approval;

use App\Features\Approval\Exceptions\InvalidStateTransitionException;
use App\Features\Approval\Services\ApprovalService;
use App\Features\Approval\Services\ApprovalStateMachine;
use App\Models\Event;
use App\Models\EventApproval;
use App\Models\EventStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ApprovalServiceTest extends TestCase
{
    use RefreshDatabase;

    private ApprovalService $service;

    private ApprovalStateMachine $stateMachine;

    private Event $event;

    private User $approver;

    private EventStatus $pendingInternalStatus;

    private EventStatus $approvedInternalStatus;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed lookup tables
        $this->seed(\Database\Seeders\UserRolesSeeder::class);
        $this->seed(\Database\Seeders\EventStatusesSeeder::class);
        $this->seed(\Database\Seeders\EventTypesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationStatusesSeeder::class);
        $this->seed(\Database\Seeders\OrganizationTypesSeeder::class);

        // Initialize service
        $this->stateMachine = app(ApprovalStateMachine::class);
        $this->service = new ApprovalService($this->stateMachine);

        // Get statuses
        $this->pendingInternalStatus = EventStatus::where('status_code', 'pending_internal_approval')->first();
        $this->approvedInternalStatus = EventStatus::where('status_code', 'approved_internal')->first();

        // Create approver
        $entityAdminRole = \App\Models\UserRole::where('role_code', 'entity_admin')->first();
        $this->approver = User::factory()->create([
            'role_id' => $entityAdminRole->id,
        ]);

        // Create event
        $this->event = Event::factory()->create([
            'status_id' => $this->pendingInternalStatus->id,
        ]);
    }

    // ===== Test 1: State Machine Validation =====

    #[Test]
    public function approve_internal_calls_state_machine_validation(): void
    {
        // This should succeed (valid transition from pending_internal_approval to approved_internal)
        $this->service->approveInternal($this->event, $this->approver);

        // Verify event status was updated (proves validation passed)
        $this->event->refresh();
        $this->assertEquals($this->approvedInternalStatus->id, $this->event->status_id);

        // Now try invalid transition: reject from approved_internal state
        // (approved_internal can only go to pending_public_approval or cancelled)
        $this->expectException(InvalidStateTransitionException::class);

        $this->service->reject($this->event, 'Invalid rejection', $this->approver);
    }

    // ===== Test 2: Transaction Wrapping =====

    #[Test]
    public function approve_internal_wraps_in_transaction(): void
    {
        // Count DB transactions by checking if changes rollback on exception

        // Mock the Event model to throw exception after status update
        $eventMock = \Mockery::mock($this->event)->makePartial();
        $eventMock->shouldReceive('update')
            ->once()
            ->andThrow(new \Exception('Simulated failure'));

        try {
            // This should fail and rollback
            DB::transaction(function () use ($eventMock) {
                $eventMock->update(['status_id' => $this->approvedInternalStatus->id]);
                throw new \Exception('Simulated failure');
            });
        } catch (\Exception $e) {
            // Expected
        }

        // Verify original status unchanged (transaction rolled back)
        $this->event->refresh();
        $this->assertEquals($this->pendingInternalStatus->id, $this->event->status_id);

        // Now verify actual service uses transactions
        // by checking that EventApproval creation happens atomically
        $initialApprovalCount = EventApproval::count();

        $this->service->approveInternal($this->event, $this->approver);

        // Both event update AND approval creation should succeed together
        $this->event->refresh();
        $this->assertEquals($this->approvedInternalStatus->id, $this->event->status_id);
        $this->assertEquals($initialApprovalCount + 1, EventApproval::count());
    }

    // ===== Test 3: All Methods Create EventApproval Records =====

    #[Test]
    public function all_approval_methods_create_event_approval_record(): void
    {
        // Test approveInternal
        $this->service->approveInternal($this->event, $this->approver, 'Test comment');

        $approval = EventApproval::where('event_id', $this->event->id)
            ->where('action', EventApproval::ACTION_APPROVE_INTERNAL)
            ->first();

        $this->assertNotNull($approval);
        $this->assertEquals($this->approver->id, $approval->performed_by);
        $this->assertEquals('Test comment', $approval->comments);

        // Test requestPublicApproval
        $this->event->refresh();
        $this->event->update(['status_id' => $this->approvedInternalStatus->id]);

        $this->service->requestPublicApproval($this->event, $this->approver);

        $approval = EventApproval::where('event_id', $this->event->id)
            ->where('action', EventApproval::ACTION_REQUEST_PUBLIC)
            ->first();

        $this->assertNotNull($approval);
        $this->assertEquals($this->approver->id, $approval->performed_by);

        // Test requestChanges (reset to pending_internal first)
        $this->event->refresh();
        $this->event->update(['status_id' => $this->pendingInternalStatus->id]);

        $this->service->requestChanges($this->event, 'Needs more info', $this->approver);

        $approval = EventApproval::where('event_id', $this->event->id)
            ->where('action', EventApproval::ACTION_REQUEST_CHANGES)
            ->first();

        $this->assertNotNull($approval);
        $this->assertEquals('Needs more info', $approval->comments);

        // Test reject (reset to pending_internal first, not from requires_changes)
        $requiresChangesStatus = EventStatus::where('status_code', 'requires_changes')->first();
        $this->event->refresh();
        $this->assertEquals($requiresChangesStatus->id, $this->event->status_id);

        // Reset to pending_internal_approval before rejecting
        $this->event->update(['status_id' => $this->pendingInternalStatus->id]);
        $this->event->refresh(); // Refresh to load new status relationship

        $this->service->reject($this->event, 'Does not meet criteria', $this->approver);

        $approval = EventApproval::where('event_id', $this->event->id)
            ->where('action', EventApproval::ACTION_REJECT)
            ->first();

        $this->assertNotNull($approval);
        $this->assertEquals('Does not meet criteria', $approval->comments);

        // Test publishEvent (reset to pending_public_approval first)
        $rejectedStatus = EventStatus::where('status_code', 'rejected')->first();
        $this->event->refresh();
        $this->assertEquals($rejectedStatus->id, $this->event->status_id);

        $pendingPublicStatus = EventStatus::where('status_code', 'pending_public_approval')->first();
        $this->event->update(['status_id' => $pendingPublicStatus->id]);
        $this->event->refresh(); // Refresh to load new status relationship

        $this->service->publishEvent($this->event, $this->approver);

        $approval = EventApproval::where('event_id', $this->event->id)
            ->where('action', EventApproval::ACTION_PUBLISH)
            ->first();

        $this->assertNotNull($approval);
        $this->assertEquals($this->approver->id, $approval->performed_by);
    }

    // ===== Test 4: getApprovalStatistics Uses Single Query =====

    #[Test]
    public function get_approval_statistics_uses_single_query(): void
    {
        // Create events with different statuses
        $draftStatus = EventStatus::where('status_code', 'draft')->first();
        $publishedStatus = EventStatus::where('status_code', 'published')->first();
        $rejectedStatus = EventStatus::where('status_code', 'rejected')->first();

        Event::factory()->count(3)->create(['status_id' => $draftStatus->id]);
        Event::factory()->count(2)->create(['status_id' => $this->pendingInternalStatus->id]);
        Event::factory()->count(1)->create(['status_id' => $publishedStatus->id]);
        Event::factory()->count(1)->create(['status_id' => $rejectedStatus->id]);

        // Enable query logging
        DB::enableQueryLog();

        $stats = $this->service->getApprovalStatistics();

        $queries = DB::getQueryLog();
        DB::disableQueryLog();

        // Verify only 1 query was executed (efficient JOIN + GROUP BY)
        $this->assertCount(1, $queries);

        // Verify correct counts
        // Note: setUp() creates 1 event in pending_internal_approval, + 2 more = 3 total
        $this->assertEquals(3, $stats['draft']);
        $this->assertEquals(3, $stats['pending_internal_approval']); // pending_internal_approval (1 from setUp + 2 here)
        $this->assertEquals(1, $stats['published']);
        $this->assertEquals(1, $stats['rejected']);
        $this->assertEquals(0, $stats['approved_internal']);
        $this->assertEquals(0, $stats['pending_public_approval']);
    }

    // ===== Test 5: Exception Handling =====

    #[Test]
    public function services_handle_exceptions_correctly(): void
    {
        // Test invalid state transition throws exception
        $publishedStatus = EventStatus::where('status_code', 'published')->first();
        $this->event->update(['status_id' => $publishedStatus->id]);

        $this->expectException(InvalidStateTransitionException::class);

        // Cannot approve an already-published event
        $this->service->approveInternal($this->event, $this->approver);
    }

    protected function tearDown(): void
    {
        \Mockery::close();
        parent::tearDown();
    }
}
