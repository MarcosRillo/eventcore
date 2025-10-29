# TECHNICAL DEBT INVENTORY

**Última actualización:** Octubre 29, 2025 13:26
**Fuente:** deep-audit.sh execution (audit-reports-2025-10-29_10-25/)
**Score de deuda:** 4/10 (CRÍTICA)

---

## RESUMEN EJECUTIVO

**Total Items:** 6 (1 crítico + 2 medios + 3 bajos)
**Status General:** 🔴 CRÍTICO - Requiere acción inmediata
**Bloqueantes:** 1 item (backend tests)
**Tiempo Total Estimado:** 7-10 horas

---

## 📊 MÉTRICAS DE DEUDA TÉCNICA

| Métrica | Valor | Target | Status |
|---------|-------|--------|--------|
| Items críticos | 1 | 0 | ❌ |
| Items medios | 2 | <3 | ✓ |
| Items bajos | 3 | <5 | ✓ |
| Backend tests passing | 3/36 (8.3%) | 100% | ❌ |
| Frontend tests passing | 128/128 (100%) | 100% | ✅ |
| TODOs en código | 2 | <5 | ✅ |
| FIXMEs en código | 0 | 0 | ✅ |
| console.log (frontend) | 41 | 0 | ❌ |
| any types (frontend) | 1 | 0 | ❌ |
| Backend dependencies outdated | 4 | 0 | ❌ |
| Frontend dependencies outdated | 9 | 0 | ❌ |

---

## DEUDA TÉCNICA ACTUAL

### 🔴 CRÍTICA (Alta Prioridad) - 1 ITEM

#### 1. Backend Tests Regression - Missing user_roles table

**Categoría:** Testing / Database
**Severidad:** CRÍTICA
**Prioridad:** MÁXIMA
**Estado:** ABIERTO
**Bloqueante:** SÍ

**Descripción:**
33 de 36 tests backend failing (91.7% failure rate) debido a error "SQLSTATE[HY000]: General error: 1 no such table: user_roles" en SQLite test database.

**Impacto:**
- Bloquea CI/CD pipeline
- No se puede garantizar calidad del backend
- Riesgo de regressions no detectadas
- Deployment bloqueado

**Evidencia (de audit):**
```
Tests:    33 failed, 3 passed (4 assertions)
Duration: 0.28s

Error Pattern:
SQLSTATE[HY000]: General error: 1 no such table: user_roles
(Connection: sqlite, SQL: insert into "user_roles" ...)

at vendor/laravel/framework/src/Illuminate/Database/Connection.php:824
at database/seeders/UserRolesSeeder.php:69
```

**Tests Afectados:**
```
ApprovalTest (5 tests):
- test_can_reject_event
- test_can_request_changes
- test_can_publish_approved_event
- test_can_request_public_approval
- test_can_get_approval_statistics

CategoryTest (5 tests):
- test_can_list_categories
- test_can_create_category
- test_can_update_category
- test_can_delete_category
- test_can_get_active_categories_only

Dashboard/OrganizerStatsTest (11 tests):
- (todos los tests de OrganizerStatsController)

EventTest (9 tests):
- test_can_list_events
- test_can_create_event
- test_can_update_event
- test_can_delete_event
- test_can_get_event_statistics
- test_can_duplicate_event
- test_can_toggle_featured_status
- test_can_get_single_event_details
- (+ otros)

LocationTest (5 tests):
- test_can_list_locations
- test_can_create_location
- test_can_update_location
- test_can_delete_location
- test_can_get_active_locations_only
```

**Root Cause:**
- Migration para user_roles table faltante o no ejecutada en test environment
- UserRolesSeeder.php intenta insertar en tabla inexistente
- Tests usan DatabaseTransactions pero tabla no existe en schema

**Archivos Afectados:**
- `database/seeders/UserRolesSeeder.php` (línea 69)
- `tests/Feature/ApprovalTest.php`
- `tests/Feature/CategoryTest.php`
- `tests/Feature/Dashboard/OrganizerStatsTest.php`
- `tests/Feature/EventTest.php`
- `tests/Feature/LocationTest.php`

**Solución Propuesta:**
1. Verificar si existe migration para user_roles:
   ```bash
   ls backend/database/migrations/*_create_user_roles_table.php
   ```
