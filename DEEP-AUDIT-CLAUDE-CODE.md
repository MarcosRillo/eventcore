# 🤖 AUDITORÍA PROFUNDA CON CLAUDE CODE

**Propósito:** Ejecutar auditoría profunda del proyecto usando Claude Code  
**Ventaja:** Todo automatizado end-to-end, sin uploads manuales  
**Tiempo:** 40-50 minutos (Claude Code trabaja, vos descansás)

---

## 🎯 OVERVIEW

Este sistema permite que **Claude Code** ejecute la auditoría completa del proyecto y genere documentación actualizada en una sola sesión.

**Archivos necesarios en el proyecto:**
```
proyecto-root/
├── deep-audit.sh              ← Script de auditoría
└── DEEP-AUDIT-CLAUDE-CODE.md  ← Este archivo (instrucciones)
```

---

## 🚀 CÓMO USAR CON CLAUDE CODE

### Paso 1: Preparar Archivos (5 min - una sola vez)

```bash
# En el root de tu proyecto
cd ~/code/plataforma-calendario

# Copiar archivos de auditoría desde outputs/
# (descargar desde Claude.ai o copiar desde donde los tengas)
cp /path/to/deep-audit.sh .
cp /path/to/DEEP-AUDIT-CLAUDE-CODE.md .

# Hacer script ejecutable
chmod +x deep-audit.sh

# Commit
git add deep-audit.sh DEEP-AUDIT-CLAUDE-CODE.md
git commit -m "docs: add deep audit system for Claude Code"
```

---

### Paso 2: Ejecutar con Claude Code (40-50 min)

Abrir Claude Code en la terminal del proyecto y enviar este prompt:

```
Por favor ejecuta una auditoría profunda del proyecto siguiendo estas instrucciones:

1. LEE el archivo DEEP-AUDIT-CLAUDE-CODE.md para entender el proceso

2. EJECUTA el script de auditoría:
   bash deep-audit.sh --all

3. LEE los 4 reportes generados en audit-reports-*/

4. ANALIZA los reportes en profundidad y GENERA:
   - TODO.md actualizado con métricas REALES (no estimaciones)
   - TECHNICAL-DEBT-INVENTORY.md con items reales encontrados
   - PROJECT-STATUS.md (nuevo) con snapshot completo del proyecto
   - ARCHITECTURE.md actualizado si hay cambios estructurales

5. VALIDA que todos los números en la documentación generada coincidan 
   con los reportes (cross-check de métricas)

Filosofía: Máxima calidad sobre velocidad.
Todos los datos deben estar basados en los reportes de auditoría, 
no en estimaciones o suposiciones.

Confirma cuando hayas completado cada paso.
```

---

## 📋 PROCESO DETALLADO (Para Claude Code)

### FASE 1: Lectura de Contexto

**Acción:** Leer este archivo completo para entender el proceso

**Objetivo:** 
- Comprender qué hace el script de auditoría
- Entender qué métricas se extraen
- Saber qué documentación generar

---

### FASE 2: Ejecución de Auditoría

**Comando:**
```bash
bash deep-audit.sh --all
```

**Output esperado:**
```
audit-reports-YYYY-MM-DD_HH-MM/
├── 00-AUDIT-SUMMARY.md
├── backend-audit-report.md
├── frontend-audit-report.md
└── project-metrics.md
```

**Duración:** 10-15 minutos

**Qué hace el script:**
1. ✅ Ejecuta tests backend: `php artisan test`
2. ✅ Ejecuta tests frontend: `npm test`
3. ✅ Verifica TypeScript: `npx tsc --noEmit`
4. ✅ Ejecuta ESLint: `npm run lint`
5. ✅ Verifica build: `npm run build`
6. ✅ Cuenta LOC, componentes, services, hooks
7. ✅ Detecta TODOs, FIXMEs, console.logs, any types
8. ✅ Lista dependencies desactualizadas
9. ✅ Analiza git history
10. ✅ Genera 4 reportes markdown

---

### FASE 3: Lectura de Reportes

