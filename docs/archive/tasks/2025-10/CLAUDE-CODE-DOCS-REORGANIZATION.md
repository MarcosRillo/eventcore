# CLAUDE CODE: Reorganización de Documentación

**Fecha:** 16 Octubre 2025
**Duración estimada:** 30-45 minutos
**Objetivo:** Reorganizar carpeta docs/ eliminando obsoletos y archivando históricos

## CONTEXTO

El proyecto tiene 64 archivos de documentación con algunos obsoletos y duplicados. 
Necesitamos limpiar, archivar históricos, y reorganizar para mejor navegabilidad.

**Referencia completa:** `docs/tasks/ACTIVE/2025-10-16-docs-reorganization.md`

---

## TAREAS A EJECUTAR

### TAREA 1: Eliminar Archivos Obsoletos (5 min)

Eliminar los siguientes 8 archivos que están obsoletos o duplicados:

```bash
# Audit outputs obsoletos (duplicados en LATEST/)
rm docs/audit-outputs/01-structure-analysis.txt
rm docs/audit-outputs/02-imports-analysis.txt
rm docs/audit-outputs/03-cleanup-analysis.txt
rm docs/audit-outputs/04-metrics.txt

# Tareas obsoletas (reemplazadas por TD inventory)
rm docs/tasks/HIGH-001-refactor-imports.md
rm docs/tasks/HIGH-002-eslint-strict.md
rm docs/tasks/MED-001-nginx-redis.md
rm docs/tasks/MED-002-mailhog.md
```

**Verificar después:**
```bash
ls -la docs/audit-outputs/  # No deben estar los 01-04
ls -la docs/tasks/          # No deben estar HIGH-001, HIGH-002, MED-001, MED-002
```

---

### TAREA 2: Crear Estructura de Archive (5 min)

Crear directorios para archivar documentos históricos:

```bash
mkdir -p docs/archive/audits/2025-10-baseline
mkdir -p docs/archive/audits/backend-phase5
mkdir -p docs/archive/audits/2025-10-sessions
mkdir -p docs/archive/tasks/2025-10
```

**Verificar después:**
```bash
tree docs/archive -L 2
# Debe mostrar la estructura de directorios
```

---

### TAREA 3: Archivar Documentos Históricos (10 min)

Mover 12 archivos históricos a archive/:

```bash
# Baseline snapshots (4 archivos)
mv docs/audit-outputs/BASELINE-SNAPSHOT.md docs/archive/audits/2025-10-baseline/
mv docs/SNAPSHOT-ANTES-FEATURES.md docs/archive/audits/2025-10-baseline/
mv docs/frontend/SNAPSHOT-ANTES-CONSOLIDACION.md docs/archive/audits/2025-10-baseline/
mv docs/backend/SNAPSHOT-ANTES-FEATURES.md docs/archive/audits/2025-10-baseline/

# Backend phase 5 (3 archivos)
mv docs/backend/BACKEND-PHASE-5-PLAN.md docs/archive/audits/backend-phase5/
mv docs/backend/BACKEND-PHASE-5-PROGRESS.md docs/archive/audits/backend-phase5/
mv docs/backend/BACKEND-PHASE-5-COMPLETION.md docs/archive/audits/backend-phase5/

# Completed tasks (3 archivos)
mv docs/tasks/HIGH-003-tests-frontend.md docs/archive/tasks/2025-10/
mv docs/tasks/LOW-001-performance.md docs/archive/tasks/2025-10/
mv docs/tasks/LOW-002-migrate-moment.md docs/archive/tasks/2025-10/

# Session audits (2 archivos)
mv docs/audit-outputs/SESSION-2025-10-01-CONSOLIDACION.md docs/archive/audits/2025-10-sessions/
mv docs/audit-outputs/SESSION-2025-10-02-TESTS.md docs/archive/audits/2025-10-sessions/
```

**Verificar después:**
```bash
find docs/archive -type f -name "*.md" | wc -l
# Debe mostrar 12
```

---

### TAREA 4: Reorganizar Tasks (10 min)

Crear estructura ACTIVE/ y SPECS/, mover archivos:

```bash
# Crear directorios
mkdir -p docs/tasks/ACTIVE
mkdir -p docs/tasks/SPECS

# Mover task activa
mv docs/tasks/2025-10-16-docs-reorganization.md docs/tasks/ACTIVE/

# Mover specs de features
mv docs/frontend/ORGANIZER-PANEL-SPEC.md docs/tasks/SPECS/
mv docs/frontend/DASHBOARD-PHASE-2-SPEC.md docs/tasks/SPECS/
mv docs/frontend/APPROVAL-MODAL-SPEC.md docs/tasks/SPECS/
```

