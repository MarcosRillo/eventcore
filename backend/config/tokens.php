<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Access Token Expiration
    |--------------------------------------------------------------------------
    |
    | This value determines how long access tokens remain valid, in minutes.
    | Default: 15 minutes for security.
    |
    */
    'access_token_expiration' => env('ACCESS_TOKEN_EXPIRATION', 15),

    /*
    |--------------------------------------------------------------------------
    | Refresh Token Expiration
    |--------------------------------------------------------------------------
    |
    | This value determines how long refresh tokens remain valid, in minutes.
    | Default: 10080 minutes (7 days).
    |
    */
    'refresh_token_expiration' => env('REFRESH_TOKEN_EXPIRATION', 10080),
];