**Acción:** Leer y parsear los 4 reportes generados

**Archivos a leer:**
```bash
# Encontrar directorio de reportes
REPORT_DIR=$(ls -td audit-reports-* | head -1)

# Leer reportes
cat $REPORT_DIR/00-AUDIT-SUMMARY.md
cat $REPORT_DIR/backend-audit-report.md
cat $REPORT_DIR/frontend-audit-report.md
cat $REPORT_DIR/project-metrics.md
```

**Extraer estas métricas clave:**

**Backend:**
- PHP version
- Laravel version
- Tests: X/Y passing
- Models count
- Controllers count
- Services count
- Features count
- LOC (Lines of Code)
- TODOs count
- FIXMEs count
- Outdated dependencies list

**Frontend:**
- Node version
- Next.js version
- React version
- TypeScript version
- Tests: X/Y passing
- TypeScript errors count
- ESLint warnings/errors count
- Components count
- Hooks count
- Services count
- Types count
- LOC
- console.log count
- any types count
- Outdated dependencies list

**General:**
- Total commits
- Branches count
- Contributors count
- Last commit date
- Documentation files count

---

### FASE 4: Generación de Documentación

**Archivos a generar/actualizar:**

#### 1. TODO.md (actualizar)

**Estructura:**
```markdown
# 📊 ESTADO ACTUAL DEL PROYECTO
## Plataforma Multi-Tenant de Eventos Turísticos - Tucumán

**Fecha:** [FECHA ACTUAL]
**Última auditoría:** [FECHA EJECUCIÓN AUDIT]
**Score general:** [SCORE BASADO EN MÉTRICAS]/10

---

## 📊 MÉTRICAS ACTUALES (VERIFICADAS)

### Backend
- Tests: [X]/[Y] passing ([TIEMPO]s)
- Coverage: [%] (verificado en reporte)
- Architecture: Features-based
- Controllers: [N]
- Services: [N]
- Models: [N]
- Features: [N]
- LOC Features: [N] líneas
- TODOs: [N]
- FIXMEs: [N]

### Frontend
- Tests: [X]/[Y] passing ([TIEMPO]s)
- TypeScript errors (build): [N]
- ESLint warnings: [N]
- ESLint errors: [N]
- Components: [N]
- Hooks: [N]
- Services: [N]
- Type files: [N]
- LOC src/: [N] líneas
- console.logs: [N]
- any types: [N]

### General
- Tests totales: [BACKEND + FRONTEND]
- Score técnico: [CALCULADO]/10
- MVP funcional: [%] completo
- Deuda técnica crítica: [N]
- Deuda técnica total: [N] items

[... resto del TODO según template existente ...]
```

**CRÍTICO:** Todos los números deben venir de los reportes, NO estimaciones.

---

#### 2. TECHNICAL-DEBT-INVENTORY.md (actualizar)

**Extraer de reportes:**

**Items críticos (si existen):**
- Test failures (si tests no pasaron 100%)
- TypeScript errors en build (si > 0)
- ESLint errors (si > 0)

**Items medios:**
- Outdated dependencies (lista exacta de composer.json y package.json)
- PHPUnit warnings (si existen)
- TypeScript errors en tsc --noEmit (si > 0 pero build OK)

**Items bajos:**
- console.log() calls (lista archivos)
- any types (lista archivos)
- TODOs en código (lista archivos con líneas)
- FIXMEs en código (lista archivos con líneas)

**Estructura:**
```markdown
# TECHNICAL DEBT INVENTORY

**Última actualización:** [FECHA AUDIT]
**Fuente:** deep-audit.sh execution
**Score de deuda:** [CALCULADO]/10

---

## DEUDA TÉCNICA ACTUAL

### CRÍTICA (Alta Prioridad)
[Lista items críticos encontrados]
[Si no hay: "0 items - No hay deuda técnica crítica ✅"]

### MEDIA (2 items)
[Lista items medios con detalles específicos de reportes]

### BAJA (N items)
[Lista items bajos con ubicaciones exactas]

---

## MÉTRICAS DE DEUDA TÉCNICA

| Métrica | Valor | Target | Status |
|---------|-------|--------|--------|
| Items críticos | [N] | 0 | [✓/✗] |
| Items medios | [N] | <5 | [✓/✗] |
| Items bajos | [N] | <10 | [✓/✗] |
| TODOs en código | [N] | 0 | [✓/✗] |
| FIXMEs en código | [N] | 0 | [✓/✗] |
| console.log | [N] | 0 | [✓/✗] |
| any types | [N] | 0 | [✓/✗] |
```

