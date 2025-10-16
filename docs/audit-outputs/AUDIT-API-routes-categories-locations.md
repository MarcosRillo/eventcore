# AUDITORÍA: API Routes Categories/Locations
## Debugging 404/500 en endpoints /active

**Fecha:** Octubre 7, 2025 - 13:05  
**Problema:** Endpoints `/categories/active` y `/locations/active` retornan HTML en lugar de JSON  
**Síntomas:** 404 en categories, 500 en locations, incluso con token válido  
**Objetivo:** Identificar causa raíz y solución

---

## 🎯 INFORMACIÓN A RECOPILAR

### 1. Estructura de Routes API
**Archivo:** `backend/routes/api.php`

**Recopilar:**
- Líneas completas del archivo (primeras 100 líneas)
- Ubicación de `Route::middleware('auth:sanctum')`
- Ubicación de rutas `/categories/active` y `/locations/active`
- Si están dentro o fuera del middleware auth

**Comando:**
```bash
cd backend
cat routes/api.php
```

---

### 2. Controllers - Método active()
**Archivos:**
- `backend/app/Features/Categories/Controllers/CategoryController.php`
- `backend/app/Features/Locations/Controllers/LocationController.php`

**Recopilar para cada controller:**
- ¿Existe el método `active()`?
- ¿Qué middleware tiene el controller en el constructor?
- Código completo del método `active()`

**Comandos:**
```bash
# Categories
cd backend
grep -A 20 "public function active" app/Features/Categories/Controllers/CategoryController.php

# Constructor middleware
grep -A 10 "__construct" app/Features/Categories/Controllers/CategoryController.php

# Locations
grep -A 20 "public function active" app/Features/Locations/Controllers/LocationController.php
grep -A 10 "__construct" app/Features/Locations/Controllers/LocationController.php
```

---

### 3. Response Headers - Request Real
**Comando con curl verbose:**
```bash
# Categories sin auth
curl -v http://localhost:8000/api/v1/categories/active 2>&1 | head -30

# Categories con auth
curl -v -H "Authorization: Bearer 20|yBZEr9eFtCt3rNH9glTPJikzqKQgRoIR8bRO1tfS49588c74" \
  http://localhost:8000/api/v1/categories/active 2>&1 | head -30

# Locations sin auth
curl -v http://localhost:8000/api/v1/locations/active 2>&1 | head -30

# Locations con auth
curl -v -H "Authorization: Bearer 20|yBZEr9eFtCt3rNH9glTPJikzqKQgRoIR8bRO1tfS49588c74" \
  http://localhost:8000/api/v1/locations/active 2>&1 | head -30
```

**Buscar en output:**
- HTTP status code (200, 404, 500, 302)
- Content-Type header (debe ser `application/json`)
- Location header (si hay redirect)

---

### 4. Laravel Logs - Errores Específicos
**Comando:**
```bash
cd backend
docker exec plataforma-calendario-backend tail -100 storage/logs/laravel.log | grep -A 5 -B 5 "categories\|locations"
```

**Buscar:**
- Stack traces
- Errores de SQL
- Middleware errors
- Route not found

---

### 5. Database - Verificar Datos
**Comandos:**
```bash
# Categorías activas
docker exec plataforma-calendario-backend php artisan tinker --execute="echo json_encode(\App\Models\Category::where('is_active', true)->get());"

# Locations activas
docker exec plataforma-calendario-backend php artisan tinker --execute="echo json_encode(\App\Models\Location::where('is_active', true)->get());"
```

**Verificar:**
- ¿Existen registros?
- ¿Campo `is_active` existe?
- ¿Nombre correcto del modelo?

---

### 6. Route List - Configuración Real
**Comando:**
```bash
docker exec plataforma-calendario-backend php artisan route:list --columns=Method,URI,Name,Action,Middleware | grep -E "categories|locations"
```

**Buscar:**
- Middleware column para `/active` endpoints
- ¿Dice `auth:sanctum`?
- Comparar con otros endpoints

---

## 📋 CHECKLIST DE AUDITORÍA

Ejecutar en orden y guardar outputs:

- [ ] **1. routes/api.php completo**
  ```bash
  cd backend && cat routes/api.php > /tmp/routes-api.txt && cat /tmp/routes-api.txt
  ```

- [ ] **2. CategoryController - método active**
  ```bash
  cd backend && grep -A 30 "public function active" app/Features/Categories/Controllers/CategoryController.php
  ```

- [ ] **3. LocationController - método active**
  ```bash
  cd backend && grep -A 30 "public function active" app/Features/Locations/Controllers/LocationController.php
  ```

- [ ] **4. Curl verbose categories (sin auth)**
  ```bash
  curl -v http://localhost:8000/api/v1/categories/active 2>&1 | head -40
  ```

- [ ] **5. Curl verbose categories (con auth)**
  ```bash
  curl -v -H "Authorization: Bearer 20|yBZEr9eFtCt3rNH9glTPJikzqKQgRoIR8bRO1tfS49588c74" \
    http://localhost:8000/api/v1/categories/active 2>&1 | head -40
  ```

- [ ] **6. Route list con middleware**
  ```bash
  docker exec plataforma-calendario-backend php artisan route:list --columns=Method,URI,Action,Middleware | grep "active"
  ```

- [ ] **7. Laravel logs últimos errores**
  ```bash
  docker exec plataforma-calendario-backend tail -50 storage/logs/laravel.log
  ```

---

## 🔍 ANÁLISIS ESPERADO

### Escenario A: Routes dentro de auth:sanctum
**Síntoma:** 404 o redirect a login  
**Causa:** Endpoints requieren auth pero frontend llama sin token  
**Solución:** Mover rutas fuera de middleware auth

### Escenario B: Método active() no existe
**Síntoma:** 500 error, "Method does not exist"  
**Causa:** Controller no tiene método `active()`  
**Solución:** Crear método o usar endpoint diferente

### Escenario C: Middleware en constructor
**Síntoma:** Funciona con algunas rutas, falla con otras  
**Causa:** Constructor del controller aplica middleware a todos los métodos  
**Solución:** Especificar excepciones en constructor

### Escenario D: Error de database
**Síntoma:** 500 error, SQL error en logs  
**Causa:** Columna `is_active` no existe o query mal formada  
**Solución:** Verificar schema de DB y query

---

## 📦 OUTPUT ESPERADO

Después de ejecutar todos los comandos, tendremos:

1. **Confirmación de estructura de routes**
2. **Código de métodos active()**
3. **Headers reales de respuestas**
4. **Errores específicos de logs**
5. **Confirmación de datos en DB**
6. **Middleware real aplicado**

Con esta información podremos:
- ✅ Identificar causa exacta
- ✅ Proponer solución específica
- ✅ Implementar fix quirúrgico
- ✅ Verificar funcionamiento

---

## 🚀 PRÓXIMOS PASOS

1. **Ejecutar checklist completo** (5-10 min)
2. **Analizar outputs**
3. **Identificar causa raíz**
4. **Generar fix específico** (puede ser un prompt para Claude Code)
5. **Verificar solución**
6. **Commit y lunch**

---

**Tiempo estimado total:** 15-20 minutos para diagnóstico completo y fix