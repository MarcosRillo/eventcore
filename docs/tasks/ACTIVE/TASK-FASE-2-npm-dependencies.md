# TASK FASE 2: Actualizar npm Dependencies
**Archivo de referencia para:** Resolución deuda técnica TD-001  
**Branch:** fix/resolve-technical-debt  
**Tiempo estimado:** 60-90 minutos  
**Prioridad:** Alta  
**Score objetivo:** 9.87 → 9.94

---

## 🎯 FILOSOFÍA: CALIDAD SOBRE VELOCIDAD

**CRÍTICO:** Esta fase tiene mayor riesgo que Fase 1.

- ⏸️ NO apurarse - Verificar después de CADA update
- 🛑 Rollback inmediato si algo falla
- ✅ Resultado "11/12 packages" ES ÉXITO
- 📊 Tests 91/91 passing es NO-NEGOCIABLE

**REGLA DE ORO:** "Proyecto funcionando con packages viejos > Proyecto roto con packages nuevos"

---

## OBJETIVO

Actualizar 12 packages npm desactualizados:
- **Seguros (minor/patch):** react, typescript, tailwindcss, +8 más
- **Riesgoso (major):** @types/node (20.x → 24.x)

**Estrategia:** 
1. Actualizar minor/patch primero (bajo riesgo)
2. Actualizar @types/node después (con rollback plan)

---

## CHECKPOINT 0: Estado Inicial

### Verificaciones obligatorias:

```bash
cd frontend

# 1. Tests base
npm test
# Debe: 91/91 passing ✅

# 2. Build base
npm run build
# Debe: Success ✅

# 3. TypeScript base
npx tsc --noEmit
# Anotar errores: ___ (debe ser 0 después de Fase 1)
```

**🛑 SI ALGO FALLA:** No continuar. Investigar por qué.

### Backups obligatorios:

```bash
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup
```

**Resultado esperado:**
- 2 backups creados
- Estado inicial documentado

---

## PASO 1: Inspección de Packages

```bash
npm outdated
```

**Anotar en tabla:**

| Package | Current | Wanted | Latest | Tipo Update |
|---------|---------|--------|--------|-------------|
| react | | | | minor/patch/major |
| typescript | | | | |
| @types/node | | | | |
| ... | | | | |

**Análisis de riesgo:**
- ¿Cuántos packages minor/patch? (bajo riesgo)
- ¿Cuántos packages major? (alto riesgo)
- ¿Hay major jumps >2 versiones? (muy alto riesgo)

**🛑 SI HAY MAJOR JUMPS GRANDES:**
- Documentar cuáles
- Considerar NO actualizarlos
- Enfocarse solo en minor/patch

---

## PASO 2A: Actualizar Minor/Patch (SEGURO)

### Comando:

```bash
npm update
```

Este comando:
- ✅ Solo actualiza dentro del rango en package.json
- ✅ No hace jumps major
- ✅ Respeta semantic versioning

### Verificar cambios:

```bash
git diff package.json
git diff package-lock.json
```

**Checklist:**
- [ ] Solo versiones minor/patch cambiaron
- [ ] No hay cambios extraños
- [ ] package.json se ve razonable

**🛑 SI ALGO SE VE RARO:**
```bash
git restore package.json package-lock.json
# Reportar qué se vio raro
```

---

## CHECKPOINT 2A: Verificación Post-Update Minor/Patch

### ⚠️ CRÍTICO - NO SALTEARSE

Ejecutar en orden:

### Verificación 1: Tests (PRIMERO)
```bash
npm test
```

**Resultado esperado:** 91/91 passing

**🛑 SI NO ES 91/91:**
```bash
# ROLLBACK INMEDIATO
git restore package.json package-lock.json
npm install
npm test  # Debe volver a 91/91
# DETENER y reportar problema
```

### Verificación 2: Build
```bash
npm run build
```

**Resultado esperado:** Success

**🛑 SI FALLA:**
```bash
# ROLLBACK INMEDIATO
git restore package.json package-lock.json
npm install
npm run build  # Debe volver a Success
# DETENER y reportar problema
```

### Verificación 3: TypeScript
```bash
npx tsc --noEmit
```

**Resultado esperado:** 0 errores (o mismo número que CHECKPOINT 0)

**🛑 SI HAY MÁS ERRORES:**
```bash
# ROLLBACK INMEDIATO
git restore package.json package-lock.json
npm install
# DETENER y reportar problema
```

---

## DECISIÓN PUNTO DE CONTROL

**✅ Si las 3 verificaciones PASARON:**
- Continuar con Paso 2B (@types/node)

**❌ Si alguna FALLÓ:**
- NO continuar con 2B
- Mantener rollback
- Considerar commitear lo que funcionó hasta aquí
- Reportar problema

---

## PASO 2B: Actualizar @types/node (MAJOR - RIESGOSO)

### ⚠️ ADVERTENCIAS

- Major version jump: 20.x → 24.x
- Mayor riesgo de incompatibilidades
- Rollback es PROBABLE
- Si falla, está OK (11/12 es éxito)

### Pre-flight checks:
- [ ] Tests: 91/91 passing
- [ ] Build: Success
- [ ] TypeScript: 0 errores
- [ ] Backups: Disponibles

### Comando:

```bash
npm install --save-dev @types/node@latest
```

### Verificar versión instalada:

```bash
npm list @types/node
# Anotar: ___
```

---

## CHECKPOINT 2B: Verificación Post-Major-Update

### ⚠️ MÁXIMA ATENCIÓN - Alto riesgo de fallo

