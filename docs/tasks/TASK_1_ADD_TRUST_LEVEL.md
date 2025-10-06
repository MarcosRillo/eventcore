# TASK 1: Agregar Campo trust_level a Organizations

**Prioridad:** CRÍTICA  
**Tiempo estimado:** 30 minutos  
**Contexto:** El Panel Organizador necesita trust_level para auto-aprobación de eventos

---

## OBJETIVO

Agregar columna `trust_level` a tabla `organizations` para implementar sistema de confianza con 3 niveles:
- **Level 1 (Nuevo):** Todos los eventos requieren aprobación manual
- **Level 2 (Confiable):** Algunos eventos auto-aprobados según criterios
- **Level 3 (Premium):** Auto-publicación directa sin aprobación

---

## PASOS DE EJECUCIÓN

### 1. Crear Migration

```bash
cd backend
php artisan make:migration add_trust_level_to_organizations_table
```

### 2. Implementar Migration

Editar el archivo generado en `backend/database/migrations/YYYY_MM_DD_HHMMSS_add_trust_level_to_organizations_table.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->tinyInteger('trust_level')
                ->default(1)
                ->after('type_id')
                ->comment('1=Nuevo, 2=Confiable, 3=Premium');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn('trust_level');
        });
    }
};
```

### 3. Ejecutar Migration

```bash
php artisan migrate
```

Deberías ver output similar a:
```
Migrating: YYYY_MM_DD_HHMMSS_add_trust_level_to_organizations_table
Migrated:  YYYY_MM_DD_HHMMSS_add_trust_level_to_organizations_table (XX.XXms)
```

### 4. Actualizar Model Organization

Editar `backend/app/Models/Organization.php`:

Agregar `trust_level` al array `$fillable`:

```php
protected $fillable = [
    'name',
    'cuit',
    'description',
    'status_id',
    'type_id',
    'parent_id',
    'slug',
    'trust_level', // ← AGREGAR ESTA LÍNEA
];
```

Opcional: Agregar cast para asegurar tipo integer:

```php
protected $casts = [
    'trust_level' => 'integer',
];
```

### 5. Verificar en Database

Opción A - Usando Tinker:
```bash
php artisan tinker
```

```php
// Verificar que campo existe y tiene default value
>>> Organization::first()->trust_level
=> 1

// Verificar que se puede actualizar
>>> $org = Organization::first();
>>> $org->trust_level = 2;
>>> $org->save();
=> true

>>> $org->trust_level
=> 2
```

Opción B - Usando SQL directo:
```bash
docker exec -it plataforma-calendario-db psql -U postgres -d plataforma_calendario
```

```sql
-- Ver estructura de tabla
\d organizations

-- Verificar valores actuales
SELECT id, name, trust_level FROM organizations LIMIT 5;
```

---

## TESTING

### Test 1: Verificar Default Value

**Acción:** Crear nueva organización sin especificar trust_level

```bash
php artisan tinker
```

```php
$org = Organization::create([
    'name' => 'Test Organization',
    'cuit' => '20-12345678-9',
    'status_id' => 1,
    'type_id' => 1,
]);

$org->trust_level; // Debe retornar 1
```

**Resultado esperado:** trust_level = 1 automáticamente

### Test 2: Verificar Actualización

**Acción:** Actualizar trust_level de organización existente

```php
$org = Organization::first();
$org->update(['trust_level' => 3]);
$org->refresh();
$org->trust_level; // Debe retornar 3
```

**Resultado esperado:** trust_level se actualiza correctamente

### Test 3: Verificar Constraint de Valores

**Acción:** Intentar setear valor inválido

```php
$org = Organization::first();
$org->trust_level = 999; // Valor fuera de rango
$org->save();
```

**Resultado esperado:** Debería permitirlo (tinyInt acepta -128 a 127), pero en producción considera agregar validación a nivel de aplicación.

---

## VALIDACIÓN ADICIONAL (Opcional pero Recomendado)

### Agregar Validación en Requests

Si existen Request classes para Organization, agregar validación:

```php
// backend/app/Http/Requests/StoreOrganizationRequest.php
// backend/app/Http/Requests/UpdateOrganizationRequest.php

public function rules(): array
{
    return [
        // ... otras reglas
        'trust_level' => 'sometimes|integer|min:1|max:3',
    ];
}
```

---

## ROLLBACK (Si algo sale mal)

```bash
# Deshacer migration
php artisan migrate:rollback

# O rollback específico
php artisan migrate:rollback --step=1
```

---

## CRITERIOS DE ÉXITO

- [ ] Migration ejecutada sin errores
- [ ] Columna `trust_level` existe en tabla `organizations`
- [ ] Default value = 1 para todas las organizaciones
- [ ] Organizaciones existentes tienen trust_level = 1
- [ ] Campo es actualizable desde Model
- [ ] `Organization::first()->trust_level` retorna integer (1, 2, o 3)

---

## PROBLEMAS COMUNES

**Error: "SQLSTATE[42701]: Duplicate column"**
- Causa: Columna ya existe
- Solución: Verificar con `\d organizations` en psql, hacer rollback si es necesario

**Error: "SQLSTATE[42P01]: Undefined table"**
- Causa: Tabla organizations no existe
- Solución: Verificar que migraciones anteriores se ejecutaron correctamente

**Error: "Class 'Organization' not found" en tinker**
- Causa: Namespace incorrecto
- Solución: Usar `App\Models\Organization::first()`

---

## PRÓXIMO PASO

Después de completar esta tarea, continuar con:
- **TASK 2:** Fix Security - Crear OrganizerController con scoping

---

**Tiempo real esperado:** 20-30 minutos  
**Bloqueantes:** Ninguno  
**Dependencias:** Migraciones base de organizations ya ejecutadas