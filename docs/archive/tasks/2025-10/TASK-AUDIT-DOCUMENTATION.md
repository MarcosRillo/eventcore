# TASK: Auditoría de Documentación del Proyecto
**Fecha:** Octubre 2025  
**Objetivo:** Identificar documentación vigente, obsoleta y archivar apropiadamente  
**Tiempo estimado:** 15-20 minutos  
**Output:** Informe completo en formato Markdown

---

## 🎯 OBJETIVO

Generar un informe detallado de TODA la documentación del proyecto para:
1. Identificar qué documentos son vigentes y útiles
2. Identificar qué documentos son obsoletos o redundantes
3. Identificar qué documentos tienen valor histórico (archivar)
4. Proponer estructura limpia y minimalista

---

## 📋 INSTRUCCIONES PASO A PASO

### PASO 1: Recolectar Información de Archivos

Ejecutar estos comandos y capturar output:

```bash
# 1.1 Estructura completa de docs/
echo "=== ESTRUCTURA DOCS/ ===" > /tmp/audit-docs.txt
find docs -type f \( -name "*.md" -o -name "*.txt" \) | sort >> /tmp/audit-docs.txt

# 1.2 Tamaño de cada archivo
echo -e "\n=== TAMAÑOS ===" >> /tmp/audit-docs.txt
find docs -type f \( -name "*.md" -o -name "*.txt" \) -exec ls -lh {} \; | awk '{print $5, $9}' | sort -k2 >> /tmp/audit-docs.txt

# 1.3 Archivos en root
echo -e "\n=== ARCHIVOS ROOT ===" >> /tmp/audit-docs.txt
ls -lh *.md 2>/dev/null | awk '{print $5, $9}' >> /tmp/audit-docs.txt

# 1.4 Fecha de modificación
echo -e "\n=== FECHAS MODIFICACIÓN ===" >> /tmp/audit-docs.txt
find docs -type f \( -name "*.md" -o -name "*.txt" \) -exec ls -lh {} \; | awk '{print $6, $7, $8, $9}' | sort >> /tmp/audit-docs.txt

# 1.5 Primeras líneas de cada archivo (para entender contenido)
echo -e "\n=== CONTENIDO ARCHIVOS ===" >> /tmp/audit-docs.txt
for file in $(find docs -type f \( -name "*.md" -o -name "*.txt" \) | sort); do
  echo -e "\n--- FILE: $file ---" >> /tmp/audit-docs.txt
  head -10 "$file" >> /tmp/audit-docs.txt
done

# Ver resultado
cat /tmp/audit-docs.txt
```

### PASO 2: Analizar Cada Archivo

Para cada archivo encontrado, determinar:

**Clasificación:**
- 🟢 **VIGENTE**: Documentación actual y útil (mantener en docs/)
- 🟡 **ARCHIVO**: Valor histórico pero no vigente (mover a archive/)
- 🔴 **OBSOLETO**: Sin valor, contradictorio o redundante (eliminar)
- 🔵 **CONSOLIDAR**: Contenido duplicado, mergear con otro archivo

**Criterios de evaluación:**

**🟢 VIGENTE si:**
- Describe arquitectura/código actual
- Es guía de desarrollo activa
- Contiene información de referencia necesaria
- Se consulta regularmente

**🟡 ARCHIVO si:**
- Tareas completadas con valor histórico
- Prompts usados en resolución de problemas
- Reportes de auditorías pasadas
- Decisiones de diseño documentadas

**🔴 OBSOLETO si:**
- Información contradice código actual
- Boilerplate sin modificar
- TODOs completados sin contexto útil
- Duplica información de otro archivo mejor

**🔵 CONSOLIDAR si:**
- Múltiples archivos sobre mismo tema
- Información fragmentada que debería estar junta
- Versiones viejas de mismo documento

---

## 📊 FORMATO DEL INFORME

Generar archivo: `docs/audit-outputs/DOCUMENTATION-AUDIT-REPORT.md`

### Estructura del informe:

