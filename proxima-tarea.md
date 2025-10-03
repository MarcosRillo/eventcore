# ARCHIVAR DOCUMENTACIÓN HISTÓRICA

**Objetivo:** Mover archivos completados/históricos a docs/archive/ manteniendo documentación activa limpia
**Tiempo:** 10-15 minutos

---

## FASE 1: VERIFICAR ARCHIVOS A ARCHIVAR (3 min)

### 1.1 Verificar existencia de archivos históricos

```bash
echo "=== VERIFICANDO ARCHIVOS A ARCHIVAR ==="

# Backend históricos
[ -f "docs/backend/BACKEND_COMPLETE_MIGRATION.md" ] && echo "[X] BACKEND_COMPLETE_MIGRATION.md (31K)" || echo "[ ] BACKEND_COMPLETE_MIGRATION.md - NO EXISTE"
[ -f "docs/backend/BACKEND_FINAL_AUDIT.md" ] && echo "[X] BACKEND_FINAL_AUDIT.md (15K)" || echo "[ ] BACKEND_FINAL_AUDIT.md - NO EXISTE"

# Frontend históricos
[ -f "docs/frontend/FIX_CRÍTICO_COMPLETADO.md" ] && echo "[X] FIX_CRÍTICO_COMPLETADO.md (7K)" || echo "[ ] FIX_CRÍTICO_COMPLETADO.md - NO EXISTE"
[ -f "docs/frontend/FRONTEND-AUDIT-COMPLETE.md" ] && echo "[X] FRONTEND-AUDIT-COMPLETE.md (3.2K)" || echo "[ ] FRONTEND-AUDIT-COMPLETE.md - NO EXISTE"

# Tasks completadas
[ -f "docs/tasks/HIGH-003-tests-frontend.md" ] && echo "[X] HIGH-003-tests-frontend.md (15K)" || echo "[ ] HIGH-003-tests-frontend.md - NO EXISTE"

echo ""
echo "Total archivos a archivar: 5"
```

### 1.2 Listar tamaños

```bash
echo "=== TAMAÑOS DE ARCHIVOS ==="
ls -lh docs/backend/BACKEND_COMPLETE_MIGRATION.md 2>/dev/null
ls -lh docs/backend/BACKEND_FINAL_AUDIT.md 2>/dev/null
ls -lh docs/frontend/FIX_CRÍTICO_COMPLETADO.md 2>/dev/null
ls -lh docs/frontend/FRONTEND-AUDIT-COMPLETE.md 2>/dev/null
ls -lh docs/tasks/HIGH-003-tests-frontend.md 2>/dev/null
```

---

## FASE 2: CREAR ESTRUCTURA ARCHIVE (2 min)

### 2.1 Crear directorios

```bash
echo "=== CREANDO ESTRUCTURA ARCHIVE ==="

mkdir -p docs/archive/backend
mkdir -p docs/archive/frontend
mkdir -p docs/archive/tasks

echo "Directorios creados:"
ls -la docs/archive/
```

### 2.2 Crear README en archive

```bash
cat > docs/archive/README.md << 'EOF'
# Archive - Documentación Histórica

Archivos de documentación que completaron su función pero se mantienen para referencia histórica.

## Contenido

### Backend
- **BACKEND_COMPLETE_MIGRATION.md** - Proceso completo de migración MySQL → PostgreSQL 3NF
- **BACKEND_FINAL_AUDIT.md** - Auditoría exhaustiva post-migración

### Frontend  
- **FIX_CRÍTICO_COMPLETADO.md** - Resolución de bug crítico en EventService
- **FRONTEND-AUDIT-COMPLETE.md** - Auditoría de arquitectura frontend completada

### Tasks
- **HIGH-003-tests-frontend.md** - Implementación de 91 tests frontend (Oct 2, 2025)

## Por Qué Están Archivados

Estos documentos:
- Describen trabajo ya completado
- Tienen valor histórico/referencia
- No se necesitan para trabajo diario
- Se preservan para consultas futuras

## Cuándo Consultar

- Para entender decisiones arquitecturales pasadas
- Para ver cómo se resolvieron problemas específicos
- Para onboarding de nuevos developers
- Para auditorías de proceso

## Última Actualización

Octubre 3, 2025 - Primera organización de archivos históricos
EOF

echo "README.md creado en docs/archive/"
```

---

## FASE 3: MOVER ARCHIVOS (3 min)

### 3.1 Mover archivos backend

```bash
echo "=== MOVIENDO ARCHIVOS BACKEND ==="

if [ -f "docs/backend/BACKEND_COMPLETE_MIGRATION.md" ]; then
    mv docs/backend/BACKEND_COMPLETE_MIGRATION.md docs/archive/backend/
    echo "✓ Movido BACKEND_COMPLETE_MIGRATION.md"
else
    echo "✗ BACKEND_COMPLETE_MIGRATION.md no existe"
fi

if [ -f "docs/backend/BACKEND_FINAL_AUDIT.md" ]; then
    mv docs/backend/BACKEND_FINAL_AUDIT.md docs/archive/backend/
    echo "✓ Movido BACKEND_FINAL_AUDIT.md"
else
    echo "✗ BACKEND_FINAL_AUDIT.md no existe"
fi
```

