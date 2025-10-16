# Documentación del Proyecto - Plataforma de Eventos Turísticos

**Última actualización:** Octubre 16, 2025
**Estado:** Production Ready (Score: 9.8/10)

---

## 📁 Estructura de Documentación

### Documentos Principales

- **[PRESENTACION-EJECUTIVA.md](PRESENTACION-EJECUTIVA.md)** - Resumen ejecutivo para management (no técnico)
- **[TECHNICAL-DEBT-INVENTORY.md](TECHNICAL-DEBT-INVENTORY.md)** - Tracking de deuda técnica (6 items)
- **[ToDo.md](ToDo.md)** - Estado actual del proyecto y métricas

### Por Módulo

#### Backend (`backend/`)
- **[ARCHITECTURE.md](backend/ARCHITECTURE.md)** - Arquitectura backend (Laravel Features + PostgreSQL)
- **[CHANGELOG.md](backend/CHANGELOG.md)** - Historia de cambios v2.0.0

#### Frontend (`frontend/`)
- **[ARCHITECTURE.md](frontend/ARCHITECTURE.md)** - Arquitectura frontend (Next.js 15 + React 19)
- **[CHANGELOG.md](frontend/CHANGELOG.md)** - Historia de cambios v2.0.0

#### Tareas (`tasks/`)
- **[ACTIVE/](tasks/ACTIVE/)** - Tareas en progreso actualmente (7 tareas)
- **[SPECS/](tasks/SPECS/)** - Especificaciones de features pendientes (4 specs)

#### Auditorías (`audit-outputs/`)
- **[DOCUMENTATION-AUDIT-REPORT.md](audit-outputs/DOCUMENTATION-AUDIT-REPORT.md)** - Auditoría de documentación (Oct 16)
- **[ORGANIZER_PANEL_AUDIT.md](audit-outputs/ORGANIZER_PANEL_AUDIT.md)** - Auditoría panel organizador
- **[LATEST/](audit-outputs/LATEST/)** - Últimos análisis y métricas del proyecto

#### Histórico (`archive/`)
- **[audits/](archive/audits/)** - Auditorías antiguas y snapshots baseline
- **[tasks/](archive/tasks/)** - Tareas completadas históricas
- **[backend/](archive/backend/)** - Documentación histórica backend
- **[frontend/](archive/frontend/)** - Documentación histórica frontend

---

## 🎯 Quick Start

### Para Desarrolladores Nuevos
1. Leer **[PRESENTACION-EJECUTIVA.md](PRESENTACION-EJECUTIVA.md)** (visión general del proyecto)
2. Revisar **[frontend/ARCHITECTURE.md](frontend/ARCHITECTURE.md)** (arquitectura frontend)
3. Revisar **[backend/ARCHITECTURE.md](backend/ARCHITECTURE.md)** (arquitectura backend)
4. Consultar **[TECHNICAL-DEBT-INVENTORY.md](TECHNICAL-DEBT-INVENTORY.md)** (estado actual)
5. Ver **[tasks/ACTIVE/](tasks/ACTIVE/)** (tareas en progreso)

### Para Management
1. Leer **[PRESENTACION-EJECUTIVA.md](PRESENTACION-EJECUTIVA.md)** (completo)
2. Revisar **[ToDo.md](ToDo.md)** (progreso y métricas actuales)

### Para Implementar Nueva Feature
1. Revisar **[tasks/SPECS/](tasks/SPECS/)** (especificaciones disponibles)
2. Consultar **[frontend/ARCHITECTURE.md](frontend/ARCHITECTURE.md)** (patrones a seguir)
3. Consultar **[backend/ARCHITECTURE.md](backend/ARCHITECTURE.md)** (estructura Features)

---

## 📊 Estado del Proyecto

**MVP:** ~75% completado

**Tests:**
- Backend: 26/26 passing (100%)
- Frontend: 91/91 passing (100%)
- **Total: 117/117 passing**

**Deuda Técnica:**
- Crítica: 0 items
- Alta: 0 items
- Media: 3 items (TD-001, TD-002, TD-003)
- Baja: 3 items (TD-004, TD-005, TD-006)

**Documentación:**
- Activos: ~40 archivos
- Archivados: 28 archivos
- **Total: 68 archivos** organizados

---

## 🗂️ Organización de Documentación

### Archivos Vigentes
Todos los documentos vigentes y consultados regularmente están en:
- `docs/` (raíz)
- `docs/backend/`
- `docs/frontend/`
- `docs/tasks/ACTIVE/`
- `docs/tasks/SPECS/`
- `docs/audit-outputs/LATEST/`

### Archivos Históricos
Documentación completada preservada para referencia en:
- `docs/archive/audits/` - Snapshots y auditorías pasadas
- `docs/archive/tasks/` - Tareas completadas organizadas por mes
- `docs/archive/backend/` - Documentación histórica backend
- `docs/archive/frontend/` - Documentación histórica frontend

Ver **[archive/README.md](archive/README.md)** para índice completo del archivo histórico.

---

## 🔗 Enlaces Útiles

- [Inventario de Deuda Técnica](TECHNICAL-DEBT-INVENTORY.md) - Tracking de issues técnicos
- [Tareas Activas](tasks/ACTIVE/) - Trabajo en progreso
- [Especificaciones](tasks/SPECS/) - Features planificadas
- [Auditoría de Documentación](audit-outputs/DOCUMENTATION-AUDIT-REPORT.md) - Última auditoría (Oct 16, 2025)

---

## 📖 Convenciones

### Nomenclatura de Archivos
- `NOMBRE-EN-MAYUSCULAS.md` - Documentos principales (ARCHITECTURE, CHANGELOG, etc.)
- `TASK-XXX-descripcion.md` - Tareas y specs
- `AUDIT-*.md` - Reportes de auditoría

### Organización
- **Vigente** → `docs/` o subdirectorios activos
- **Histórico** → `docs/archive/` organizado por tipo y fecha
- **Obsoleto** → Eliminado (preservado en git history)

---

## 🛠️ Mantenimiento

### Auditoría Trimestral (cada 3 meses)
1. Mover `LATEST/` a `archive/audits/YYYY-MM-baseline/`
2. Revisar `tasks/ACTIVE/` y mover completados a `archive/tasks/YYYY-MM/`
3. Actualizar `TECHNICAL-DEBT-INVENTORY.md`
4. Actualizar `ToDo.md` con métricas actuales
5. Eliminar archivos obsoletos detectados

### Al Completar Feature Grande
1. Mover documentación de diseño a `archive/`
2. Actualizar `ARCHITECTURE.md` si hay cambios
3. Agregar entrada en `CHANGELOG.md`

### Auditoría Semestral (cada 6 meses)
1. Auditoría completa de documentación (como Oct 16, 2025)
2. Verificar que `README.md` refleja estructura actual
3. Consolidar fragmentos detectados

---

**Última reorganización:** Octubre 16, 2025
**Próxima auditoría sugerida:** Enero 2026
