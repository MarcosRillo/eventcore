<?php

namespace App\Services;

use HTMLPurifier;
use HTMLPurifier_Config;

class HtmlSanitizer
{
    public static function clean(string $input, string $profile = 'default'): string
    {
        if ($input === '') {
            return '';
        }

        $cacheKey = 'html_purifier.'.$profile.'.'.md5($input);

        return cache()->remember($cacheKey, now()->addHour(), function () use ($input, $profile) {
            $settings = config("purifier.settings.{$profile}", []);
            $phpConfig = HTMLPurifier_Config::createDefault();

            foreach ($settings as $key => $value) {
                $phpConfig->set($key, $value);
            }

            $phpConfig->set('Core.Encoding', config('purifier.encoding', 'UTF-8'));

            $cachePath = config('purifier.cachePath', storage_path('app/purifier'));
            if ($cachePath) {
                $phpConfig->set('Cache.SerializerPath', $cachePath);
            }

            return (new HTMLPurifier($phpConfig))->purify($input);
        });
    }
}
