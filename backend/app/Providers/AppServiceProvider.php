<?php

namespace App\Providers;

use App\Models\Event;
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

        // Rate limiters
        $this->configureRateLimiting();
    }

    private function configureRateLimiting(): void
    {
        // Public endpoints — IP based (no auth available)
        RateLimiter::for('public', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip());
        });

        // Public heavy endpoints — tighter limit for expensive queries (search, stats, calendar)
        RateLimiter::for('public-heavy', function (Request $request) {
            return Limit::perMinute(20)->by($request->ip());
        });

        // Authenticated endpoints — user ID based with IP fallback
        RateLimiter::for('authenticated', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });
    }
}
