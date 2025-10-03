# HIGH-003: Tests Frontend Críticos
## Coverage bajo → Mínimo 50% en código crítico

**Creado:** Octubre 2, 2025  
**Prioridad:** Alta (necesario para refactoring seguro)  
**Tiempo estimado:** 2 días (dividido en 4 fases + 1 setup)  
**Branch:** `test/high-003-frontend-tests`

---

## 🎯 OBJETIVO GENERAL

Implementar suite de tests para los 4 componentes más críticos del frontend:
1. **useEventManager** (God Hook - 499 líneas, 32 returns)
2. **EventService** (API calls y cache)
3. **AuthContext** (autenticación multi-rol)
4. **usePermissions** (verificación de permisos)

**Meta:** Coverage >50% en código crítico  
**Tiempo:** 2 días (dividido en 4 fases + setup inicial)

---

## 📦 SETUP INICIAL (30 min)

### Instalar dependencias de testing

```bash
cd frontend

# Testing libraries
npm install --save-dev @testing-library/react @testing-library/react-hooks @testing-library/jest-dom

# Mocking
npm install --save-dev msw

# Verificar instalación
npm list | grep testing-library
```

### Configurar Jest (si no está configurado)

```javascript
// jest.config.js (crear si no existe)
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
};
```

### Crear setup file

```javascript
// jest.setup.js (crear si no existe)
import '@testing-library/jest-dom';
```

---

## 📋 FASE 1: Tests para useEventManager (4-5 horas)

**Complejidad:** Alta (499 líneas, 32 returns)  
**Prioridad:** Máxima (hook más crítico)

### Estructura de tests

```typescript
// src/features/events/hooks/__tests__/useEventManager.test.ts

import { renderHook, act } from '@testing-library/react-hooks';
import { useEventManager } from '../useEventManager';
import * as eventService from '@/features/events/services/event.service';

// Mock del service
jest.mock('@/features/events/services/event.service');

describe('useEventManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CRUD Operations', () => {
    test('should create event successfully', async () => {
      // Mock API response
      const mockEvent = { id: 1, title: 'Test Event' };
      (eventService.createEvent as jest.Mock).mockResolvedValue(mockEvent);

      const { result } = renderHook(() => useEventManager());

      await act(async () => {
        await result.current.handleCreate(mockEvent);
      });

      expect(eventService.createEvent).toHaveBeenCalledWith(mockEvent);
      // Verificar estado actualizado
    });

    test('should update event successfully', async () => {
      // Similar pattern...
    });

    test('should delete event successfully', async () => {
      // Similar pattern...
    });
  });

  describe('Approval Workflow', () => {
    test('should approve event', async () => {
      const mockEventId = 1;
      (eventService.approveEvent as jest.Mock).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useEventManager());

      await act(async () => {
        await result.current.handleApprove(mockEventId);
      });

      expect(eventService.approveEvent).toHaveBeenCalledWith(mockEventId);
    });

    test('should reject event', async () => {
      // Similar pattern...
    });

    test('should request changes', async () => {
      // Similar pattern...
    });
  });

  describe('Modal Management', () => {
    test('should open approval modal', () => {
      const { result } = renderHook(() => useEventManager());

      act(() => {
        result.current.openApprovalModal(1);
      });

      expect(result.current.isApprovalModalOpen).toBe(true);
      expect(result.current.selectedEventId).toBe(1);
    });

    test('should close approval modal', () => {
      // Similar pattern...
    });
  });

  describe('Filter Management', () => {
    test('should update filters', () => {
      const { result } = renderHook(() => useEventManager());

      act(() => {
        result.current.updateFilters({ status: 'published' });
      });

      expect(result.current.filters.status).toBe('published');
    });
  });

  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      const mockError = new Error('API Error');
      (eventService.createEvent as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useEventManager());

      await act(async () => {
        await result.current.handleCreate({});
      });

      // Verificar que el error se manejó
      expect(result.current.error).toBeDefined();
    });
  });
});
```

### Criterios de éxito Fase 1
- [ ] Al menos 10 tests implementados
- [ ] Coverage >50% del hook useEventManager
- [ ] Todos los tests pasan (`npm test`)
- [ ] CRUD operations testeadas
- [ ] Approval workflow testeado
- [ ] Error handling testeado

---

## 📋 FASE 2: Tests para EventService (2-3 horas)

**Complejidad:** Media  
**Prioridad:** Alta (API calls críticos)

### Estructura de tests

