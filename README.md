<div align="center">

# eventcore

**Plataforma SaaS multi-tenant de gestión de eventos masivos y acreditación en tiempo real.**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-portfolio_case_study-orange)](#about)
[![Stack](https://img.shields.io/badge/stack-Laravel_%2B_Next.js-2D3748)](#architecture)
[![Tests](https://img.shields.io/badge/pruebas-Jest_%2B_Artisan_%2B_Playwright-blue)](#testing)

[Demo en vivo](#demo) · [Arquitectura](#architecture) · [Quick start](#quick-start) · [Caso de estudio](#case-study)

</div>

---

## Table of contents

- [About](#about)
- [Features](#features)
- [Architecture](#architecture)
- [Demo](#demo)
- [Quick start](#quick-start)
- [Project structure](#project-structure)
- [Testing](#testing)
- [Security](#security)
- [Roadmap](#roadmap)
- [Case study](#case-study)
- [License](#license)
- [Author](#author)

## About

**eventcore** es una plataforma SaaS multi-tenant para gestionar eventos masivos de punta a punta: creación, aprobación, registro de asistentes, acreditación con sincronización en vivo entre terminales y emisión de credenciales con un editor visual drag-and-drop.

Originalmente desarrollada como proyecto interno en una empresa de servicios, fue liberada como open source para servir como caso de estudio sobre cómo se construye, prueba y endurece una SaaS multi-tenant con un equipo de un solo desarrollador.

## Features

- **Multi-tenant con aislamiento por organización**: cada organización gestiona sus eventos sin ver datos del resto.
- **4 roles + workflow de aprobación**: platform admin, entity admin, entity staff, organizer admin — con trazabilidad de cada cambio de estado del evento.
- **Acreditación en tiempo real**: sincronización en vivo entre terminales vía Laravel Echo + Reverb (4 listeners por canal `event.{eventId}` con payload guards type-safe, reconexión automática, auth bidireccional).
- **Editor visual de credenciales**: drag-and-drop con `react-konva` — Text/Image/Field/QR/Shape/Transformer, properties panel, store en Zustand y serialización propia. Los clientes diseñan sus badges sin tocar código.
- **Design system propio**: 56 componentes consolidados, dark mode y accesibilidad WCAG 2.1 AA. Regla ESLint custom para bloquear imports cross-feature.
- **Hardening de seguridad**: rate limiting anti-spoofing (CF-Connecting-IP), CSP con nonces dinámicos por ruta, HSTS, normalización de timing en password recovery.
- **Pruebas**: Jest + Testing Library para pruebas unitarias del frontend, `php artisan test` para el backend y Playwright por separado para pruebas de navegador.
- **Configuración de CI**: workflows de GitHub Actions para tests, linting y CodeQL; la configuración no garantiza que los checks pasen.

## Architecture

```
┌──────────────────────┐         ┌──────────────────────┐
│   Web (Next.js 15)   │ ◀────▶ │   API (Laravel 13)   │
│   App Router · TS    │  REST   │   105 endpoints      │
│   Tailwind · Zustand │  + WS   │   24 modelos Eloquent│
│   SWR · react-konva  │         │   Sanctum · Spatie   │
└──────────┬───────────┘         └──────────┬───────────┘
           │                                │
           │                                ▼
           │                    ┌──────────────────────┐
           │                    │     PostgreSQL       │
           │                    │     Redis (cache)    │
           │                    └──────────┬───────────┘
           │                                │
           ▼                                ▼
        ┌─────────────────────────────────────┐
        │   Laravel Reverb (WebSockets)       │
        │   Canal event.{eventId}             │
        │   RegistrantCreated / Updated /     │
        │   Accredited / Payment              │
        └─────────────────────────────────────┘
```

**Stack núcleo:** Next.js 15 (App Router) · React 19 · TypeScript · Laravel 13 (restricción de PHP `^8.3`) · PostgreSQL · Redis · Laravel Echo + Reverb · Sanctum · Spatie Permissions · Tailwind · Zustand · SWR · react-konva.

**Toolchain:** pnpm · Jest + Testing Library · Pruebas vía Artisan (dependencias Pest/PHPUnit) · Playwright · GitHub Actions · CodeQL · Docker.

> Ver las [guías de contribución](CONTRIBUTING.md) para las convenciones de arquitectura y los manifiestos del [frontend](frontend/package.json) y [backend](backend/composer.json) para los requisitos actuales de los frameworks.

## Demo

> [!NOTE]
> **Demo en vivo:** https://eventcore-app.vercel.app
>
> Este enlace muestra la interfaz pública. El despliegue de la API descrito en el [roadmap](#roadmap) es un objetivo futuro documentado, no una descripción del estado actual del backend. El enlace por sí solo no verifica los flujos autenticados ni end-to-end.

**Credenciales de prueba** (resetadas cada hora):

| Rol             | Email                       | Password    |
|-----------------|-----------------------------|-------------|
| Platform admin  | `admin@eventcore.dev`       | `demo1234`  |
| Entity admin    | `entity@eventcore.dev`      | `demo1234`  |
| Organizer       | `organizer@eventcore.dev`   | `demo1234`  |

> Walkthrough en video (90s): <!-- TODO: link a Loom -->

## Quick start

### Pre-requisitos

- Docker + Docker Compose
- Node 20+ y pnpm 10
- PHP compatible con `^8.3` y Composer (sólo si corrés la API fuera de Docker)
- Configuración del entorno local, incluido `.env.docker`, requerido por Compose; no versionar secretos

### Levantar todo con Docker

```bash
git clone https://github.com/MarcosRillo/eventcore.git
cd eventcore

# Desde la raíz del repositorio, con el entorno local configurado
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Migraciones + seeders + enlace de storage (servicio: backend)
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend php artisan migrate --seed
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend php artisan storage:link

# Web (scripts del paquete frontend, no de la raíz)
cd frontend
pnpm install
pnpm run dev
```

- API: `http://localhost:8000`
- Web: `http://localhost:3000`

La configuración de desarrollo expone el backend en el puerto 8000; el archivo Compose base por sí solo no lo hace. Estos comandos corresponden a la [configuración de Compose](docker-compose.dev.yml), pero no prueban que el arranque funcione. Compose no configura un servicio Reverb.

El contenedor frontend sólo se activa con el perfil `frontend-docker`; no actives ese perfil si vas a ejecutar `pnpm run dev` por separado, para evitar duplicar el uso del puerto 3000.

### Levantar sin Docker

Consultá el [manifiesto del backend](backend/composer.json) para los requisitos de PHP y configurá PostgreSQL y Redis antes de ejecutar la API localmente. El frontend se inicia con `pnpm run dev` desde `frontend/`; ver las [guías de contribución](CONTRIBUTING.md) para las convenciones de desarrollo.

## Project structure

```
eventcore/
├── backend/                    # Laravel 13 — API REST + Reverb
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── tests/                  # Pruebas Unit/Feature vía php artisan test
├── frontend/                   # Next.js 15 — App Router
│   ├── src/
│   │   ├── app/
│   │   ├── shared/components/  # Componentes compartidos
│   │   ├── features/           # Módulos por dominio; pruebas de Jest en __tests__
│   │   └── lib/
│   ├── jest.config.js          # Configuración de pruebas unitarias
│   └── e2e/                    # Preparación y pruebas de navegador con Playwright
├── docs/
│   ├── backend/ARCHITECTURE.md
│   ├── frontend/ARCHITECTURE.md
│   ├── SECURITY.md
│   └── case-study.md
├── .github/
│   └── workflows/              # CI: tests, lint, CodeQL
├── docker-compose.yml
├── docker-compose.dev.yml       # Puerto local del backend y volúmenes de desarrollo
├── LICENSE
├── NOTICE
└── README.md
```

## Testing

```bash
# Frontend — desde la raíz del repositorio
cd frontend
pnpm test                   # Jest + Testing Library
pnpm run test:coverage       # Recolección de cobertura con Jest
pnpm run test:ci             # Jest en modo CI con cobertura
pnpm run test:e2e            # Pruebas de navegador con Playwright, por separado

# Backend — pasar de frontend/ a backend/
cd ../backend
php artisan test            # Usa las dependencias Pest/PHPUnit
```

Ver los [scripts del frontend](frontend/package.json), la [configuración de Jest](frontend/jest.config.js), la [configuración de Playwright](frontend/playwright.config.ts) y la [configuración de pruebas del backend](backend/phpunit.xml). Las pruebas de navegador requieren un entorno adecuado de aplicación y backend; no forman parte del [workflow Tests](.github/workflows/test.yml) predeterminado, que ejecuta `test:ci` en el frontend y `php artisan test --coverage-clover=coverage.xml` en el backend, desde sus respectivos directorios.

Está configurada la recolección de cobertura, no un porcentaje alcanzado ni un umbral porcentual obligatorio. Los totales de pruebas ejecutadas y la cobertura requieren resultados de una ejecución concreta; ver la [evidencia del caso de estudio](docs/case-study.md#testing-evidence) para el estado de CI en el commit auditado.

## Security

- Reportar vulnerabilidades: ver [`docs/SECURITY.md`](docs/SECURITY.md).
- Pipeline corre CodeQL + Dependabot en cada PR.
- Headers HTTP por defecto: HSTS, CSP con nonces dinámicos, X-Content-Type-Options, X-Frame-Options.
- Rate limiting anti-spoofing usando `CF-Connecting-IP` (no `X-Forwarded-For`).

## Roadmap

- [ ] Objetivo futuro documentado: despliegue de la API + Postgres en Railway, junto a la interfaz pública existente en Vercel
- [ ] Walkthrough en Loom (90s)
- [ ] Ampliar la [vista general de arquitectura](#architecture) con diagramas detallados
- [ ] Playground público de tenants efímeros
- [ ] Webhook signing para integraciones de terceros
- [ ] OpenAPI spec autogenerada

## Case study

Lectura larga sobre las decisiones de diseño, los trade-offs y los aprendizajes:
**[Caso de estudio del repositorio](docs/case-study.md)**

Algunos posts relacionados:
- Consolidar dos design systems en uno
- Hardening de un Laravel multi-tenant: lecciones del campo

## License

Apache 2.0 — ver [LICENSE](LICENSE) y [NOTICE](NOTICE).

## Author

**Marcos Rillo Cabanne** — Full Stack Developer · Tucumán, Argentina

[LinkedIn](https://linkedin.com/in/marcos-rillo-cabanne) · [Email](mailto:marcosrillocabanne@gmail.com)

> Este repo es el caso de estudio principal de mi portfolio. Si te interesa cómo está construido o querés conversar sobre una posición full stack, escribime.
