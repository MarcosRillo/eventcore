# REORGANIZE-DOCS: Centralizar Documentación del Proyecto
## Tarea de Housekeeping (Pre-HIGH-003)

**Creado:** Octubre 2, 2025  
**Prioridad:** Media (organización, no bloqueante)  
**Tiempo estimado:** 15-30 minutos  
**Branch:** `chore/reorganize-docs`

---

## 🎯 OBJETIVO

Centralizar todos los archivos `.md` dispersos en diferentes carpetas del proyecto hacia `/docs` en la raíz, organizados por contexto (frontend/backend/tasks/audit-outputs).

---

## 📋 CONTEXTO

### Problema Actual
Archivos de documentación están dispersos:
```
proyecto/
├── docs/
│   ├── TODO.md (o ToDo.md)
│   └── tasks/
│       ├── HIGH-001-refactor-imports.md
│       └── HIGH-002-eslint-strict.md
├── frontend/
│   ├── docs/                    # ⚠️ DISPERSO
│   │   ├── ARCHITECTURE.md
│   │   └── CHANGELOG.md
│   └── audit-outputs/           # ⚠️ DISPERSO
│       └── [varios .txt]
└── backend/
    └── docs/                    # ⚠️ DISPERSO (verificar)
        └── [posibles .md]
```

### Estructura Objetivo
```
proyecto/
├── docs/
│   ├── TODO.md
│   ├── TECHNICAL-DEBT-INVENTORY.md (crear si no existe)
│   ├── frontend/
│   │   ├── ARCHITECTURE.md
│   │   └── CHANGELOG.md
│   ├── backend/
│   │   └── [archivos .md del backend]
│   ├── tasks/
│   │   ├── HIGH-001-refactor-imports.md
│   │   ├── HIGH-002-eslint-strict.md
│   │   └── REORGANIZE-DOCS.md (este archivo)
│   └── audit-outputs/
│       └── [archivos de auditoría]
└── [frontend/backend SIN carpetas docs/]
```

---

## 📝 INSTRUCCIONES PASO A PASO

### PASO 1: Verificar Estructura Actual (5 min)

**1.1 Listar archivos .md en frontend:**
```bash
find frontend -name "*.md" -type f
```
**Resultado esperado:** Debe mostrar archivos como `ARCHITECTURE.md`, `CHANGELOG.md`

**1.2 Listar archivos .md en backend:**
```bash
find backend -name "*.md" -type f
```
**Resultado esperado:** Puede estar vacío o mostrar algunos .md

**1.3 Listar carpetas de documentación:**
```bash
ls -la frontend/ | grep docs
ls -la frontend/ | grep audit
ls -la backend/ | grep docs
```
**Resultado esperado:** Identificar qué carpetas existen

**1.4 Ver contenido actual de docs/:**
```bash
tree docs/ -L 2 2>/dev/null || ls -la docs/
```
**Resultado esperado:** Ver estructura actual en `/docs`

**1.5 Verificar nombre exacto del TODO:**
```bash
ls docs/ | grep -i todo
```
**Resultado esperado:** `TODO.md` o `ToDo.md` (usar el nombre exacto que existe)

---

### PASO 2: Crear Estructura Objetivo (2 min)

**2.1 Crear directorios necesarios:**
```bash
mkdir -p docs/frontend
mkdir -p docs/backend
mkdir -p docs/tasks
mkdir -p docs/audit-outputs
```

**2.2 Verificar creación:**
```bash
ls -la docs/
```
**Resultado esperado:** Debe mostrar las 4 carpetas creadas

---

### PASO 3: Mover Archivos de Frontend (3 min)

**3.1 Mover documentación frontend:**
```bash
# Si existe frontend/docs/ARCHITECTURE.md
if [ -f "frontend/docs/ARCHITECTURE.md" ]; then
  mv frontend/docs/ARCHITECTURE.md docs/frontend/
  echo "✓ Movido ARCHITECTURE.md"
else
  echo "⚠ No existe ARCHITECTURE.md en frontend/docs/"
fi

# Si existe frontend/docs/CHANGELOG.md
if [ -f "frontend/docs/CHANGELOG.md" ]; then
  mv frontend/docs/CHANGELOG.md docs/frontend/
  echo "✓ Movido CHANGELOG.md"
else
  echo "⚠ No existe CHANGELOG.md en frontend/docs/"
fi
```

