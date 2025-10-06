# TASK 6: Fix 37 Errores TypeScript en Tests (Opcional)

**Prioridad:** BAJA (Mejora de Calidad)  
**Tiempo estimado:** 1-2 horas  
**Contexto:** Después de TASK 3, quedan 37 errores legítimos de tipos en mocks de tests

---

## OBJETIVO

Corregir los 37 errores TypeScript reales en archivos de test para:
- Type safety completo en tests
- Mejor IntelliSense en editor
- Prevenir bugs en tests
- Validación estricta de tipos

**Nota:** Esta tarea es OPCIONAL y puede hacerse incrementalmente.

---

## TIPOS DE ERRORES A CORREGIR

Según output de TASK 3, los errores son:

### 1. Propiedades Incorrectas en Mocks (Mayoría)
- `status_id` vs `status` en Event mocks
- `slug` property que no existe en Event
- `code` property que no existe en Role

### 2. Type Mismatches en AuthContext
- Conversiones de tipos incorrectas
- Mocks que no coinciden con interfaces

### 3. Properties Opcionales No Manejadas
- Properties undefined en mocks
- Falta de null checks

---

## ESTRATEGIA DE FIX

### Enfoque Incremental (Recomendado)

Fix por archivo, uno a la vez:
1. Identificar archivo con más errores
2. Corregir todos los errores de ese archivo
3. Ejecutar tests para verificar no rompe nada
4. Commit
5. Siguiente archivo

**Ventaja:** Cambios pequeños, fáciles de revertir si algo falla.

### Enfoque Bulk (Más Rápido pero Riesgoso)

Fix todos los errores de una vez:
1. Generar lista completa de errores
2. Crear script de fix automático
3. Aplicar todos los fixes
4. Ejecutar tests y arreglar lo que falle

**Ventaja:** Más rápido. **Desventaja:** Si algo falla, es difícil debuguear.

---

## PASOS DE EJECUCIÓN

### 1. Generar Lista Completa de Errores

```bash
cd frontend

# Generar lista detallada de errores
npx tsc --noEmit 2>&1 > typescript-errors.txt

# Ver resumen de errores por archivo
cat typescript-errors.txt | grep "error TS" | cut -d'(' -f1 | sort | uniq -c | sort -rn
```

**Output esperado:**
```
10 src/features/events/hooks/__tests__/useEventManager.test.ts
8 src/features/events/services/__tests__/event.service.test.ts
12 src/context/__tests__/AuthContext.test.tsx
7 src/hooks/__tests__/usePermissions.test.ts
```

### 2. Fix por Archivo - Ejemplo: useEventManager.test.ts

**Ver errores específicos:**
```bash
npx tsc --noEmit 2>&1 | grep "useEventManager.test.ts"
```

**Errores típicos encontrados:**

```typescript
// ERROR: 'slug' does not exist in type 'Event'
const mockEvent = {
  id: 1,
  title: 'Test',
  slug: 'test-event',  // ❌ Event no tiene slug
  status_id: 1,        // ❌ Event tiene status, no status_id
};

// FIX:
const mockEvent: Partial<Event> = {
  id: 1,
  title: 'Test',
  // Remover slug (no existe en Event)
  status: { id: 1, status_code: 'draft', status_name: 'Draft' },  // ✅ Usar status object
};
```

**Implementar Fix:**

Editar `src/features/events/hooks/__tests__/useEventManager.test.ts`:

```typescript
// ANTES - Línea 54 (ejemplo)
const mockEvent = {
  id: 1,
  title: 'Test Event',
  slug: 'test-event',
  status_id: 1,
  category_id: 1,
};

// DESPUÉS
const mockEvent: Partial<Event> = {
  id: 1,
  title: 'Test Event',
  // slug no existe en Event type - remover
  status: {
    id: 1,
    status_code: 'draft',
    status_name: 'Draft'
  },
  category: {
    id: 1,
    name: 'Test Category'
  },
};
```

**Verificar:**
```bash
npx tsc --noEmit 2>&1 | grep "useEventManager.test.ts" | wc -l
# Debe mostrar menos errores que antes
```

### 3. Fix Común: status_id vs status

**Problema:** Muchos mocks usan `status_id: 1` pero Event type tiene `status: EventStatus`

**Fix rápido:** Crear helper function

```typescript
// src/test/helpers/mockHelpers.ts
export const createMockEvent = (overrides?: Partial<Event>): Event => {
  return {
    id: 1,
    title: 'Test Event',
    description: 'Test description',
    start_date: new Date('2025-11-01'),
    end_date: new Date('2025-11-02'),
    status: {
      id: 1,
      status_code: 'draft',
      status_name: 'Draft',
      is_public: false,
    },
    category: {
      id: 1,
      name: 'Test Category',
    },
    locations: [],
    ...overrides,
  } as Event;
};
```

**Usar en tests:**
```typescript
// ANTES
const mockEvent = { id: 1, title: 'Test', status_id: 1 };

// DESPUÉS
import { createMockEvent } from '@/test/helpers/mockHelpers';
const mockEvent = createMockEvent({ title: 'Test' });
```

### 4. Fix Común: Properties Opcionales

**Problema:** Properties marcadas como undefined

```typescript
// ERROR
const mockRole: Role = {
  id: 1,
  name: 'admin',
  code: 'admin_role',  // ❌ 'code' no existe en Role
};

// FIX: Ver interface real de Role
// src/features/auth/types/index.ts
interface Role {
  id: number;
  role_code: string;  // ✅ Es role_code, no code
  role_name: string;
  permissions: string[];
}

// Correcto:
const mockRole: Role = {
  id: 1,
  role_code: 'admin_role',  // ✅
  role_name: 'Admin',       // ✅
  permissions: ['manage_all'],
};
```