**Verificar después:**
```bash
ls -la docs/tasks/ACTIVE/   # Debe tener 1 archivo
ls -la docs/tasks/SPECS/    # Debe tener 3 archivos
```

---

### TAREA 5: Consolidar Audit Directories (5 min)

Si existe docs/audit/, mover su contenido a docs/audit-outputs/:

```bash
# Solo si existe docs/audit/
if [ -d "docs/audit" ]; then
    mv docs/audit/* docs/audit-outputs/ 2>/dev/null || true
    rmdir docs/audit
fi
```

**Verificar después:**
```bash
ls -d docs/audit 2>/dev/null
# No debe existir el directorio
```

---

### TAREA 6: Crear README Principal (10 min)

Crear `docs/README.md` con el siguiente contenido:

```markdown
# Documentación del Proyecto - Plataforma de Eventos Turísticos

**Última actualización:** Octubre 16, 2025
**Estado:** Production Ready (Score: 9.8/10)

## 📁 Estructura de Documentación

### Documentos Principales

- **PRESENTACION-EJECUTIVA.md** - Resumen para management (no técnico)
- **ARCHITECTURE.md** - Arquitectura frontend (Next.js + React)
- **TECHNICAL-DEBT-INVENTORY.md** - Tracking de deuda técnica
- **CHANGELOG.md** - Historia de cambios del proyecto
- **ToDo.md** - Estado actual y métricas

### Por Módulo

#### Backend (`backend/`)
- **ARCHITECTURE.md** - Arquitectura backend (Laravel + PostgreSQL)
- **API-DOCUMENTATION.md** - Documentación de endpoints
- **DATABASE-SCHEMA.md** - Esquema de base de datos

#### Frontend (`frontend/`)
- **COMPONENTS-GUIDE.md** - Guía de componentes
- **HOOKS-DOCUMENTATION.md** - Custom hooks disponibles
- **SERVICES-GUIDE.md** - Capa de servicios API

#### Tareas (`tasks/`)
- **ACTIVE/** - Tareas en progreso actualmente
- **SPECS/** - Especificaciones de features pendientes

#### Auditorías (`audit-outputs/`)
- **AUDIT-REPORT.md** - Reporte de auditoría completo
- **DOCUMENTATION-AUDIT-REPORT.md** - Auditoría de documentación
- **LATEST/** - Últimos análisis y métricas

#### Histórico (`archive/`)
- **audits/** - Auditorías antiguas y snapshots
- **tasks/** - Tareas completadas

## 🎯 Quick Start

**Para desarrolladores nuevos:**
1. Leer `PRESENTACION-EJECUTIVA.md` (visión general)
2. Revisar `ARCHITECTURE.md` (arquitectura frontend)
3. Revisar `backend/ARCHITECTURE.md` (arquitectura backend)
4. Consultar `TECHNICAL-DEBT-INVENTORY.md` (estado actual)

**Para management:**
1. Leer `PRESENTACION-EJECUTIVA.md` (completo)
2. Revisar `ToDo.md` (progreso y métricas)

## 📊 Estado del Proyecto

- **MVP:** ~75% completado
- **Tests:** 117/117 passing (100%)
- **Deuda técnica:** 3 items menores (0 críticos)
- **Documentación:** 32 archivos activos, 27 archivados

## 🔗 Enlaces Útiles

- [Issues del proyecto](../docs/TECHNICAL-DEBT-INVENTORY.md)
- [Tareas activas](./tasks/ACTIVE/)
- [Specs de features](./tasks/SPECS/)
```

**Crear el archivo:**
```bash
cat > docs/README.md << 'EOF'
[contenido del markdown de arriba]
EOF
```

---

### TAREA 7: Actualizar Archive README (5 min)

Actualizar `docs/archive/README.md`:

```markdown
# Archivo Histórico de Documentación

Este directorio contiene documentación histórica preservada para referencia.

## Estructura

### audits/
Auditorías y análisis históricos del proyecto:

- **2025-10-baseline/** - Snapshots antes de migraciones mayores
  - BASELINE-SNAPSHOT.md
  - SNAPSHOT-ANTES-FEATURES.md
  - frontend/SNAPSHOT-ANTES-CONSOLIDACION.md
  - backend/SNAPSHOT-ANTES-FEATURES.md

- **backend-phase5/** - Documentación de fase 5 backend
  - BACKEND-PHASE-5-PLAN.md
  - BACKEND-PHASE-5-PROGRESS.md
  - BACKEND-PHASE-5-COMPLETION.md

- **2025-10-sessions/** - Auditorías de sesiones
  - SESSION-2025-10-01-CONSOLIDACION.md
  - SESSION-2025-10-02-TESTS.md

### tasks/
Tareas completadas históricas:

- **2025-10/** - Tareas completadas en octubre 2025
  - HIGH-003-tests-frontend.md (✅ Completado Oct 2)
  - LOW-001-performance.md (archivado)
  - LOW-002-migrate-moment.md (archivado)

## Consulta

Para documentación activa y vigente, ver: `docs/README.md`

**Total archivado:**
- 12 archivos markdown
- ~180 KB de documentación histórica
- Preservado para referencia futura
```

