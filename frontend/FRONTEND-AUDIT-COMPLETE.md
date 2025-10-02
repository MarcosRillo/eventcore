# PROMPT PARA CLAUDE CODE - Frontend Audit Orchestrator

## OBJETIVO

Ejecutar auditoría exhaustiva del frontend siguiendo instrucciones del archivo de referencia.

---

## PASO 1: Leer Archivo de Referencia

```
Lee completamente: frontend/FRONTEND-AUDIT-COMPLETE.md
```

Ese archivo contiene las instrucciones detalladas en 5 secciones.

---

## PASO 2: Ejecutar Secciones Secuencialmente

**SECCIÓN 1: Análisis Estructural** (30-45 min)
- Mapear estructura completa src/
- Inventario de Features
- Verificar CategoryTableContainer
- Buscar componentes mal ubicados
- **REPORTA después** y espera confirmación

**SECCIÓN 2: Imports Relativos** (30-45 min)
- Identificar todos los imports con ../../../
- Verificar configuración de aliases
- Generar script de refactoring si aplica
- **REPORTA después** y espera confirmación

**SECCIÓN 3: Limpieza de Archivos** (15 min)
- Buscar archivos .backup, .old, .tmp
- Buscar dashboard.backup específicamente
- Buscar archivos versionados
- Contar TODO/FIXME
- **REPORTA después** y espera confirmación

**SECCIÓN 4: Métricas Consolidadas** (20 min)
- Calcular LOC, features, componentes
- Contar hooks, services, interfaces
- Ejecutar build y capturar status
- Ejecutar ESLint y capturar warnings
- **REPORTA después** y espera confirmación

**SECCIÓN 5: Documentación** (30 min)
- Crear docs/ARCHITECTURE.md
- Crear docs/CHANGELOG.md
- Crear audit-outputs/00-AUDIT-SUMMARY.md
- **REPORTA después**

---

## PASO 3: Verificación Final

Después de completar todas las secciones:

```bash
# Verificar archivos generados
ls -la frontend/audit-outputs/
ls -la frontend/docs/

# Extraer métricas clave
cat frontend/audit-outputs/04-metrics.txt | grep "Total"
```

Reportar:
- Archivos generados (lista)
- Métricas clave
- Issues críticos encontrados
- Build status
- Próxima acción requerida

---

## FORMATO DE REPORTE

Después de cada sección:

```
=== SECCIÓN [X] COMPLETADA ===

Tiempo: [X] minutos
Archivos generados: [lista]

Findings clave:
- [Finding 1]
- [Finding 2]

Issues críticos: [número]
Warnings: [número]

Status: [Success / Issues / Error]

¿Continuar con Sección [X+1]? [ESPERAR CONFIRMACIÓN]
```

---

## REGLAS IMPORTANTES

### DETENER SI:
- Build falla con errores TypeScript
- Comandos bash dan errores críticos
- No puede leer el archivo de referencia

### REPORTAR CLARAMENTE:
- CategoryTableContainer status (tamaño, comparación con EventTable)
- Número de archivos con imports relativos
- Archivos obsoletos encontrados
- Build status (exitoso/fallido)

### NO ELIMINAR ARCHIVOS:
- Esta es auditoría e investigación
- Solo identificar y reportar
- NO ejecutar el script refactor-imports.sh automáticamente

---

## CONTEXTO ADICIONAL

**Proyecto:** Frontend Next.js 15 + React 19 + TypeScript  
**Branch:** audit/complete-architecture-consolidation  
**Backend:** Ya auditado y mergeado (Production Ready)

**Issues conocidos a verificar:**
- CategoryTableContainer (1.3KB vs 10.7KB esperado)
- Imports relativos en 6+ archivos
- Archivos residuales (dashboard.backup)

---

## INICIO

Confirma que leíste `frontend/FRONTEND-AUDIT-COMPLETE.md` y comienza con Sección 1.

**Di:** "Archivo leído. Iniciando Sección 1: Análisis Estructural..."