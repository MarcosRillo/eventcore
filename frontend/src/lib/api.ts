/**
 * API Client
 * HTTP client for Laravel backend with JWT authentication and error handling
 */

// Core domain types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  error?: string;
}

// Specific domain response types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Domain entities
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  organization_id?: number;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: EventStatus;
  category_id: number;
  organization_id: number;
  is_featured: boolean;
}

export type EventStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'rejected';

// Request data types
export interface LoginData {
  email: string;
  password: string;
}

export interface EventFormData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  category_id: number;
  organization_id?: number;
}

// Error types for better error handling
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  public errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Response data types (not currently used)
// type JsonResponse = Record<string, unknown>;
// type TextResponse = string;
// type ResponseData = JsonResponse | TextResponse | null;

// Request body types for HTTP methods
type RequestBody = unknown;

// HTTP method types
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestConfig {
  method: HttpMethod;
  headers: HeadersInit;
  body?: string | FormData;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    this.baseURL = `${baseUrl}/api/v1`;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;

    try {
      return localStorage.getItem('authToken');
    } catch {
      return null;
    }
  }

  /**
   * Get request headers with authentication
   */
  private getHeaders(customHeaders: HeadersInit = {}): HeadersInit {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    const token = this.getAuthToken();
    
    if (token) {
      (headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    let responseData: unknown;

    try {
      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
    } catch {
      responseData = null;
    }

    // Handle different HTTP status codes
    if (response.ok) {
      // Success (200-299)
      return responseData as T;
    }

    // Handle specific error codes
    switch (response.status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        this.handleUnauthorized();
        throw new Error('No autorizado. Por favor, inicie sesión nuevamente.');

      case 403:
        // Forbidden
        throw new Error('Acceso denegado. No tiene permisos suficientes.');

      case 404:
        // Not found
        throw new Error('Recurso no encontrado.');

      case 422:
        // Validation error
        const apiError = responseData as ApiError;
        const validationMessage = apiError?.message || 'Error de validación.';
        const validationErrors = apiError?.errors || {};
        const errorMessages = Object.values(validationErrors).flat();
        
        if (errorMessages.length > 0) {
          throw new Error(`${validationMessage} ${errorMessages.join(' ')}`);
        }
        throw new Error(validationMessage);

      case 429:
        // Too many requests
        throw new Error('Demasiadas solicitudes. Por favor, espere un momento.');

      case 500:
        // Internal server error
        const serverError = responseData as ApiError;
        const serverMessage = serverError?.message || 'Error interno del servidor.';
        throw new Error(serverMessage);

      case 503:
        // Service unavailable
        throw new Error('Servicio no disponible. Por favor, intente más tarde.');

      default:
        // Generic error
        const genericError = responseData as ApiError;
        const errorMessage = genericError?.message || `Error HTTP ${response.status}`;
        throw new Error(errorMessage);
    }
  }

  /**
   * Handle unauthorized access
   */
  private handleUnauthorized(): void {
    if (typeof window === 'undefined') return;

    // Clear authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    // Redirect to login page
    // Only redirect if not already on login page
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(
    url: string,
    config: RequestConfig,
    retries: number = 1
  ): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    try {
      const response = await fetch(fullUrl, {
        ...config,
        headers: this.getHeaders(config.headers),
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      // Retry on network errors
      if (retries > 0 && this.isNetworkError(error)) {
        await this.delay(1000); // Wait 1 second before retry
        return this.makeRequest<T>(url, config, retries - 1);
      }

      throw error;
    }
  }

  /**
   * Check if error is a network error that can be retried
   */
  private isNetworkError(error: unknown): boolean {
    if (error instanceof TypeError) {
      return true;
    }

    if (error instanceof Error) {
      return (
        error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('NetworkError')
      );
    }

    return false;
  }

  /**
   * Delay utility for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET request
   */
  async get<T>(url: string, headers?: HeadersInit): Promise<T> {
    return this.makeRequest<T>(url, {
      method: 'GET',
      headers: headers || {},
    });
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: RequestBody, headers?: HeadersInit): Promise<T> {
    return this.makeRequest<T>(url, {
      method: 'POST',
      headers: headers || {},
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: RequestBody, headers?: HeadersInit): Promise<T> {
    return this.makeRequest<T>(url, {
      method: 'PUT',
      headers: headers || {},
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: RequestBody, headers?: HeadersInit): Promise<T> {
    return this.makeRequest<T>(url, {
      method: 'PATCH',
      headers: headers || {},
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, headers?: HeadersInit): Promise<T> {
    return this.makeRequest<T>(url, {
      method: 'DELETE',
      headers: headers || {},
    });
  }

  /**
   * Upload file (multipart/form-data)
   */
  async upload<T>(url: string, formData: FormData): Promise<T> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData - browser will set it automatically with boundary

    return this.makeRequest<T>(url, {
      method: 'POST',
      headers,
      body: formData,
    });
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string | null): void {
    if (typeof window === 'undefined') return;

    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  /**
   * Get base URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Set base URL
   */
  setBaseURL(url: string): void {
    this.baseURL = url;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or custom instances
export { ApiClient };