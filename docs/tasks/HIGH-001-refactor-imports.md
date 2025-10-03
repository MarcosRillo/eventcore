# HIGH-001: Refactorizar Imports Relativos

**Tarea:** Convertir 21 archivos con imports relativos `../../../` a absolutos `@/`
**Tiempo estimado:** 1-2 horas
**Severidad:** Alta (mantenibilidad)
**Branch:** `refactor/high-001-fix-relative-imports`

**Status:** ✅ COMPLETADO
**Fecha de ejecución:** Octubre 2025 (verificado en auditoría Oct 3)
**Resultado:** 0 imports relativos encontrados en auditoría
**Evidencia:** `grep -r "from ['\"]\.\./" frontend/src` = 0 resultados

---

## PASO 1: Verificar script existe

```bash
ls -lh audit-outputs/refactor-imports.sh
```

**Esperado:** Archivo existe (~2KB)

---

## PASO 2: Ver archivos afectados ANTES

```bash
cd frontend
grep -r "\.\./\.\./\.\." src/ --include="*.ts" --include="*.tsx" | wc -l
```

**Esperado:** ~21 archivos

---

## PASO 3: Ejecutar script de refactoring

```bash
bash ../audit-outputs/refactor-imports.sh
```

**Esperado:** Script ejecuta sin errores

---

## PASO 4: Verificar cambios realizados

```bash
grep -r "\.\./\.\./\.\." src/ --include="*.ts" --include="*.tsx" | wc -l
```

**Esperado:** 0 o muy pocos

---

## PASO 5: Build verification

```bash
npm run build
```

**Esperado:** `✓ Compiled successfully`

---

## PASO 6: TypeScript check

```bash
npx tsc --noEmit
```

**Esperado:** Sin errores

---

## PASO 7: ESLint check

```bash
npm run lint
```

**Esperado:** Sin errores críticos

---

## PASO 8: Revisar archivos modificados

```bash
git status
git diff --stat
```

**Esperado:** ~21 archivos modificados

---

## PASO 9: Ver ejemplo de cambios

```bash
git diff src/features/events/hooks/useEventManager.ts | head -20
```

**Esperado:** Cambios de `../../` a `@/`

---

## CRITERIOS DE ÉXITO

- ✅ Script ejecutado sin errores
- ✅ Imports relativos eliminados/reducidos
- ✅ `npm run build` exitoso
- ✅ `npx tsc --noEmit` sin errores
- ✅ ~21 archivos modificados
- ✅ Cambios visibles en git diff

---

## REPORTAR

Al finalizar, reportar:
1. Número de archivos con imports relativos ANTES
2. Número de archivos con imports relativos DESPUÉS
3. Build status (success/fail)
4. TypeScript errors (cantidad)
5. Archivos modificados (cantidad)
6. Ejemplo de transformación (1-2 líneas)

---

## NOTAS

- NO hacer commit (esperar auditoría)
- Si hay errores, DETENER y reportar
- Mantener todos los cambios en working directory

---

## VERIFICACIÓN POST-EJECUCIÓN

**Auditoría:** Octubre 3, 2025

**Comando ejecutado:**
```bash
grep -r "from ['\"]\.\./" frontend/src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l
```

**Resultado:** 0 imports relativos

**Conclusión:** Tarea completada exitosamente. Todo el código usa imports absolutos con @/