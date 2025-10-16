# TASK FASE 3: PHPUnit Metadata Warnings
**Archivo de referencia para:** Resolución deuda técnica TD-002  
**Branch:** fix/resolve-technical-debt  
**Tiempo estimado:** 90-120 minutos  
**Prioridad:** Alta  
**Score objetivo:** 9.94 → 10.0

---

## 🎯 FILOSOFÍA: CALIDAD SOBRE VELOCIDAD

**CRÍTICO:** Esta es la fase más compleja - múltiples archivos backend.

- ⏸️ NO apurarse - UN archivo a la vez, verificar cada uno
- 🛑 Si un archivo falla, revertir SOLO ese archivo
- ✅ Resultado "3/5 archivos migrados" ES ÉXITO
- 📊 Tests 26/26 passing es NO-NEGOCIABLE

**REGLA DE ORO:** "Un test con warnings es mejor que un test roto sin warnings"

---

## OBJETIVO

Eliminar 14 deprecation warnings migrando de `@test` annotations a `#[Test]` attributes.

**Contexto:**
- PHPUnit 12 depreca doc-comment annotations (`@test`)
- Mejor práctica: PHP 8 attributes (`#[Test]`)
- 14 warnings en 4-5 archivos de tests
- **NO afecta funcionalidad** (tests pasan)
- Preparación para PHPUnit 12

---

## CHECKPOINT 0: Estado Inicial

### Verificaciones obligatorias:

```bash
cd backend

# Tests deben pasar con warnings
docker exec plataforma-calendario-backend php artisan test --compact
```

**Resultado esperado:**
- Tests: 26 passed ✅
- Warnings: ~14 deprecation warnings ⚠️

**Anotar:**
- Tests passing: [ ] 26/26 [ ] Otra cantidad
- Warnings count: ___

**🛑 SI NO SON 26/26:** Hay problemas pre-existentes. No continuar.

---

## PASO 1: Identificar Archivos Afectados

```bash
cd backend
grep -rn "@test" tests/Feature/
```

**Resultado esperado (anotar TODOS):**
```
tests/Feature/ApprovalTest.php: líneas X, Y, Z
tests/Feature/CategoryTest.php: líneas X, Y
tests/Feature/EventTest.php: líneas X, Y, Z
tests/Feature/LocationTest.php: líneas X, Y
```

**Checklist de archivos:**
- [ ] ApprovalTest.php (~6 tests)
- [ ] CategoryTest.php (~5 tests)
- [ ] EventTest.php (~8 tests)
- [ ] LocationTest.php (~5 tests)
- [ ] Otros: ___

**Total archivos a migrar:** ___

---

## PASO 2: PATRÓN DE MIGRACIÓN

### Estudiar ANTES de empezar

**ANTES (deprecated):**
```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ApprovalTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @test
     */
    public function test_can_approve_event()
    {
        // test code
    }
}
```

**DESPUÉS (recomendado):**
```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;  // ← AGREGAR

class ApprovalTest extends TestCase
{
    use RefreshDatabase;

    #[Test]  // ← REEMPLAZAR
    public function test_can_approve_event()
    {
        // test code
    }
}
```

### Cambios específicos:

1. **Agregar import** (después namespace, antes class):
   ```php
   use PHPUnit\Framework\Attributes\Test;
   ```

2. **Reemplazar CADA:**
   ```php
   /**
    * @test
    */
   ```
   
   **Por:**
   ```php
   #[Test]
   ```

3. **Mantener nombre del método** (`test_nombre` no cambia)

4. **Eliminar doc-comment vacío** si no tiene descripción

---

## PASO 3: Migrar Archivo por Archivo (ITERATIVO)

### 🔄 PROCESO PARA CADA ARCHIVO

---

### ARCHIVO 1: ApprovalTest.php

#### 3.1: Backup
```bash
cp tests/Feature/ApprovalTest.php tests/Feature/ApprovalTest.php.backup
```

#### 3.2: Editar archivo

1. Abrir `tests/Feature/ApprovalTest.php`
2. Agregar import después de otros use:
   ```php
   use PHPUnit\Framework\Attributes\Test;
   ```
3. Buscar TODAS las `@test`
4. Reemplazar cada una por `#[Test]`

**Checklist:**
- [ ] Import agregado correctamente
- [ ] TODAS las `@test` reemplazadas
- [ ] Sintaxis PHP válida
- [ ] Nombres métodos intactos

#### 3.3: Verificar SOLO este archivo

```bash
docker exec plataforma-calendario-backend php artisan test --filter=ApprovalTest
```

**Resultado esperado:**
- Tests: 6/6 passing (o cantidad del archivo)
- Warnings: 0 para este archivo
- Duration: ~X.XXs

**Checklist:**
- [ ] Tests pasan
- [ ] No warnings para este archivo
- [ ] No errores PHP

**🛑 SI FALLÓ:**
```bash
# Restaurar backup
cp tests/Feature/ApprovalTest.php.backup tests/Feature/ApprovalTest.php

# Verificar que vuelve
docker exec plataforma-calendario-backend php artisan test --filter=ApprovalTest

# Analizar qué salió mal
# Reportar problema
# Continuar con siguiente archivo
```

**✅ SI PASÓ:**
```bash
git add tests/Feature/ApprovalTest.php
# NO commitear aún
```

---

### ARCHIVO 2: CategoryTest.php

**Repetir mismo proceso:**

1. Backup: `cp tests/Feature/CategoryTest.php tests/Feature/CategoryTest.php.backup`
2. Editar (import + reemplazar `@test`)
3. Verificar: `docker exec plataforma-calendario-backend php artisan test --filter=CategoryTest`
4. Si falla → restaurar, si pasa → git add