```markdown
# Auditoría de Documentación - Proyecto Plataforma Calendario
**Fecha:** [FECHA]
**Auditor:** Claude Code
**Tiempo de ejecución:** [X minutos]

---

## RESUMEN EJECUTIVO

**Archivos totales encontrados:** X
**Clasificación:**
- 🟢 Vigentes: X archivos (XX KB)
- 🟡 Archivar: X archivos (XX KB)
- 🔴 Obsoletos: X archivos (XX KB)
- 🔵 Consolidar: X archivos (XX KB)

**Recomendación:** Reducir de X archivos a Y archivos vigentes + Z archivos históricos

---

## INVENTARIO DETALLADO

### 🟢 DOCUMENTACIÓN VIGENTE (Mantener)

| Archivo | Tamaño | Última Mod | Descripción | Justificación |
|---------|--------|------------|-------------|---------------|
| docs/ARCHITECTURE.md | X KB | Oct 2025 | Arquitectura frontend/backend | Core documentation |
| ... | | | | |

**Total vigentes:** X archivos, XX KB

---

### 🟡 DOCUMENTACIÓN HISTÓRICA (Archivar)

| Archivo | Tamaño | Última Mod | Descripción | Destino Archive |
|---------|--------|------------|-------------|-----------------|
| docs/tasks/TASK-FASE-1.md | X KB | Oct 2025 | Fase 1 deuda técnica | archive/2025-10-deuda-tecnica/ |
| ... | | | | |

**Total históricos:** X archivos, XX KB

---

### 🔴 DOCUMENTACIÓN OBSOLETA (Eliminar)

| Archivo | Tamaño | Última Mod | Razón para Eliminar |
|---------|--------|------------|---------------------|
| docs/OLD-README.md | X KB | Aug 2024 | Contradice README actual |
| ... | | | |

**Total obsoletos:** X archivos, XX KB a liberar

---

### 🔵 DOCUMENTACIÓN A CONSOLIDAR

| Archivos a Mergear | Destino Final | Razón |
|-------------------|---------------|-------|
| docs/setup-1.md + docs/setup-2.md | docs/SETUP.md | Información fragmentada |
| ... | | |

**Total a consolidar:** X archivos → Y archivos

---

## ANÁLISIS POR DIRECTORIO

### docs/
[Análisis de archivos en root de docs/]

### docs/tasks/
[Análisis de archivos de tareas]

### docs/audit-outputs/
[Análisis de outputs de auditorías]

### [Otros directorios]
[Análisis...]

---

## DETALLE DE CADA ARCHIVO

[Para cada archivo, incluir:]

### Archivo: docs/example.md
- **Tamaño:** X KB
- **Última modificación:** Oct 16, 2025
- **Primeras líneas:**
  ```
  [primeras 5 líneas del archivo]
  ```
- **Clasificación:** 🟢/🟡/🔴/🔵
- **Justificación:** [Por qué se clasifica así]
- **Acción recomendada:** [Mantener/Archivar/Eliminar/Consolidar]

---

## ESTRUCTURA PROPUESTA POST-AUDITORÍA

```
docs/
├── README.md                        # Índice de documentación
├── ARCHITECTURE.md                  # Arquitectura del sistema
├── CHANGELOG.md                     # Historia de cambios
├── TECHNICAL-DEBT-INVENTORY.md      # Tracking deuda técnica
├── CONTRIBUTING.md                  # Guía de contribución (si aplica)
├── tasks/                           # Solo tareas ACTIVAS
│   └── [tareas en progreso]
└── archive/                         # Histórico organizado
    ├── 2025-10-deuda-tecnica/       # Resolución deuda técnica
    │   ├── TASK-FASE-1.md
    │   ├── TASK-FASE-2.md
    │   ├── TASK-FASE-3.md
    │   └── PROMPT-*.txt
    └── audits/                      # Auditorías pasadas
        └── 2025-10-audit-report.md
```

**Reducción estimada:**
- De: X archivos (XXX KB)
- A: Y archivos vigentes (YY KB) + Z archivos históricos (ZZ KB)
- Eliminados: W archivos (WW KB)
- **Limpieza: -XX%**

---

## SCRIPTS DE REORGANIZACIÓN

### Script 1: Crear estructura de archive

```bash
#!/bin/bash
# create-archive-structure.sh