---

#### 3. PROJECT-STATUS.md (nuevo)

**Snapshot completo del proyecto basado en reportes:**

```markdown
# 📊 PROJECT STATUS SNAPSHOT
**Generated:** [FECHA AUDIT]
**Source:** deep-audit.sh execution
**Purpose:** Complete project state based on verified metrics

---

## 🎯 EXECUTIVE SUMMARY

**Overall Score:** [CALCULADO]/10
**MVP Progress:** [%]
**Production Ready:** [YES/NO]
**Critical Issues:** [N]

---

## 📊 DETAILED METRICS

### Backend Status
- **Architecture:** Features-based ✅
- **Tests:** [X]/[Y] passing ([%] pass rate)
- **Code Quality:** 
  - LOC: [N] lines
  - TODOs: [N]
  - FIXMEs: [N]
- **Features:** [N] features implemented
- **Models:** [N]
- **Controllers:** [N]
- **Services:** [N]

### Frontend Status
- **Architecture:** Features-based ✅
- **Tests:** [X]/[Y] passing ([%] pass rate)
- **Build:** [SUCCESS/FAILED] ([TIME]s)
- **TypeScript:** [N] errors (strict mode)
- **ESLint:** [N] warnings, [N] errors
- **Code Quality:**
  - LOC: [N] lines
  - console.logs: [N]
  - any types: [N]
- **Components:** [N]
- **Hooks:** [N]
- **Services:** [N]

### Infrastructure
- **Docker:** [CONFIGURED/NOT CONFIGURED]
- **Database:** PostgreSQL [VERSION]
- **Git:** [N] commits, [N] branches, [N] contributors

---

## 🎯 RECOMMENDATIONS

[Basado en análisis de métricas, listar 3-5 recomendaciones]

1. [Recomendación basada en datos]
2. [...]

---

## 📈 TRENDS

[Si hay audits previos, comparar métricas]
[Si es primer audit, poner "First audit - no trends available"]
```

---

#### 4. ARCHITECTURE.md (actualizar si cambió)

**Verificar cambios estructurales:**
- Número de Features cambió?
- Número de Controllers/Services cambió?
- Estructura de carpetas cambió?

**Si hubo cambios:** Actualizar conteos y diagramas

**Si NO hubo cambios:** Dejar como está, solo actualizar fecha de verificación

---

### FASE 5: Validación Cruzada

**Acción:** Verificar consistencia entre documentos generados

**Checklist:**

```
[ ] TODO.md - Backend tests: Coincide con backend-audit-report.md
[ ] TODO.md - Frontend tests: Coincide con frontend-audit-report.md
[ ] TODO.md - Tests totales: Suma de backend + frontend
[ ] TODO.md - Score: Calculado correctamente basado en métricas
[ ] TECHNICAL-DEBT-INVENTORY.md: Todos los items tienen evidencia en reportes
[ ] PROJECT-STATUS.md: Todas las métricas coinciden con reportes
[ ] No hay contradicciones entre documentos
[ ] Todos los números son exactos (no "~" o "aproximadamente")
```

---

## 🎓 FILOSOFÍA DE AUDITORÍA

### Principios Clave

1. **Datos Verificados > Estimaciones**
   - ✅ "36/36 tests passing"
   - ❌ "~36 tests passing"

2. **Evidencia > Suposiciones**
   - ✅ "72.4% coverage (verified in report)"
   - ❌ "approximately 65% coverage"

3. **Específico > Genérico**
   - ✅ "3,487 LOC in Features/ (wc -l verified)"
   - ❌ "around 3,500 LOC"