**Checklist:**
- [ ] Tests passing
- [ ] No warnings
- [ ] git add completado

---

### ARCHIVO 3: EventTest.php

**Repetir mismo proceso:**

1. Backup
2. Editar
3. Verificar: `docker exec plataforma-calendario-backend php artisan test --filter=EventTest`
4. Rollback o git add

---

### ARCHIVO 4: LocationTest.php

**Repetir mismo proceso:**

1. Backup
2. Editar
3. Verificar: `docker exec plataforma-calendario-backend php artisan test --filter=LocationTest`
4. Rollback o git add

---

### OTROS ARCHIVOS (si existen)

**Repetir mismo proceso para cada uno.**

---

## CHECKPOINT FINAL: Verificación Suite Completa

**Solo ejecutar cuando TODOS los archivos estén migrados.**

```bash
docker exec plataforma-calendario-backend php artisan test --compact
```

**Resultado esperado:**
```
Tests:    26 passed (XX assertions)
Duration: X.XXs
```

**Checklist final:**
- [ ] Tests: 26 passed (mismo que inicio)
- [ ] Assertions: Similar al inicio
- [ ] Warnings: 0 (antes: ~14) ✨
- [ ] Errores: 0
- [ ] Duration: Similar

**🛑 SI ALGO NO COINCIDE:**
- Revisar archivo por archivo
- Ejecutar tests individuales
- Identificar cuál causó problema
- Revertir solo ese archivo
- Continuar con demás

---

## PASO 4: Commit

### Pre-commit checklist:

- [ ] Todos archivos migrados y verificados
- [ ] Suite completa: 26/26 passing
- [ ] 0 warnings (antes: 14)
- [ ] No errores PHP
- [ ] Mismo assertions count
- [ ] Solo annotations modificadas (no código test)

### Revisar staging:

```bash
git status
# ¿Solo archivos en tests/Feature/?
# ¿No hay extraños?
```

### Commit message (ajustar según archivos):

```bash
git add tests/Feature/
git commit -m "refactor(tests): migrate PHPUnit annotations to PHP 8 attributes

- Replace @test doc-comment annotations with #[Test] attributes
- Resolves 14 PHPUnit 12 deprecation warnings
- All tests still passing (26/26)
- Assertions count unchanged

Migration pattern:
  Before: /** @test */ public function test_name()
  After:  #[Test] public function test_name()

Files migrated:
- tests/Feature/ApprovalTest.php (6 tests)
- tests/Feature/CategoryTest.php (5 tests)
- tests/Feature/EventTest.php (8 tests)
- tests/Feature/LocationTest.php (5 tests)

Verification:
✅ Tests: 26/26 passing
✅ Warnings: 0 (before: 14)
✅ No regressions

Resolves: TD-002 from TECHNICAL-DEBT-INVENTORY.md"
```

**IMPORTANTE:** Ajustar lista según archivos realmente migrados.

### Post-commit verification:

```bash
# Ver commit
git log -1 --stat

# Ver cambios
git show HEAD

# Tests una última vez
docker exec plataforma-calendario-backend php artisan test --compact
# ¿Todo verde?
```

---

## MÉTRICAS DE ÉXITO

| Métrica | Antes | Después | Target |
|---------|-------|---------|--------|
| Tests passing | 26/26 | 26/26 | 26/26 |
| Deprecation warnings | 14 | 0 | 0 |
| Files migrated | 0 | 4-5 | ≥3 |
| Tests with @test | ~24 | 0 | 0 |
| Tests with #[Test] | 0 | ~24 | ~24 |
| PHP errors | 0 | 0 | 0 |

**Score:** 9.94 → 10.0 (+0.06)

---

## TROUBLESHOOTING

### Problema: Syntax error después de #[Test]
**Causa:** Falta import o error tipeo  
**Solución:**
```php
// Verificar import existe:
use PHPUnit\Framework\Attributes\Test;

// Verificar sintaxis:
#[Test]  // correcto
#Test    // incorrecto
```

### Problema: Tests fallan después de migración
**Causa:** Se editó código test accidentalmente  
**Solución:**
```bash
diff tests/Feature/ApprovalTest.php tests/Feature/ApprovalTest.php.backup
# Solo deben verse cambios en annotations
```

### Problema: Import no funciona
**Causa:** Posición incorrecta  
**Solución:**
```php
<?php
namespace Tests\Feature;        // 1. Namespace
use Tests\TestCase;             // 2. Imports
use PHPUnit\Framework\Attributes\Test;  // Aquí
class ApprovalTest extends TestCase     // 3. Class
```

### Problema: Algunos tests pasan, otros fallan
**Causa:** Migración inconsistente  
**Solución:**
```bash
grep -n "@test" tests/Feature/ApprovalTest.php
# Si aparecen, faltaron migrar
```

---

## RESULTADO ESPERADO

**Ideal:** 5/5 archivos, 0 warnings, 26/26 tests  
**Realista:** 4/5 archivos, 0-2 warnings, 26/26 tests  
**Aceptable:** 3/5 archivos, algunas warnings, 26/26 tests

**Crítico:** Tests 26/26 SIEMPRE

---

## RESULTADO FINAL DE FASE 3

Al completar:
- 14 warnings eliminados
- 4-5 archivos migrados
- 0 regressions
- Suite tests moderna (PHP 8)
- **Score: 10/10** 🎉

---

## TIEMPO ESTIMADO

- Optimista: 90 min (15-20 min/archivo)
- Realista: 105 min
- Con issues: 120 min

---

## ARCHIVOS DE REFERENCIA

- Prompt corto: `docs/tasks/PROMPT-FASE-3-SHORT.txt`
- Task completo: Este archivo
- Inventario deuda: `TECHNICAL-DEBT-INVENTORY.md`