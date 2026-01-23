/**
 * Type Guards
 * Reusable type guard functions for runtime type checking
 */

/**
 * Type guard for API errors (typically Axios errors)
 */
export interface ApiErrorResponse {
  response?: {
    status?: number;
    data?: {
      errors?: Record<string, string[]>;
      message?: string;
    };
  };
}

export const isApiError = (error: unknown): error is ApiErrorResponse => {
  return (
    error !== null &&
    typeof error === 'object' &&
    'response' in error &&
    error.response !== null &&
    typeof error.response === 'object'
  );
};

/**
 * Type guard for standard Error objects
 * @param error
 */
export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

/**
 * Type guard for objects with a message property
 * @param error
 */
export const hasMessage = (error: unknown): error is { message: string } => {
  return (
    error !== null &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
};

/**
 * Get error message from unknown error safely
 * @param error
 */
export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error) && error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (isError(error)) {
    return error.message;
  }
  
  if (hasMessage(error)) {
    return error.message;
  }
  
  return 'Ha ocurrido un error inesperado';
};
