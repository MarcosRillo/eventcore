# CARD-002 TDD: Organizer Stats Widget - Frontend Implementation
## Test-Driven Development Approach

**Creado:** Octubre 27, 2025  
**Metodología:** RED → GREEN → REFACTOR  
**Tiempo estimado:** 4-5 horas (con TDD)  
**Dependencia:** CARD-001 (✅ COMPLETADO)

---

## 🎯 TDD METHODOLOGY

### RED Phase (1-1.5 horas)
Escribir tests PRIMERO que fallen (red)

### GREEN Phase (2-2.5 horas)
Implementar código mínimo para pasar tests (green)

### REFACTOR Phase (30-60 min)
Mejorar código manteniendo tests passing

---

## 📊 API Response (Backend Ready)

```typescript
GET /api/v1/organizer/stats
Response: {
  data: {
    total_events: 12,
    pending_internal: 2,
    approved_internal: 3,
    pending_public: 1,
    published: 4,
    requires_changes: 1,
    rejected: 1
  }
}
```

---

## 🔴 PHASE 1: RED - Write Tests First

### Setup Testing Environment

```bash
# Verificar que Jest esté configurado
cd frontend
cat jest.config.js

# Si no existe, usar el default de Next.js
# Ya debería estar configurado del proyecto
```

---

### Test 1: Service Tests (organizerStatsService.test.ts)

**Location:** `frontend/src/features/organizer/services/__tests__/organizerStatsService.test.ts`

```typescript
import { organizerStatsService } from '../organizerStatsService';
import apiClient from '@/lib/api';

// Mock the API client
jest.mock('@/lib/api');

describe('organizerStatsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    test('should fetch stats and return data correctly', async () => {
      // Arrange
      const mockResponse = {
        data: {
          data: {
            total_events: 12,
            pending_internal: 2,
            approved_internal: 3,
            pending_public: 1,
            published: 4,
            requires_changes: 1,
            rejected: 1,
          },
        },
      };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await organizerStatsService.getStats();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/organizer/stats');
      expect(result).toEqual(mockResponse.data.data);
      expect(result.total_events).toBe(12);
      expect(result.pending_internal).toBe(2);
    });

    test('should throw error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error');
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(organizerStatsService.getStats()).rejects.toThrow('Network error');
      expect(apiClient.get).toHaveBeenCalledWith('/organizer/stats');
    });

    test('should handle 401 unauthorized error', async () => {
      // Arrange
      const mockError = { response: { status: 401 } };
      (apiClient.get as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(organizerStatsService.getStats()).rejects.toEqual(mockError);
    });

    test('should handle malformed response', async () => {
      // Arrange
      const mockResponse = { data: null };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // Act & Assert
      // Should handle gracefully or throw appropriate error
      await expect(organizerStatsService.getStats()).rejects.toThrow();
    });
  });
});
```

**Expected Result:** 4/4 tests FAILING (service doesn't exist yet)

---

### Test 2: Hook Tests (useOrganizerStats.test.ts)

**Location:** `frontend/src/features/organizer/hooks/__tests__/useOrganizerStats.test.ts`

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useOrganizerStats } from '../useOrganizerStats';
import { organizerStatsService } from '../../services/organizerStatsService';

// Mock the service
jest.mock('../../services/organizerStatsService');

