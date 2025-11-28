import apiClient from '@/services/apiClient'
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
jest.mock('@/services/apiClient')

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

// Helper to create mock axios response
const createMockResponse = <T>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: { headers: {} } as AxiosResponse['config'],
})

// Helper to create a valid Category mock
const createMockCategory = (overrides: Partial<Category> & { id: number; name: string }): Category => ({
  slug: overrides.name.toLowerCase().replace(/\s+/g, '-'),
  entity_id: 1,
  is_active: true,
  color: '#000000',
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  ...overrides,
})

// Helper to create valid PaginationMeta
const createMockMeta = (overrides: Partial<{
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}> = {}) => ({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: null,
  to: null,
  path: 'http://api.example.com/categories',
  links: [],
  ...overrides,
})

describe('category.service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCategories', () => {
    it('should fetch categories with default params', async () => {
      const mockResponse: CategoryPagination = {
        data: [
          createMockCategory({ id: 1, name: 'Music', color: '#FF0000' }),
          createMockCategory({ id: 2, name: 'Sports', color: '#00FF00' }),
        ],
        meta: createMockMeta({ current_page: 1, from: 1, last_page: 1, per_page: 10, to: 2, total: 2 }),
        links: {
          first: 'http://api.example.com/categories?page=1',
          last: 'http://api.example.com/categories?page=1',
          prev: null,
          next: null,
        },
      }

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse })

      const result = await getCategories()

      expect(mockApiClient.get).toHaveBeenCalledWith('/categories?')
      expect(result).toEqual(mockResponse)
      expect(result.data).toHaveLength(2)
    })

    it('should fetch categories with search param', async () => {
      const mockResponse: CategoryPagination = {
        data: [createMockCategory({ id: 1, name: 'Music', color: '#FF0000' })],
        meta: createMockMeta({ current_page: 1, from: 1, last_page: 1, per_page: 10, to: 1, total: 1 }),
        links: {
          first: 'http://api.example.com/categories?page=1',
          last: 'http://api.example.com/categories?page=1',
          prev: null,
          next: null,
        },
      }

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse })

      await getCategories({ search: 'Music' })

      expect(mockApiClient.get).toHaveBeenCalledWith('/categories?search=Music')
    })

    it('should fetch categories with pagination params', async () => {
      const mockResponse: CategoryPagination = {
        data: [],
        meta: createMockMeta({ current_page: 2, from: 11, last_page: 3, per_page: 20, to: 30, total: 50 }),
        links: {
          first: 'http://api.example.com/categories?page=1',
          last: 'http://api.example.com/categories?page=3',
          prev: 'http://api.example.com/categories?page=1',
          next: 'http://api.example.com/categories?page=3',
        },
      }

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse })

      await getCategories({ page: 2, per_page: 20 })

      expect(mockApiClient.get).toHaveBeenCalledWith('/categories?page=2&per_page=20')
    })

    it('should fetch active categories only', async () => {
      const mockResponse: CategoryPagination = {
        data: [createMockCategory({ id: 1, name: 'Music', color: '#FF0000' })],
        meta: createMockMeta({ current_page: 1, from: 1, last_page: 1, per_page: 10, to: 1, total: 1 }),
        links: {
          first: 'http://api.example.com/categories?page=1',
          last: 'http://api.example.com/categories?page=1',
          prev: null,
          next: null,
        },
      }

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse })

      await getCategories({ active: true })

      expect(mockApiClient.get).toHaveBeenCalledWith('/categories?active=true')
    })
  })

  describe('getCategory', () => {
    it('should fetch a single category by ID', async () => {
      const mockCategory = createMockCategory({
        id: 1,
        name: 'Music',
        color: '#FF0000',
        description: 'Music events',
      })

      mockApiClient.get.mockResolvedValueOnce({ data: mockCategory })

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

      const mockResponse = createMockResponse<ApiResponse<Category>>({
        
        message: 'Category created successfully',
        data: createMockCategory({
          id: 3,
          name: 'Technology',
          description: 'Tech events',
          color: '#0000FF',
        }),
      })

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

      const mockResponse = createMockResponse<ApiResponse<Category>>({
        
        message: 'Category created successfully',
        data: createMockCategory({
          id: 4,
          name: 'Sports',
        }),
      })

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

      const mockResponse = createMockResponse<ApiResponse<Category>>({
        
        message: 'Category updated successfully',
        data: createMockCategory({
          id: 1,
          name: 'Updated Music',
          description: 'Updated description',
          color: '#FF00FF',
          is_active: false,
        }),
      })

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

      const mockResponse = createMockResponse<ApiResponse<Category>>({
        
        message: 'Category updated successfully',
        data: createMockCategory({
          id: 1,
          name: 'Partially Updated',
          color: '#FF0000',
        }),
      })

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
        response: createMockResponse({ message: 'Category not found' }),
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed with status code 404',
      }
      error.response!.status = 404
      error.response!.statusText = 'Not Found'

      mockApiClient.delete.mockRejectedValueOnce(error)

      await expect(deleteCategory(1)).rejects.toThrow(
        'No tienes permiso para eliminar esta categoría o ya no existe.'
      )
    })

    it('should handle 403 error with custom message', async () => {
      const error: AxiosError = {
        response: createMockResponse({ message: 'Forbidden' }),
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed with status code 403',
      }
      error.response!.status = 403
      error.response!.statusText = 'Forbidden'

      mockApiClient.delete.mockRejectedValueOnce(error)

      await expect(deleteCategory(1)).rejects.toThrow(
        'No tienes permiso para eliminar esta categoría o ya no existe.'
      )
    })

    it('should handle other errors with API message', async () => {
      const error: AxiosError = {
        response: createMockResponse({ message: 'Internal server error' }),
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed with status code 500',
      }
      error.response!.status = 500
      error.response!.statusText = 'Internal Server Error'

      mockApiClient.delete.mockRejectedValueOnce(error)

      await expect(deleteCategory(1)).rejects.toThrow('Internal server error')
    })
  })

  describe('toggleCategoryStatus', () => {
    it('should toggle category status', async () => {
      const mockResponse = createMockResponse<ApiResponse<Category>>({
        
        message: 'Category status toggled',
        data: createMockCategory({
          id: 1,
          name: 'Music',
          color: '#FF0000',
          is_active: false,
        }),
      })

      mockApiClient.patch.mockResolvedValueOnce(mockResponse)

      const result = await toggleCategoryStatus(1)

      expect(mockApiClient.patch).toHaveBeenCalledWith('/categories/1/toggle-status')
      expect(result.is_active).toBe(false)
    })
  })

  describe('getActiveCategories', () => {
    it('should fetch active categories when backend returns array with data wrapper', async () => {
      const mockCategories: Category[] = [
        createMockCategory({ id: 1, name: 'Music', color: '#FF0000' }),
        createMockCategory({ id: 2, name: 'Sports', color: '#00FF00' }),
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
      const mockResponseData: ApiResponse<Category[]> = {
        
        message: 'Active categories retrieved',
        data: [
          createMockCategory({ id: 1, name: 'Music', color: '#FF0000' }),
          createMockCategory({ id: 2, name: 'Sports', color: '#00FF00' }),
        ],
      }

      mockApiClient.get.mockResolvedValueOnce(mockResponseData)

      const result = await getActiveCategories()

      expect(result).toHaveLength(2)
      expect(result.every((cat) => cat.is_active)).toBe(true)
    })
  })

  describe('searchCategories', () => {
    it('should search categories with default pagination', async () => {
      const mockResponse: CategoryPagination = {
        data: [createMockCategory({ id: 1, name: 'Music', color: '#FF0000' })],
        meta: createMockMeta({ current_page: 1, from: 1, last_page: 1, per_page: 15, to: 1, total: 1 }),
        links: {
          first: 'http://api.example.com/categories?page=1',
          last: 'http://api.example.com/categories?page=1',
          prev: null,
          next: null,
        },
      }

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse })

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
        meta: createMockMeta({ current_page: 2, from: 16, last_page: 2, per_page: 15, to: 30, total: 30 }),
        links: {
          first: 'http://api.example.com/categories?page=1',
          last: 'http://api.example.com/categories?page=2',
          prev: 'http://api.example.com/categories?page=1',
          next: null,
        },
      }

      mockApiClient.get.mockResolvedValueOnce({ data: mockResponse })

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

      const mockResponse1 = createMockResponse<ApiResponse<Category>>({
        
        message: 'Category updated',
        data: createMockCategory({ id: 1, name: 'Updated 1' }),
      })

      const mockResponse2 = createMockResponse<ApiResponse<Category>>({
        
        message: 'Category updated',
        data: createMockCategory({ id: 2, name: 'Updated 2' }),
      })

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
        .mockResolvedValueOnce(
          createMockResponse({
            data: createMockCategory({ id: 1, name: 'Updated 1' }),
          })
        )
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

      mockApiClient.get.mockResolvedValueOnce({ data: mockPublicCategories })

      const result = await getPublicCategories()

      expect(mockApiClient.get).toHaveBeenCalledWith('/public/categories')
      expect(result).toEqual(mockPublicCategories)
      expect(result).toHaveLength(2)
      expect(result[0].event_count).toBe(15)
      expect(result[1].event_count).toBe(8)
    })
  })
})
