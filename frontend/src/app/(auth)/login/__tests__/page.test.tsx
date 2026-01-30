/**
 * Login Page Tests
 * Tests for rendering, interactions, and error handling
 */
import { fireEvent,render, screen } from '@testing-library/react';

import { useAuth } from '@/context/AuthContext';
import { useLoginForm } from '@/features/auth';

import LoginPage from '../page';

// Mock dependencies
jest.mock('@/context/AuthContext');
jest.mock('@/features/auth', () => ({
  useLoginForm: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseLoginForm = useLoginForm as jest.MockedFunction<typeof useLoginForm>;

// Helper to create default auth mock
const createMockAuth = (overrides = {}) => ({
  isAuthenticated: false,
  isLoading: false,
  user: null,
  token: null,
  login: jest.fn(),
  logout: jest.fn(),
  error: null,
  clearError: jest.fn(),
  refreshUser: jest.fn(),
  hasRole: jest.fn(),
  canAccess: jest.fn(),
  getUserPermissions: jest.fn().mockReturnValue([]),
  canManageEvents: jest.fn().mockReturnValue(false),
  canApproveEvents: jest.fn().mockReturnValue(false),
  canAccessAdmin: jest.fn().mockReturnValue(false),
  canManageUsers: jest.fn().mockReturnValue(false),
  canManageOrganization: jest.fn().mockReturnValue(false),
  canViewAnalytics: jest.fn().mockReturnValue(false),
  ...overrides,
});

// Helper to create default login form mock
const createMockLoginForm = (overrides = {}) => ({
  data: { email: '', password: '' },
  error: null,
  isLoading: false,
  isValid: false,
  isDirty: false,
  fieldErrors: {},
  validateField: jest.fn().mockReturnValue(true),
  getFirstErrorField: jest.fn().mockReturnValue(null),
  updateField: jest.fn(),
  setError: jest.fn(),
  submit: jest.fn(),
  reset: jest.fn(),
  validate: jest.fn().mockReturnValue(false),
  handleSubmit: jest.fn((e) => e?.preventDefault()),
  ...overrides,
});

// Helper to get inputs by placeholder (placeholders end with "…" - proper ellipsis)
const getEmailInput = () => screen.getByPlaceholderText('tu@ejemplo.com…');
const getPasswordInput = () => screen.getByPlaceholderText('Tu contraseña…');

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue(createMockAuth());
    mockUseLoginForm.mockReturnValue(createMockLoginForm());
  });

  describe('rendering', () => {
    it('should render login form with all elements', () => {
      render(<LoginPage />);

      expect(screen.getByText('Eventos Tucumán')).toBeInTheDocument();
      expect(screen.getByText('Plataforma de eventos turísticos y culturales')).toBeInTheDocument();
      expect(screen.getByText('Correo electrónico')).toBeInTheDocument();
      expect(screen.getByText('Contraseña')).toBeInTheDocument();
      expect(getEmailInput()).toBeInTheDocument();
      expect(getPasswordInput()).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    });

    it('should render email and password inputs with correct attributes', () => {
      render(<LoginPage />);

      const emailInput = getEmailInput();
      const passwordInput = getPasswordInput();

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('name', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('name', 'password');
    });

    it('should render forgot password link', () => {
      render(<LoginPage />);

      const forgotLink = screen.getByText('¿Olvidaste tu contraseña?');
      expect(forgotLink).toBeInTheDocument();
      expect(forgotLink).toHaveAttribute('href', '/forgot-password');
    });

  });

  describe('interactions', () => {
    it('should call updateField when email changes', () => {
      const mockUpdateField = jest.fn();
      mockUseLoginForm.mockReturnValue(createMockLoginForm({ updateField: mockUpdateField }));

      render(<LoginPage />);

      const emailInput = getEmailInput();
      fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });

      expect(mockUpdateField).toHaveBeenCalledWith('email', 'test@example.com');
    });

    it('should call updateField when password changes', () => {
      const mockUpdateField = jest.fn();
      mockUseLoginForm.mockReturnValue(createMockLoginForm({ updateField: mockUpdateField }));

      render(<LoginPage />);

      const passwordInput = getPasswordInput();
      fireEvent.change(passwordInput, { target: { name: 'password', value: 'mypassword' } });

      expect(mockUpdateField).toHaveBeenCalledWith('password', 'mypassword');
    });

    it('should keep submit button enabled when form is invalid (per UX guidelines)', () => {
      mockUseLoginForm.mockReturnValue(createMockLoginForm({ isValid: false, isLoading: false }));

      render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      // Button is now always enabled until loading (per UX guidelines)
      expect(submitButton).not.toBeDisabled();
    });

    it('should keep submit button enabled when form is valid', () => {
      mockUseLoginForm.mockReturnValue(createMockLoginForm({
        isValid: true,
        isLoading: false,
        data: { email: 'test@example.com', password: 'Password123' }
      }));

      render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
      expect(submitButton).not.toBeDisabled();
    });

    it('should call handleSubmit when form is submitted', () => {
      const mockHandleSubmit = jest.fn((e) => e?.preventDefault());
      mockUseLoginForm.mockReturnValue(createMockLoginForm({
        isValid: true,
        handleSubmit: mockHandleSubmit,
        data: { email: 'test@example.com', password: 'Password123' }
      }));

      render(<LoginPage />);

      const form = screen.getByRole('button', { name: /iniciar sesión/i }).closest('form');
      fireEvent.submit(form!);

      expect(mockHandleSubmit).toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('should disable inputs when loading', () => {
      mockUseLoginForm.mockReturnValue(createMockLoginForm({ isLoading: true }));

      render(<LoginPage />);

      const emailInput = getEmailInput();
      const passwordInput = getPasswordInput();

      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });

    it('should disable submit button when loading and show loading text', () => {
      mockUseLoginForm.mockReturnValue(createMockLoginForm({ isLoading: true, isValid: true }));

      render(<LoginPage />);

      // Button text changes to "Iniciando sesión..." during loading
      const submitButton = screen.getByRole('button', { name: /iniciando sesión/i });
      expect(submitButton).toBeDisabled();
    });

    it('should show redirecting message when authenticated', () => {
      mockUseAuth.mockReturnValue(createMockAuth({ isAuthenticated: true }));

      render(<LoginPage />);

      expect(screen.getByText('Redirigiendo...')).toBeInTheDocument();
      expect(screen.queryByText('Eventos Tucumán')).not.toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should display error message when error exists', () => {
      mockUseLoginForm.mockReturnValue(createMockLoginForm({
        error: 'Credenciales inválidas'
      }));

      render(<LoginPage />);

      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
    });

    it('should not display error message when no error', () => {
      mockUseLoginForm.mockReturnValue(createMockLoginForm({ error: null }));

      render(<LoginPage />);

      expect(screen.queryByText('Credenciales inválidas')).not.toBeInTheDocument();
    });
  });
});