describe('useOrganizerStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize with loading state', () => {
    // Arrange
    (organizerStatsService.getStats as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    // Act
    const { result } = renderHook(() => useOrganizerStats());

    // Assert
    expect(result.current.loading).toBe(true);
    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBeNull();
  });

  test('should fetch stats on mount and update state', async () => {
    // Arrange
    const mockStats = {
      total_events: 10,
      pending_internal: 2,
      approved_internal: 3,
      pending_public: 1,
      published: 4,
      requires_changes: 0,
      rejected: 0,
    };
    (organizerStatsService.getStats as jest.Mock).mockResolvedValue(mockStats);

    // Act
    const { result } = renderHook(() => useOrganizerStats());

    // Assert - Initial state
    expect(result.current.loading).toBe(true);

    // Wait for async operation
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert - Final state
    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.error).toBeNull();
    expect(organizerStatsService.getStats).toHaveBeenCalledTimes(1);
  });

  test('should handle fetch error', async () => {
    // Arrange
    const mockError = new Error('Failed to fetch');
    (organizerStatsService.getStats as jest.Mock).mockRejectedValue(mockError);

    // Act
    const { result } = renderHook(() => useOrganizerStats());

    // Wait for async operation
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert
    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBe('Failed to fetch');
  });

  test('should refetch stats when refetch is called', async () => {
    // Arrange
    const mockStats = {
      total_events: 5,
      pending_internal: 1,
      approved_internal: 1,
      pending_public: 1,
      published: 2,
      requires_changes: 0,
      rejected: 0,
    };
    (organizerStatsService.getStats as jest.Mock).mockResolvedValue(mockStats);

    // Act
    const { result } = renderHook(() => useOrganizerStats());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear previous calls
    jest.clearAllMocks();

    // Refetch
    await result.current.refetch();

    // Assert
    expect(organizerStatsService.getStats).toHaveBeenCalledTimes(1);
    expect(result.current.stats).toEqual(mockStats);
  });

  test('should handle non-Error thrown values', async () => {
    // Arrange
    (organizerStatsService.getStats as jest.Mock).mockRejectedValue('String error');

    // Act
    const { result } = renderHook(() => useOrganizerStats());

    // Wait for async operation
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert
    expect(result.current.error).toBe('Failed to fetch stats');
  });
});
```

**Expected Result:** 5/5 tests FAILING (hook doesn't exist yet)

---

### Test 3: Component Tests (Optional but Recommended)

**Location:** `frontend/src/features/organizer/components/dumb/__tests__/OrganizerStatsCard.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { OrganizerStatsCard } from '../OrganizerStatsCard';
import { StatCardData } from '../../../types/organizerStats.types';

describe('OrganizerStatsCard', () => {
  const mockStats: StatCardData[] = [
    { label: 'Pendiente Interno', value: 2, color: 'yellow' },
    { label: 'Aprobado Interno', value: 3, color: 'blue' },
    { label: 'Pendiente Público', value: 1, color: 'orange' },
    { label: 'Publicado', value: 4, color: 'green' },
    { label: 'Requiere Cambios', value: 1, color: 'orange' },
    { label: 'Rechazado', value: 0, color: 'red' },
  ];

  test('should render total events correctly', () => {
    render(<OrganizerStatsCard stats={mockStats} totalEvents={11} />);
    
    expect(screen.getByText('Mis Eventos')).toBeInTheDocument();
    expect(screen.getByText(/11/)).toBeInTheDocument();
  });

  test('should render all stat cards', () => {
    render(<OrganizerStatsCard stats={mockStats} totalEvents={11} />);
    
    expect(screen.getByText('Pendiente Interno')).toBeInTheDocument();
    expect(screen.getByText('Aprobado Interno')).toBeInTheDocument();
    expect(screen.getByText('Pendiente Público')).toBeInTheDocument();
    expect(screen.getByText('Publicado')).toBeInTheDocument();
    expect(screen.getByText('Requiere Cambios')).toBeInTheDocument();
    expect(screen.getByText('Rechazado')).toBeInTheDocument();
  });

  test('should display correct values for each stat', () => {
    render(<OrganizerStatsCard stats={mockStats} totalEvents={11} />);
    
    expect(screen.getByText('2')).toBeInTheDocument(); // pending_internal
    expect(screen.getByText('3')).toBeInTheDocument(); // approved_internal
    expect(screen.getByText('1')).toBeInTheDocument(); // pending_public or requires_changes
    expect(screen.getByText('4')).toBeInTheDocument(); // published
    expect(screen.getByText('0')).toBeInTheDocument(); // rejected
  });

  test('should render with empty stats', () => {
    render(<OrganizerStatsCard stats={[]} totalEvents={0} />);
    
    expect(screen.getByText('Mis Eventos')).toBeInTheDocument();
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });
});
```

**Expected Result:** 4/4 tests FAILING (component doesn't exist yet)

---

## 📋 RED Phase Summary

### Files to Create (Test Files Only)

```
frontend/src/features/organizer/
├── services/__tests__/
│   └── organizerStatsService.test.ts      (4 tests)
├── hooks/__tests__/
│   └── useOrganizerStats.test.ts          (5 tests)
└── components/dumb/__tests__/
    └── OrganizerStatsCard.test.tsx        (4 tests - optional)