mkdir -p docs/archive/2025-10-deuda-tecnica
mkdir -p docs/archive/audits
echo "✅ Estructura de archive creada"
```

### Script 2: Mover archivos históricos

```bash
#!/bin/bash
# move-to-archive.sh

# Mover tareas completadas
mv docs/tasks/TASK-FASE-1.md docs/archive/2025-10-deuda-tecnica/
mv docs/tasks/TASK-FASE-2.md docs/archive/2025-10-deuda-tecnica/
mv docs/tasks/TASK-FASE-3.md docs/archive/2025-10-deuda-tecnica/
# [más archivos según análisis]

echo "✅ Archivos históricos movidos"
```

### Script 3: Eliminar obsoletos

```bash
#!/bin/bash
# delete-obsolete.sh

# Eliminar archivos obsoletos
rm docs/OLD-FILE-1.md
rm docs/OBSOLETE-FILE-2.txt
# [más archivos según análisis]

echo "✅ Archivos obsoletos eliminados"
```

### Script 4: Consolidar duplicados

```bash
#!/bin/bash
# consolidate-docs.sh

# Ejemplo: Consolidar setup guides
cat docs/setup-1.md docs/setup-2.md > docs/SETUP.md
rm docs/setup-1.md docs/setup-2.md

echo "✅ Documentos consolidados"
```

---

## RECOMENDACIONES FINALES

### Principios de Documentación Minimalista

1. **Un tema = Un archivo**
   - No fragmentar información relacionada
   - No duplicar información

2. **Vigencia clara**
   - Archivos vigentes en docs/
   - Histórico en archive/ con fecha
   - Obsoleto = eliminado

3. **Nombres descriptivos**
   - `ARCHITECTURE.md` no `arch.md`
   - `TASK-panel-organizer.md` no `task1.md`

4. **Mantenimiento**
   - Auditoría trimestral
   - Eliminar TODOs completados
   - Actualizar CHANGELOG

### Métricas de Éxito

- [ ] Reducción de al menos 30% en número de archivos
- [ ] Reducción de al menos 40% en tamaño total
- [ ] 0 archivos obsoletos en docs/
- [ ] Estructura clara: vigente vs histórico
- [ ] Fácil encontrar documentación relevante

---

## SIGUIENTE PASO

Después de revisar este informe, ejecutar:

1. Revisar clasificación de cada archivo
2. Ajustar si hay desacuerdos
3. Ejecutar scripts de reorganización
4. Commit de limpieza de docs
5. Actualizar README con índice

---

## NOTAS

- Este informe es una PROPUESTA, no ejecutar cambios automáticamente
- Revisar cada clasificación antes de eliminar
- Mantener backups de archivos eliminados (git history)
- Priorizar legibilidad sobre minimalismo extremo

---

**FIN DEL INFORME**
```

---

## 🎯 RESULTADO ESPERADO

Al finalizar, deberías tener:

1. ✅ Archivo `docs/audit-outputs/DOCUMENTATION-AUDIT-REPORT.md` completo
2. ✅ Clasificación de TODOS los archivos de documentación
3. ✅ Justificación clara de cada clasificación
4. ✅ Scripts listos para ejecutar reorganización
5. ✅ Propuesta de estructura post-limpieza

---

## ⏱️ TIEMPO ESTIMADO

- Paso 1 (Recolección): 5 min
- Paso 2 (Análisis): 10 min
- Generación informe: 5 min
- **Total: 15-20 minutos**

---

## 🔍 CRITERIO DE CALIDAD

El informe debe ser:
- ✅ Completo (todos los archivos analizados)
- ✅ Justificado (razón clara para cada clasificación)
- ✅ Accionable (scripts listos para ejecutar)
- ✅ Conservador (ante la duda, archivar en vez de eliminar)

---

**EJECUTAR ESTA AUDITORÍA Y GENERAR EL INFORME COMPLETO**