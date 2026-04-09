<?php

namespace App\Providers;

use App\Models\Event;
use App\Models\EventFormat;
use App\Models\EventStatus;
use App\Models\EventType;
use App\Observers\EventCacheObserver;
use App\Observers\EventFormatCacheObserver;
use App\Observers\EventStatusCacheObserver;
use App\Observers\EventTypeCacheObserver;
use App\Policies\EventPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Model::preventLazyLoading(! $this->app->isProduction());

        // Register policies
        Gate::policy(Event::class, EventPolicy::class);

        // Cache invalidation observers
        Event::observe(EventCacheObserver::class);
        EventType::observe(EventTypeCacheObserver::class);
        EventStatus::observe(EventStatusCacheObserver::class);
        EventFormat::observe(EventFormatCacheObserver::class);

        // Rate limiters
        $this->configureRateLimiting();
    }

    private function configureRateLimiting(): void
    {
        // Public endpoints — IP based (no auth available)
        RateLimiter::for('public', function (Request $request) {
            $ip = $request->header('CF-Connecting-IP') ?? $request->ip();

            return Limit::perMinute(60)->by($ip);
        });

        // Public heavy endpoints — tighter limit for expensive queries (search, stats, calendar)
        RateLimiter::for('public-heavy', function (Request $request) {
            $ip = $request->header('CF-Connecting-IP') ?? $request->ip();

            return Limit::perMinute(20)->by($ip);
        });

        // Authenticated endpoints — user ID based with IP fallback
        RateLimiter::for('authenticated', function (Request $request) {
            $ip = $request->header('CF-Connecting-IP') ?? $request->ip();

            return Limit::perMinute(120)->by($request->user()?->id ?: $ip);
        });
    }
}
