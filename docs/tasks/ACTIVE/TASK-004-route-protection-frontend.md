# TASK-004: Protección de Rutas por Rol en Frontend

**Creado:** Octubre 6, 2025  
**Prioridad:** ALTA - Mejora de seguridad y UX  
**Tiempo estimado:** 1-2 horas  
**Dependencias:** TASK-SECURITY completada (backend roles funcionando)

---

## PROBLEMA ACTUAL

**Backend:** Seguro con middleware de roles  
**Frontend:** Inseguro - cualquier usuario puede acceder a cualquier ruta escribiendo la URL

**Escenario actual:**
```
1. Login como Event Organizer (Maria Rodriguez)
2. Navegar manualmente a: http://localhost:3000/events
3. ❌ La pantalla se muestra (aunque el backend retorne 403)
4. ❌ Usuario ve UI que no debería ver
5. ❌ Mal UX y confusión
```

**Lo que necesitamos:**
- Event Organizers solo pueden acceder a `/organizer/*`
- Entity roles NO pueden acceder a `/organizer/*`
- Redirección automática si intentan acceder a rutas no permitidas
- Loading state mientras verifica autenticación

---

## SOLUCIÓN: Middleware de Next.js

Next.js 15 permite crear un middleware que se ejecuta ANTES de renderizar cualquier página. Perfecto para proteger rutas.

**Ubicación:** `frontend/src/middleware.ts` (en la raíz de `src/`)

---

## IMPLEMENTACIÓN

### 1. Crear Middleware Principal

**Archivo:** `frontend/src/middleware.ts`

```typescript
/**
 * Next.js Middleware - Route Protection
 * Protects routes based on user role from authentication
 * Runs before rendering any page
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper function to get user from cookies
function getUserFromCookies(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const userStr = request.cookies.get('user')?.value;

  if (!token || !userStr) {
    return null;
  }

  try {
    const user = JSON.parse(userStr);
    return user;
  } catch {
    return null;
  }
}

// Helper function to get role name
function getRoleName(user: any): string | null {
  return user?.role?.role_name || null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  const publicRoutes = ['/login', '/calendar'];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get user from cookies
  const user = getUserFromCookies(request);

  // Not authenticated - redirect to login
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const roleName = getRoleName(user);

  // No role - redirect to login (invalid user)
  if (!roleName) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ROLE-BASED PROTECTION
  
  // Event Organizer - ONLY /organizer/* and /calendar
  if (roleName === 'Event Organizer') {
    // Allow: /organizer/*, /calendar/*
    const allowedPaths = ['/organizer', '/calendar'];
    const isAllowed = allowedPaths.some(path => pathname.startsWith(path));

    if (!isAllowed) {
      // Trying to access Entity routes - redirect to organizer dashboard
      console.log(`[Middleware] Event Organizer blocked from: ${pathname}`);
      return NextResponse.redirect(new URL('/organizer/dashboard', request.url));
    }
  }

  // Entity roles (Admin, Staff) - NO /organizer/*
  const entityRoles = ['Entity Administrator', 'Entity Staff', 'Platform Administrator'];
  if (entityRoles.includes(roleName)) {
    if (pathname.startsWith('/organizer')) {
      // Trying to access Organizer routes - redirect to events
      console.log(`[Middleware] ${roleName} blocked from: ${pathname}`);
      return NextResponse.redirect(new URL('/events', request.url));
    }
  }

  // Entity Staff - NO write operations (handled by backend, but good UX to prevent access)
  if (roleName === 'Entity Staff') {
    const readOnlyRestrictions = [
      '/events/create',
      '/events/edit',
      '/categories/create',
      '/categories/edit',
      '/locations/create',
      '/locations/edit',
      '/admin',
    ];

    if (readOnlyRestrictions.some(path => pathname.startsWith(path))) {
      console.log(`[Middleware] Entity Staff blocked from write route: ${pathname}`);
      return NextResponse.redirect(new URL('/events', request.url));
    }
  }

  // All checks passed - allow access
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

---

### 2. Actualizar AuthContext para Guardar en Cookies

El middleware necesita acceder al usuario desde cookies, no desde localStorage.

**Archivo:** `frontend/src/context/useAuthActions.ts`

**Agregar después del login exitoso:**

```typescript
const login = async (credentials: LoginCredentials): Promise<boolean> => {
  try {
    setIsLoading(true);
    setError(null);
    
    const response = await apiClient.post<{ data: LoginResponse }>('/auth/login', credentials);
    
    if (!response.data?.data) {
      throw new Error('Invalid response structure from login API');
    }

    const { token: authToken, user: userData } = response.data.data;

    if (!authToken || !userData) {
      throw new Error('Missing token or user data in login response');
    }

    // Store in localStorage (existing)
    setAuthToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));

    // ✅ AGREGAR: Store in cookies for middleware access
    document.cookie = `token=${authToken}; path=/; max-age=86400; samesite=strict`;
    document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=86400; samesite=strict`;

    // Update state
    setTokenState(authToken);
    setUser(userData);

    return true;
  } catch (error) {
    // ... error handling
  }
};
```

**Actualizar logout para limpiar cookies:**

```typescript
const logout = () => {
  // Clear localStorage (existing)
  removeAuthToken();
  localStorage.removeItem('user');

  // ✅ AGREGAR: Clear cookies
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

  // Reset state
  setTokenState(null);
  setUser(null);
};
```

---

## TESTING Y VERIFICACIÓN

### Test 1: Event Organizer - Bloqueado de rutas del Ente

**Setup:**
1. Login como `maria.rodriguez@sheraton.com`
2. Navegar a: `http://localhost:3000/events`

**Resultado esperado:**
- Redirección automática a `/organizer/dashboard`
- Console log: `[Middleware] Event Organizer blocked from: /events`

