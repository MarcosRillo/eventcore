import { apiClient } from '@/lib/api'
import {
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
} from '../category.service'
import {
  Category,
  CategoryPagination,
  CreateCategoryData,
  UpdateCategoryData,
} from '@/types/category.types'
import { ApiResponse } from '@/types/api-response.types'
import { AxiosError, AxiosResponse } from 'axios'

// Mock apiClient
jest.mock('@/lib/api')

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

describe('category.service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCategories', () => {
    it('should fetch categories with default params', async () => {
      const mockResponse: CategoryPagination = {
        data: [
          { id: 1, name: 'Music', slug: 'music', is_active: true, color: '#FF0000' },
          { id: 2, name: 'Sports', slug: 'sports', is_active: true, color: '#00FF00' },
        ],
        meta: {
          current_page: 1,
          from: 1,
          last_page: 1,
          per_page: 10,
          to: 2,
          total: 2,
        },
        links: {
          first: 'http://api.example.com/categories?page=1',
          last: 'http://api.example.com/categories?page=1',
          prev: null,
          next: null,
        },
      }

      mockApiClient.get.mockResolvedValueOnce(mockResponse)

      const result = await getCategories()

      expect(mockApiClient.get).toHaveBeenCalledWith('/categories?')
      expect(result).toEqual(mockResponse)
      expect(result.data).toHaveLength(2)
    })

    it('should fetch categories with search param', async () => {
      const mockResponse: CategoryPagination = {
        data: [{ id: 1, name: 'Music', slug: 'music', is_active: true, color: '#FF0000' }],
        meta: {
          current_page: 1,
          from: 1,
          last_page: 1,
          per_page: 10,
          to: 1,
          total: 1,
        },
        links: {
          first: 'http://api.example.com/categories?page=1',
          last: 'http://api.example.com/categories?page=1',
          prev: null,
          next: null,
        },
      }

      mockApiClient.get.mockResolvedValueOnce(mockResponse)

      await getCategories({ search: 'Music' })

      expect(mockApiClient.get).toHaveBeenCalledWith('/categories?search=Music')
    })

    it('should fetch categories with pagination params', async () => {
      const mockResponse: CategoryPagination = {
        data: [],
        meta: {
          current_page: 2,
          from: 11,
          last_page: 3,
          per_page: 20,
          to: 30,
          total: 50,
        },
        links: {
          first: 'http://api.example.com/categories?page=1',
          last: 'http://api.example.com/categories?page=3',
          prev: 'http://api.example.com/categories?page=1',
          next: 'http://api.example.com/categories?page=3',
        },
      }

      mockApiClient.get.mockResolvedValueOnce(mockResponse)

      await getCategories({ page: 2, per_page: 20 })

      expect(mockApiClient.get).toHaveBeenCalledWith('/categories?page=2&per_page=20')
    })

    it('should fetch active categories only', async () => {
      const mockResponse: CategoryPagination = {
        data: [{ id: 1, name: 'Music', slug: 'music', is_active: true, color: '#FF0000' }],
        meta: {
          current_page: 1,
          from: 1,
          last_page: 1,
          per_page: 10,
          to: 1,
          total: 1,
        },
        links: {
          first: 'http://api.example.com/categories?page=1',
          last: 'http://api.example.com/categories?page=1',
          prev: null,
          next: null,
        },
      }

      mockApiClient.get.mockResolvedValueOnce(mockResponse)

      await getCategories({ active: true })

      expect(mockApiClient.get).toHaveBeenCalledWith('/categories?active=true')
    })
  })

  describe('getCategory', () => {
    it('should fetch a single category by ID', async () => {
      const mockCategory: Category = {
        id: 1,
        name: 'Music',
        slug: 'music',
        is_active: true,
        color: '#FF0000',
        description: 'Music events',
      }

      mockApiClient.get.mockResolvedValueOnce(mockCategory)

      const result = await getCategory(1)

      expect(mockApiClient.get).toHaveBeenCalledWith('/categories/1')
      expect(result).toEqual(mockCategory)
      expect(result.id).toBe(1)
      expect(result.name).toBe('Music')
    })
  })

  describe('createCategory', () => {
    it('should create a new category with all fields', async () => {
      const newCategoryData: CreateCategoryData = {
        name: 'Technology',
        description: 'Tech events',
        color: '#0000FF',
        is_active: true,
      }

      const mockResponse: AxiosResponse<ApiResponse<Category>> = {
        data: {
          success: true,
          message: 'Category created successfully',
          data: {
            id: 3,
            name: 'Technology',
            slug: 'technology',
            description: 'Tech events',
            color: '#0000FF',
            is_active: true,
          },
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      }

      mockApiClient.post.mockResolvedValueOnce(mockResponse)

      const result = await createCategory(newCategoryData)

      expect(mockApiClient.post).toHaveBeenCalledWith('/categories', {
        name: 'Technology',
        description: 'Tech events',
        color: '#0000FF',
        is_active: true,
      })
      expect(result.id).toBe(3)
      expect(result.name).toBe('Technology')
      expect(result.slug).toBe('technology')
    })

    it('should create category with minimal fields (name only)', async () => {
      const newCategoryData: CreateCategoryData = {
        name: 'Sports',
      }

      const mockResponse: AxiosResponse<ApiResponse<Category>> = {
        data: {
          success: true,
          message: 'Category created successfully',
          data: {
            id: 4,
            name: 'Sports',
            slug: 'sports',
            is_active: true,
            color: '#000000',
          },
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      }

      mockApiClient.post.mockResolvedValueOnce(mockResponse)

      const result = await createCategory(newCategoryData)

      expect(mockApiClient.post).toHaveBeenCalledWith('/categories', {
        name: 'Sports',
        description: null,
        color: null,
        is_active: true,
      })
      expect(result.name).toBe('Sports')
    })

    it('should handle creation errors', async () => {
      const newCategoryData: CreateCategoryData = {
        name: 'Invalid',
      }

      mockApiClient.post.mockRejectedValueOnce(new Error('Validation failed'))

      await expect(createCategory(newCategoryData)).rejects.toThrow('Validation failed')
    })
  })

  describe('updateCategory', () => {
    it('should update category with all fields', async () => {
      const updateData: UpdateCategoryData = {
        name: 'Updated Music',
        description: 'Updated description',
        color: '#FF00FF',
        is_active: false,
      }

      const mockResponse: AxiosResponse<ApiResponse<Category>> = {
        data: {
          success: true,
          message: 'Category updated successfully',
          data: {
            id: 1,
            name: 'Updated Music',
            slug: 'updated-music',
            description: 'Updated description',
            color: '#FF00FF',
            is_active: false,
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }

      mockApiClient.put.mockResolvedValueOnce(mockResponse)

      const result = await updateCategory(1, updateData)

      expect(mockApiClient.put).toHaveBeenCalledWith('/categories/1', updateData)
      expect(result.name).toBe('Updated Music')
      expect(result.is_active).toBe(false)
    })

    it('should update category with partial fields', async () => {
      const updateData: UpdateCategoryData = {
        name: 'Partially Updated',
      }

      const mockResponse: AxiosResponse<ApiResponse<Category>> = {
        data: {
          success: true,
          message: 'Category updated successfully',
          data: {
            id: 1,
            name: 'Partially Updated',
            slug: 'partially-updated',
            is_active: true,
            color: '#FF0000',
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }

      mockApiClient.put.mockResolvedValueOnce(mockResponse)

      const result = await updateCategory(1, updateData)

      expect(result.name).toBe('Partially Updated')
    })
  })

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      mockApiClient.delete.mockResolvedValueOnce({})

      await expect(deleteCategory(1)).resolves.not.toThrow()

      expect(mockApiClient.delete).toHaveBeenCalledWith('/categories/1')
    })

    it('should handle 404 error with custom message', async () => {
      const error: AxiosError = {
        response: {
          status: 404,
          data: { message: 'Category not found' },
          statusText: 'Not Found',
          headers: {},
          config: {} as any,
        },
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed with status code 404',
      }

      mockApiClient.delete.mockRejectedValueOnce(error)

      await expect(deleteCategory(1)).rejects.toThrow(
        'No tienes permiso para eliminar esta categoría o ya no existe.'
      )
    })

    it('should handle 403 error with custom message', async () => {
      const error: AxiosError = {
        response: {
          status: 403,
          data: { message: 'Forbidden' },
          statusText: 'Forbidden',
          headers: {},
          config: {} as any,
        },
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed with status code 403',
      }

      mockApiClient.delete.mockRejectedValueOnce(error)

      await expect(deleteCategory(1)).rejects.toThrow(
        'No tienes permiso para eliminar esta categoría o ya no existe.'
      )
    })

    it('should handle other errors with API message', async () => {
      const error: AxiosError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' },
          statusText: 'Internal Server Error',
          headers: {},
          config: {} as any,
        },
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed with status code 500',
      }

      mockApiClient.delete.mockRejectedValueOnce(error)

      await expect(deleteCategory(1)).rejects.toThrow('Internal server error')
    })
  })

  describe('toggleCategoryStatus', () => {
    it('should toggle category status', async () => {
      const mockResponse: AxiosResponse<ApiResponse<Category>> = {
        data: {
          success: true,
          message: 'Category status toggled',
          data: {
            id: 1,
            name: 'Music',
            slug: 'music',
            is_active: false,
            color: '#FF0000',
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }

      mockApiClient.patch.mockResolvedValueOnce(mockResponse)

      const result = await toggleCategoryStatus(1)

      expect(mockApiClient.patch).toHaveBeenCalledWith('/categories/1/toggle-status')
      expect(result.is_active).toBe(false)
    })
  })

  describe('getActiveCategories', () => {
    it('should fetch active categories when backend returns array with data wrapper', async () => {
      const mockCategories: Category[] = [
        { id: 1, name: 'Music', slug: 'music', is_active: true, color: '#FF0000' },
        { id: 2, name: 'Sports', slug: 'sports', is_active: true, color: '#00FF00' },
      ]

      // apiClient returns what backend sends
      // The code checks Array.isArray(response.data), so response needs .data property
      mockApiClient.get.mockResolvedValueOnce({ data: mockCategories })

      const result = await getActiveCategories()

      expect(mockApiClient.get).toHaveBeenCalledWith('/categories/active')
      expect(result).toEqual(mockCategories)
      expect(result).toHaveLength(2)
      expect(result.every((cat) => cat.is_active)).toBe(true)
    })

    it('should fetch active categories (wrapped in data)', async () => {
      const mockResponse: AxiosResponse<ApiResponse<Category[]>> = {
        data: {
          success: true,
          message: 'Active categories retrieved',
          data: [
            { id: 1, name: 'Music', slug: 'music', is_active: true, color: '#FF0000' },
            { id: 2, name: 'Sports', slug: 'sports', is_active: true, color: '#00FF00' },
          ],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }

      mockApiClient.get.mockResolvedValueOnce(mockResponse.data)

      const result = await getActiveCategories()

      expect(result).toHaveLength(2)
      expect(result.every((cat) => cat.is_active)).toBe(true)
    })
  })

  describe('searchCategories', () => {
    it('should search categories with default pagination', async () => {
      const mockResponse: CategoryPagination = {
        data: [{ id: 1, name: 'Music', slug: 'music', is_active: true, color: '#FF0000' }],
        meta: {
          current_page: 1,
          from: 1,
          last_page: 1,
          per_page: 15,
          to: 1,
          total: 1,
        },
        links: {
          first: 'http://api.example.com/categories?page=1',
          last: 'http://api.example.com/categories?page=1',
          prev: null,
          next: null,
        },
      }

      mockApiClient.get.mockResolvedValueOnce(mockResponse)

      const result = await searchCategories('Music')

      // Check that all params are present (order doesn't matter with URLSearchParams)
      const callArg = mockApiClient.get.mock.calls[0][0] as string
      expect(callArg).toContain('search=Music')
      expect(callArg).toContain('page=1')
      expect(callArg).toContain('per_page=15')
      expect(result.data).toHaveLength(1)
    })

    it('should search categories with custom page', async () => {
      const mockResponse: CategoryPagination = {
        data: [],
        meta: {
          current_page: 2,
          from: 16,
          last_page: 2,
          per_page: 15,
          to: 30,
          total: 30,
        },
        links: {
          first: 'http://api.example.com/categories?page=1',
          last: 'http://api.example.com/categories?page=2',
          prev: 'http://api.example.com/categories?page=1',
          next: null,
        },
      }

      mockApiClient.get.mockResolvedValueOnce(mockResponse)

      await searchCategories('Tech', 2)

      // Check that all params are present (order doesn't matter with URLSearchParams)
      const callArg = mockApiClient.get.mock.calls[0][0] as string
      expect(callArg).toContain('search=Tech')
      expect(callArg).toContain('page=2')
      expect(callArg).toContain('per_page=15')
    })
  })

  describe('batchUpdateCategories', () => {
    it('should update multiple categories successfully', async () => {
      const updates = [
        { id: 1, data: { name: 'Updated 1' } },
        { id: 2, data: { name: 'Updated 2' } },
      ]

      const mockResponse1: AxiosResponse<ApiResponse<Category>> = {
        data: {
          success: true,
          message: 'Category updated',
          data: { id: 1, name: 'Updated 1', slug: 'updated-1', is_active: true, color: '#000000' },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }

      const mockResponse2: AxiosResponse<ApiResponse<Category>> = {
        data: {
          success: true,
          message: 'Category updated',
          data: { id: 2, name: 'Updated 2', slug: 'updated-2', is_active: true, color: '#000000' },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      }

      mockApiClient.put
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2)

      const result = await batchUpdateCategories(updates)

      expect(mockApiClient.put).toHaveBeenCalledTimes(2)
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Updated 1')
      expect(result[1].name).toBe('Updated 2')
    })

    it('should handle batch update errors', async () => {
      const updates = [
        { id: 1, data: { name: 'Updated 1' } },
        { id: 2, data: { name: 'Updated 2' } },
      ]

      mockApiClient.put
        .mockResolvedValueOnce({
          data: {
            data: { id: 1, name: 'Updated 1', slug: 'updated-1', is_active: true, color: '#000000' },
          },
        } as any)
        .mockRejectedValueOnce(new Error('Update failed for category 2'))

      await expect(batchUpdateCategories(updates)).rejects.toThrow('Update failed for category 2')
    })
  })

  describe('validateCategoryData', () => {
    it('should return no errors for valid data', () => {
      const validData: CreateCategoryData = {
        name: 'Valid Category',
        description: 'Valid description',
        color: '#FF0000',
      }

      const errors = validateCategoryData(validData)

      expect(errors).toHaveLength(0)
    })

    it('should return error for empty name', () => {
      const invalidData: CreateCategoryData = {
        name: '',
      }

      const errors = validateCategoryData(invalidData)

      expect(errors).toContain('Category name is required')
    })

    it('should return error for name too short', () => {
      const invalidData: CreateCategoryData = {
        name: 'A',
      }

      const errors = validateCategoryData(invalidData)

      expect(errors).toContain('Category name must be at least 2 characters long')
    })

    it('should return error for name too long', () => {
      const invalidData: CreateCategoryData = {
        name: 'A'.repeat(256),
      }

      const errors = validateCategoryData(invalidData)

      expect(errors).toContain('Category name must not exceed 255 characters')
    })

    it('should return error for description too long', () => {
      const invalidData: CreateCategoryData = {
        name: 'Valid Name',
        description: 'A'.repeat(1001),
      }

      const errors = validateCategoryData(invalidData)

      expect(errors).toContain('Description must not exceed 1000 characters')
    })

    it('should return error for invalid color format', () => {
      const invalidData: CreateCategoryData = {
        name: 'Valid Name',
        color: 'invalid',
      }

      const errors = validateCategoryData(invalidData)

      expect(errors).toContain('Color must be a valid hexadecimal color (e.g., #FF0000)')
    })

    it('should accept valid 3-digit hex color', () => {
      const validData: CreateCategoryData = {
        name: 'Valid Name',
        color: '#F00',
      }

      const errors = validateCategoryData(validData)

      expect(errors).toHaveLength(0)
    })

    it('should accept valid 6-digit hex color', () => {
      const validData: CreateCategoryData = {
        name: 'Valid Name',
        color: '#FF0000',
      }

      const errors = validateCategoryData(validData)

      expect(errors).toHaveLength(0)
    })

    it('should return multiple errors for multiple invalid fields', () => {
      const invalidData: CreateCategoryData = {
        name: '',
        description: 'A'.repeat(1001),
        color: 'not-a-color',
      }

      const errors = validateCategoryData(invalidData)

      expect(errors).toHaveLength(3)
      expect(errors).toContain('Category name is required')
      expect(errors).toContain('Description must not exceed 1000 characters')
      expect(errors).toContain('Color must be a valid hexadecimal color (e.g., #FF0000)')
    })
  })

  describe('getPublicCategories', () => {
    it('should fetch public categories with event counts', async () => {
      const mockPublicCategories = [
        {
          id: 1,
          name: 'Music',
          slug: 'music',
          color: '#FF0000',
          description: 'Music events',
          event_count: 15,
        },
        {
          id: 2,
          name: 'Sports',
          slug: 'sports',
          color: '#00FF00',
          event_count: 8,
        },
      ]

      mockApiClient.get.mockResolvedValueOnce(mockPublicCategories)

      const result = await getPublicCategories()

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/categories')
      expect(result).toEqual(mockPublicCategories)
      expect(result).toHaveLength(2)
      expect(result[0].event_count).toBe(15)
      expect(result[1].event_count).toBe(8)
    })
  })
})
