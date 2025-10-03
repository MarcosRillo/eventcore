# HIGH-002: Configurar ESLint Estricto

**Tarea:** Implementar reglas ESLint strict para enforced code quality
**Tiempo estimado:** 30-60 minutos
**Severidad:** Alta (calidad de código)
**Branch:** `refactor/high-002-eslint-strict`

**Status:** ✅ COMPLETADO
**Fecha de ejecución:** Octubre 2025 (verificado en auditoría Oct 3)
**Resultado:** 0 ESLint warnings, código ya cumplía con reglas estrictas
**Tiempo real:** Menos del estimado (código ya era de calidad)

---

## CONTEXTO

Actualmente el proyecto usa configuración ESLint básica de Next.js (defaults). Necesitamos agregar reglas estrictas personalizadas para:
- Prevenir uso de `any` types
- Detectar variables no usadas
- Enforced mejores prácticas TypeScript
- Mantener código consistente

**Estado actual:**
- Build: Exitoso
- ESLint warnings: 0 (configuración básica)
- TypeScript strict mode: Activo

---

## PASO 1: Crear configuración ESLint estricta

```bash
cd frontend
cat > .eslintrc.json << 'EOF'
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/no-floating-promises": "warn",
    "no-console": [
      "warn",
      {
        "allow": ["warn", "error"]
      }
    ],
    "prefer-const": "error",
    "no-var": "error"
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  }
}
EOF
```

**Esperado:** Archivo `.eslintrc.json` creado

---

## PASO 2: Verificar instalación de dependencias

```bash
npm list @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

**Esperado:** Ambos packages listados

**Si faltan, instalar:**
```bash
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

---

## PASO 3: Ejecutar ESLint y capturar warnings

```bash
npm run lint 2>&1 | tee eslint-output.txt
```

**Esperado:** Lista de warnings/errors encontrados

---

## PASO 4: Analizar tipo de warnings

```bash
# Contar por tipo de warning
grep -o "@typescript-eslint/[a-z-]*" eslint-output.txt | sort | uniq -c | sort -nr

# Ver archivos más afectados
grep "\.tsx\?$" eslint-output.txt | cut -d: -f1 | sort | uniq -c | sort -nr | head -10
```

**Esperado:** Reporte de warnings agrupados

---

## PASO 5: Fix automático de issues simples

```bash
npm run lint -- --fix
```

**Esperado:** ESLint corrige automáticamente lo que puede

---

## PASO 6: Verificar warnings restantes

```bash
npm run lint 2>&1 | grep -c "warning\|error"
```

**Esperado:** Número de warnings/errors restantes

---

## PASO 7: Revisar warnings críticos manualmente

Si hay warnings restantes que no se arreglaron automáticamente:

```bash
npm run lint 2>&1 | grep "error" | head -20
```

**Acción:** Documentar warnings que requieren revisión manual

---

## PASO 8: Verificar build sigue funcionando

```bash
npm run build
```

**Esperado:** Build exitoso

---

## PASO 9: Verificar TypeScript

```bash
npx tsc --noEmit
```

**Esperado:** 0 errores TypeScript

---

## PASO 10: Documentar estado final

```bash
# Guardar configuración y reporte
git status
npm run lint 2>&1 | tee eslint-final-report.txt
```

**Esperado:** Archivos modificados listados

---

## CRITERIOS DE ÉXITO

- [ ] Archivo `.eslintrc.json` creado con reglas estrictas
- [ ] ESLint ejecuta sin errores de configuración
- [ ] `npm run lint -- --fix` ejecutado
- [ ] `npm run build` exitoso
- [ ] `npx tsc --noEmit` sin errores
- [ ] Warnings documentados (si los hay)

---

## ESCENARIOS POSIBLES

### Escenario A: 0 warnings después de --fix
**Acción:** Commit directamente

### Escenario B: <10 warnings restantes
**Acción:** Revisar y decidir si:
1. Corregir manualmente
2. Agregar excepciones justificadas
3. Ajustar severidad (error → warn)

### Escenario C: >10 warnings restantes
**Acción:** 
1. Documentar en issue
2. Ajustar reglas menos estrictas
3. Plan de corrección gradual

---

## REGLAS IMPLEMENTADAS

### @typescript-eslint/no-explicit-any
**Severidad:** error  
**Qué previene:** Uso de `any` types  
**Excepciones:** Ninguna (use `unknown` en su lugar)

### @typescript-eslint/no-unused-vars
**Severidad:** error  
**Qué previene:** Variables/parámetros declarados pero no usados  
**Excepciones:** Variables que empiezan con `_`

### @typescript-eslint/no-floating-promises
**Severidad:** warn  
**Qué previene:** Promises sin await/catch  
**Acción:** Agregar `void` o `await`

### no-console
**Severidad:** warn  
**Qué previene:** console.log en producción  
**Excepciones:** console.warn, console.error permitidos

### prefer-const / no-var
**Severidad:** error  
**Qué previene:** Uso de `let` cuando debería ser `const`, uso de `var`  
**Acción:** Auto-fixeable

---

## REPORTAR

Al finalizar, reportar:
1. Configuración ESLint creada (sí/no)
2. Warnings encontrados (número)
3. Warnings auto-corregidos (número)
4. Warnings restantes (número y tipos)
5. Build status (success/fail)
6. Archivos modificados (número)

---

## NOTAS

- NO hacer commit todavía (esperar auditoría)
- Si build falla, DETENER y reportar
- Documentar cualquier warning que no se pueda auto-corregir
- Guardar `eslint-output.txt` para referencia

---

## VERIFICACIÓN POST-EJECUCIÓN

**Auditoría:** Octubre 3, 2025

**Métricas verificadas:**
- ESLint warnings: 0
- ESLint errors: 0
- any types: 0
- console.log: 0
- Code quality: Excelente

**Comandos ejecutados:**
```bash
cd frontend
npm run lint        # 0 warnings, 0 errors
grep -r ": any" src --include="*.ts" --include="*.tsx" | wc -l  # 0
grep -r "console\.log" src --include="*.ts" --include="*.tsx" | wc -l  # 0
```

**Conclusión:** El código ya cumplía con todas las reglas estrictas antes de configurarlas, lo que demuestra la calidad arquitectural del proyecto.