2. Si no existe, crear migration:
   ```bash
   cd backend && php artisan make:migration create_user_roles_table
   ```
3. Definir schema en migration:
   ```php
   Schema::create('user_roles', function (Blueprint $table) {
       $table->id();
       $table->string('role_code')->unique();
       $table->string('role_name');
       $table->text('description')->nullable();
       $table->json('permissions')->nullable();
       $table->timestamps();
   });
   ```
4. Verificar que tests usan DatabaseMigrations trait:
   ```php
   use Illuminate\Foundation\Testing\DatabaseMigrations;
   ```
5. Ejecutar tests:
   ```bash
   cd backend && php artisan test
   ```
6. Validar que 36/36 tests passing

**Tiempo Estimado:** 1-2 horas
**Asignado a:** URGENTE
**Deadline:** INMEDIATO

---

### ⚠️ MEDIA (2 items)

#### 2. Outdated Backend Dependencies

**Categoría:** Maintenance / Security
**Severidad:** MEDIA
**Prioridad:** ALTA
**Estado:** ABIERTO
**Bloqueante:** NO

**Descripción:**
4 dependencias backend desactualizadas, incluyendo Laravel Framework con 12 minor versions de retraso.

**Evidencia (de audit):**
```
laravel/framework 12.24.0 ! 12.36.0 The Laravel Framework.
laravel/pint      1.24.0  ! 1.25.1  An opinionated code formatter for PHP.
laravel/sail      1.44.0  ! 1.47.0  Docker files for running a basic Laravel...
phpunit/phpunit   11.5.32 ~ 12.4.1  The PHP Unit Testing framework.
```

**Impacto:**
- Posibles vulnerabilidades de seguridad no patcheadas
- Features nuevas de Laravel no disponibles
- PHPUnit 12 tiene breaking changes (major upgrade)
- Diferencias con producción si se despliega con versiones nuevas

**Dependencias Específicas:**
1. **laravel/framework: 12.24.0 → 12.36.0**
   - Tipo: Minor update (12 versions)
   - Risk: Bajo (minor versions son backward compatible)
   - Beneficio: Bug fixes, mejoras de performance

2. **laravel/pint: 1.24.0 → 1.25.1**
   - Tipo: Minor update
   - Risk: Muy bajo (code formatter)
   - Beneficio: Nuevas reglas de formato

3. **laravel/sail: 1.44.0 → 1.47.0**
   - Tipo: Minor update
   - Risk: Bajo (Docker dev environment)
   - Beneficio: Mejoras en Docker setup

4. **phpunit/phpunit: 11.5.32 → 12.4.1**
   - Tipo: MAJOR update
   - Risk: MEDIO (breaking changes esperados)
   - Beneficio: Nuevas features, mejor performance
   - Requiere: Revisar migration guide

**Solución Propuesta:**
1. Actualizar dependencias menores primero:
   ```bash
   cd backend
   composer update laravel/framework laravel/pint laravel/sail
   ```
2. Ejecutar tests completos:
   ```bash
   php artisan test
   ```
3. Para PHPUnit 12 (separado):
   - Revisar breaking changes: https://phpunit.de/announcements/phpunit-12.html
   - Actualizar tests si necesario
   - Migrar doc-comments a attributes
   - Ejecutar: `composer require --dev phpunit/phpunit:^12.0`

**Tiempo Estimado:** 1-2 horas (includes testing)
**Deadline:** Próxima semana
**Depends On:** Resolver CRÍTICO-001 primero

---

#### 3. Outdated Frontend Dependencies

**Categoría:** Maintenance / Security
**Severidad:** MEDIA
**Prioridad:** MEDIA
**Estado:** ABIERTO
**Bloqueante:** NO

**Descripción:**
9 dependencias frontend desactualizadas (todas minor/patch updates).

**Evidencia (de audit):**
```
Package               Current   Wanted   Latest
@tailwindcss/postcss   4.1.14   4.1.16   4.1.16
@types/node            24.7.2   24.9.2   24.9.2
axios                  1.12.2   1.13.1   1.13.1
eslint                 9.37.0   9.38.0   9.38.0
eslint-config-next     15.5.5   15.5.6   16.0.1
lucide-react          0.544.0  0.544.0  0.548.0
msw                    2.11.5   2.11.6   2.11.6
next                   15.5.5   15.5.6   16.0.1
tailwindcss            4.1.14   4.1.16   4.1.16
```

