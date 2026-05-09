<?php

use App\Models\Event;
use App\Models\EventAsyncDate;
use App\Models\EventFrequency;
use App\Models\EventOrigin;
use App\Models\EventRotationType;
use App\Models\EventService;
use App\Models\EventTheme;
use App\Models\Organization;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Migrates existing string/boolean/json data to normalized tables.
     */
    public function up(): void
    {
        DB::transaction(function () {
            $this->migrateStringFieldsToFKs();
            $this->migrateServicesToPivot();
            $this->migrateAsyncDatesToTable();
        });
    }

    /**
     * Migrate string fields to foreign keys.
     */
    private function migrateStringFieldsToFKs(): void
    {
        // Load lookup tables into memory for faster access
        $origins = EventOrigin::pluck('id', 'code')->toArray();
        $themes = EventTheme::pluck('id', 'code')->toArray();
        $frequencies = EventFrequency::pluck('id', 'code')->toArray();
        $rotationTypes = EventRotationType::pluck('id', 'code')->toArray();
        $organizations = Organization::pluck('id', 'name')->toArray();

        // Process events in chunks
        Event::query()
            ->whereNotNull('id')
            ->chunkById(100, function ($events) use ($origins, $themes, $frequencies, $rotationTypes, $organizations) {
                foreach ($events as $event) {
                    $updates = [];

                    // Map origin string to FK
                    if (! empty($event->origin)) {
                        $originCode = $this->normalizeCode($event->origin);
                        if (isset($origins[$originCode])) {
                            $updates['origin_id'] = $origins[$originCode];
                        }
                    }

                    // Map theme string to FK
                    if (! empty($event->theme)) {
                        $themeCode = $this->normalizeCode($event->theme);
                        if (isset($themes[$themeCode])) {
                            $updates['theme_id'] = $themes[$themeCode];
                        }
                    }

                    // Map frequency string to FK
                    if (! empty($event->frequency)) {
                        $frequencyCode = $this->normalizeCode($event->frequency);
                        if (isset($frequencies[$frequencyCode])) {
                            $updates['frequency_id'] = $frequencies[$frequencyCode];
                        }
                    }

                    // Map rotation_type string to FK
                    if (! empty($event->rotation_type)) {
                        $rotationCode = $this->normalizeCode($event->rotation_type);
                        if (isset($rotationTypes[$rotationCode])) {
                            $updates['rotation_type_id'] = $rotationTypes[$rotationCode];
                        }
                    }

                    // Map producer string to organization FK
                    if (! empty($event->producer)) {
                        // Try exact match first
                        if (isset($organizations[$event->producer])) {
                            $updates['producer_id'] = $organizations[$event->producer];
                        }
                    }

                    if (! empty($updates)) {
                        Event::where('id', $event->id)->update($updates);
                    }
                }
            });
    }

    /**
     * Migrate boolean service fields to pivot table.
     */
    private function migrateServicesToPivot(): void
    {
        // Load service IDs
        $services = EventService::pluck('id', 'code')->toArray();

        // Map old column names to service codes
        $serviceMapping = [
            'coffee_break' => 'coffee_break',
            'lunch_catering' => 'lunch',
            'dinner_catering' => 'dinner',
            'pre_event_package' => 'pre_event',
            'post_event_package' => 'post_event',
            'virtual_transmission' => 'virtual',
        ];

        // Process events in chunks
        Event::query()
            ->whereNotNull('id')
            ->chunkById(100, function ($events) use ($services, $serviceMapping) {
                foreach ($events as $event) {
                    $servicesToAttach = [];

                    foreach ($serviceMapping as $column => $serviceCode) {
                        // Check if column exists and is true
                        if (isset($event->{$column}) && $event->{$column} === true) {
                            if (isset($services[$serviceCode])) {
                                $servicesToAttach[$services[$serviceCode]] = [
                                    'is_included' => true,
                                    'created_at' => now(),
                                    'updated_at' => now(),
                                ];
                            }
                        }
                    }

                    if (! empty($servicesToAttach)) {
                        // Use sync without detaching to avoid duplicates
                        DB::table('event_service')->insertOrIgnore(
                            array_map(fn ($serviceId, $pivot) => array_merge(
                                ['event_id' => $event->id, 'service_id' => $serviceId],
                                $pivot,
                            ), array_keys($servicesToAttach), $servicesToAttach),
                        );
                    }
                }
            });
    }

    /**
     * Migrate JSON async dates to table.
     */
    private function migrateAsyncDatesToTable(): void
    {
        Event::query()
            ->whereNotNull('asynchronous_dates')
            ->chunkById(100, function ($events) {
                foreach ($events as $event) {
                    $dates = $event->asynchronous_dates;

                    // Handle both array and JSON string
                    if (is_string($dates)) {
                        $dates = json_decode($dates, true);
                    }

                    if (is_array($dates) && ! empty($dates)) {
                        foreach ($dates as $date) {
                            try {
                                EventAsyncDate::firstOrCreate(
                                    [
                                        'event_id' => $event->id,
                                        'date_value' => $date,
                                    ],
                                    [
                                        'notes' => null,
                                    ],
                                );
                            } catch (Exception $e) {
                                Log::warning('Failed to migrate async date', [
                                    'event_id' => $event->id,
                                    'date' => $date,
                                    'error' => $e->getMessage(),
                                ]);
                            }
                        }
                    }
                }
            });
    }

    /**
     * Normalize string to code format (snake_case, lowercase).
     */
    private function normalizeCode(string $value): string
    {
        // Convert to lowercase
        $code = mb_strtolower($value);

        // Replace spaces and special characters with underscore
        $code = preg_replace('/[^a-z0-9]+/', '_', $code);

        // Remove leading/trailing underscores
        return trim($code, '_');
    }

    /**
     * Reverse the migrations.
     * Note: This is a data migration, reversing it would lose data.
     * The down() method clears the migrated data from normalized tables.
     */
    public function down(): void
    {
        // Clear pivot table data
        DB::table('event_service')->truncate();
        DB::table('event_room')->truncate();
        DB::table('event_async_dates')->truncate();

        // Reset FK columns to null
        Event::query()->update([
            'subtype_id' => null,
            'origin_id' => null,
            'theme_id' => null,
            'frequency_id' => null,
            'rotation_type_id' => null,
            'producer_id' => null,
        ]);
    }
};