4. **Reproducible > Subjetivo**
   - ✅ "Score 10/10 (based on: 0 errors + 0 warnings + 152 tests passing)"
   - ❌ "Score 9.8/10 (feels production ready)"

---

## 📊 CÁLCULO DE SCORES

### Overall Score (0-10)

```
Base: 10 puntos

Deducciones:
- Tests failing: -0.5 por cada test que falle (máx -3)
- TypeScript errors en build: -2 si > 0
- ESLint errors: -1 si > 0
- Critical debt items: -1 por item (máx -3)
- Build failed: -2

Score mínimo: 0
```

### MVP Progress (0-100%)

```
Calcular basado en features implementadas vs features planificadas

Si no hay lista de features planificadas:
- Usar Features/ count como baseline
- Estimar progreso basado en cobertura de funcionalidad core
```

---

## ⚠️ MANEJO DE ERRORES

### Si el script falla

**Caso 1: Tests fallan**
- ✅ OK - El script captura el output
- ✅ Incluir detalles en TECHNICAL-DEBT-INVENTORY.md
- ✅ Marcar como deuda técnica crítica

**Caso 2: Build falla**
- ✅ OK - El script captura el output
- ✅ Incluir detalles en TECHNICAL-DEBT-INVENTORY.md
- ✅ Marcar Production Ready como NO

**Caso 3: Script no puede ejecutar comando**
- ❌ Reportar error al usuario
- ❌ Sugerir instalar dependencia faltante
- ✅ Continuar con partes que sí funcionan

---

## 📁 OUTPUTS ESPERADOS

### Después de auditoría completa:

```
proyecto-root/
├── TODO.md                              [ACTUALIZADO]
├── TECHNICAL-DEBT-INVENTORY.md          [ACTUALIZADO]
├── PROJECT-STATUS.md                    [NUEVO]
├── ARCHITECTURE.md                      [ACTUALIZADO si cambió]
│
└── audit-reports-YYYY-MM-DD_HH-MM/      [NUEVO]
    ├── 00-AUDIT-SUMMARY.md
    ├── backend-audit-report.md
    ├── frontend-audit-report.md
    └── project-metrics.md
```

---

## ✅ CHECKLIST FINAL (Para Claude Code)

```
[ ] Script deep-audit.sh ejecutado exitosamente
[ ] 4 reportes generados en audit-reports-*/
[ ] TODO.md actualizado con métricas reales
[ ] TECHNICAL-DEBT-INVENTORY.md actualizado con items verificados
[ ] PROJECT-STATUS.md creado con snapshot completo
[ ] ARCHITECTURE.md actualizado si hubo cambios
[ ] Validación cruzada completada (métricas consistentes)
[ ] Todos los números exactos (no estimaciones)
[ ] Usuario notificado de archivos generados
```

---

## 🎯 PRÓXIMO PASO (Para Usuario)

Después de que Claude Code complete la auditoría:

1. **Revisar documentación generada**
   ```bash
   cat TODO.md
   cat PROJECT-STATUS.md
   cat TECHNICAL-DEBT-INVENTORY.md
   ```

2. **Commit cambios**
   ```bash
   git add TODO.md TECHNICAL-DEBT-INVENTORY.md PROJECT-STATUS.md
   git add audit-reports-*/
   git commit -m "docs: update project documentation after deep audit
   
   Audit executed: $(date)
   - TODO.md: Updated with verified metrics
   - PROJECT-STATUS.md: New snapshot created
   - TECHNICAL-DEBT-INVENTORY.md: Updated with real findings
   - audit-reports-*/: Complete audit reports"
   ```

3. **Actualizar Project Context en Claude.ai**
   - Project Settings → Knowledge
   - Upload archivos actualizados:
     - TODO.md
     - PROJECT-STATUS.md
     - TECHNICAL-DEBT-INVENTORY.md
     - ARCHITECTURE.md

---

**Generated:** Octubre 28, 2025  
**For:** Claude Code execution  
**Philosophy:** Maximum quality over speed, verified data over estimates