### 3.2 Mover archivos frontend

```bash
echo "=== MOVIENDO ARCHIVOS FRONTEND ==="

if [ -f "docs/frontend/FIX_CRÍTICO_COMPLETADO.md" ]; then
    mv docs/frontend/FIX_CRÍTICO_COMPLETADO.md docs/archive/frontend/
    echo "✓ Movido FIX_CRÍTICO_COMPLETADO.md"
else
    echo "✗ FIX_CRÍTICO_COMPLETADO.md no existe"
fi

if [ -f "docs/frontend/FRONTEND-AUDIT-COMPLETE.md" ]; then
    mv docs/frontend/FRONTEND-AUDIT-COMPLETE.md docs/archive/frontend/
    echo "✓ Movido FRONTEND-AUDIT-COMPLETE.md"
else
    echo "✗ FRONTEND-AUDIT-COMPLETE.md no existe"
fi
```

### 3.3 Mover archivos tasks

```bash
echo "=== MOVIENDO ARCHIVOS TASKS ==="

if [ -f "docs/tasks/HIGH-003-tests-frontend.md" ]; then
    mv docs/tasks/HIGH-003-tests-frontend.md docs/archive/tasks/
    echo "✓ Movido HIGH-003-tests-frontend.md"
else
    echo "✗ HIGH-003-tests-frontend.md no existe"
fi
```

---

## FASE 4: VERIFICACIÓN (5 min)

### 4.1 Verificar archivos en archive

```bash
echo "======================================"
echo "VERIFICACIÓN ARCHIVE"
echo "======================================"

echo ""
echo "1. ARCHIVOS EN ARCHIVE/BACKEND:"
ls -lh docs/archive/backend/ 2>/dev/null || echo "   Vacío o no existe"

echo ""
echo "2. ARCHIVOS EN ARCHIVE/FRONTEND:"
ls -lh docs/archive/frontend/ 2>/dev/null || echo "   Vacío o no existe"

echo ""
echo "3. ARCHIVOS EN ARCHIVE/TASKS:"
ls -lh docs/archive/tasks/ 2>/dev/null || echo "   Vacío o no existe"

echo ""
echo "4. README EN ARCHIVE:"
[ -f "docs/archive/README.md" ] && echo "   ✓ README.md existe" || echo "   ✗ README.md no existe"
```

### 4.2 Verificar archivos ya no están en ubicación original

```bash
echo ""
echo "======================================"
echo "VERIFICAR UBICACIONES ORIGINALES"
echo "======================================"

echo ""
echo "BACKEND (debe estar vacío de históricos):"
ls -lh docs/backend/*.md 2>/dev/null | grep -v ARCHITECTURE | grep -v CHANGELOG || echo "   Solo quedan ARCHITECTURE y CHANGELOG ✓"

echo ""
echo "FRONTEND (debe estar vacío de históricos):"
ls -lh docs/frontend/*.md 2>/dev/null | grep -v ARCHITECTURE | grep -v CHANGELOG || echo "   Solo quedan ARCHITECTURE y CHANGELOG ✓"

echo ""
echo "TASKS (debe tener solo HIGH-001 y HIGH-002):"
ls -lh docs/tasks/*.md 2>/dev/null
```

### 4.3 Contar archivos totales

```bash
echo ""
echo "======================================"
echo "CONTEO DE ARCHIVOS .md"
echo "======================================"

# Total en docs/ (excluyendo archive/)
active_count=$(find docs -name "*.md" -type f ! -path "*/archive/*" 2>/dev/null | wc -l | tr -d ' ')
echo "Archivos activos (sin archive/): $active_count (esperado: ~16)"

# En archive/
archive_count=$(find docs/archive -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
echo "Archivos archivados: $archive_count (esperado: 6 - 5 históricos + README)"

# Total
total_count=$(find docs -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
echo "Total docs/: $total_count (esperado: ~22)"
```

### 4.4 Verificar estructura completa

```bash
echo ""
echo "======================================"
echo "ESTRUCTURA COMPLETA docs/"
echo "======================================"

tree docs -L 3 -I 'outputs|process' 2>/dev/null || find docs -type d | sort
```

### 4.5 Tamaño total de archivos archivados

```bash
echo ""
echo "======================================"
echo "TAMAÑO TOTAL ARCHIVADO"
echo "======================================"

du -sh docs/archive/ 2>/dev/null || echo "No se puede calcular"
```

---

## FASE 5: VALIDAR DOCUMENTACIÓN ACTIVA (2 min)

### 5.1 Listar documentación que DEBE quedar activa