```typescript
// src/features/events/services/__tests__/event.service.test.ts

import { 
  createEvent, 
  updateEvent, 
  deleteEvent,
  approveEvent,
  getEvents 
} from '../event.service';
import api from '@/lib/api';

// Mock del API client
jest.mock('@/lib/api');

describe('EventService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CRUD Operations', () => {
    test('createEvent should call API correctly', async () => {
      const mockEvent = { title: 'Test Event' };
      const mockResponse = { data: { id: 1, ...mockEvent } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await createEvent(mockEvent);

      expect(api.post).toHaveBeenCalledWith('/events', mockEvent);
      expect(result).toEqual(mockResponse.data);
    });

    test('updateEvent should call API correctly', async () => {
      // Similar pattern...
    });

    test('deleteEvent should call API correctly', async () => {
      // Similar pattern...
    });

    test('getEvents should call API with filters', async () => {
      const filters = { status: 'published' };
      const mockResponse = { data: [] };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      await getEvents(filters);

      expect(api.get).toHaveBeenCalledWith('/events', { params: filters });
    });
  });

  describe('Approval Operations', () => {
    test('approveEvent should call API correctly', async () => {
      const mockEventId = 1;
      const mockResponse = { data: { success: true } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      await approveEvent(mockEventId);

      expect(api.post).toHaveBeenCalledWith(`/events/${mockEventId}/approve`);
    });
  });

  describe('Error Handling', () => {
    test('should throw error on API failure', async () => {
      const mockError = new Error('Network Error');
      (api.post as jest.Mock).mockRejectedValue(mockError);

      await expect(createEvent({})).rejects.toThrow('Network Error');
    });
  });
});
```

### Criterios de éxito Fase 2
- [ ] Al menos 8 tests implementados
- [ ] Coverage >60% del EventService
- [ ] Todos los tests pasan
- [ ] API calls testeados
- [ ] Error handling testeado

---

## 📋 FASE 3: Tests para AuthContext (2-3 horas)

**Complejidad:** Media  
**Prioridad:** Alta (autenticación crítica)

### Estructura de tests

```typescript
// src/contexts/__tests__/AuthContext.test.tsx

import { renderHook, act } from '@testing-library/react-hooks';
import { AuthProvider, useAuth } from '../AuthContext';
import * as authService from '@/features/auth/services/auth.service';

jest.mock('@/features/auth/services/auth.service');

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Login', () => {
    test('should login successfully', async () => {
      const mockUser = { id: 1, email: 'test@example.com', role: 'entity_admin' };
      const mockToken = 'mock-token-123';
      (authService.login as jest.Mock).mockResolvedValue({ user: mockUser, token: mockToken });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.getItem('token')).toBe(mockToken);
    });

    test('should handle login error', async () => {
      const mockError = new Error('Invalid credentials');
      (authService.login as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrong');
        } catch (error) {
          expect(error.message).toBe('Invalid credentials');
        }
      });

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Logout', () => {
    test('should logout successfully', async () => {
      // Setup: login first
      const mockUser = { id: 1, email: 'test@example.com' };
      (authService.login as jest.Mock).mockResolvedValue({ user: mockUser, token: 'token' });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      // Now logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('Token Persistence', () => {
    test('should restore session from localStorage', () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockToken = 'stored-token';
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});
```

### Criterios de éxito Fase 3
- [ ] Al menos 6 tests implementados
- [ ] Coverage >70% del AuthContext
- [ ] Todos los tests pasan
- [ ] Login/logout testeados
- [ ] Persistencia testeada
- [ ] Error handling testeado

---

## 📋 FASE 4: Tests para usePermissions (1-2 horas)

**Complejidad:** Baja  
**Prioridad:** Media

### Estructura de tests