**Impacto:**
- Posibles vulnerabilidades de seguridad
- Features nuevas no disponibles
- Diferencias con Next.js 16 (future major)

**Dependencias Prioritarias:**
1. **next: 15.5.5 → 15.5.6** (patch - bug fixes)
2. **axios: 1.12.2 → 1.13.1** (minor - security fixes)
3. **tailwindcss: 4.1.14 → 4.1.16** (patch - bug fixes)
4. **eslint: 9.37.0 → 9.38.0** (minor - new rules)

**Nota:** eslint-config-next y next tienen 16.0.1 como latest, pero es mejor esperar estabilidad antes de major upgrade.

**Solución Propuesta:**
```bash
cd frontend
npm update @tailwindcss/postcss @types/node axios eslint lucide-react msw tailwindcss
npm update next@15.5.6 eslint-config-next@15.5.6
npm test
npm run build
```

**Tiempo Estimado:** 30 minutos
**Deadline:** Próxima semana

---

### 🟡 BAJA (3 items)

#### 4. Frontend Code Quality: console.log statements

**Categoría:** Code Quality / Performance
**Severidad:** BAJA
**Prioridad:** MEDIA (acumula deuda)
**Estado:** ABIERTO
**Bloqueante:** NO

**Descripción:**
41 console.log() calls detectadas en código fuente frontend.

**Evidencia (de audit):**
```
console.log() calls: 41 (verified by grep)
```

**Impacto:**
- Performance degradation en producción
- Información sensible puede exponerse en console
- Debuging artifacts en production build
- No es apropiado para logging profesional

**Ubicaciones (muestra):**
```bash
# Para obtener lista completa:
cd frontend && grep -r "console.log" src/
```

**Solución Propuesta:**
1. Eliminar console.log de código de producción
2. Reemplazar con logger apropiado si es necesario:
   ```typescript
   // Antes
   console.log('User data:', user)

   // Después (si es necesario logging)
   import { logger } from '@/utils/logger'
   logger.debug('User data loaded', { userId: user.id })
   ```
3. Agregar ESLint rule para prevenir:
   ```json
   {
     "rules": {
       "no-console": ["error", { "allow": ["warn", "error"] }]
     }
   }
   ```

**Tiempo Estimado:** 1-2 horas
**Deadline:** Esta semana (después de CRÍTICO-001)

---

#### 5. Frontend Code Quality: any types

**Categoría:** Type Safety
**Severidad:** BAJA
**Prioridad:** BAJA
**Estado:** ABIERTO
**Bloqueante:** NO

**Descripción:**
1 any type detectado en código frontend (TypeScript strict mode violation).

**Evidencia (de audit):**
```
any types: 1 (verified by grep)
```

**Impacto:**
- Compromete type safety en ese punto
- Posibles runtime errors no detectados
- Viola estándar de código del proyecto

**Ubicación:**
```bash
cd frontend && grep -r ": any" src/
```

**Solución Propuesta:**
1. Identificar ubicación exacta del any type
2. Refactorizar con tipo específico:
   ```typescript
   // Antes
   function processData(data: any) {
     return data.value
   }

   // Después
   interface DataInput {
     value: string
   }
   function processData(data: DataInput) {
     return data.value
   }
   ```
3. Si el tipo es complejo, usar `unknown` + type guard:
   ```typescript
   function processData(data: unknown) {
     if (isValidData(data)) {
       return data.value
     }
     throw new Error('Invalid data')
   }

   function isValidData(data: unknown): data is DataInput {
     return typeof data === 'object' && data !== null && 'value' in data
   }
   ```

**Tiempo Estimado:** 15 minutos
**Deadline:** Esta semana

---

#### 6. PHPUnit 12 Upgrade Pending

**Categoría:** Testing Infrastructure
**Severidad:** BAJA
**Prioridad:** BAJA
**Estado:** ABIERTO
**Bloqueante:** NO

**Descripción:**
PHPUnit 11.5.32 instalado, versión 12.4.1 disponible (major upgrade).

**Evidencia (de audit):**
```
phpunit/phpunit   11.5.32 ~ 12.4.1
```

**Impacto:**
- Nuevas features no disponibles
- Warnings de deprecación esperadas
- PHPUnit 11 eventualmente sin soporte