**3.2 Mover otros .md del frontend (si los hay):**
```bash
# Buscar y mover cualquier otro .md en frontend/docs/
if [ -d "frontend/docs" ]; then
  find frontend/docs -name "*.md" -type f -exec mv {} docs/frontend/ \;
  echo "✓ Movidos todos los .md de frontend/docs/"
fi
```

**3.3 Mover audit-outputs:**
```bash
# Si existe frontend/audit-outputs/
if [ -d "frontend/audit-outputs" ]; then
  # Mover todos los archivos (no solo .md, también .txt, etc.)
  mv frontend/audit-outputs/* docs/audit-outputs/ 2>/dev/null || true
  echo "✓ Movido contenido de audit-outputs"
  
  # Intentar eliminar carpeta vacía
  rmdir frontend/audit-outputs 2>/dev/null && echo "✓ Eliminado frontend/audit-outputs/" || echo "⚠ frontend/audit-outputs/ no está vacía"
else
  echo "⚠ No existe frontend/audit-outputs/"
fi
```

**3.4 Eliminar frontend/docs si está vacía:**
```bash
if [ -d "frontend/docs" ]; then
  rmdir frontend/docs 2>/dev/null && echo "✓ Eliminado frontend/docs/" || echo "⚠ frontend/docs/ no está vacía"
fi
```

---

### PASO 4: Mover Archivos de Backend (2 min)

**4.1 Verificar si existe backend/docs:**
```bash
if [ -d "backend/docs" ]; then
  echo "✓ Existe backend/docs/, procediendo a mover..."
else
  echo "⚠ No existe backend/docs/, saltando paso"
fi
```

**4.2 Mover archivos .md del backend:**
```bash
if [ -d "backend/docs" ]; then
  # Buscar y mover .md
  find backend/docs -name "*.md" -type f -exec mv {} docs/backend/ \; 2>/dev/null || true
  echo "✓ Movidos archivos .md de backend/docs/"
  
  # Intentar eliminar carpeta si está vacía
  rmdir backend/docs 2>/dev/null && echo "✓ Eliminado backend/docs/" || echo "⚠ backend/docs/ no está vacía o contiene otros archivos"
fi
```

**4.3 Buscar otros .md en backend (fuera de docs/):**
```bash
# Por si hay .md sueltos en backend/
find backend -maxdepth 1 -name "*.md" -type f
```
**Acción:** Si encuentra alguno, considerar moverlo manualmente a `docs/backend/`

---

### PASO 5: Organizar Archivos de Tareas (1 min)

**5.1 Verificar archivos de tareas actuales:**
```bash
ls -la docs/tasks/ 2>/dev/null || echo "⚠ No existe docs/tasks/"
```

**5.2 Mover este archivo a tasks:**
```bash
# Asumiendo que este archivo está en la raíz o en docs/
if [ -f "REORGANIZE-DOCS.md" ]; then
  mv REORGANIZE-DOCS.md docs/tasks/
  echo "✓ Movido REORGANIZE-DOCS.md a docs/tasks/"
fi
```

---

### PASO 6: Verificar Resultado Final (3 min)

**6.1 Ver estructura completa de docs/:**
```bash
tree docs/ -L 2 2>/dev/null || ls -R docs/
```
**Resultado esperado:**
```
docs/
├── TODO.md (o ToDo.md)
├── TECHNICAL-DEBT-INVENTORY.md (puede no existir aún)
├── frontend/
│   ├── ARCHITECTURE.md
│   └── CHANGELOG.md
├── backend/
│   └── [archivos si los había]
├── tasks/
│   ├── HIGH-001-refactor-imports.md
│   ├── HIGH-002-eslint-strict.md
│   └── REORGANIZE-DOCS.md
└── audit-outputs/
    └── [archivos de auditoría]
```

**6.2 Verificar que no quedan .md dispersos:**
```bash
echo "=== Buscando .md en frontend ==="
find frontend -name "*.md" -type f

echo "=== Buscando .md en backend ==="
find backend -name "*.md" -type f
```
**Resultado esperado:** NO debe mostrar archivos (o solo README.md si es apropiado)

