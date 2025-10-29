# 🔍 FRONTEND AUDIT REPORT
**Generated:** $(date)
**Platform:** Next.js + TypeScript + React
**Purpose:** Comprehensive frontend analysis

---

## 📊 EXECUTIVE SUMMARY

**Node Version:** v22.15.1
**npm Version:** 11.4.2

**Next.js Version:** ^15.5.4
**React Version:** ^19.2.0
**TypeScript Version:** ^5.9.3

## 📦 DEPENDENCIES

**Dependencies:** 11
**Dev Dependencies:** 17

## 🏗️ ARCHITECTURE

**Type:** Features-based ✅

**Features:**
```
appearance
auth
categories
events
locations
organizer
```

**Components:**       82
**Custom Hooks:**       26
**Services:**        5
**Type Files:**       14

## 🔷 TYPESCRIPT

```
```

## 🔍 ESLINT

```

> frontend@0.1.0 lint
> next lint

`next lint` is deprecated and will be removed in Next.js 16.
For new projects, use create-next-app to choose your preferred linter.
For existing projects, migrate to the ESLint CLI:
npx @next/codemod@canary next-lint-to-eslint-cli .

✔ No ESLint warnings or errors
```

## 🧪 TESTS

```

> frontend@0.1.0 test
> jest --passWithNoTests --passWithNoTests

PASS src/features/organizer/hooks/__tests__/useOrganizerStats.test.ts
PASS src/features/organizer/__tests__/OrganizerEventForm.test.tsx
PASS src/context/__tests__/AuthContext.test.tsx
PASS src/features/organizer/__tests__/OrganizerEventList.test.tsx
PASS src/features/events/hooks/__tests__/useEventManager.test.ts
PASS src/hooks/__tests__/usePermissions.test.ts
PASS src/features/organizer/components/dumb/__tests__/OrganizerStatsCard.test.tsx
PASS src/features/events/services/__tests__/event.service.test.ts
PASS src/features/organizer/services/__tests__/organizerStatsService.test.ts

Test Suites: 9 passed, 9 total
Tests:       128 passed, 128 total
Snapshots:   0 total
Time:        1.362 s
Ran all test suites.
```

## 🏗️ BUILD

```

> frontend@0.1.0 build
> next build

   ▲ Next.js 15.5.5
   - Environments: .env.local

   Creating an optimized production build ...
 ✓ Compiled successfully in 2.3s
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/15) ...
   Generating static pages (3/15) 
   Generating static pages (7/15) 
   Generating static pages (11/15) 
 ✓ Generating static pages (15/15)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                 Size  First Load JS
┌ ○ /                                      557 B         205 kB
├ ○ /_not-found                            997 B         103 kB
├ ○ /admin/categories                      342 B         102 kB
├ ○ /appearance                          3.26 kB         208 kB
├ ○ /calendar                            59.3 kB         264 kB
├ ƒ /calendar/[slug]                     5.25 kB         155 kB
├ ○ /categories                          4.89 kB         212 kB
├ ○ /events                              25.7 kB         233 kB
├ ○ /login                               3.11 kB         208 kB
├ ○ /organizer/dashboard                 2.02 kB         104 kB
├ ○ /organizer/events                    5.25 kB         164 kB
├ ƒ /organizer/events/[id]/edit            368 B         127 kB
├ ○ /organizer/events/create               336 B         127 kB
└ ○ /test-widget                         1.64 kB         124 kB
+ First Load JS shared by all             102 kB
  ├ chunks/255-e62f614902caf7fa.js       45.5 kB
  ├ chunks/4bd1b696-409494caf8c83275.js  54.2 kB
  └ other shared chunks (total)          1.99 kB


ƒ Middleware                             34.2 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand

```

## 📏 CODE METRICS

**Features LOC:** 5460 lines
**Total src/ LOC:**  lines

**TODOs in code:**        1
**FIXMEs in code:**        0
**console.log() calls:**       41
**any types:**        1

## 📦 OUTDATED DEPENDENCIES

```
Package               Current   Wanted   Latest  Location                           Depended by
@tailwindcss/postcss   4.1.14   4.1.16   4.1.16  node_modules/@tailwindcss/postcss  frontend
@types/node            24.7.2   24.9.2   24.9.2  node_modules/@types/node           frontend
axios                  1.12.2   1.13.1   1.13.1  node_modules/axios                 frontend
eslint                 9.37.0   9.38.0   9.38.0  node_modules/eslint                frontend
eslint-config-next     15.5.5   15.5.6   16.0.1  node_modules/eslint-config-next    frontend
lucide-react          0.544.0  0.544.0  0.548.0  node_modules/lucide-react          frontend
msw                    2.11.5   2.11.6   2.11.6  node_modules/msw                   frontend
next                   15.5.5   15.5.6   16.0.1  node_modules/next                  frontend
tailwindcss            4.1.14   4.1.16   4.1.16  node_modules/tailwindcss           frontend
```

