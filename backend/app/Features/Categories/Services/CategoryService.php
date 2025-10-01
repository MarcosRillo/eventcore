<?php

namespace App\Features\Categories\Services;

use App\Models\Category;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CategoryService
{
    /**
     * Get all categories with optional filters and pagination.
     * This method ALWAYS returns a LengthAwarePaginator object for consistent API responses.
     */
    public function getAllCategories(array $filters = []): LengthAwarePaginator
    {
        $query = Category::query();

        // Apply entity filter - scope to current user's organization
        $this->applyScopeFilter($query);

        // Apply search filter
        if (!empty($filters['search'])) {
            $this->applySearchFilter($query, $filters['search']);
        }

        // Apply active status filter
        if (isset($filters['active'])) {
            $this->applyActiveFilter($query, $filters['active']);
        }

        // Apply default ordering
        $this->applyDefaultOrdering($query);

        // Apply pagination - ALWAYS paginate to ensure consistent API response structure
        $perPage = $this->getPerPageValue($filters);

        // CRITICAL: This method MUST always return paginated results
        return $query->paginate($perPage);
    }

    /**
     * Create a new category.
     */
    public function createCategory(array $data, User $user): Category
    {
        try {
            return DB::transaction(function () use ($data, $user) {
                // Get the user's primary organization
                $organization = $user->organizations()->first();

                if (!$organization) {
                    throw new \Exception('User is not associated with any organization');
                }

                // Generate unique slug
                $slug = $this->generateUniqueSlug($data['name'], $organization->id);

                // Prepare category data with safe defaults
                $categoryData = [
                    'name' => $data['name'],
                    'slug' => $slug,
                    'entity_id' => $organization->id,
                    'description' => $data['description'] ?? null,
                    'color' => $data['color'] ?? null,
                    'is_active' => $data['is_active'] ?? true,
                ];

                $category = Category::create($categoryData);

                Log::info('Category created', [
                    'category_id' => $category->id,
                    'category_name' => $category->name,
                    'user_id' => $user->id
                ]);

                return $category;
            });
        } catch (\Exception $e) {
            Log::error('Failed to create category', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Update an existing category.
     */
    public function updateCategory(Category $category, array $data): Category
    {
        try {
            return DB::transaction(function () use ($category, $data) {
                $originalData = $category->toArray();

                // Update slug only if name is being updated
                if (isset($data['name']) && $data['name'] !== $category->name) {
                    $data['slug'] = $this->generateUniqueSlug(
                        $data['name'],
                        $category->entity_id,
                        $category->id
                    );
                }

                $category->update($data);

                Log::info('Category updated', [
                    'category_id' => $category->id,
                    'category_name' => $category->name,
                    'changes' => array_diff_assoc($data, $originalData)
                ]);

                return $category->fresh();
            });
        } catch (\Exception $e) {
            Log::error('Failed to update category', [
                'error' => $e->getMessage(),
                'category_id' => $category->id,
                'data' => $data
            ]);
            throw $e;
        }
    }

    /**
     * Delete a category.
     */
    public function deleteCategory(Category $category): string
    {
        try {
            return DB::transaction(function () use ($category) {
                $categoryId = $category->id;
                $categoryName = $category->name;

                $category->delete();

                Log::info('Category deleted', [
                    'category_id' => $categoryId,
                    'category_name' => $categoryName
                ]);

                return "Category '{$categoryName}' deleted successfully";
            });
        } catch (\Exception $e) {
            Log::error('Failed to delete category', [
                'error' => $e->getMessage(),
                'category_id' => $category->id,
                'category_name' => $category->name
            ]);
            throw $e;
        }
    }

    /**
     * Apply scope filter to limit categories to user's organization.
     */
    private function applyScopeFilter(Builder $query): void
    {
        // Note: In a real application, you might want to scope by user's organization
        // For now, we'll leave this as a placeholder for future implementation
        // $query->where('entity_id', auth()->user()->organization_id);
    }

    /**
     * Apply search filter to the query.
     */
    private function applySearchFilter(Builder $query, string $search): void
    {
        $search = trim($search);

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
    }

    /**
     * Apply active status filter to the query.
     */
    private function applyActiveFilter(Builder $query, mixed $active): void
    {
        $query->where('is_active', (bool) $active);
    }

    /**
     * Apply default ordering to the query.
     */
    private function applyDefaultOrdering(Builder $query): void
    {
        $query->orderBy('name', 'asc')
              ->orderBy('created_at', 'desc');
    }

    /**
     * Get the per_page value with validation and defaults.
     */
    private function getPerPageValue(array $filters): int
    {
        $perPage = $filters['per_page'] ?? 15;

        // Ensure per_page is within reasonable bounds
        $perPage = (int) $perPage;

        if ($perPage < 1) {
            $perPage = 15;
        }

        if ($perPage > 100) {
            $perPage = 100;
        }

        return $perPage;
    }

    /**
     * Generate a unique slug for a category within an organization.
     */
    private function generateUniqueSlug(string $name, int $entityId, ?int $excludeId = null): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 1;

        // Check if base slug is available
        while ($this->slugExists($slug, $entityId, $excludeId)) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Check if a slug already exists for the given entity.
     */
    private function slugExists(string $slug, int $entityId, ?int $excludeId = null): bool
    {
        $query = Category::where('slug', $slug)
                        ->where('entity_id', $entityId);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    /**
     * Get category statistics for the current entity.
     */
    public function getCategoryStats(): array
    {
        $query = Category::query();
        $this->applyScopeFilter($query);

        $total = $query->count();
        $active = $query->where('is_active', true)->count();
        $inactive = $total - $active;

        return [
            'total' => $total,
            'active' => $active,
            'inactive' => $inactive,
        ];
    }

    /**
     * Toggle category active status.
     */
    public function toggleCategoryStatus(Category $category): Category
    {
        $category->update([
            'is_active' => !$category->is_active
        ]);

        return $category->fresh();
    }

    /**
     * Get all active categories (useful for dropdowns and selects).
     */
    public function getActiveCategories(): \Illuminate\Database\Eloquent\Collection
    {
        $query = Category::query();

        // Apply scope filter if needed
        $this->applyScopeFilter($query);

        return $query->where('is_active', true)
                    ->orderBy('name', 'asc')
                    ->get();
    }
}