**Actualizar el archivo:**
```bash
cat > docs/archive/README.md << 'EOF'
[contenido del markdown de arriba]
EOF
```

---

### TAREA 8: Actualizar .gitignore (2 min)

Verificar que .gitignore incluya estos paths (agregar si faltan):

```bash
# Agregar al .gitignore del proyecto si no existen
cat >> .gitignore << 'EOF'

# Documentation temporary files
docs/**/.DS_Store
docs/**/Thumbs.db
docs/**/*.tmp
docs/**/*.bak

# Archive is tracked (no ignore needed for archive/)
EOF
```

---

### TAREA 9: Verificación Final (5 min)

Ejecutar verificaciones finales:

```bash
echo "=== VERIFICACIÓN FINAL ==="
echo ""

echo "1. Archivos vigentes (debe ser ~32):"
find docs -type f \( -name "*.md" -o -name "*.txt" \) ! -path "*/archive/*" | wc -l

echo ""
echo "2. Archivos archivados (debe ser ~12):"
find docs/archive -type f \( -name "*.md" -o -name "*.txt" \) | wc -l

echo ""
echo "3. Estructura de docs:"
tree docs -L 2 -I 'node_modules'

echo ""
echo "4. Directorios vacíos (debe ser 0):"
find docs -type d -empty

echo ""
echo "5. Verificar tasks/:"
ls -la docs/tasks/

echo ""
echo "=== FIN VERIFICACIÓN ==="
```

**Resultado esperado:**
- ✅ ~32 archivos vigentes
- ✅ ~12 archivos archivados  
- ✅ 0 directorios vacíos
- ✅ Estructura: docs/{README.md, backend/, frontend/, tasks/{ACTIVE/,SPECS/}, audit-outputs/, archive/}

---

## RESULTADO ESPERADO

Al completar todas las tareas:

```
docs/
├── README.md ✨ NUEVO
├── PRESENTACION-EJECUTIVA.md
├── ARCHITECTURE.md
├── TECHNICAL-DEBT-INVENTORY.md
├── CHANGELOG.md
├── ToDo.md
├── backend/
│   ├── ARCHITECTURE.md
│   ├── API-DOCUMENTATION.md
│   └── DATABASE-SCHEMA.md
├── frontend/
│   ├── COMPONENTS-GUIDE.md
│   ├── HOOKS-DOCUMENTATION.md
│   └── SERVICES-GUIDE.md
├── tasks/
│   ├── ACTIVE/ ✨ NUEVO
│   │   └── 2025-10-16-docs-reorganization.md
│   └── SPECS/ ✨ NUEVO
│       ├── ORGANIZER-PANEL-SPEC.md
│       ├── DASHBOARD-PHASE-2-SPEC.md
│       └── APPROVAL-MODAL-SPEC.md
├── audit-outputs/
│   ├── AUDIT-REPORT.md
│   ├── DOCUMENTATION-AUDIT-REPORT.md
│   └── LATEST/
│       └── [archivos recientes]
└── archive/ ✨ REORGANIZADO
    ├── README.md ✨ ACTUALIZADO
    ├── audits/
    │   ├── 2025-10-baseline/ (4 archivos)
    │   ├── backend-phase5/ (3 archivos)
    │   └── 2025-10-sessions/ (2 archivos)
    └── tasks/
        └── 2025-10/ (3 archivos)
```

**Métricas:**
- Archivos eliminados: 8
- Archivos archivados: 12
- Archivos vigentes: ~32
- Score: 9/10 → 10/10

---

## DESPUÉS DE COMPLETAR

**NO hacer commit todavía.** Reportar resultado y esperar verificación manual antes de commit.

Informar:
1. ✅ Todas las tareas completadas
2. 📊 Resultado de verificación final
3. 🔍 Cualquier error o advertencia encontrada

---

## NOTAS IMPORTANTES

- Usar `mv` en lugar de `cp` para mover archivos
- Verificar cada paso antes de continuar
- Si un comando falla, reportar el error
- No modificar archivos fuera de docs/
- Preservar permisos de archivos