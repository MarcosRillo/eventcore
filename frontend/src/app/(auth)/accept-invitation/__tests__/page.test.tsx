/**
 * Accept Invitation Page Tests
 * Tests for token validation, form rendering, success state, and error handling
 */
import { render, screen, fireEvent } from '@testing-library/react';
import AcceptInvitationPage from '../page';
import { useAcceptInvitation } from '@/features/invitations/hooks/useAcceptInvitation';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

jest.mock('@/features/invitations/hooks/useAcceptInvitation');

const mockUseSearchParams = jest.requireMock('next/navigation').useSearchParams;
const mockUseAcceptInvitation = useAcceptInvitation as jest.MockedFunction<typeof useAcceptInvitation>;

// Helper to create default mock
const createMockAcceptInvitation = (overrides = {}) => ({
  validating: false,
  tokenValid: true,
  tokenError: null,
  invitationInfo: {
    email: 'invited@example.com',
    role: 'organizer_admin',
    expires_at: '2025-12-31T23:59:59Z',
  },
  formData: {
    name: '',
    dni: '',
    password: '',
    password_confirmation: '',
  },
  formErrors: {},
  submitting: false,
  success: false,
  validateToken: jest.fn(),
  updateFormData: jest.fn(),
  submitForm: jest.fn(),
  clearErrors: jest.fn(),
  ...overrides,
});

describe('AcceptInvitationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue('valid-token'),
    });
    mockUseAcceptInvitation.mockReturnValue(createMockAcceptInvitation());
  });

  describe('token validation', () => {
    it('should show loading while validating token', () => {
      mockUseAcceptInvitation.mockReturnValue(createMockAcceptInvitation({
        validating: true,
      }));

      render(<AcceptInvitationPage />);

      expect(screen.getByText('Validando invitación...')).toBeInTheDocument();
    });

    it('should show error for invalid token', () => {
      mockUseAcceptInvitation.mockReturnValue(createMockAcceptInvitation({
        tokenValid: false,
        tokenError: 'El token ha expirado',
      }));

      render(<AcceptInvitationPage />);

      expect(screen.getByText('Invitación inválida')).toBeInTheDocument();
      expect(screen.getByText('El token ha expirado')).toBeInTheDocument();
    });

    it('should show no token error when token is missing', () => {
      mockUseSearchParams.mockReturnValue({
        get: jest.fn().mockReturnValue(null),
      });

      render(<AcceptInvitationPage />);

      expect(screen.getByText('Token no proporcionado')).toBeInTheDocument();
      expect(screen.getByText(/enlace de invitación no es válido/)).toBeInTheDocument();
    });

    it('should show form for valid token', () => {
      render(<AcceptInvitationPage />);

      expect(screen.getByText('Acepta tu invitación')).toBeInTheDocument();
      expect(screen.getByText('Completa tus datos para crear tu cuenta')).toBeInTheDocument();
    });

    it('should call validateToken on mount with token', () => {
      const mockValidateToken = jest.fn();
      mockUseAcceptInvitation.mockReturnValue(createMockAcceptInvitation({
        validateToken: mockValidateToken,
      }));

      render(<AcceptInvitationPage />);

      expect(mockValidateToken).toHaveBeenCalledWith('valid-token');
    });
  });

  describe('form rendering', () => {
    it('should show invitation details', () => {
      render(<AcceptInvitationPage />);

      // The form component should receive invitationInfo
      expect(screen.getByText(/invited@example.com/)).toBeInTheDocument();
    });

    it('should render the login link', () => {
      render(<AcceptInvitationPage />);

      expect(screen.getByText('Inicia sesión')).toBeInTheDocument();
    });
  });

  describe('success state', () => {
    it('should show success message after account creation', () => {
      mockUseAcceptInvitation.mockReturnValue(createMockAcceptInvitation({
        success: true,
      }));

      render(<AcceptInvitationPage />);

      expect(screen.getByText('¡Cuenta creada exitosamente!')).toBeInTheDocument();
      expect(screen.getByText(/Tu cuenta ha sido creada/)).toBeInTheDocument();
    });

    it('should show redirect message after success', () => {
      mockUseAcceptInvitation.mockReturnValue(createMockAcceptInvitation({
        success: true,
      }));

      render(<AcceptInvitationPage />);

      expect(screen.getByText(/Serás redirigido al inicio de sesión/)).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should show default error message for invalid token', () => {
      mockUseAcceptInvitation.mockReturnValue(createMockAcceptInvitation({
        tokenValid: false,
        tokenError: null,
      }));

      render(<AcceptInvitationPage />);

      expect(screen.getByText(/no es válido o ha expirado/)).toBeInTheDocument();
    });

    it('should show login link on error page', () => {
      mockUseAcceptInvitation.mockReturnValue(createMockAcceptInvitation({
        tokenValid: false,
      }));

      render(<AcceptInvitationPage />);

      expect(screen.getByText('Ir al inicio de sesión')).toBeInTheDocument();
    });
  });
});