**Verificar también:**
```
/dashboard         → Redirect a /organizer/dashboard
/categories        → Redirect a /organizer/dashboard
/admin/appearance  → Redirect a /organizer/dashboard
```

---

### Test 2: Entity Admin - Bloqueado de rutas del Organizador

**Setup:**
1. Login como `ana.garcia@enteturismo.gov.ar`
2. Navegar a: `http://localhost:3000/organizer/dashboard`

**Resultado esperado:**
- Redirección automática a `/events`
- Console log: `[Middleware] Entity Administrator blocked from: /organizer/dashboard`

---

### Test 3: Entity Staff - Bloqueado de rutas de escritura

**Setup:**
1. Login como `pedro.gomez@enteturismo.gov.ar`
2. Navegar a: `http://localhost:3000/categories/create`

**Resultado esperado:**
- Redirección automática a `/events`
- Console log: `[Middleware] Entity Staff blocked from write route: /categories/create`

**Verificar puede acceder a:**
```
/events           → ✅ Permitido (read-only)
/dashboard        → ✅ Permitido (read-only)
/categories       → ✅ Permitido (read-only)
```

---

### Test 4: Usuario no autenticado

**Setup:**
1. Logout (si estás logueado)
2. Navegar a: `http://localhost:3000/events`

**Resultado esperado:**
- Redirección a `/login?from=/events`
- Después del login, redirige de vuelta a `/events` (si el rol lo permite)

---

### Test 5: Rutas públicas

**Setup:**
1. Logout
2. Navegar a: `http://localhost:3000/calendar`

**Resultado esperado:**
- Acceso permitido sin login
- No hay redirección

---

## MEJORAS ADICIONALES (Opcionales)

### 1. Loading State durante verificación

Crear componente de loading para rutas protegidas:

```typescript
// src/components/auth/RouteProtectionLoading.tsx
export const RouteProtectionLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Verificando permisos...</p>
    </div>
  </div>
);
```

### 2. Mensaje de acceso denegado

En lugar de redirección silenciosa, mostrar toast:

```typescript
// Agregar al middleware antes de redirect
const response = NextResponse.redirect(new URL('/events', request.url));
response.cookies.set('access-denied', 'true', { maxAge: 5 });
return response;
```

Luego en el layout, leer la cookie y mostrar mensaje.

### 3. Logging de intentos de acceso

Para auditoría, loggear todos los intentos bloqueados:

```typescript
// En middleware, antes de redirect
await fetch('/api/v1/audit/access-denied', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    user_id: user.id,
    attempted_path: pathname,
    role: roleName,
    timestamp: new Date().toISOString(),
  }),
});
```

---

## CRITERIOS DE ÉXITO

### Funcionalidad
- [ ] Event Organizer bloqueado de rutas del Ente (redirect a /organizer/dashboard)
- [ ] Entity roles bloqueados de rutas del Organizador (redirect a /events)
- [ ] Entity Staff bloqueado de rutas de escritura
- [ ] Usuarios no autenticados redirigen a /login
- [ ] Rutas públicas (/login, /calendar) accesibles sin autenticación

### Testing
- [ ] Test 1: Event Organizer - 5 rutas bloqueadas
- [ ] Test 2: Entity Admin - /organizer/* bloqueado
- [ ] Test 3: Entity Staff - rutas de escritura bloqueadas
- [ ] Test 4: No autenticado - redirect a /login
- [ ] Test 5: Rutas públicas accesibles

### Logging
- [ ] Console logs muestran accesos bloqueados
- [ ] Logs incluyen: rol, ruta intentada, acción tomada

### UX
- [ ] No se muestra UI de rutas no permitidas (redirect inmediato)
- [ ] Redirecciones son rápidas y suaves
- [ ] No hay flash de contenido no autorizado

---

## NOTAS TÉCNICAS

### Diferencia con Backend Security

**Backend (TASK-SECURITY):**
- Protege APIs y datos
- Retorna 403/404 para requests no autorizados
- Evita modificación de datos

**Frontend (TASK-004):**
- Protege rutas y UI
- Mejora UX evitando mostrar pantallas no permitidas
- Reduce requests fallidos al backend

**Ambos son necesarios:**
- Backend: Seguridad real
- Frontend: UX y performance

### Next.js Middleware Execution

El middleware se ejecuta:
1. **Antes** de cualquier renderizado
2. En el **edge runtime** (muy rápido)
3. Para **todas las rutas** que coincidan con `matcher`

**No se ejecuta para:**
- Archivos estáticos (`_next/static`, imágenes)
- API routes (a menos que se especifique en matcher)

### Cookies vs localStorage

**Middleware necesita cookies** porque:
- localStorage NO está disponible en edge runtime
- Cookies son accesibles en server-side
- Más seguro para autenticación server-side

---

## COMMIT

```bash
git add frontend/src/middleware.ts
git add frontend/src/context/useAuthActions.ts
git commit -m "feat(frontend): implement role-based route protection middleware

- Add Next.js middleware for route protection
- Block Event Organizers from Entity routes
- Block Entity roles from Organizer routes
- Block Entity Staff from write routes
- Redirect unauthorized access automatically
- Store auth data in cookies for middleware access

Security improvements:
- No UI shown for unauthorized routes
- Automatic redirection based on role
- Logging of blocked access attempts

UX improvements:
- Users only see their allowed routes
- No 403 errors from UI navigation
- Cleaner separation of role interfaces

Resolves: TASK-004 (Route Protection Frontend)"
```

---

**Tiempo real esperado:** 1-2 horas  
**Bloqueantes:** Ninguno  
**Prioridad:** ALTA - Complementa seguridad del backend con mejor UX