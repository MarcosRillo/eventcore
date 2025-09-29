/**
 * Category Service
 * API service functions for category CRUD operations
 *
 * ARCHITECTURE RULES:
 * - All single item operations (CREATE, READ, UPDATE, DELETE) use ApiResponse<T> wrapper
 * - Collection operations (INDEX) use Laravel Resource Collection structure directly
 * - Consistent error handling across all methods
 * - TypeScript safety with proper typing
 */

import { AxiosResponse, AxiosError } from "axios";
import { apiClient } from "@/lib/api";
import {
  Category,
  CategoryPagination,
  CreateCategoryData,
  UpdateCategoryData,
  CategoryQueryParams,
} from "@/types/category.types";
import { ApiResponse, ApiError } from "@/types/api-response.types";

/**
 * Fetch paginated categories
 * Returns Laravel Resource Collection with pagination metadata
 */
export const getCategories = async (
  params: CategoryQueryParams = {}
): Promise<CategoryPagination> => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append("page", String(params.page));
  if (params.per_page) searchParams.append("per_page", String(params.per_page));
  if (params.search) searchParams.append("search", params.search);
  if (params.active !== undefined)
    searchParams.append("active", String(params.active));

  const response = await apiClient.get<CategoryPagination>(
    `/categories?${searchParams.toString()}`
  );
  return response;
};

/**
 * Get a single category by ID
 * Returns ApiResponse<Category> wrapper structure
 */
export const getCategory = async (id: number): Promise<Category> => {
  return await apiClient.get<Category>(`/categories/${id}`);
};

/**
 * Create a new category
 * Returns ApiResponse<Category> wrapper structure
 */
export const createCategory = async (
  categoryData: CreateCategoryData
): Promise<Category> => {
  try {
    const response: AxiosResponse<ApiResponse<Category>> = await apiClient.post(
      "/categories",
      {
        name: categoryData.name,
        description: categoryData.description || null,
        color: categoryData.color || null,
        is_active:
          categoryData.is_active !== undefined ? categoryData.is_active : true,
      }
    );

    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update an existing category
 * Returns ApiResponse<Category> wrapper structure
 */
export const updateCategory = async (
  id: number,
  categoryData: UpdateCategoryData
): Promise<Category> => {
  try {
    const response: AxiosResponse<ApiResponse<Category>> = await apiClient.put(
      `/categories/${id}`,
      {
        name: categoryData.name,
        description: categoryData.description,
        color: categoryData.color,
        is_active: categoryData.is_active,
      }
    );

    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a category
 * Returns success message only
 */
export const deleteCategory = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/categories/${id}`);

    // No return needed for delete operations
  } catch (error) {
    const axiosError = error as AxiosError<ApiError>;

    // Enhanced error handling for permission and not found errors
    if (
      axiosError.response?.status === 404 ||
      axiosError.response?.status === 403
    ) {
      throw new Error(
        "No tienes permiso para eliminar esta categoría o ya no existe."
      );
    }

    // For other errors, provide a user-friendly message
    const errorMessage =
      axiosError.response?.data?.message ||
      "Error al eliminar la categoría. Inténtalo de nuevo.";
    throw new Error(errorMessage);
  }
};

/**
 * Toggle category active status
 * Returns ApiResponse<Category> wrapper structure
 */
export const toggleCategoryStatus = async (id: number): Promise<Category> => {
  try {
    const response: AxiosResponse<ApiResponse<Category>> =
      await apiClient.patch(`/categories/${id}/toggle-status`);

    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get active categories only (useful for dropdowns/selects)
 * Returns ApiResponse<Category[]> wrapper structure
 */
export const getActiveCategories = async (): Promise<Category[]> => {
  try {
    console.log("📡 [CATEGORY SERVICE] Fetching active categories...");
    const response: AxiosResponse<ApiResponse<Category[]>> =
      await apiClient.get("/categories/active");

    console.log("✅ [CATEGORY SERVICE] Response received:", {
      status: response.status,
      dataStructure: response.data,
      categoriesArray: response.data.data,
      count: response.data.data?.length,
    });

    // FIX: Handle both formats (array direct or wrapped in .data)
    const categories = Array.isArray(response.data)
      ? response.data // Backend returns array directly
      : response.data.data; // Backend returns {data: [...]}

    console.log("🔧 [CATEGORY SERVICE] Normalized categories:", categories);
    return categories;
  } catch (error) {
    console.error("❌ [CATEGORY SERVICE] Error fetching categories:", error);
    throw error;
  }
};

/**
 * Search categories by name
 * Convenience method using getCategories with search parameter
 */
export const searchCategories = async (
  query: string,
  page: number = 1
): Promise<CategoryPagination> => {
  return getCategories({
    search: query,
    page,
    per_page: 15,
  });
};

/**
 * Batch update categories
 * Processes multiple updates sequentially
 */
export const batchUpdateCategories = async (
  updates: Array<{ id: number; data: UpdateCategoryData }>
): Promise<Category[]> => {
  try {
    const promises = updates.map(({ id, data }) => updateCategory(id, data));
    return await Promise.all(promises);
  } catch (error) {
    throw error;
  }
};

/**
 * Validate category data before submission
 * Client-side validation to reduce server round trips
 */
export const validateCategoryData = (
  data: CreateCategoryData | UpdateCategoryData
): string[] => {
  const errors: string[] = [];

  if ("name" in data && data.name !== undefined) {
    if (!data.name || data.name.trim().length === 0) {
      errors.push("Category name is required");
    } else if (data.name.trim().length < 2) {
      errors.push("Category name must be at least 2 characters long");
    } else if (data.name.trim().length > 255) {
      errors.push("Category name must not exceed 255 characters");
    }
  }

  if (data.description && data.description.length > 1000) {
    errors.push("Description must not exceed 1000 characters");
  }

  if (data.color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(data.color)) {
    errors.push("Color must be a valid hexadecimal color (e.g., #FF0000)");
  }

  return errors;
};

/**
 * Get public categories for public calendar (no auth required)
 */
export const getPublicCategories = async (): Promise<
  {
    id: number;
    name: string;
    slug: string;
    color: string;
    description?: string;
    event_count: number;
  }[]
> => {
  const response = await apiClient.get<
    {
      id: number;
      name: string;
      slug: string;
      color: string;
      description?: string;
      event_count: number;
    }[]
  >("/public/categories");
  return response;
};

/**
 * Export default object with all service functions
 */
const categoryService = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  getActiveCategories,
  searchCategories,
  batchUpdateCategories,
  validateCategoryData,
  getPublicCategories,
};

export default categoryService;