### Verificación 1: TypeScript (PRIMERO)

**Ejecutar antes que nada:**
```bash
npx tsc --noEmit
```

**Análisis:**
- Errores antes: ___ (del CHECKPOINT 2A)
- Errores ahora: ___

**Decisión:**
- ✅ Mismo número o menos → EXCELENTE, continuar
- ❌ Más errores (especialmente muchos) → PROBLEMA

**🛑 SI HAY MUCHOS ERRORES NUEVOS:**
```bash
# ROLLBACK de @types/node solamente
npm install --save-dev @types/node@20.19.13
npx tsc --noEmit  # Verificar que volvieron los errores originales
# DETENER actualización de @types/node
# Continuar con commit (Escenario B)
```

### Verificación 2: Build
```bash
npm run build
```

**🛑 SI FALLA:**
```bash
# ROLLBACK de @types/node
npm install --save-dev @types/node@20.19.13
npm run build  # Verificar que vuelve a funcionar
```

### Verificación 3: Tests
```bash
npm test
```

**🛑 SI NO ES 91/91:**
```bash
# ROLLBACK de @types/node
npm install --save-dev @types/node@20.19.13
npm test  # Verificar que vuelven a 91/91
```

---

## DECISIÓN FINAL: Qué Commitear

### Escenario A: TODO funcionó (12/12 packages)

**Condiciones:**
- ✅ npm update exitoso
- ✅ @types/node@latest exitoso
- ✅ Todas verificaciones pasaron

**Mensaje de commit:**
```bash
git add package.json package-lock.json
git commit -m "chore(deps): update npm dependencies to latest versions

Updated packages:
- react: X.X.X → Y.Y.Y (minor)
- typescript: X.X.X → Y.Y.Y (patch)
- tailwindcss: X.X.X → Y.Y.Y (patch)
- @types/node: 20.19.13 → 24.6.2 (major)
- + N other minor/patch updates

Verification completed successfully:
✅ Tests: 91/91 passing
✅ Build: Success
✅ TypeScript: 0 errors

Total packages updated: 12/12

Resolves: TD-001 from TECHNICAL-DEBT-INVENTORY.md"
```

**Ajustar versiones según lo que se actualizó realmente.**

---

### Escenario B: @types/node falló (11/12 packages)

**Condiciones:**
- ✅ npm update exitoso
- ❌ @types/node causó problemas
- ✅ Rollback exitoso

**Mensaje de commit:**
```bash
git add package.json package-lock.json
git commit -m "chore(deps): update npm dependencies (11/12 packages)

Updated packages:
- react: X.X.X → Y.Y.Y (minor)
- typescript: X.X.X → Y.Y.Y (patch)
- tailwindcss: X.X.X → Y.Y.Y (patch)
- + N other minor/patch updates

Verification:
✅ Tests: 91/91 passing
✅ Build: Success
✅ TypeScript: 0 errors

Note: @types/node NOT updated
- Attempted update from 20.19.13 → 24.x caused [issue]
- Kept at 20.19.13 for stability
- Can be attempted separately in future

Total packages updated: 11/12

Partially resolves: TD-001 from TECHNICAL-DEBT-INVENTORY.md"
```

**Nota:** Describir brevemente qué issue causó (ej: "TypeScript errors", "build failure").

---

### Escenario C: npm update falló

**Condiciones:**
- ❌ npm update causó problemas
- ✅ Rollback completo exitoso

**Acción:** 
- NO commitear nada
- Reportar problema detallado
- Investigar qué package causó issue

---

## POST-COMMIT VERIFICATION

Después de commitear:

```bash
# Ver commit
git log -1 --stat

# Ver cambios
git show HEAD

# Verificar archivos
# ¿Solo package.json y package-lock.json?
```

---

## MÉTRICAS DE ÉXITO

| Métrica | Antes | Después | Target |
|---------|-------|---------|--------|
| Packages desactualizados | 12 | 0-1 | ≤1 |
| Tests passing | 91/91 | 91/91 | 91/91 |
| Build status | Success | Success | Success |
| TypeScript errors | 0 | 0 | 0 |
| Packages actualizados | 0 | 11-12 | ≥11 |

**Score:** 9.87 → 9.94 (+0.07)

---

## TROUBLESHOOTING

### Problema: Tests fallan después de npm update
**Causa:** Algún minor/patch tuvo breaking change (raro)  
**Solución:** Rollback completo, actualizar uno por uno

### Problema: Build falla con error críptico
**Causa:** Incompatibilidad entre packages  
**Solución:** Rollback, revisar npm outdated, buscar changelogs

### Problema: @types/node causa 100+ errores
**Causa:** Breaking changes en types v20 → v24  
**Solución:** Rollback a v20, documentar en commit, está OK

### Problema: npm update no actualiza nada
**Causa:** package.json tiene versiones locked (^X.X.X)  
**Solución:** Verificar package.json, puede ser intencional

---

## RESULTADO ESPERADO

**Ideal:** 12/12 packages, todo funciona  
**Realista:** 11/12 packages, @types/node en v20  
**Aceptable:** 10/12 packages, algunas issues documentadas

**Crítico:** Tests 91/91 y Build Success SIEMPRE

---

## TIEMPO ESTIMADO

- Optimista: 60 min
- Realista: 75 min  
- Con issues: 90 min

---

## ARCHIVOS DE REFERENCIA

- Prompt corto: `docs/tasks/PROMPT-FASE-2-SHORT.txt`
- Task completo: Este archivo
- Inventario deuda: `TECHNICAL-DEBT-INVENTORY.md`