```typescript
// src/features/auth/hooks/__tests__/usePermissions.test.ts

import { renderHook } from '@testing-library/react-hooks';
import { usePermissions } from '../usePermissions';
import { AuthProvider } from '@/contexts/AuthContext';

const mockUser = {
  id: 1,
  email: 'admin@example.com',
  role: 'entity_admin',
  permissions: ['manage_events', 'approve_events', 'view_analytics']
};

const wrapper = ({ children }) => (
  <AuthProvider value={{ user: mockUser, isAuthenticated: true }}>
    {children}
  </AuthProvider>
);

describe('usePermissions', () => {
  test('should check permission correctly', () => {
    const { result } = renderHook(() => usePermissions(), { wrapper });

    expect(result.current.hasPermission('manage_events')).toBe(true);
    expect(result.current.hasPermission('manage_users')).toBe(false);
  });

  test('should check multiple permissions (AND)', () => {
    const { result } = renderHook(() => usePermissions(), { wrapper });

    expect(result.current.hasAllPermissions(['manage_events', 'approve_events'])).toBe(true);
    expect(result.current.hasAllPermissions(['manage_events', 'manage_users'])).toBe(false);
  });

  test('should check multiple permissions (OR)', () => {
    const { result } = renderHook(() => usePermissions(), { wrapper });

    expect(result.current.hasAnyPermission(['manage_events', 'manage_users'])).toBe(true);
    expect(result.current.hasAnyPermission(['manage_users', 'platform_settings'])).toBe(false);
  });

  test('should check role', () => {
    const { result } = renderHook(() => usePermissions(), { wrapper });

    expect(result.current.isRole('entity_admin')).toBe(true);
    expect(result.current.isRole('platform_admin')).toBe(false);
  });

  test('should handle no user gracefully', () => {
    const emptyWrapper = ({ children }) => (
      <AuthProvider value={{ user: null, isAuthenticated: false }}>
        {children}
      </AuthProvider>
    );

    const { result } = renderHook(() => usePermissions(), { wrapper: emptyWrapper });

    expect(result.current.hasPermission('manage_events')).toBe(false);
  });
});
```

### Criterios de éxito Fase 4
- [ ] Al menos 5 tests implementados
- [ ] Coverage >80% del hook usePermissions
- [ ] Todos los tests pasan
- [ ] Verificaciones de permisos testeadas
- [ ] Edge cases testeados

---

## 🎯 RESUMEN DE FASES

| Fase | Componente | Tests | Tiempo | Complejidad |
|------|-----------|-------|--------|-------------|
| 1 | useEventManager | 10+ | 4-5h | Alta |
| 2 | EventService | 8+ | 2-3h | Media |
| 3 | AuthContext | 6+ | 2-3h | Media |
| 4 | usePermissions | 5+ | 1-2h | Baja |
| **Total** | **4 componentes** | **29+ tests** | **9-13h** | **~2 días** |

---

## ✅ CRITERIOS DE ÉXITO GENERAL

### Cobertura
- [ ] useEventManager: >50% coverage
- [ ] EventService: >60% coverage
- [ ] AuthContext: >70% coverage
- [ ] usePermissions: >80% coverage

### Funcionalidad
- [ ] Todos los tests pasan (`npm test`)
- [ ] Build exitoso (`npm run build`)
- [ ] No regresiones en funcionalidad existente

### Calidad
- [ ] Tests son legibles y mantenibles
- [ ] Mocks correctamente configurados
- [ ] Edge cases cubiertos
- [ ] Error handling testeado

---

## 🔄 COMMIT STRATEGY

Hacer commit después de cada fase:

```bash
# Después de Fase 1
git add src/features/events/hooks/__tests__/
git commit -m "test(frontend): add useEventManager tests

- Add 10+ tests for useEventManager hook
- Cover CRUD operations, approval workflow, modal management
- Coverage: >50%
- All tests passing

Part of: HIGH-003 Tests Frontend (Phase 1/4)"

# Después de Fase 2
git add src/features/events/services/__tests__/
git commit -m "test(frontend): add EventService tests

- Add 8+ tests for EventService
- Cover API calls, error handling
- Coverage: >60%
- All tests passing

Part of: HIGH-003 Tests Frontend (Phase 2/4)"

# Similar para Fases 3 y 4...

# Commit final
git commit -m "test(frontend): complete HIGH-003 critical tests suite

Summary:
- useEventManager: 10+ tests, >50% coverage
- EventService: 8+ tests, >60% coverage
- AuthContext: 6+ tests, >70% coverage
- usePermissions: 5+ tests, >80% coverage

Total: 29+ tests, all passing
Build: ✓ Success
No regressions

Resolves: HIGH-003"
```

---

## 🚀 DESPUÉS DE COMPLETAR HIGH-003

1. **Actualizar TODO.md:**
   ```markdown
   ✅ HIGH-003: Tests Frontend Críticos - COMPLETADO - [fecha]
   ```

2. **Próximas tareas:**
   - MED-001: Reintegrar Nginx + Redis
   - MED-002: Configurar MailHog
   - O continuar con desarrollo de features

3. **Celebrar:** El proyecto tendrá una base sólida de tests para refactoring seguro