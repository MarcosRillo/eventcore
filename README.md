<div align="center">

# eventcore

**Plataforma SaaS multi-tenant de gestión de eventos masivos y acreditación en tiempo real.**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-portfolio_case_study-orange)](#about)
[![Stack](https://img.shields.io/badge/stack-Laravel_%2B_Next.js-2D3748)](#architecture)
[![Tests](https://img.shields.io/badge/coverage-85%25%2B-brightgreen)](#testing)

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
- **Tests serios**: 85%+ cobertura — 433 Vitest + 60 PHPUnit + 66 Playwright end-to-end. Gates per-file del 88% en módulos críticos.
- **CI/CD listo**: GitHub Actions con tests, linting y CodeQL en cada PR.

## Architecture

```
┌──────────────────────┐         ┌──────────────────────┐
│   Web (Next.js 14)   │ ◀────▶ │   API (Laravel 11)   │
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

**Stack núcleo:** Next.js 14 (App Router) · TypeScript · Laravel 11 · PostgreSQL · Redis · Laravel Echo + Reverb · Sanctum · Spatie Permissions · Tailwind · Zustand · SWR · react-konva.

**Toolchain:** pnpm · Vitest · PHPUnit · Playwright · GitHub Actions · CodeQL · Docker.

> Diagrama de arquitectura detallado: [`docs/architecture.md`](docs/architecture.md)

## Demo

> [!NOTE]
> **Demo en vivo:** https://plataforma-calendario-monorepo.vercel.app

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
- PHP 8.3 y Composer (sólo si corrés la API fuera de Docker)

### Levantar todo con Docker

```bash
git clone https://github.com/MarcosRillo/eventcore.git
cd eventcore

cp .env.example .env
docker compose up -d

# Migrations + seeders + storage link
docker compose exec api php artisan migrate --seed
docker compose exec api php artisan storage:link

# Web
cd frontend && pnpm install && pnpm dev
```

- API: `http://localhost:8000`
- Web: `http://localhost:3000`
- Reverb: `ws://localhost:8080`

### Levantar sin Docker

Ver [`docs/local-dev.md`](docs/local-dev.md).

## Project structure

```
eventcore/
├── backend/                    # Laravel 11 — API REST + Reverb
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── tests/                  # PHPUnit
├── frontend/                   # Next.js 14 — App Router
│   ├── src/
│   │   ├── app/
│   │   ├── components/         # Design system
│   │   ├── features/           # Vertical slices
│   │   └── lib/
│   └── e2e/                    # Vitest + Playwright
├── docs/
│   ├── architecture.md
│   ├── local-dev.md
│   └── assets/
├── .github/
│   └── workflows/              # CI: tests, lint, CodeQL
├── docker-compose.yml
├── LICENSE
├── NOTICE
└── README.md
```

## Testing

```bash
# Frontend (Vitest + Playwright)
cd frontend
pnpm test           # unit
pnpm test:e2e       # Playwright
pnpm coverage       # gate per-file 88% en módulos críticos

# Backend (PHPUnit)
cd backend
php artisan test
```

**Cobertura objetivo:** 85% global · 88% per-file en módulos críticos (auth, billing, accreditation).

## Security

- Reportar vulnerabilidades: ver [`SECURITY.md`](SECURITY.md).
- Pipeline corre CodeQL + Dependabot en cada PR.
- Headers HTTP por defecto: HSTS, CSP con nonces dinámicos, X-Content-Type-Options, X-Frame-Options.
- Rate limiting anti-spoofing usando `CF-Connecting-IP` (no `X-Forwarded-For`).

## Roadmap

- [ ] Demo deploy en Railway (API + Postgres) + Vercel (Web)
- [ ] Walkthrough en Loom (90s)
- [ ] `docs/architecture.md` con diagramas detallados
- [ ] Playground público de tenants efímeros
- [ ] Webhook signing para integraciones de terceros
- [ ] OpenAPI spec autogenerada

## Case study

Lectura larga sobre las decisiones de diseño, los trade-offs y los aprendizajes:
**[marcosrillo.dev/eventcore](https://marcosrillo.dev)** <!-- TODO -->

Algunos posts relacionados:
- Migración Jest → Vitest sin perder cobertura (37 archivos vía codemod)
- Consolidar dos design systems en uno (de 273 archivos legacy a 56 componentes)
- Hardening de un Laravel multi-tenant: lecciones del campo

## License

Apache 2.0 — ver [LICENSE](LICENSE) y [NOTICE](NOTICE).

## Author

**Marcos Rillo Cabanne** — Full Stack Developer · Tucumán, Argentina

[LinkedIn](https://linkedin.com/in/marcos-rillo-cabanne) · [Email](mailto:marcosrillocabanne@gmail.com)

> Este repo es el caso de estudio principal de mi portfolio. Si te interesa cómo está construido o querés conversar sobre una posición full stack, escribime.