### 5. Fix Común: EventFormData vs Event

**Problema:** Confusión entre Event (DB model) y EventFormData (form data)

```typescript
// ERROR - mezclar tipos
const formData: EventFormData = {
  title: 'Test',
  status_id: 1,  // ❌ EventFormData no tiene status_id
};

// FIX - usar tipo correcto
const formData: EventFormData = {
  title: 'Test',
  description: 'Test',
  start_date: new Date(),
  end_date: new Date(),
  category_id: 1,
  location_ids: [1],
  type: 'single_location',
  // status no se incluye en form data
};
```

### 6. Ejecutar Tests Después de Cada Fix

```bash
# Verificar TypeScript
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l

# Ejecutar tests afectados
npm test -- useEventManager.test.ts

# Si pasan, commit
git add src/features/events/hooks/__tests__/useEventManager.test.ts
git commit -m "fix(tests): correct TypeScript errors in useEventManager.test.ts"
```

---

## SCRIPT AUTOMATIZADO (Opcional)

Para fixes masivos de patterns comunes:

```bash
#!/bin/bash
# fix-typescript-tests.sh

cd frontend

# Fix 1: Reemplazar status_id por status object en mocks
find src/**/__tests__ -name "*.test.ts" -o -name "*.test.tsx" | while read file; do
  # Backup
  cp "$file" "$file.bak"
  
  # Reemplazar pattern común
  sed -i '' 's/status_id: 1/status: { id: 1, status_code: "draft", status_name: "Draft" }/g' "$file"
  
  echo "Processed: $file"
done

# Verificar que no rompió nada
npm test

# Si tests pasan, remover backups
find src/**/__tests__ -name "*.bak" -delete
```

**⚠️ Cuidado:** Scripts automáticos pueden romper cosas. Siempre revisar cambios y ejecutar tests.

---

## ORDEN SUGERIDO DE FIX

Basado en impacto y complejidad:

1. **useEventManager.test.ts** (10 errores - alto impacto)
2. **AuthContext.test.tsx** (12 errores - medio impacto)
3. **event.service.test.ts** (8 errores - bajo impacto)
4. **usePermissions.test.ts** (7 errores - bajo impacto)

---

## VERIFICACIÓN FINAL

Después de todos los fixes:

```bash
# 1. TypeScript
npx tsc --noEmit
# Debe mostrar: 0 errors

# 2. Build
npm run build
# Debe compilar sin errores

# 3. Tests
npm test
# Debe pasar: 91/91 tests

# 4. Linting
npm run lint
# Debe mostrar: 0 errors, 0 warnings
```

---

## PROBLEMAS COMUNES

### Problema 1: Mock No Coincide con Type Actual

**Síntoma:** "Type X is not assignable to type Y"

**Solución:**
```typescript
// Ver type real
// Ctrl+Click en VSCode sobre el type para ver definición

// Usar Partial<T> si no necesitas todas las properties
const mockEvent: Partial<Event> = {
  id: 1,
  title: 'Test',
  // Solo las properties que necesitas
};
```

### Problema 2: Type Cambió Pero Tests No

**Síntoma:** Tests funcionan pero TypeScript da error

**Solución:**
- Ver CHANGELOG o git history del type
- Actualizar mocks para coincidir con nueva estructura
- Considerar si tests necesitan actualizarse también

### Problema 3: Interface No Exportada

**Síntoma:** "Cannot find name 'EventFormData'"

**Solución:**
```typescript
// Verificar que interface está exportada
// src/features/events/types/index.ts
export interface EventFormData {  // ✅ export
  // ...
}

// Importar correctamente en test
import { EventFormData } from '@/features/events/types';
```

---

## ROLLBACK

Si algo sale mal:

```bash
# Revertir archivo específico
git checkout -- src/features/events/hooks/__tests__/useEventManager.test.ts

# Revertir todos los tests
git checkout -- src/**/__tests__/

# Reinstalar dependencies por si acaso
rm -rf node_modules package-lock.json
npm install
```

---

## CRITERIOS DE ÉXITO

- [ ] `npx tsc --noEmit` muestra 0 errores
- [ ] `npm run build` exitoso
- [ ] `npm test` pasa 91/91 tests
- [ ] No hay regresiones en funcionalidad
- [ ] Commits son atómicos y descriptivos
- [ ] Mejor IntelliSense en tests

---

## ALTERNATIVA: Fix Incremental en el Futuro

Si no tienes tiempo ahora:

**Estrategia:** Fix-as-you-go
- Cuando trabajes en un feature, fix los tests relacionados
- Priorizar tests que tocas frecuentemente
- Ignorar tests que rara vez cambias

**Pros:** No interrumpe flujo de trabajo  
**Contras:** Deuda técnica persiste

---

## PRÓXIMO PASO

Después de completar esta tarea (o decidir posponerla):

**Opción A:** Continuar con Panel Organizador Frontend (FASE 2)  
**Opción B:** Otra deuda técnica identificada

---

**Tiempo real esperado:** 1-2 horas (o hacerlo incrementalmente)  
**Bloqueantes:** Ninguno  
**Dependencias:** TASK 3 completada (@types/jest instalado)  
**Opcional:** Puede hacerse más adelante sin urgencia