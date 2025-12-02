<?php

namespace App\Features\Categories\Controllers;

use App\Http\Controllers\Controller;
use App\Features\Categories\Requests\StoreCategoryRequest;
use App\Features\Categories\Requests\UpdateCategoryRequest;
use App\Features\Categories\Requests\IndexCategoriesRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Features\Categories\Services\CategoryService;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Category Controller
 *
 * Handles category CRUD operations.
 * Swagger documentation is in App\Features\Categories\Docs\CategorySwaggerDocs
 */
class CategoryController extends Controller
{
    public function __construct(
        private CategoryService $categoryService
    ) {}

    /**
     * Display a listing of categories for the authenticated user's entity.
     */
    public function index(IndexCategoriesRequest $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $filters = $request->validated();
        $categories = $this->categoryService->getAllCategories($filters);

        return CategoryResource::collection($categories);
    }

    /**
     * Store a newly created category.
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        try {
            $category = $this->categoryService->createCategory(
                $request->validated(),
                $request->user()
            );

            return response()->json([
                'success' => true,
                'message' => 'Category created successfully',
                'data' => new CategoryResource($category),
            ], 201);
        } catch (QueryException $e) {
            Log::error('Database error creating category', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create category due to database error',
            ], 500);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Display the specified category.
     */
    public function show(Category $category): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Category retrieved successfully',
            'data' => new CategoryResource($category),
        ]);
    }

    /**
     * Update the specified category.
     */
    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        try {
            $updatedCategory = $this->categoryService->updateCategory(
                $category,
                $request->validated()
            );

            return response()->json([
                'success' => true,
                'message' => 'Category updated successfully',
                'data' => new CategoryResource($updatedCategory),
            ]);
        } catch (QueryException $e) {
            Log::error('Database error updating category', ['id' => $category->id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update category due to database error',
            ], 500);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(Category $category): JsonResponse
    {
        try {
            $message = $this->categoryService->deleteCategory($category);

            return response()->json([
                'success' => true,
                'message' => $message,
            ]);
        } catch (QueryException $e) {
            Log::error('Database error deleting category', ['id' => $category->id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete category. It may have associated events.',
            ], 409);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Toggle category active status.
     */
    public function toggleStatus(Category $category): JsonResponse
    {
        $updatedCategory = $this->categoryService->toggleCategoryStatus($category);

        return response()->json([
            'success' => true,
            'message' => 'Category status updated successfully',
            'data' => new CategoryResource($updatedCategory),
        ]);
    }

    /**
     * Get only active categories (useful for dropdowns).
     */
    public function active(): JsonResponse
    {
        $activeCategories = $this->categoryService->getActiveCategories();

        return response()->json([
            'success' => true,
            'message' => 'Active categories retrieved successfully',
            'data' => CategoryResource::collection($activeCategories),
        ]);
    }
}