```bash
echo ""
echo "======================================"
echo "DOCUMENTACIÓN ACTIVA (DEBE EXISTIR)"
echo "======================================"

# Raíz
echo "RAÍZ /docs:"
ls -lh docs/*.md 2>/dev/null | awk '{print "  " $9, "(" $5 ")"}'

# Backend activo
echo ""
echo "BACKEND (solo activos):"
ls -lh docs/backend/*.md 2>/dev/null | awk '{print "  " $9, "(" $5 ")"}'

# Frontend activo
echo ""
echo "FRONTEND (solo activos):"
ls -lh docs/frontend/*.md 2>/dev/null | awk '{print "  " $9, "(" $5 ")"}'

# Tasks activos
echo ""
echo "TASKS (solo pendientes/activos):"
ls -lh docs/tasks/*.md 2>/dev/null | awk '{print "  " $9, "(" $5 ")"}'
```

### 5.2 Validar archivos críticos

```bash
echo ""
echo "======================================"
echo "VALIDAR ARCHIVOS CRÍTICOS"
echo "======================================"

# Lista de archivos que DEBEN existir
critical_files=(
    "docs/PRESENTACION-EJECUTIVA.md"
    "docs/ToDo.md"
    "docs/TECHNICAL-DEBT-INVENTORY.md"
    "docs/backend/ARCHITECTURE.md"
    "docs/backend/CHANGELOG.md"
    "docs/frontend/ARCHITECTURE.md"
    "docs/frontend/CHANGELOG.md"
    "docs/tasks/HIGH-001-refactor-imports.md"
    "docs/tasks/HIGH-002-eslint-strict.md"
)

missing=0
for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file"
    else
        echo "✗ MISSING: $file"
        missing=$((missing + 1))
    fi
done

if [ $missing -eq 0 ]; then
    echo ""
    echo "VALIDACIÓN: PASS - Todos los archivos críticos presentes"
else
    echo ""
    echo "VALIDACIÓN: FAIL - Faltan $missing archivos críticos"
fi
```

---

## FASE 6: GIT STATUS (NO COMMIT)

```bash
echo ""
echo "======================================"
echo "GIT STATUS"
echo "======================================"

git status --short

echo ""
echo "======================================"
echo "ARCHIVOS MOVIDOS (STAGED)"
echo "======================================"

git diff --cached --stat 2>/dev/null || echo "No hay archivos staged aún"

echo ""
echo "======================================"
echo "RESUMEN FINAL"
echo "======================================"

if [ $archive_count -eq 6 ] && [ $active_count -le 17 ]; then
    echo "ESTADO: ✓ COMPLETO"
    echo ""
    echo "Archivos archivados: 5 históricos + 1 README"
    echo "Documentación activa: ~16 archivos (limpia)"
    echo ""
    echo "Próximos pasos:"
    echo "1. Revisar cambios: git status"
    echo "2. Agregar archivos: git add docs/archive/ docs/backend/ docs/frontend/ docs/tasks/"
    echo "3. Hacer commit con mensaje sugerido"
else
    echo "ESTADO: ✗ REVISAR"
    echo ""
    echo "Archivos archivados: $archive_count (esperado: 6)"
    echo "Archivos activos: $active_count (esperado: ~16)"
    echo ""
    echo "Revisar errores arriba"
fi
```

---

## COMMIT SUGERIDO (PARA USUARIO)

```bash
# Agregar archivos nuevos (archive/)
git add docs/archive/

# Agregar cambios en ubicaciones originales (archivos movidos)
git add docs/backend/ docs/frontend/ docs/tasks/

# Verificar qué se va a commitear
git status

# Commit
git commit -m "chore: archive historical documentation

Moved completed/historical docs to docs/archive/:

Backend (2 files, 46K):
- BACKEND_COMPLETE_MIGRATION.md (PostgreSQL migration process)
- BACKEND_FINAL_AUDIT.md (post-migration audit)

Frontend (2 files, 10.2K):
- FIX_CRÍTICO_COMPLETADO.md (EventService bug fix)
- FRONTEND-AUDIT-COMPLETE.md (architecture audit)

Tasks (1 file, 15K):
- HIGH-003-tests-frontend.md (91 tests implementation)

Active documentation reduced: 21 → 16 files
Archived: 5 files + README
Historical files preserved for reference

Result: Cleaner active docs, historical preserved"

# Push
git push
```

---

## CRITERIOS DE ÉXITO

Archivado completo cuando:
- docs/archive/ existe con 3 subdirectorios (backend, frontend, tasks)
- 5 archivos movidos a archive/
- README.md en archive/ explicando contenido
- Archivos críticos permanecen en ubicaciones activas
- Documentación activa reducida a ~16 archivos
- Git muestra archivos movidos correctamente

---

## ROLLBACK (SI ALGO SALE MAL)

```bash
# Si necesitas revertir
git checkout docs/backend/ docs/frontend/ docs/tasks/
rm -rf docs/archive/

# O si ya commiteaste
git revert HEAD
```