# Plan de Optimización — Auditoría Completa

## Filosofía
No damos ninguna optimización por implementada al 100%. 
Cada una se audita en profundidad antes de marcarla como completa.
Orden: de lo más crítico (afecta costos y performance directamente) a lo menos.

---

## PRIORIDAD 1 — CRÍTICAS (afectan costos directamente)

### 1.1 Database Queries — N+1 y Eager Loading
**Estado asumido:** Parcialmente implementado
**Auditar:**
- Cada controller/service que hace queries: ¿usa ->with() siempre?
- ¿Hay N+1 escondidos en loops, transformaciones de recursos, o relaciones anidadas?
- ¿Los Resources (EventResource, etc.) acceden a relaciones sin eager load?
- Herramientas: Laravel Debugbar, laravel-query-detector, clockwork
**Métrica:** Queries por request en cada endpoint principal

### 1.2 Database Indexes
**Estado asumido:** Parcialmente implementado (existe migración add_missing_performance_indexes)
**Auditar:**
- ¿Qué columnas se usan en WHERE, ORDER BY, JOIN que no tienen índice?
- ¿Los índices existentes cubren las queries reales de producción?
- ¿Faltan índices compuestos para queries con múltiples filtros?
- EXPLAIN ANALYZE en las 10 queries más frecuentes
**Métrica:** Tiempo de las queries más lentas con dataset real

### 1.3 Database Normalization (3NF)
**Estado asumido:** Implementado pero nunca auditado formalmente
**Auditar:**
- ¿Hay datos redundantes entre tablas?
- ¿Hay columnas que dependen de claves no primarias? (violación 2NF/3NF)
- ¿Las lookup tables cubren todos los valores hardcodeados?
- ¿Las foreign keys tienen constraints correctos (onDelete, onUpdate)?
- ¿Hay orphan records posibles?
**Métrica:** Score de normalización por tabla

### 1.4 API Rate Limiting
**Estado asumido:** Parcial (registration requests tiene 3/min, pero el resto no)
**Auditar:**
- ¿Qué endpoints están protegidos con rate limiting?
- ¿Cuáles son públicos y vulnerables a abuso?
- ¿Hay protección contra brute force en login?
- Plan: ThrottleRequests middleware por grupo (auth, public, admin)
**Métrica:** Endpoints sin rate limiting

---

## PRIORIDAD 2 — ALTAS (afectan performance y escalabilidad)

### 2.1 Redis Caching Layer
**Estado asumido:** No implementado
**Auditar:**
- ¿Qué datos cambian poco y se consultan mucho? (tipos, ubicaciones, stats)
- ¿Qué endpoints se beneficiarían más de cache?
- Cache invalidation strategy: ¿tag-based? ¿time-based?
- Infraestructura: Redis en Railway (addon), config en Laravel
**Métrica:** Reducción estimada de queries a DB por request

### 2.2 Image Storage — CDN/S3
**Estado asumido:** No implementado (imágenes en picsum para dev)
**Auditar:**
- ¿Dónde se almacenan las imágenes reales en producción?
- ¿Hay compresión/resize automático?
- ¿El frontend usa next/image con optimización?
- Plan: S3 (storage) + CloudFront/Cloudinary (CDN + transformación)
**Métrica:** Peso promedio de imágenes, bandwidth estimado

### 2.3 SWR/Frontend Caching
**Estado asumido:** Parcialmente implementado (keepPreviousData en algunos hooks)
**Auditar:**
- ¿Todos los hooks con SWR usan keepPreviousData?
- ¿Hay revalidation strategies configuradas (staleTime, revalidateOnFocus)?
- ¿Se deduplican requests idénticos?
- ¿Hay prefetching de datos probables?
**Métrica:** Requests redundantes al backend por sesión de usuario

---

## PRIORIDAD 3 — MEDIAS (afectan mantenibilidad y robustez)

### 3.1 Database Transactions
**Estado asumido:** Implementado pero verificar cobertura
**Auditar:**
- ¿TODOS los writes están en DB::transaction()?
- ¿Hay services nuevos (post-octubre 2025) sin transactions?
- ¿Los transactions tienen rollback correcto en caso de error?
- ¿Hay transactions anidados que puedan causar deadlocks?
**Métrica:** % de write operations con transaction

### 3.2 Error Handling & Logging
**Estado asumido:** Implementado pero verificar consistencia
**Auditar:**
- ¿Todos los catch blocks logean con contexto suficiente?
- ¿Hay catch blocks que swallean errores silenciosamente?
- ¿El logging es excesivo? (>1 log per 50 lines de código)
- ¿Los errores de producción llegan a algún servicio (Sentry, etc.)?
**Métrica:** Log statements por feature, errores sin contexto

### 3.3 OPcache Configuration
**Estado asumido:** Configurado en Dockerfile.production
**Auditar:**
- ¿Los valores de opcache son óptimos para el tamaño del proyecto?
- ¿validate_timestamps está en 0 para producción?
- ¿opcache.preload está configurado para Laravel?
- ¿El artisan optimize se ejecuta en el entrypoint?
**Métrica:** Hit rate de OPcache en runtime

### 3.4 TypeScript Strict Mode
**Estado asumido:** Implementado (0 errors actualmente)
**Auditar:**
- ¿Hay type assertions (as) que enmascaran errores?
- ¿Hay @ts-ignore o @ts-expect-error?
- ¿Las interfaces cubren todos los posibles estados de la data?
- ¿Hay any escondidos en generics o utility types?
**Métrica:** Count de as assertions, @ts-ignore, any usage

---

## PRIORIDAD 4 — BAJAS (mejoras futuras)

### 4.1 Slow Query Log
**Configurar:** log_min_duration_statement en PostgreSQL
**Auditar:** Queries que excedan 100ms bajo carga

### 4.2 Laravel Telescope / Debugbar
**Para desarrollo:** Instalar para monitorear queries, requests, etc.

### 4.3 Frontend Bundle Size
**Auditar:** next/bundle-analyzer para encontrar dependencias pesadas

### 4.4 SEO & Core Web Vitals
**Auditar:** Lighthouse en /calendar (la página pública más importante)

### 4.5 Security Audit
**Auditar:** Headers (HSTS, CSP), SQL injection, XSS, CSRF

### 4.6 Multi-tenant Scaling
**Auditar:** ¿Queries están scoped por entity_id? ¿Hay riesgo de data leak entre tenants?

---

## METODOLOGÍA DE AUDITORÍA

Para cada optimización:
1. **Audit** — Claude Code investiga el estado real del código
2. **Report** — Genera reporte con hallazgos + métricas
3. **Plan** — Propone fixes ordenados por impacto
4. **Execute** — Implementa los fixes con TDD
5. **Verify** — Tests + métricas antes/después

## CRONOGRAMA SUGERIDO

- Semana 1: Prioridad 1 (DB queries, indexes, 3NF audit, rate limiting)
- Semana 2: Prioridad 2 (Redis, imágenes, SWR)
- Semana 3: Prioridad 3 (transactions, logging, OPcache, TS)
- Semana 4: Prioridad 4 (slow queries, bundle, SEO, security)