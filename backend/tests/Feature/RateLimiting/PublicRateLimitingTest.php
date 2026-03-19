<?php

namespace Tests\Feature\RateLimiting;

use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PublicRateLimitingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\UserRolesSeeder::class);
    }

    #[Test]
    public function test_public_events_has_rate_limit_headers(): void
    {
        $response = $this->getJson('/api/v1/public/events');

        $response->assertHeader('X-RateLimit-Limit', '60');
        $response->assertHeader('X-RateLimit-Remaining', '59');
    }

    #[Test]
    public function test_public_search_is_rate_limited_at_20_per_minute(): void
    {
        for ($i = 0; $i < 20; $i++) {
            $response = $this->getJson('/api/v1/public/events/search?q=test');
            $this->assertNotEquals(429, $response->status(),
                "Request #{$i} was unexpectedly rate limited");
        }

        // 21st request should be rate limited by public-heavy (20/min)
        $response = $this->getJson('/api/v1/public/events/search?q=test');
        $response->assertStatus(429);
    }

    #[Test]
    public function test_public_stats_is_rate_limited_at_20_per_minute(): void
    {
        for ($i = 0; $i < 20; $i++) {
            $response = $this->getJson('/api/v1/public/stats');
            $this->assertNotEquals(429, $response->status(),
                "Request #{$i} was unexpectedly rate limited");
        }

        // 21st request should be rate limited by public-heavy (20/min)
        $response = $this->getJson('/api/v1/public/stats');
        $response->assertStatus(429);
    }

    #[Test]
    public function test_public_rate_limit_returns_retry_after_header(): void
    {
        // Exhaust public-heavy limit on stats (20/min)
        for ($i = 0; $i < 21; $i++) {
            $this->getJson('/api/v1/public/stats');
        }

        $response = $this->getJson('/api/v1/public/stats');
        $response->assertStatus(429);
        $response->assertHeader('Retry-After');
    }

    #[Test]
    public function test_public_calendar_month_is_rate_limited_at_20_per_minute(): void
    {
        for ($i = 0; $i < 20; $i++) {
            $response = $this->getJson('/api/v1/public/events/calendar/2026/03');
            $this->assertNotEquals(429, $response->status(),
                "Request #{$i} was unexpectedly rate limited");
        }

        // 21st request should be rate limited by public-heavy (20/min)
        $response = $this->getJson('/api/v1/public/events/calendar/2026/03');
        $response->assertStatus(429);
    }
}