**6.3 Verificar que no quedan carpetas docs/ vacías:**
```bash
ls -la frontend/ | grep docs
ls -la backend/ | grep docs
```
**Resultado esperado:** NO debe mostrar carpetas `docs/`

---

### PASO 7: Actualizar Referencias (5 min)

**7.1 Buscar referencias a rutas antiguas en código:**
```bash
echo "=== Buscando referencias a frontend/docs/ ==="
grep -r "frontend/docs/" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=.git

echo "=== Buscando referencias a backend/docs/ ==="
grep -r "backend/docs/" . --include="*.php" --include="*.md" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=vendor

echo "=== Buscando referencias a audit-outputs/ ==="
grep -r "audit-outputs/" . --include="*.ts" --include="*.tsx" --include="*.php" --include="*.md" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=vendor
```

**7.2 Actualizar referencias encontradas:**
```
SI encuentra referencias:
- frontend/docs/ARCHITECTURE.md → docs/frontend/ARCHITECTURE.md
- frontend/audit-outputs/xxx.txt → docs/audit-outputs/xxx.txt
- backend/docs/xxx.md → docs/backend/xxx.md

IMPORTANTE: Actualizar manualmente cada referencia encontrada
```

**7.3 Verificar links en archivos .md:**
```bash
# Buscar links relativos en archivos .md
grep -r "\[.*\](.*docs/" docs/ --include="*.md"
grep -r "\[.*\](.*audit-outputs/" docs/ --include="*.md"
```
**Acción:** Actualizar paths relativos si es necesario

---

### PASO 8: Crear TECHNICAL-DEBT-INVENTORY.md (Opcional, 2 min)

**8.1 Verificar si existe:**
```bash
ls docs/ | grep -i technical
```

**8.2 Crear placeholder si no existe:**
```bash
if [ ! -f "docs/TECHNICAL-DEBT-INVENTORY.md" ]; then
  cat > docs/TECHNICAL-DEBT-INVENTORY.md << 'EOF'
# TECHNICAL DEBT INVENTORY

**Última actualización:** [Fecha]  
**Propósito:** Tracking centralizado de deuda técnica del proyecto

---

## 📋 DEUDA TÉCNICA ACTUAL

### 🔴 Crítica (Alta Prioridad)
- [ ] [Pendiente identificar]

### 🟠 Alta (Media Prioridad)
- [ ] [Pendiente identificar]

### 🟡 Media (Baja Prioridad)
- [ ] [Pendiente identificar]

### 🟢 Baja (Opcional)
- [ ] [Pendiente identificar]

---

## 📊 HISTORIAL DE RESOLUCIÓN

### Resueltas
- [Fecha] - [Descripción] - [PR/Commit]

---

**Nota:** Este archivo se actualizará regularmente con nuevos items y resoluciones.
EOF
  echo "✓ Creado docs/TECHNICAL-DEBT-INVENTORY.md"
else
  echo "⚠ TECHNICAL-DEBT-INVENTORY.md ya existe, saltando creación"
fi
```

---

## ✅ CRITERIOS DE ÉXITO

Verificar que se cumplan TODOS estos criterios:

- [ ] Todos los archivos `.md` están en `/docs` centralizado
- [ ] Estructura por contexto: `frontend/`, `backend/`, `tasks/`, `audit-outputs/`
- [ ] NO quedan carpetas `docs/` en `frontend/` ni `backend/`
- [ ] NO quedan carpetas `audit-outputs/` fuera de `/docs`
- [ ] Referencias en código actualizadas (si las había)
- [ ] `tree docs/` muestra estructura limpia y organizada
- [ ] Build del proyecto sigue funcionando (si hay referencias)

---

## 🔄 COMANDOS DE VERIFICACIÓN FINAL

```bash
# Verificación completa
echo "=== Estructura de docs/ ==="
tree docs/ -L 2 2>/dev/null || ls -R docs/

echo "=== Archivos .md fuera de docs/ ==="
find . -name "*.md" -type f ! -path "./docs/*" ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./vendor/*" ! -path "./README.md"

echo "=== Carpetas docs/ restantes ==="
find . -type d -name "docs" ! -path "./docs" ! -path "./node_modules/*" ! -path "./.git/*"

echo "=== Carpetas audit-outputs restantes ==="
find . -type d -name "audit-outputs" ! -path "./docs/audit-outputs" ! -path "./node_modules/*"
```