```

**Total Tests:** 9 tests (13 if including component tests)

### Run Tests (Should All Fail)

```bash
cd frontend
npm test organizerStatsService
npm test useOrganizerStats
npm test OrganizerStatsCard  # if created

# Expected output:
# FAIL  9/9 tests (or 13/13)
# All tests should fail with "Cannot find module" errors
```

---

## 🟢 PHASE 2: GREEN - Implement Code to Pass Tests

### Step 1: Create Types (5 min)

**File:** `frontend/src/features/organizer/types/organizerStats.types.ts`

```typescript
export interface OrganizerStats {
  total_events: number;
  pending_internal: number;
  approved_internal: number;
  pending_public: number;
  published: number;
  requires_changes: number;
  rejected: number;
}

export interface StatCardData {
  label: string;
  value: number;
  color: 'blue' | 'yellow' | 'green' | 'orange' | 'red' | 'gray';
}
```

---

### Step 2: Implement Service (15 min)

**File:** `frontend/src/features/organizer/services/organizerStatsService.ts`

```typescript
import apiClient from '@/lib/api';
import { OrganizerStats } from '../types/organizerStats.types';

export const organizerStatsService = {
  /**
   * Get organizer statistics from API
   * @returns Promise<OrganizerStats>
   * @throws Error if API call fails or response is malformed
   */
  getStats: async (): Promise<OrganizerStats> => {
    try {
      const response = await apiClient.get<{ data: OrganizerStats }>('/organizer/stats');
      
      // Validate response structure
      if (!response.data || !response.data.data) {
        throw new Error('Invalid response structure from API');
      }
      
      return response.data.data;
    } catch (error) {
      // Re-throw to let caller handle
      throw error;
    }
  },
};
```

**Run Tests:**
```bash
npm test organizerStatsService
# Expected: 4/4 passing ✅
```

---

### Step 3: Implement Hook (25 min)

**File:** `frontend/src/features/organizer/hooks/useOrganizerStats.ts`

```typescript
import { useState, useEffect } from 'react';
import { organizerStatsService } from '../services/organizerStatsService';
import { OrganizerStats } from '../types/organizerStats.types';

