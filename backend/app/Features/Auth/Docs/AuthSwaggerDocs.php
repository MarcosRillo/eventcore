<?php

namespace App\Features\Auth\Docs;

/**
 * @OA\Post(
 *     path="/api/v1/auth/login",
 *     summary="User Login",
 *     description="Authenticate user credentials and return access token",
 *     operationId="loginUser",
 *     tags={"Authentication"},
 *
 *     @OA\RequestBody(
 *         required=true,
 *         description="User credentials",
 *
 *         @OA\JsonContent(
 *             required={"email", "password"},
 *
 *             @OA\Property(property="email", type="string", format="email", example="admin@example.com"),
 *             @OA\Property(property="password", type="string", format="password", example="password123")
 *         )
 *     ),
 *
 *     @OA\Response(
 *         response=200,
 *         description="Login successful",
 *
 *         @OA\JsonContent(
 *
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="message", type="string", example="Login successful"),
 *             @OA\Property(property="data", type="object",
 *                 @OA\Property(property="user", ref="#/components/schemas/UserResource"),
 *                 @OA\Property(property="token", type="string", example="1|abcdef123456...")
 *             )
 *         )
 *     ),
 *
 *     @OA\Response(response=401, ref="#/components/responses/Unauthorized"),
 *     @OA\Response(response=422, ref="#/components/responses/ValidationError")
 * )
 *
 * @OA\Post(
 *     path="/api/v1/auth/logout",
 *     summary="User Logout",
 *     description="Revoke the current user's access token",
 *     operationId="logoutUser",
 *     tags={"Authentication"},
 *     security={{"bearerAuth":{}}},
 *
 *     @OA\Response(
 *         response=200,
 *         description="Logout successful",
 *
 *         @OA\JsonContent(
 *
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="message", type="string", example="Logout successful")
 *         )
 *     ),
 *
 *     @OA\Response(response=401, ref="#/components/responses/Unauthenticated"),
 *     @OA\Response(response=500, ref="#/components/responses/ServerError")
 * )
 *
 * @OA\Get(
 *     path="/api/v1/auth/me",
 *     summary="Get User Profile",
 *     description="Get the authenticated user's profile information",
 *     operationId="getUserProfile",
 *     tags={"Authentication"},
 *     security={{"bearerAuth":{}}},
 *
 *     @OA\Response(
 *         response=200,
 *         description="User profile retrieved successfully",
 *
 *         @OA\JsonContent(
 *
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="message", type="string", example="User profile retrieved successfully"),
 *             @OA\Property(property="data", ref="#/components/schemas/UserResource")
 *         )
 *     ),
 *
 *     @OA\Response(response=401, ref="#/components/responses/Unauthenticated"),
 *     @OA\Response(response=500, ref="#/components/responses/ServerError")
 * )
 */
class AuthSwaggerDocs
{
    // Virtual annotations class - no methods needed
}