**Breaking Changes Esperados:**
- Migration de doc-comments a PHP 8 attributes
- Cambios en assertion messages
- Deprecation de algunos métodos
- Ver: https://phpunit.de/announcements/phpunit-12.html

**Solución Propuesta:**
1. Leer migration guide completo
2. Crear branch para upgrade:
   ```bash
   git checkout -b feature/phpunit-12-upgrade
   ```
3. Actualizar composer.json:
   ```json
   {
     "require-dev": {
       "phpunit/phpunit": "^12.0"
     }
   }
   ```
4. Ejecutar composer update:
   ```bash
   cd backend && composer update phpunit/phpunit
   ```
5. Migrar tests (example):
   ```php
   // Antes (PHPUnit 11)
   /**
    * @test
    */
   public function it_works() {}

   // Después (PHPUnit 12)
   #[Test]
   public function it_works() {}
   ```
6. Ejecutar tests y fix issues
7. Merge solo cuando 100% tests passing

**Tiempo Estimado:** 2-3 horas
**Deadline:** Próximo mes
**Depends On:** Resolver CRÍTICO-001 primero

---

## 📊 RESUMEN POR CATEGORÍA

| Categoría | Items | Críticos | Medios | Bajos |
|-----------|-------|----------|--------|-------|
| Testing | 2 | 1 | 0 | 1 |
| Code Quality | 2 | 0 | 0 | 2 |
| Maintenance | 2 | 0 | 2 | 0 |
| **TOTAL** | **6** | **1** | **2** | **3** |

---

## 🎯 PLAN DE ACCIÓN

### Fase 1: CRÍTICO (HOY)
- [x] ✅ Deep audit ejecutada
- [ ] ❌ CRÍTICO-001: Fix backend tests (1-2h)
- [ ] ⏳ Validar fix con nueva auditoría
- [ ] ⏳ Actualizar documentación

### Fase 2: Code Quality (ESTA SEMANA)
- [ ] ⏳ Eliminar 41 console.log (1-2h)
- [ ] ⏳ Fix 1 any type (15min)
- [ ] ⏳ Agregar ESLint rules preventivas

### Fase 3: Dependencies (PRÓXIMA SEMANA)
- [ ] ⏳ Update frontend dependencies (30min)
- [ ] ⏳ Update backend dependencies menores (1h)
- [ ] ⏳ Full test suite validation

### Fase 4: Major Upgrades (PRÓXIMO MES)
- [ ] ⏳ PHPUnit 12 upgrade (2-3h)
- [ ] ⏳ Considerar Next.js 16 cuando esté estable

---

## 📈 HISTÓRICO DE DEUDA TÉCNICA

### Octubre 29, 2025 (Esta auditoría)
- **Score:** 4/10 (CRÍTICO)
- **Items:** 6 (1 crítico + 2 medios + 3 bajos)
- **Backend Tests:** 3/36 passing (REGRESIÓN)
- **Frontend Tests:** 128/128 passing (MEJORA)

### Octubre 27, 2025 (Auditoría anterior)
- **Score:** 10/10 (EXCELENTE)
- **Items:** 3 (0 críticos + 2 medios + 1 bajo)
- **Backend Tests:** 36/36 passing
- **Frontend Tests:** 116/116 passing

### Cambio
- **Score:** 10/10 → 4/10 ❌ REGRESIÓN -60%
- **Items Críticos:** 0 → 1 ❌ NUEVO CRÍTICO
- **Backend Tests:** 36 → 3 ❌ REGRESIÓN -91.7%
- **Frontend Tests:** 116 → 128 ✅ MEJORA +10.3%

**Conclusión:** Regresión crítica en backend requiere acción INMEDIATA.

---

## 🔄 PROCESO DE ACTUALIZACIÓN

Este documento se actualiza:
1. Después de cada deep audit (automático)
2. Después de resolver items (manual)
3. Al agregar nueva deuda técnica (manual)
4. Semanalmente (review)

**Próxima actualización:** Después de resolver CRÍTICO-001

---

**Generado por:** deep-audit.sh (audit-reports-2025-10-29_10-25/)
**Filosofía:** Maximum quality over speed, verified data over estimates
**Última actualización:** Octubre 29, 2025 13:26