interface UseOrganizerStatsReturn {
  stats: OrganizerStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useOrganizerStats = (): UseOrganizerStatsReturn => {
  const [stats, setStats] = useState<OrganizerStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await organizerStatsService.getStats();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(errorMessage);
      console.error('Error fetching organizer stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};
```

**Run Tests:**
```bash
npm test useOrganizerStats
# Expected: 5/5 passing ✅
```

---

### Step 4: Implement Dumb Component (45 min)

**File:** `frontend/src/features/organizer/components/dumb/OrganizerStatsCard.tsx`

```typescript
import { StatCardData } from '../../types/organizerStats.types';

interface OrganizerStatsCardProps {
  stats: StatCardData[];
  totalEvents: number;
}

export const OrganizerStatsCard = ({ stats, totalEvents }: OrganizerStatsCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mis Eventos</h2>
        <p className="text-gray-600 mt-1">
          Total: <span className="font-semibold text-blue-600">{totalEvents}</span> eventos
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`p-4 rounded-lg border-2 ${getColorClasses(stat.color)}`}
          >
            <div className="text-sm font-medium text-gray-600 mb-1">
              {stat.label}
            </div>
            <div className={`text-3xl font-bold ${getTextColor(stat.color)}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper functions
const getColorClasses = (color: StatCardData['color']): string => {
  const colors = {
    blue: 'border-blue-200 bg-blue-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    green: 'border-green-200 bg-green-50',
    orange: 'border-orange-200 bg-orange-50',
    red: 'border-red-200 bg-red-50',
    gray: 'border-gray-200 bg-gray-50',
  };
  return colors[color] || colors.gray;
};

const getTextColor = (color: StatCardData['color']): string => {
  const colors = {
    blue: 'text-blue-600',
    yellow: 'text-yellow-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    gray: 'text-gray-600',
  };
  return colors[color] || colors.gray;
};
```

**Run Tests (if created):**
```bash
npm test OrganizerStatsCard
# Expected: 4/4 passing ✅
```

---

### Step 5: Implement Smart Component (30 min)

**File:** `frontend/src/features/organizer/components/smart/OrganizerStatsWidget.tsx`

```typescript
import { useOrganizerStats } from '../../hooks/useOrganizerStats';
import { OrganizerStatsCard } from '../dumb/OrganizerStatsCard';
import { StatCardData } from '../../types/organizerStats.types';

export const OrganizerStatsWidget = () => {
  const { stats, loading, error, refetch } = useOrganizerStats();

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600">
          <p className="font-semibold">Error al cargar estadísticas</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!stats) {
    return null;
  }

  // Transform stats to StatCardData format
  const statCards: StatCardData[] = [
    {
      label: 'Pendiente Interno',
      value: stats.pending_internal,
      color: 'yellow',
    },
    {
      label: 'Aprobado Interno',
      value: stats.approved_internal,
      color: 'blue',
    },
    {
      label: 'Pendiente Público',
      value: stats.pending_public,
      color: 'orange',
    },
    {
      label: 'Publicado',
      value: stats.published,
      color: 'green',
    },
    {
      label: 'Requiere Cambios',
      value: stats.requires_changes,
      color: 'orange',
    },
    {
      label: 'Rechazado',
      value: stats.rejected,
      color: 'red',
    },
  ];

  return <OrganizerStatsCard stats={statCards} totalEvents={stats.total_events} />;
};
```

---

### Step 6: Run All Tests

```bash
cd frontend
npm test -- --testPathPattern=organizer

# Expected output:
# PASS  organizerStatsService.test.ts (4/4)
# PASS  useOrganizerStats.test.ts (5/5)
# PASS  OrganizerStatsCard.test.tsx (4/4) - if created
#
# Total: 9-13 tests passing ✅
```

---

## 🔄 PHASE 3: REFACTOR - Improve Code Quality

### Refactoring Opportunities

1. **Extract Color Mapping** to separate utility file
2. **Add Loading Skeleton Component** (reusable)
3. **Error Boundary** around widget
4. **Memoization** for expensive computations
5. **Custom Error Types** for better error handling

### Optional Refactors

**File:** `frontend/src/features/organizer/utils/statColors.ts`

```typescript
export const getStatColorClasses = (color: string): string => {
  const colors: Record<string, string> = {
    blue: 'border-blue-200 bg-blue-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    green: 'border-green-200 bg-green-50',
    orange: 'border-orange-200 bg-orange-50',
    red: 'border-red-200 bg-red-50',
    gray: 'border-gray-200 bg-gray-50',
  };
  return colors[color] || colors.gray;
};

export const getStatTextColor = (color: string): string => {
  const colors: Record<string, string> = {
    blue: 'text-blue-600',
    yellow: 'text-yellow-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    gray: 'text-gray-600',
  };
  return colors[color] || colors.gray;
};
```

Then update component to import these.

**After refactor, run tests again:**
```bash
npm test -- --testPathPattern=organizer
# All tests should still pass ✅
```

---

## ✅ SUCCESS CRITERIA

### Tests
- [ ] 4/4 service tests passing
- [ ] 5/5 hook tests passing
- [ ] 4/4 component tests passing (optional)
- [ ] Total: 9-13 tests passing
- [ ] Test duration: < 2 seconds
- [ ] No console errors in tests

### Code Quality
- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 warnings
- [ ] All imports use path aliases (@/)
- [ ] Smart/Dumb pattern followed
- [ ] No console.logs in production code
- [ ] Proper error handling

### Functionality
- [ ] Widget displays all 6 stats correctly
- [ ] Loading state shows skeleton
- [ ] Error state shows message + retry button
- [ ] Responsive design works
- [ ] Integrates cleanly in dashboard

---

## 🎯 INTEGRATION IN DASHBOARD

Once all tests pass, integrate the widget:

```typescript
// frontend/src/app/(admin)/dashboard/page.tsx
import { OrganizerStatsWidget } from '@/features/organizer/components/smart/OrganizerStatsWidget';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      <OrganizerStatsWidget />
      
      {/* Other dashboard content */}
    </div>
  );
}
```

---

## 📊 MANUAL TESTING

```bash
# 1. Start services
cd ~/code/plataforma-calendario
docker-compose up -d

# 2. Start frontend
cd frontend
npm run dev

# 3. Open browser: http://localhost:3000/dashboard

# 4. Login as organizer:
# Email: (from seeder - any organizer)
# Password: password123

# 5. Verify:
# ✅ Widget displays stats
# ✅ Loading state appears briefly
# ✅ Numbers match backend data
# ✅ Colors are appropriate
# ✅ Responsive on mobile
```

---

## 🎯 COMMIT STRATEGY

```bash
# After GREEN phase (all tests passing)
git add frontend/src/features/organizer/
git commit -m "feat(organizer): implement stats widget with TDD

CARD-002: Organizer Stats Widget - Frontend Implementation

Components:
- Add OrganizerStatsService (API client)
- Add useOrganizerStats hook (data fetching)
- Add OrganizerStatsCard (dumb/presentational)
- Add OrganizerStatsWidget (smart/container)
- Add TypeScript interfaces

Test Suite:
- Add 4 service tests (API calls, error handling)
- Add 5 hook tests (loading, success, error, refetch)
- Add 4 component tests (rendering, props)

Features:
- Loading state with skeleton
- Error state with retry button
- Responsive grid layout (2/3/4 columns)
- Color-coded status cards
- Total events counter

TDD Methodology:
- RED Phase: 13 tests written first (all failing)
- GREEN Phase: Implementation to pass all tests
- REFACTOR Phase: Extract utilities, improve readability

Architecture:
- Features-based structure
- Smart/Dumb component pattern
- Custom hooks for reusability
- Path aliases (@/)
- Zero technical debt

Test Results:
- Tests: 13/13 passing
- Duration: <2s
- Coverage: 100% on service/hook
- Quality: 10/10

Integrates with: CARD-001 Backend API
Resolves: CARD-002
TDD: Complete ✓"
```

---

## ⏱️ TIME BREAKDOWN

| Phase | Task | Time |
|-------|------|------|
| RED | Write service tests | 20 min |
| RED | Write hook tests | 30 min |
| RED | Write component tests | 20 min |
| **RED Total** | | **70 min** |
| GREEN | Implement types | 5 min |
| GREEN | Implement service | 15 min |
| GREEN | Implement hook | 25 min |
| GREEN | Implement dumb component | 45 min |
| GREEN | Implement smart component | 30 min |
| **GREEN Total** | | **120 min** |
| REFACTOR | Extract utilities | 15 min |
| REFACTOR | Improve error handling | 15 min |
| **REFACTOR Total** | | **30 min** |
| **TOTAL** | | **220 min (3.7 hours)** |

---

## 🚀 NEXT STEPS

After completing CARD-002 with TDD:

1. **Update TODO.md** (mark CARD-002 as complete)
2. **Update metrics** (frontend tests: 91 → 104)
3. **Commit and push**
4. **Decide next card:**
   - CARD-003: Event List Widget
   - CARD-004: Quick Actions
   - Or work on deuda técnica

---

**Metodología:** Test-Driven Development  
**Status:** Ready for RED phase  
**Calidad esperada:** 10/10 con tests completos