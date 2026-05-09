<?php

namespace Tests\Feature\Approval;

use App\Features\Approval\Exceptions\InvalidStateTransitionException;
use App\Features\Approval\Services\ApprovalStateMachine;
use App\Models\Event;
use App\Models\EventStatus;
use Database\Seeders\EventStatusesSeeder;
use Database\Seeders\EventTypesSeeder;
use Database\Seeders\OrganizationStatusesSeeder;
use Database\Seeders\OrganizationTypesSeeder;
use Database\Seeders\UserRolesSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ApprovalStateMachineTest extends TestCase
{
    use RefreshDatabase;

    private ApprovalStateMachine $stateMachine;

    protected function setUp(): void
    {
        parent::setUp();
        $this->stateMachine = new ApprovalStateMachine;
        $this->seed([
            UserRolesSeeder::class,
            EventStatusesSeeder::class,
            OrganizationStatusesSeeder::class,
            OrganizationTypesSeeder::class,
            EventTypesSeeder::class,
        ]);
    }

    #[Test]
    public function test_can_transition_from_draft_to_pending_internal_approval(): void
    {
        $result = $this->stateMachine->canTransition('draft', 'pending_internal_approval');

        $this->assertTrue($result);
    }

    #[Test]
    public function test_cannot_transition_from_draft_directly_to_published(): void
    {
        $result = $this->stateMachine->canTransition('draft', 'published');

        $this->assertFalse($result);
    }

    #[Test]
    public function test_can_transition_from_pending_internal_approval_to_approved_internal(): void
    {
        $result = $this->stateMachine->canTransition('pending_internal_approval', 'approved_internal');

        $this->assertTrue($result);
    }

    #[Test]
    public function test_can_transition_from_pending_internal_approval_to_requires_changes(): void
    {
        $result = $this->stateMachine->canTransition('pending_internal_approval', 'requires_changes');

        $this->assertTrue($result);
    }

    #[Test]
    public function test_can_transition_from_pending_internal_approval_to_rejected(): void
    {
        $result = $this->stateMachine->canTransition('pending_internal_approval', 'rejected');

        $this->assertTrue($result);
    }

    #[Test]
    public function test_can_transition_from_approved_internal_to_pending_public_approval(): void
    {
        $result = $this->stateMachine->canTransition('approved_internal', 'pending_public_approval');

        $this->assertTrue($result);
    }

    #[Test]
    public function test_can_transition_from_pending_public_approval_to_published(): void
    {
        $result = $this->stateMachine->canTransition('pending_public_approval', 'published');

        $this->assertTrue($result);
    }

    #[Test]
    public function test_cannot_transition_from_published_to_draft(): void
    {
        $result = $this->stateMachine->canTransition('published', 'draft');

        $this->assertFalse($result);
    }

    #[Test]
    public function test_can_cancel_from_any_non_terminal_state(): void
    {
        $states = ['draft', 'pending_internal_approval', 'approved_internal', 'pending_public_approval', 'published'];

        foreach ($states as $state) {
            $result = $this->stateMachine->canTransition($state, 'cancelled');
            $this->assertTrue($result, "Should be able to cancel from {$state}");
        }
    }

    #[Test]
    public function test_cancelled_is_terminal_state(): void
    {
        $this->assertTrue($this->stateMachine->isTerminalState('cancelled'));
        $this->assertEmpty($this->stateMachine->getAllowedTransitions('cancelled'));
    }

    #[Test]
    public function test_same_state_transition_is_never_valid(): void
    {
        $states = $this->stateMachine->getAllStatuses();

        foreach ($states as $state) {
            $result = $this->stateMachine->canTransition($state, $state);
            $this->assertFalse($result, "Same state transition should not be valid for {$state}");
        }
    }

    #[Test]
    public function test_can_resubmit_from_requires_changes(): void
    {
        $result = $this->stateMachine->canTransition('requires_changes', 'pending_internal_approval');

        $this->assertTrue($result);
    }

    #[Test]
    public function test_can_resubmit_from_rejected_as_new_draft(): void
    {
        $result = $this->stateMachine->canTransition('rejected', 'draft');

        $this->assertTrue($result);
    }

    #[Test]
    public function test_get_all_allowed_transitions_returns_correct_array(): void
    {
        $transitions = $this->stateMachine->getAllowedTransitions('draft');

        $this->assertContains('pending_internal_approval', $transitions);
        $this->assertContains('cancelled', $transitions);
        $this->assertNotContains('published', $transitions);
    }

    #[Test]
    public function test_get_all_statuses_returns_all_defined_statuses(): void
    {
        $statuses = $this->stateMachine->getAllStatuses();

        $this->assertContains('draft', $statuses);
        $this->assertContains('pending_internal_approval', $statuses);
        $this->assertContains('approved_internal', $statuses);
        $this->assertContains('pending_public_approval', $statuses);
        $this->assertContains('published', $statuses);
        $this->assertContains('requires_changes', $statuses);
        $this->assertContains('rejected', $statuses);
        $this->assertContains('cancelled', $statuses);
        $this->assertCount(8, $statuses);
    }

    #[Test]
    public function test_validate_transition_throws_exception_for_invalid_transition(): void
    {
        $status = EventStatus::where('status_code', 'draft')->first();
        $event = Event::factory()->create(['status_id' => $status->id]);

        $this->expectException(InvalidStateTransitionException::class);
        $this->expectExceptionMessage("Invalid state transition from 'draft' to 'published'");

        $this->stateMachine->validateTransition($event, 'published');
    }

    #[Test]
    public function test_validate_transition_does_not_throw_for_valid_transition(): void
    {
        $status = EventStatus::where('status_code', 'draft')->first();
        $event = Event::factory()->create(['status_id' => $status->id]);

        $this->stateMachine->validateTransition($event, 'pending_internal_approval');

        $this->assertTrue(true); // If no exception, test passes
    }

    #[Test]
    public function test_exception_contains_allowed_transitions(): void
    {
        $status = EventStatus::where('status_code', 'draft')->first();
        $event = Event::factory()->create(['status_id' => $status->id]);

        try {
            $this->stateMachine->validateTransition($event, 'published');
            $this->fail('Expected InvalidStateTransitionException');
        } catch (InvalidStateTransitionException $e) {
            $this->assertEquals('draft', $e->currentStatus);
            $this->assertEquals('published', $e->targetStatus);
            $this->assertContains('pending_internal_approval', $e->allowedTransitions);
            $this->assertContains('cancelled', $e->allowedTransitions);
        }
    }
}