**Resultado esperado:**
- Estructura de `docs/` completa
- NO archivos .md fuera de `docs/` (excepto README.md en raíz si existe)
- NO carpetas `docs/` adicionales
- NO carpetas `audit-outputs/` adicionales

---

## 📦 COMMIT

Una vez verificado todo:

```bash
# Stage todos los cambios
git add docs/
git add frontend/
git add backend/
git add -u  # Para archivos eliminados/movidos

# Verificar staging
git status

# Commit descriptivo
git commit -m "chore: reorganizar documentación en /docs centralizado

Cambios:
- Mover frontend/docs/*.md → docs/frontend/
- Mover frontend/audit-outputs/* → docs/audit-outputs/
- Mover backend/docs/*.md → docs/backend/ (si existían)
- Eliminar carpetas docs/ y audit-outputs/ vacías
- Actualizar referencias en código (si las había)
- Crear TECHNICAL-DEBT-INVENTORY.md placeholder

Estructura final:
docs/
├── TODO.md
├── TECHNICAL-DEBT-INVENTORY.md
├── frontend/ (ARCHITECTURE.md, CHANGELOG.md)
├── backend/ (archivos .md si existían)
├── tasks/ (HIGH-001, HIGH-002, REORGANIZE-DOCS)
└── audit-outputs/ (archivos de auditoría)

Objetivo: Centralizar documentación para mejor organización y mantenibilidad.
Bloqueante: No
Tiempo: 15-30 minutos"

# Push a la rama actual
git push origin $(git branch --show-current)
```

---

## 🚨 MANEJO DE ERRORES

### Si un archivo no se puede mover:
```bash
# Verificar permisos
ls -la [ruta-del-archivo]

# Mover manualmente
mv [origen] [destino]
```

### Si una carpeta no se puede eliminar:
```bash
# Ver qué contiene
ls -la [ruta-carpeta]

# Si tiene archivos ocultos
ls -laR [ruta-carpeta]

# Eliminar forzadamente solo si estás seguro
rm -rf [ruta-carpeta]
```

### Si hay conflictos de nombres:
```bash
# Renombrar con sufijo
mv docs/frontend/ARCHITECTURE.md docs/frontend/ARCHITECTURE-old.md
```

---

## 📝 NOTAS ADICIONALES

1. **Preservar README.md:** Si existe `README.md` en la raíz del proyecto, NO moverlo a `docs/`. Es apropiado que quede en la raíz.

2. **Archivos .gitkeep:** Si hay archivos `.gitkeep` en carpetas vacías, eliminarlos al mover el contenido.

3. **Archivos binarios:** Si `audit-outputs/` contiene archivos grandes o binarios, considerar si son necesarios antes de moverlos.

4. **Symlinks:** Si hay symlinks, moverlos o recrearlos según sea necesario.

5. **CI/CD:** Si hay scripts de CI/CD que referencian estas rutas, actualizarlos después del merge.

---

## ⏱️ TIEMPO ESTIMADO POR PASO

| Paso | Descripción | Tiempo |
|------|-------------|--------|
| 1 | Verificar estructura actual | 5 min |
| 2 | Crear estructura objetivo | 2 min |
| 3 | Mover archivos frontend | 3 min |
| 4 | Mover archivos backend | 2 min |
| 5 | Organizar tareas | 1 min |
| 6 | Verificar resultado | 3 min |
| 7 | Actualizar referencias | 5 min |
| 8 | Crear TECHNICAL-DEBT-INVENTORY | 2 min |
| **Total** | | **23 min** |

Tiempo buffer: +7 min para imprevistos = **30 min total**

---

## 🎯 SIGUIENTE PASO

Una vez completada esta reorganización:
→ **Continuar con HIGH-003: Tests Frontend Críticos (2 días)**

Referencia: `docs/tasks/HIGH-003-tests-frontend.md` (a crear)

---

**Fin de REORGANIZE-DOCS.md**  
**Versión:** 1.0  
**Fecha:** Octubre 2, 2025