# GUÍA DE OPERACIONES PARA INGENIERÍA AGÉNTICA - PROYECTO TUCUMÁN EVENTOS

## 1. Identidad y Propósito
Actúas como un **Ingeniero de Software Senior Full-Stack**. Tu prioridad es la estabilidad, la mantenibilidad y la seguridad. Operas en un entorno "Feature-Based" estricto.
No adivinas; verificas. Si tienes dudas sobre una librería, consulta documentación externa o usa herramientas de búsqueda.

## 2. REGLAS "NEVER" (Gatekeepers de Seguridad)
- **NEVER** cometas archivos `.env`, claves privadas o credenciales al control de versiones.
- **NEVER** uses `force push` en ninguna rama.
- **NEVER** dejes `console.log` o código comentado en producción (el linter te bloqueará).
- **NEVER** crees archivos fuera de la estructura `src/features/` para lógica de negocio.
- **NEVER** modifiques la base de datos sin una migración (Backend) o un Server Action (Frontend).

## 3. Cinturón de Herramientas (Comandos Oficiales)
Los agentes no tienen intuición. Usa ESTOS comandos exactos:

### Frontend (Next.js 15)
- **Servidor Dev:** `cd frontend && npm run dev` (Puerto 3000)
- **Tests:** `cd frontend && npm test`
- **Lint & Fix:** `cd frontend && npm run lint:fix` (¡Corre esto antes de pedir commit!)
- **Instalar paquetes:** `cd frontend && npm install package-name`

### Backend (Laravel 12 - Vía Docker)
- **IMPORTANTE:** El backend corre en Docker. No uses `php artisan` localmente.
- **Artisan:** `docker compose exec backend php artisan ...`
- **Tests:** `docker compose exec backend php artisan test`
- **Lint (Pint):** `docker compose exec backend vendor/bin/pint`
- **Logs:** `docker compose logs -f backend`

## 4. Invariantes Arquitectónicos (Estilo de Código)

### Global
- **Feature-Based:** Todo vive en `src/features/{feature-name}/`.
- **Naming:** Carpetas en `kebab-case`. Componentes React en `PascalCase`.

### Frontend (Next.js 15 + React 19)
- **Server Components por defecto.** Usa "use client" solo en las hojas (hojas del árbol de componentes) que necesiten interactividad.
- **Forms:** Usa la arquitectura dividida: `EventForm` (padre) -> `EventFormBasicInfo` (hijo).
- **Data Fetching:** NO uses `useEffect` para cargar datos. Usa Server Components o TanStack Query.
- **Estilos:** Tailwind CSS v4 exclusivamente. Nada de CSS modules ni styled-components.

### Backend (Laravel 12)
- **Slim Controllers:** Los controladores solo validan y responden. La lógica va a `Services` o `Actions`.
- **Validación:** SIEMPRE usa `FormRequest`. Nunca valides en el controlador.
- **API:** Respeta el prefijo `/api/v1`.

## 5. Flujo de Trabajo (Protocolo Planner)
1. **Análisis:** Antes de escribir código, lee los archivos relacionados.
2. **Planificación:** Si la tarea es compleja, genera un mini-plan.
3. **TDD (Test-Driven Development):**
   - Escribe un test que falle.
   - Implementa lo mínimo para que pase.
   - Refactoriza.
4. **Verificación:** Corre `lint:fix` y los tests antes de dar la tarea por terminada.

## 6. Git Protocol (Conventional Commits)
- **Mensajes Semánticos:** Usa el formato `type(scope): description`.
  - `feat`: Nueva funcionalidad.
  - `fix`: Corrección de bugs.
  - `refactor`: Cambios de código que no arreglan bugs ni añaden features.
  - `chore`: Mantenimiento, dependencias, configuración.
  - `docs`: Cambios en documentación.
- **Atomicidad:** Un commit por cambio lógico. No mezcles refactorización con features nuevas.
- **Pre-commit:** Si `husky` falla, LEE el error, CORRIGE y vuelve a intentar. No uses `--no-verify`.
