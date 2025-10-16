# PROMPT PARA CLAUDE CODE - Investigation Orchestrator

## OBJETIVO

Investigar por qué el conteo automatizado reportó números diferentes a la verificación manual:
- Models: Reportado 18, verificado 13 (diferencia: +5)
- Migrations: Reportado 54, verificado 19 (diferencia: +35)

---

## INSTRUCCIONES

Ejecutar investigación siguiendo el archivo de referencia.

### PASO 1: Leer Archivo de Referencia

```
Lee completamente: backend/INVESTIGATION-COUNT-DISCREPANCY.md
```

Ese archivo contiene las instrucciones detalladas en 4 tareas.

---

### PASO 2: Ejecutar Tareas Secuencialmente

**TAREA 1: Investigar Models (5-10 min)**
- Listar todos los archivos en app/Models/
- Buscar Models en ubicaciones inesperadas
- Identificar posibles archivos sueltos

**TAREA 2: Investigar Migrations (5-10 min)**
- Listar todas las migrations en database/migrations/
- Buscar migrations en ubicaciones inesperadas
- Buscar archivos backup o duplicados

**TAREA 3: Comparar con Comando Original (5 min)**
- Reproducir comando de auditoría original
- Identificar diferencias en método de conteo

**TAREA 4: Análisis y Conclusión (5 min)**
- Calcular discrepancias exactas
- Determinar causa probable
- Recomendar acción

---

### PASO 3: Generar Reporte

Crea archivo: `audit-outputs/count-investigation.txt`

Debe incluir:
1. Lista exacta de 13 models encontrados
2. Lista exacta de 19 migrations encontradas
3. Archivos en ubicaciones inesperadas (si hay)
4. Archivos obsoletos detectados (si hay)
5. Causa probable de la discrepancia
6. Recomendación de acción

---

## FORMATO DE REPORTE

```
=== INVESTIGACIÓN: DISCREPANCIA EN CONTEO ===

MODELS:
Reportado: 18
Verificado: 13
Diferencia: +5

Lista de 13 models encontrados:
[lista completa]

Archivos sospechosos:
[si hay alguno]

MIGRATIONS:
Reportado: 54
Verificado: 19
Diferencia: +35

Lista de 19 migrations encontradas:
[lista completa]

Archivos sospechosos:
[si hay alguno]

CAUSA PROBABLE:
[análisis de por qué ocurrió la discrepancia]

RECOMENDACIÓN:
[ ] Eliminar archivos obsoletos (lista adjunta)
[ ] Error de conteo, proceder con números correctos
[ ] Otra acción requerida
```

---

## REGLAS IMPORTANTES

### ⚠️ NO ELIMINAR ARCHIVOS
- Esta es solo investigación
- NO eliminar ningún archivo automáticamente
- Solo identificar y reportar

### 📊 SER EXHAUSTIVO
- Listar TODOS los archivos encontrados
- No asumir nada
- Reportar ubicaciones exactas

### 🔍 BUSCAR EN MÚLTIPLES UBICACIONES
- No solo en ubicaciones estándar
- Buscar backups, duplicados, archivos sueltos
- Verificar directorios inesperados

---

## CONTEXTO

Durante auditoría backend Fase 5:
- Branch: audit/complete-architecture-consolidation
- Auditoría automatizada reportó: 18 models, 54 migrations
- Verificación manual confirmó: 13 models, 19 migrations
- Necesitamos entender el origen de la discrepancia

---

## INICIO

Confirma que leíste `backend/INVESTIGATION-COUNT-DISCREPANCY.md` y comienza la investigación.

**Di:** "Archivo leído. Iniciando investigación de discrepancia en conteo..."