# TASK 4: Actualizar npm Dependencies

**Prioridad:** MEDIA (Deuda Técnica)  
**Tiempo estimado:** 30-60 minutos  
**Contexto:** 12 packages tienen updates disponibles según auditoría de Oct 3, 2025

---

## OBJETIVO

Actualizar dependencies npm obsoletas para:
- Mantener seguridad del proyecto
- Obtener bug fixes de versiones nuevas
- Prevenir problemas de compatibilidad futuros

---

## PACKAGES A ACTUALIZAR

### Patch/Minor Updates (Bajo Riesgo)
- **react**: 19.1.0 → 19.2.0 (minor)
- **react-dom**: 19.1.0 → 19.2.0 (minor)
- **typescript**: 5.9.2 → 5.9.3 (patch)
- **tailwindcss**: 4.1.13 → 4.1.14 (patch)
- **+ 8 packages adicionales** (ver con `npm outdated`)

### Major Updates (Requiere Verificación)
- **@types/node**: 20.19.13 → 24.6.2 (major)
  - ⚠️ Revisar breaking changes antes de actualizar

---

## PASOS DE EJECUCIÓN

### 1. Ver Estado Actual

```bash
cd frontend

# Ver todos los packages outdated
npm outdated

# Formato output:
# Package        Current  Wanted  Latest  Location
# react          19.1.0   19.2.0  19.2.0  node_modules/react
# typescript     5.9.2    5.9.3   5.9.3   node_modules/typescript
```

### 2. Actualizar Patch/Minor Seguros

```bash
# Actualizar todo lo que es compatible semver
npm update

# Esto actualiza packages dentro del rango permitido por package.json
# Ejemplo: "^19.1.0" permite actualizar a 19.x.x pero no a 20.x.x
```

### 3. Actualizar React Manualmente (Si Necesario)

```bash
# Ver versión actual
npm list react react-dom

# Actualizar a latest
npm install react@latest react-dom@latest

# Verificar versión instalada
npm list react react-dom
```

### 4. Revisar @types/node (Major Update)

```bash
# Ver changelog de @types/node
npm info @types/node versions
npm view @types/node@24.6.2

# Si breaking changes son aceptables, actualizar:
npm install --save-dev @types/node@latest

# Alternativa conservadora: quedarse en v20 LTS
npm install --save-dev @types/node@^20
```

**Nota sobre @types/node:**
- v20 = Node.js 20 LTS (recomendado)
- v24 = Node.js 24 (más reciente pero puede tener breaking changes)
- Verificar qué versión de Node.js usa el proyecto

### 5. Verificar Integridad del Proyecto

**Test 1: Build**
```bash
npm run build
```

**Resultado esperado:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (11/11)
```

**Test 2: Tests**
```bash
npm test
```

**Resultado esperado:**
```
Test Suites: 4 passed, 4 total
Tests:       91 passed, 91 total
```

**Test 3: TypeScript**
```bash
npx tsc --noEmit
```

**Resultado esperado:**
- Máximo 37 errores (los mismos que antes)
- No nuevos errores introducidos por updates

**Test 4: Development Server**
```bash
npm run dev
```

Abrir http://localhost:3000 y verificar:
- Aplicación carga correctamente
- No hay errores en consola del navegador
- Navegación funciona

---

## VERIFICACIÓN DE SEGURIDAD

### Auditoría de Vulnerabilidades

```bash
# Ver vulnerabilidades conocidas
npm audit

# Si hay vulnerabilidades críticas/altas:
npm audit fix

# Si requiere breaking changes:
npm audit fix --force
# ⚠️ Cuidado: puede romper cosas, hacer backup primero
```

---

## DOCUMENTAR CAMBIOS

### Actualizar package.json

Después de updates exitosos, verificar que package.json tiene las versiones correctas:

```bash
cat package.json | grep -A 20 "dependencies"
```

### Generar Changelog (Opcional)

```bash
# Ver qué cambió
git diff package.json package-lock.json
```

Documentar en commit:
```
chore(deps): update npm dependencies

Updates:
- react/react-dom: 19.1.0 → 19.2.0
- typescript: 5.9.2 → 5.9.3
- tailwindcss: 4.1.13 → 4.1.14
- @types/node: 20.19.13 → 20.x.x (stayed on LTS)

All tests passing, no breaking changes.
```

---

## PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: Conflictos de Versiones

**Error:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solución:**
```bash
# Opción 1: Force install (cuidado)
npm install --legacy-peer-deps

# Opción 2: Actualizar peer dependencies manualmente
# Revisar qué package causa conflicto y actualizar sus deps
```

### Problema 2: Build Falla Después de Update

**Error:**
```
Type error: Property 'X' does not exist on type 'Y'
```

**Solución:**
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install

# Limpiar cache de Next.js
rm -rf .next

# Rebuild
npm run build
```

### Problema 3: Tests Fallan

**Solución:**
```bash
# Limpiar cache de Jest
npm test -- --clearCache

# Re-ejecutar tests
npm test
```

### Problema 4: @types/node Breaking Changes

**Error:**
```
error TS2304: Cannot find name 'NodeJS'
```

**Solución:**
```bash
# Downgrade a última versión v20 LTS
npm install --save-dev @types/node@^20

# O actualizar código para usar nuevos types
```

---

## ROLLBACK (Si Todo Sale Mal)

### Revertir Cambios

```bash
# Revertir archivos
git checkout -- package.json package-lock.json

# Reinstalar versiones anteriores
rm -rf node_modules
npm install

# Verificar
npm run build
npm test
```

---

## CRITERIOS DE ÉXITO

- [ ] `npm outdated` muestra 0 packages o solo updates major que decidimos no hacer
- [ ] `npm run build` exitoso (0 errores)
- [ ] `npm test` pasa (91/91 tests)
- [ ] `npx tsc --noEmit` no muestra nuevos errores
- [ ] `npm audit` no muestra vulnerabilidades críticas/altas
- [ ] Aplicación funciona en `npm run dev`
- [ ] No hay regresiones en funcionalidad

---

## NOTAS ADICIONALES

### Estrategia Conservadora

Si prefieres ser conservador:
1. **NO actualizar major versions** (@types/node)
2. **Solo actualizar patch/minor** (bajo riesgo)
3. **Testear exhaustivamente** antes de commit

### Estrategia Agresiva

Si quieres estar al día:
1. **Actualizar todo a latest**
2. **Arreglar breaking changes** que aparezcan
3. **Aprovechar nuevas features**

**Recomendación:** Estrategia conservadora para este proyecto (mantener estabilidad).

---

## PRÓXIMO PASO

Después de completar esta tarea, continuar con:
- **TASK 5:** Configurar MailHog para testing de emails

---

**Tiempo real esperado:** 30-60 minutos  
**Bloqueantes:** Ninguno  
**Dependencias:** Node.js y npm instalados