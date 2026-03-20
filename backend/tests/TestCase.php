<?php

namespace Tests;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        // Force test-appropriate env BEFORE app boots:
        // Docker OS env vars override phpunit.xml even with force="true",
        // so we set them here to ensure correct test isolation.
        putenv('CACHE_STORE=array');
        putenv('LOG_CHANNEL=null');
        $_ENV['CACHE_STORE'] = 'array';
        $_ENV['LOG_CHANNEL'] = 'null';
        $_SERVER['CACHE_STORE'] = 'array';
        $_SERVER['LOG_CHANNEL'] = 'null';

        parent::setUp();
    }
}
