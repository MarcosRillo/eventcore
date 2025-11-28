<?php

namespace App\Features\Categories\Docs;

/**
 * @OA\Get(
 *     path="/categories",
 *     summary="Get Categories",
 *     description="Get a paginated list of categories with optional filters",
 *     operationId="getCategories",
 *     tags={"Categories"},
 *     security={{"bearerAuth":{}}},
 *
 *     @OA\Parameter(
 *         name="search",
 *         in="query",
 *         description="Search term for filtering categories by name or description",
 *         required=false,
 *         @OA\Schema(type="string", example="marketing")
 *     ),
 *     @OA\Parameter(
 *         name="active",
 *         in="query",
 *         description="Filter by active status",
 *         required=false,
 *         @OA\Schema(type="boolean", example=true)
 *     ),
 *     @OA\Parameter(
 *         name="per_page",
 *         in="query",
 *         description="Number of items per page (default: 15)",
 *         required=false,
 *         @OA\Schema(type="integer", example=15, minimum=1, maximum=100)
 *     ),
 *
 *     @OA\Response(
 *         response=200,
 *         description="Categories retrieved successfully (Laravel Resource Collection with Pagination)",
 *         @OA\JsonContent(
 *             @OA\Property(property="data", type="array", @OA\Items(
 *                 @OA\Property(property="id", type="integer", example=1),
 *                 @OA\Property(property="name", type="string", example="Marketing"),
 *                 @OA\Property(property="slug", type="string", example="marketing"),
 *                 @OA\Property(property="description", type="string", example="Marketing related events"),
 *                 @OA\Property(property="color", type="string", example="#FF5733"),
 *                 @OA\Property(property="is_active", type="boolean", example=true),
 *                 @OA\Property(property="created_at", type="string", example="2025-08-15 10:30:00"),
 *                 @OA\Property(property="updated_at", type="string", example="2025-08-15 10:30:00")
 *             )),
 *             @OA\Property(property="current_page", type="integer", example=1),
 *             @OA\Property(property="last_page", type="integer", example=5),
 *             @OA\Property(property="per_page", type="integer", example=15),
 *             @OA\Property(property="total", type="integer", example=75),
 *             @OA\Property(property="from", type="integer", example=1),
 *             @OA\Property(property="to", type="integer", example=15)
 *         )
 *     )
 * )
 *
 * @OA\Post(
 *     path="/categories",
 *     summary="Create Category",
 *     description="Create a new category",
 *     operationId="createCategory",
 *     tags={"Categories"},
 *     security={{"bearerAuth":{}}},
 *
 *     @OA\RequestBody(
 *         required=true,
 *         description="Category data",
 *         @OA\JsonContent(
 *             required={"name"},
 *             @OA\Property(property="name", type="string", example="Marketing", maxLength=255),
 *             @OA\Property(property="description", type="string", example="Marketing related events"),
 *             @OA\Property(property="color", type="string", example="#FF5733", pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"),
 *             @OA\Property(property="is_active", type="boolean", example=true)
 *         )
 *     ),
 *
 *     @OA\Response(
 *         response=201,
 *         description="Category created successfully",
 *         @OA\JsonContent(
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="message", type="string", example="Category created successfully"),
 *             @OA\Property(property="data", type="object",
 *                 @OA\Property(property="id", type="integer", example=1),
 *                 @OA\Property(property="name", type="string", example="Marketing"),
 *                 @OA\Property(property="slug", type="string", example="marketing"),
 *                 @OA\Property(property="description", type="string", example="Marketing related events"),
 *                 @OA\Property(property="color", type="string", example="#FF5733"),
 *                 @OA\Property(property="is_active", type="boolean", example=true),
 *                 @OA\Property(property="created_at", type="string"),
 *                 @OA\Property(property="updated_at", type="string")
 *             )
 *         )
 *     )
 * )
 *
 * @OA\Get(
 *     path="/categories/{id}",
 *     summary="Get Category",
 *     description="Get a specific category by ID",
 *     operationId="getCategory",
 *     tags={"Categories"},
 *     security={{"bearerAuth":{}}},
 *
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         description="Category ID",
 *         required=true,
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *
 *     @OA\Response(
 *         response=200,
 *         description="Category retrieved successfully",
 *         @OA\JsonContent(
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="message", type="string", example="Category retrieved successfully"),
 *             @OA\Property(property="data", type="object",
 *                 @OA\Property(property="id", type="integer", example=1),
 *                 @OA\Property(property="name", type="string", example="Marketing"),
 *                 @OA\Property(property="slug", type="string", example="marketing"),
 *                 @OA\Property(property="description", type="string", example="Marketing related events"),
 *                 @OA\Property(property="color", type="string", example="#FF5733"),
 *                 @OA\Property(property="is_active", type="boolean", example=true),
 *                 @OA\Property(property="created_at", type="string"),
 *                 @OA\Property(property="updated_at", type="string")
 *             )
 *         )
 *     )
 * )
 *
 * @OA\Put(
 *     path="/categories/{id}",
 *     summary="Update Category",
 *     description="Update an existing category",
 *     operationId="updateCategory",
 *     tags={"Categories"},
 *     security={{"bearerAuth":{}}},
 *
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         description="Category ID",
 *         required=true,
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *
 *     @OA\RequestBody(
 *         required=true,
 *         description="Category data to update",
 *         @OA\JsonContent(
 *             @OA\Property(property="name", type="string", example="Marketing Updated", maxLength=255),
 *             @OA\Property(property="description", type="string", example="Updated marketing related events"),
 *             @OA\Property(property="color", type="string", example="#FF5733", pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"),
 *             @OA\Property(property="is_active", type="boolean", example=true)
 *         )
 *     ),
 *
 *     @OA\Response(
 *         response=200,
 *         description="Category updated successfully",
 *         @OA\JsonContent(
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="message", type="string", example="Category updated successfully"),
 *             @OA\Property(property="data", type="object",
 *                 @OA\Property(property="id", type="integer", example=1),
 *                 @OA\Property(property="name", type="string", example="Marketing Updated"),
 *                 @OA\Property(property="slug", type="string", example="marketing-updated"),
 *                 @OA\Property(property="description", type="string", example="Updated marketing related events"),
 *                 @OA\Property(property="color", type="string", example="#FF5733"),
 *                 @OA\Property(property="is_active", type="boolean", example=true),
 *                 @OA\Property(property="created_at", type="string"),
 *                 @OA\Property(property="updated_at", type="string")
 *             )
 *         )
 *     )
 * )
 *
 * @OA\Delete(
 *     path="/categories/{id}",
 *     summary="Delete Category",
 *     description="Delete an existing category",
 *     operationId="deleteCategory",
 *     tags={"Categories"},
 *     security={{"bearerAuth":{}}},
 *
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         description="Category ID",
 *         required=true,
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *
 *     @OA\Response(
 *         response=200,
 *         description="Category deleted successfully",
 *         @OA\JsonContent(
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="message", type="string", example="Category 'Marketing' deleted successfully")
 *         )
 *     )
 * )
 *
 * @OA\Patch(
 *     path="/categories/{id}/toggle-status",
 *     summary="Toggle Category Status",
 *     description="Toggle the active status of a category",
 *     operationId="toggleCategoryStatus",
 *     tags={"Categories"},
 *     security={{"bearerAuth":{}}},
 *
 *     @OA\Parameter(
 *         name="id",
 *         in="path",
 *         description="Category ID",
 *         required=true,
 *         @OA\Schema(type="integer", example=1)
 *     ),
 *
 *     @OA\Response(
 *         response=200,
 *         description="Category status toggled successfully",
 *         @OA\JsonContent(
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="message", type="string", example="Category status updated successfully"),
 *             @OA\Property(property="data", type="object",
 *                 @OA\Property(property="id", type="integer", example=1),
 *                 @OA\Property(property="name", type="string", example="Marketing"),
 *                 @OA\Property(property="is_active", type="boolean", example=false)
 *             )
 *         )
 *     )
 * )
 *
 * @OA\Get(
 *     path="/categories/active",
 *     summary="Get Active Categories",
 *     description="Get all active categories without pagination",
 *     operationId="getActiveCategories",
 *     tags={"Categories"},
 *     security={{"bearerAuth":{}}},
 *
 *     @OA\Response(
 *         response=200,
 *         description="Active categories retrieved successfully",
 *         @OA\JsonContent(
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="message", type="string", example="Active categories retrieved successfully"),
 *             @OA\Property(property="data", type="array", @OA\Items(
 *                 @OA\Property(property="id", type="integer", example=1),
 *                 @OA\Property(property="name", type="string", example="Marketing"),
 *                 @OA\Property(property="slug", type="string", example="marketing"),
 *                 @OA\Property(property="color", type="string", example="#FF5733")
 *             ))
 *         )
 *     )
 * )
 */
class CategorySwaggerDocs
{
    // Virtual annotations class - no methods needed
}
