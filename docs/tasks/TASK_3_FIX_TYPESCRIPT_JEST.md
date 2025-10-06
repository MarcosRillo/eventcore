# TASK 3: Fix TypeScript Jest Types in tsconfig

**Prioridad:** BAJA (Quick Win)  
**Tiempo estimado:** 15 minutos  
**Contexto:** TypeScript no puede validar archivos de test, generando 611 errores falsos

---

## PROBLEMA

### Estado Actual

Ejecutar `npx tsc --noEmit` muestra 611 errores TypeScript:

```bash
cd frontend
npx tsc --noEmit

# Output:
src/context/__tests__/AuthContext.test.tsx:5:23 - error TS2307: Cannot find module '@testing-library/react-hooks'
src/features/events/hooks/__tests__/useEventManager.test.ts:3:35 - error TS2307: Cannot find module '@testing-library/react'
...
(611 errors total)
```

**Pero:**
- `npm run build` funciona perfectamente (0 errores) ✅
- `npm test` funciona perfectamente (91 tests passing) ✅
- El problema es SOLO con `tsc --noEmit`

### Causa Raíz

`tsconfig.json` actual NO incluye archivos de test:

```json
{
  "include": [
    "src"
  ]
}
```

Archivos en `__tests__/` y `*.test.ts` no están en el scope de TypeScript.

---

## SOLUCIÓN

Agregar archivos de test al `include` en `tsconfig.json`.

---

## PASOS DE EJECUCIÓN

### 1. Editar tsconfig.json

Ubicación: `frontend/tsconfig.json`

**ANTES:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": false,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "src"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

**DESPUÉS:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": false,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "src",
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "src/**/__tests__/**/*"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

**Cambios:**
- Agregado: `"src/**/*.test.ts"` (archivos test individuales TypeScript)
- Agregado: `"src/**/*.test.tsx"` (archivos test individuales React)
- Agregado: `"src/**/__tests__/**/*"` (carpetas __tests__ completas)

### 2. Verificar Fix

```bash
cd frontend

# Ejecutar TypeScript checker
npx tsc --noEmit
```

**Resultado esperado:**
```
# Debe mostrar 0 errores o muy pocos errores legítimos
# (No 611 errores como antes)
```

Si aún hay errores, revisar que sean errores reales del código, no imports faltantes.

### 3. Verificar que Build sigue funcionando

```bash
npm run build
```

**Resultado esperado:**
```
> next build

✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (11/11)
✓ Finalizing page optimization

Build completed in XX.XXs
```

### 4. Verificar que Tests siguen funcionando

```bash
npm test
```

**Resultado esperado:**
```
PASS src/context/__tests__/AuthContext.test.tsx
PASS src/features/events/hooks/__tests__/useEventManager.test.ts
PASS src/features/events/services/__tests__/event.service.test.ts
PASS src/hooks/__tests__/usePermissions.test.ts

Test Suites: 4 passed, 4 total
Tests:       91 passed, 91 total
Snapshots:   0 total
Time:        0.783 s
```

---

## TESTING

### Test 1: Verificar Errores Antes del Fix

```bash
cd frontend

# Contar errores ANTES
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l
```

**Resultado esperado:** ~611 errores

### Test 2: Aplicar Fix y Verificar Errores Después

```bash
# Editar tsconfig.json (agregar includes de test)

# Contar errores DESPUÉS
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l
```

**Resultado esperado:** 0 errores (o solo errores legítimos del código)

### Test 3: Verificar que tsc Encuentra Archivos de Test

```bash
npx tsc --listFiles | grep "__tests__"
```

**Resultado esperado:**
```
/path/to/frontend/src/context/__tests__/AuthContext.test.tsx
/path/to/frontend/src/features/events/hooks/__tests__/useEventManager.test.ts
...
```

Si no aparecen archivos de test, el `include` no está configurado correctamente.

---

## VALIDACIÓN ADICIONAL

### Verificar que Coverage de Tests No Cambia

```bash
npm test -- --coverage
```

**Resultado esperado:**
- Coverage debe ser el mismo (~83% según docs)
- Esta configuración NO afecta cómo Jest ejecuta los tests
- Solo afecta cómo TypeScript valida los archivos

### Verificar Intellisense en VSCode

Abrir archivo de test en VSCode, por ejemplo:
- `src/context/__tests__/AuthContext.test.tsx`

**Resultado esperado:**
- Autocompletado funciona para imports de `@testing-library`
- No hay squiggly lines rojos de error
- Hover sobre funciones muestra types correctos

---

## PROBLEMAS COMUNES

### Problema 1: "Cannot find module '@testing-library/react'"

**Causa:** Dependencies de test no instaladas

**Solución:**
```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/react-hooks @testing-library/jest-dom
```

### Problema 2: Aún hay errores después del fix

**Causa:** Errores legítimos en código de test

**Solución:**
- Revisar cada error individualmente
- Posiblemente hay imports incorrectos o types mal definidos
- Arreglar los errores reales del código

### Problema 3: Build falla después del cambio

**Causa:** tsconfig.json con sintaxis incorrecta

**Solución:**
- Verificar que JSON es válido (comas, brackets)
- Usar VSCode para validar JSON
- Revertir cambios si es necesario

---

## BENEFICIOS DEL FIX

1. **Type Safety en Tests:**
   - TypeScript valida archivos de test
   - Errores de tipos detectados antes de runtime
   - Mejor autocompletado en editor

2. **CI/CD Consistency:**
   - `tsc --noEmit` puede usarse en CI
   - Validación de tipos en pipeline
   - Detecta problemas antes de merge

3. **Developer Experience:**
   - Intellisense funciona en archivos test
   - Menos errores al escribir tests
   - Refactoring más seguro

---

## CRITERIOS DE ÉXITO

- [ ] `npx tsc --noEmit` muestra 0 errores (o muy pocos legítimos)
- [ ] `npm run build` sigue funcionando (0 errores)
- [ ] `npm test` sigue funcionando (91 tests passing)
- [ ] Archivos de test aparecen en `npx tsc --listFiles`
- [ ] VSCode muestra intellisense correcto en archivos test
- [ ] No hay regresiones en funcionalidad existente

---

## ALTERNATIVA (Si el fix no funciona)

Si agregar includes causa problemas, crear `tsconfig.test.json` separado:

```json
// tsconfig.test.json
{
  "extends": "./tsconfig.json",
  "include": [
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "src/**/__tests__/**/*"
  ]
}
```

Y usar:
```bash
npx tsc --project tsconfig.test.json --noEmit
```

Esto mantiene configs separadas para build vs testing.

---

## ROLLBACK (Si algo sale mal)

```bash
# Revertir tsconfig.json a versión anterior
git checkout -- frontend/tsconfig.json

# O manualmente quitar las líneas agregadas en "include"
```

---

## PRÓXIMO PASO

¡Task completada! 🎉

Después de las 3 tareas:
1. ✅ Migration trust_level
2. ✅ OrganizerController con security fix
3. ✅ TypeScript Jest types fix

**Revisar estado general:**
- Deuda técnica crítica resuelta
- Base lista para Panel Organizador
- Tests validados por TypeScript

**Decisión para mañana:**
- Continuar con Panel Organizador completo (FASE 2: Frontend)
- O resolver deuda técnica restante (npm updates, MailHog)

---

**Tiempo real esperado:** 10-15 minutos  
**Bloqueantes:** Ninguno  
**Dependencias:** Solo necesita que tsconfig.json sea editable