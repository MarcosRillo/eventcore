# QA Manual Test Checklist — Plataforma Calendario Tucumán
**Version:** Pre-presentación Ente de Turismo
**Date:** 2026-03-31
**Frontend:** https://plataforma-calendario-monorepo.vercel.app
**Backend:** https://plataforma-calendario-monorepo.onrender.com

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Platform Admin | marcos@plataforma.com | password123 |
| Entity Admin | ana.garcia@enteturismo.gov.ar | password123 |
| Organizer (Sheraton) | maria.rodriguez@sheraton.com | password123 |
| Organizer (La Rural) | juan.perez@larural.com.ar | password123 |

---

## Legend
- **BLOCKER** — App cannot be presented with this failing
- **CRITICAL** — Significantly degrades the demo, fix before presentation
- **NICE** — Polish item, OK to present with this failing

---

## Section 1: Public Pages (sin login)

### 1.1 Landing Page — `/`

- [ ] La página carga en menos de 5 segundos (Render warm) — Hero section visible con título "Eventos Tucumán" `[BLOCKER]`
- [ ] La sección "Eventos Destacados" muestra cards con imagen, título y fecha — Las imágenes cargan desde Cloudinary (dominio `res.cloudinary.com`) `[BLOCKER]`
- [ ] La sección "Categorías" muestra los tipos de evento (chips/cards clickeables) — Visible con íconos/colores `[CRITICAL]`
- [ ] La sección "Organizadores" (CTA section) renderiza al hacer scroll — Visible al fondo del landing `[NICE]`
- [ ] Click en un evento destacado navega a `/calendar/{id}` — Página de detalle carga correctamente `[BLOCKER]`
- [ ] Click en "Explorar" o botón del hero navega a `/calendar` — Página del calendario carga `[BLOCKER]`
- [ ] Click en una categoría navega a `/calendar?event_type_id={id}` — URL contiene el query param correcto `[CRITICAL]`
- [ ] Click en "Ver todos" navega a `/calendar` — Funciona desde sección featured events `[CRITICAL]`
- [ ] Open Graph / meta tags presentes — Inspeccionar con DevTools > Elements, buscar `<meta property="og:title">` `[NICE]`
- [ ] No hay errores en la consola del navegador al cargar la página — Consola limpia `[CRITICAL]`

### 1.2 Calendario Público — `/calendar`

- [ ] La página carga con la barra de estadísticas visible (total eventos, tipos activos, eventos este mes) — Stats bar visible `[CRITICAL]`
- [ ] Vista "Calendario" es el modo default — Calendario mensual visible al entrar `[BLOCKER]`
- [ ] La vista calendario muestra el mes actual con eventos marcados en los días correctos `[BLOCKER]`
- [ ] Toggle "Cuadrícula" (LayoutGrid) cambia a vista de cards — Ambas vistas funcionan `[BLOCKER]`
- [ ] Toggle "Calendario" vuelve a la vista mensual — Estado persiste al alternar `[BLOCKER]`
- [ ] Los filtros (tipo de evento, ubicación, fechas) funcionan en vista cuadrícula — Lista se actualiza `[CRITICAL]`
- [ ] Entrar con URL `/calendar?event_type_id=X` pre-filtra el calendario — Filtro aplicado desde URL `[CRITICAL]`
- [ ] Paginación funciona en vista cuadrícula — Navegar a página 2 y volver `[CRITICAL]`
- [ ] Sin eventos para un mes: se muestra estado vacío correcto (no crash) `[CRITICAL]`
- [ ] No hay errores en consola `[CRITICAL]`

### 1.3 Detalle de Evento — `/calendar/{id}`

- [ ] La página carga con título, descripción, fecha de inicio, ubicación — Todos los campos visibles `[BLOCKER]`
- [ ] Imagen destacada carga desde Cloudinary — Sin imagen rota `[CRITICAL]`
- [ ] Fecha formateada en español argentino (ej: "lunes, 15 de abril de 2026") `[NICE]`
- [ ] Ubicación muestra nombre y ciudad `[CRITICAL]`
- [ ] Si el evento tiene `maps_url`, el link "Ver en Google Maps →" es visible y funcional `[NICE]`
- [ ] Si el evento tiene asistencia esperada (local/nacional/internacional), los badges numéricos son visibles `[NICE]`
- [ ] Si el evento tiene sitio web, el link es visible y abre en nueva pestaña `[NICE]`
- [ ] Navegar a un ID inexistente (ej: `/calendar/99999`) no crashea la app — Muestra error o 404 `[CRITICAL]`

### 1.4 Registro de Organizaciones — `/register-request`

- [ ] La página carga con formulario de solicitud — Header con "Solicitar Registro" visible `[BLOCKER]`
- [ ] Enviar formulario con campos vacíos muestra errores de validación inline `[BLOCKER]`
- [ ] Completar todos los campos requeridos y enviar — Estado de éxito con "Solicitud Enviada" y checkmark verde `[BLOCKER]`
- [ ] El email enviado se muestra en el mensaje de confirmación ("Te contactaremos a...") `[CRITICAL]`
- [ ] Botón "Volver al inicio" en el estado de éxito navega a `/` `[CRITICAL]`
- [ ] Link "Iniciá sesión" al pie del formulario navega a `/login` `[NICE]`

### 1.5 Páginas Legales

- [ ] `/terms` carga sin error — Contenido de Términos visible `[CRITICAL]`
- [ ] `/privacy` carga sin error — Contenido de Privacidad visible `[CRITICAL]`

---

## Section 2: Autenticación

### 2.1 Login — `/login`

- [ ] La página carga con logo, título "Eventos Tucumán" y formulario `[BLOCKER]`
- [ ] Login con email/password vacíos no realiza request — Validación frontend bloquea submit `[BLOCKER]`
- [ ] Login con password incorrecta muestra error "Invalid credentials" en banner rojo `[BLOCKER]`
- [ ] Login con email que no existe muestra error (mismo banner, no revela si existe) `[BLOCKER]`
- [ ] Login exitoso como **Entity Admin** (ana.garcia@enteturismo.gov.ar) redirige al panel de admin `[BLOCKER]`
- [ ] Login exitoso como **Organizer Sheraton** (maria.rodriguez@sheraton.com) redirige a `/organizer/dashboard` `[BLOCKER]`
- [ ] Login exitoso como **Organizer La Rural** (juan.perez@larural.com.ar) redirige a `/organizer/dashboard` `[BLOCKER]`
- [ ] Usuario ya autenticado que visita `/login` ve spinner "Redirigiendo..." y es redirigido automáticamente `[CRITICAL]`
- [ ] Link "¿Olvidaste tu contraseña?" navega a `/forgot-password` `[CRITICAL]`
- [ ] El campo contraseña tiene toggle show/hide funcional `[NICE]`

### 2.2 Logout

- [ ] Logout desde el panel de admin funciona y redirige a `/login` — Sesión completamente destruida `[BLOCKER]`
- [ ] Logout desde el panel de organizer funciona y redirige a `/login` `[BLOCKER]`
- [ ] Tras logout, navegar hacia atrás no muestra datos del usuario anterior `[CRITICAL]`

### 2.3 Token Refresh (sesión persistente)

- [ ] Tras login, recargar la página mantiene la sesión activa — No redirige a login `[BLOCKER]`
- [ ] Abrir una nueva pestaña con la URL del dashboard mantiene la sesión (cookies httpOnly) `[CRITICAL]`

### 2.4 Usuario Suspendido

- [ ] Si un usuario suspendido intenta hacer login, recibe el mensaje específico de suspensión (no "Invalid credentials") — El backend devuelve el mensaje "Tu cuenta ha sido suspendida" `[CRITICAL]`

### 2.5 Recupero de Contraseña

- [ ] `/forgot-password` carga con formulario de email `[CRITICAL]`
- [ ] Enviar email registrado muestra confirmación de envío `[CRITICAL]`
- [ ] `/reset-password` carga y acepta nueva contraseña `[NICE]`

### 2.6 Aceptar Invitación

- [ ] `/accept-invitation` carga con formulario para completar datos del usuario invitado `[CRITICAL]`

---

## Section 3: Panel de Administrador del Ente (Entity Admin)

Loguearse como: **ana.garcia@enteturismo.gov.ar**

### 3.1 Dashboard Principal — `/events` (o ruta raíz del admin)

- [ ] El dashboard carga con la barra de estadísticas (stats bar compacta) — Números de eventos por estado visibles `[BLOCKER]`
- [ ] Los stats cards son clickeables y filtran la lista de eventos por estado (ej: click en "Pendientes" filtra) `[BLOCKER]`
- [ ] La lista de eventos carga con paginación funcional `[BLOCKER]`
- [ ] Búsqueda por texto filtra los eventos en tiempo real (debounced) `[CRITICAL]`
- [ ] Filtro por tipo de evento (dropdown) funciona — Lista se actualiza `[CRITICAL]`
- [ ] Toggle "Próximos / Pasados" cambia el scope temporal de los eventos `[CRITICAL]`
- [ ] Botón "Limpiar filtros" restablece todos los filtros y muestra todos los eventos `[CRITICAL]`
- [ ] Sin eventos en un estado filtrado: se muestra empty state correcto `[CRITICAL]`
- [ ] No hay errores en consola `[CRITICAL]`

### 3.2 Modal de Gestión de Eventos (Approval Workflow)

- [ ] Hacer click en "Gestionar" un evento abre el modal de gestión `[BLOCKER]`
- [ ] El modal muestra panel izquierdo con: imagen, título, descripción, fechas, ubicación `[BLOCKER]`
- [ ] El modal muestra el historial de aprobaciones (ApprovalHistoryTimeline) con entradas cronológicas `[CRITICAL]`
- [ ] El panel derecho muestra las acciones disponibles según el estado actual del evento `[BLOCKER]`

**Flujo Completo de Aprobación (testar con un evento de maria.rodriguez):**

- [ ] Evento en estado `draft` — No aparece en lista admin hasta ser enviado a revisión `[CRITICAL]`
- [ ] Evento en estado `pending_internal_approval` — Acciones disponibles: "Aprobar interno", "Solicitar cambios", "Rechazar" `[BLOCKER]`
- [ ] Acción "Aprobar interno" → estado cambia a `approved_internal` — Historial se actualiza `[BLOCKER]`
- [ ] Evento en estado `approved_internal` — Acciones disponibles: "Enviar a aprobación pública", "Solicitar cambios" `[BLOCKER]`
- [ ] Acción "Enviar a aprobación pública" → estado cambia a `pending_public_approval` `[BLOCKER]`
- [ ] Evento en estado `pending_public_approval` — Acciones disponibles: "Publicar", "Solicitar cambios", "Rechazar" `[BLOCKER]`
- [ ] Acción "Publicar" → estado cambia a `published` — Evento aparece en calendario público `[BLOCKER]`
- [ ] Acción "Solicitar cambios" requiere ingresar un comentario — Validación: campo obligatorio `[CRITICAL]`
- [ ] Acción "Rechazar" requiere ingresar un comentario — Validación: campo obligatorio `[CRITICAL]`
- [ ] Tras rechazar, el estado del evento cambia a `rejected` en la lista `[BLOCKER]`
- [ ] Toggle "Destacado" en el panel de acciones marca/desmarca el evento como featured `[CRITICAL]`
- [ ] Cerrar el modal actualiza la lista de eventos (refetch automático) `[CRITICAL]`

### 3.3 Tipos de Evento — `/event-types`

- [ ] La página carga con tabla de tipos de evento y estadísticas (total, activos, inactivos) `[BLOCKER]`
- [ ] Búsqueda por nombre filtra la tabla en tiempo real `[CRITICAL]`
- [ ] Filtro por estado (Todos / Solo activos / Solo inactivos) funciona `[CRITICAL]`
- [ ] Botón "Nuevo Tipo" abre modal de creación — Formulario carga correctamente `[BLOCKER]`
- [ ] Crear nuevo tipo de evento con nombre válido — Aparece en la tabla al confirmar `[BLOCKER]`
- [ ] Botón editar (lápiz) abre modal de edición — Datos pre-cargados `[BLOCKER]`
- [ ] Editar nombre y guardar — Tabla se actualiza correctamente `[BLOCKER]`
- [ ] Botón eliminar abre diálogo de confirmación — Cancelar NO elimina `[CRITICAL]`
- [ ] Confirmar eliminación — El tipo desaparece de la tabla `[BLOCKER]`
- [ ] Click en una fila expande los **subtipos** del tipo seleccionado (filas expandibles) `[BLOCKER]`
- [ ] Botón "Agregar subtipo" dentro de la fila expandida abre modal de creación de subtipo `[BLOCKER]`
- [ ] Crear subtipo asociado al tipo padre — Aparece en la fila expandida `[BLOCKER]`
- [ ] Editar subtipo — Cambio persiste `[CRITICAL]`
- [ ] Eliminar subtipo — Diálogo de confirmación, luego desaparece `[CRITICAL]`
- [ ] URL se actualiza con `?expanded=X` al expandir un tipo (shallow routing) `[NICE]`

### 3.4 Ubicaciones — `/locations`

- [ ] La página carga con tabla de ubicaciones y total `[BLOCKER]`
- [ ] Búsqueda por nombre o ciudad filtra la tabla `[CRITICAL]`
- [ ] Botón "Nueva Ubicación" abre modal de creación `[BLOCKER]`
- [ ] Crear nueva ubicación — Aparece en la tabla `[BLOCKER]`
- [ ] Editar ubicación — Datos pre-cargados, cambio persiste `[BLOCKER]`
- [ ] Eliminar ubicación — Confirmación, luego desaparece `[CRITICAL]`
- [ ] Estado vacío: crear y eliminar todo — Se muestra "No hay ubicaciones" con botón CTA `[NICE]`

### 3.5 Sectores — `/sectors`

- [ ] La página carga con tabla de sectores y estadísticas (total, activos, inactivos) `[BLOCKER]`
- [ ] Búsqueda por nombre filtra la tabla `[CRITICAL]`
- [ ] Filtro por estado (activos/inactivos) funciona `[CRITICAL]`
- [ ] Botón "Nuevo Sector" abre modal de creación `[BLOCKER]`
- [ ] Crear sector — Aparece en tabla `[BLOCKER]`
- [ ] Editar sector — Cambio persiste `[BLOCKER]`
- [ ] Eliminar sector — Confirmación, luego desaparece `[CRITICAL]`

### 3.6 Organizaciones — `/organizations`

Esta página tiene 3 tabs unificados.

- [ ] La página carga con 3 tabs: "Organizaciones", "Solicitudes", "Invitaciones" — Tabs visibles con contadores `[BLOCKER]`
- [ ] Tab activo por defecto: "Organizaciones" — Tabla de organizaciones visible `[BLOCKER]`

**Tab Organizaciones:**
- [ ] Tabla de organizaciones carga con datos `[BLOCKER]`
- [ ] Cambiar al tab "Solicitudes" — Tabla de solicitudes de registro carga `[BLOCKER]`

**Tab Solicitudes:**
- [ ] Lista de solicitudes pendientes visible con badge de conteo en el tab `[CRITICAL]`
- [ ] Filtro por estado (pendiente, aprobado, rechazado, suspendido) funciona `[CRITICAL]`
- [ ] Click en "Ver detalle" abre el slide-over panel lateral con info completa de la solicitud `[BLOCKER]`
- [ ] Botón "Aprobar" (desde tabla o detalle) muestra toast de éxito y actualiza estado `[BLOCKER]`
- [ ] Botón "Rechazar" abre modal con campo de motivo — Validación: motivo obligatorio `[BLOCKER]`
- [ ] Confirmar rechazo — Estado cambia, toast de éxito, email enviado al solicitante `[BLOCKER]`
- [ ] Botón "Suspender" abre modal de confirmación — Confirmar suspende usuario y organización `[CRITICAL]`
- [ ] Botón "Reactivar" (en solicitudes suspendidas) reactiva sin modal `[CRITICAL]`
- [ ] Botón "Eliminar" abre modal de confirmación — Eliminar permanentemente `[CRITICAL]`

**Tab Invitaciones:**
- [ ] Lista de invitaciones enviadas visible `[CRITICAL]`
- [ ] Botón "Invitar Usuario" (en `/users`) navega a `/organizations` — Flujo de invitación desde usuarios `[CRITICAL]`
- [ ] Modal de creación de invitación: campos email y rol — Validación funciona `[CRITICAL]`
- [ ] Enviar invitación — Toast de éxito, aparece en tabla de invitaciones `[CRITICAL]`

### 3.7 Usuarios — `/users`

- [ ] La página carga con tabla de usuarios del equipo interno `[BLOCKER]`
- [ ] Botón "Invitar Usuario" navega a `/organizations` (tab de invitaciones) `[CRITICAL]`
- [ ] Click en editar usuario abre modal de edición — Cambios persisten `[CRITICAL]`

### 3.8 Calendario Interno — `/internal-calendar`

- [ ] La página carga con barra de estadísticas en la parte superior (StatsBar) `[BLOCKER]`
- [ ] Vista "Calendario" por defecto muestra calendario mensual con eventos de todos los estados `[BLOCKER]`
- [ ] Toggle a "Vista Grid" muestra lista de eventos `[CRITICAL]`
- [ ] Filtro por estado (draft, pending, approved, published, etc.) filtra los eventos `[CRITICAL]`
- [ ] Filtro por tipo de evento funciona `[CRITICAL]`
- [ ] Filtro por rango de fechas (inicio y fin) funciona `[CRITICAL]`
- [ ] Filtros se sincronizan con la URL (cambiar filtro actualiza query params) `[NICE]`
- [ ] Click en un evento en vista grid navega al detalle del evento interno `[CRITICAL]`
- [ ] La página de detalle del evento interno carga correctamente con toda la info `[CRITICAL]`
- [ ] Botón de exportar (si existe) funciona o no crashea `[NICE]`

---

## Section 4: Panel del Organizador

### 4.1 Dashboard — `/organizer/dashboard`

Loguearse como: **maria.rodriguez@sheraton.com**

- [ ] El dashboard carga con estadísticas del organizador (total, por estado) `[BLOCKER]`
- [ ] La lista de eventos del organizador carga — Solo ve sus propios eventos, no los de otros `[BLOCKER]`
- [ ] Filtro por estado (tabs o pills) en la lista de eventos funciona `[CRITICAL]`
- [ ] Toggle "Pasados" muestra eventos históricos `[CRITICAL]`
- [ ] Paginación funciona `[CRITICAL]`
- [ ] Botón "Editar" en una card de evento navega a `/organizer/{id}/edit` `[BLOCKER]`
- [ ] Botón "Ver detalle" navega a `/organizer/{id}` `[BLOCKER]`
- [ ] Sin eventos: se muestra estado vacío con mensaje apropiado `[CRITICAL]`

### 4.2 Crear Evento — `/organizer/create`

- [ ] La página carga con el formulario completo de creación `[BLOCKER]`
- [ ] Intentar enviar con campos vacíos muestra errores de validación en los campos correspondientes `[BLOCKER]`
- [ ] El form hace scroll automático al primer campo con error `[NICE]`

**Campos obligatorios:**
- [ ] Título — Requerido `[BLOCKER]`
- [ ] Tipo de evento (dropdown) — Requerido; al seleccionar, carga los subtipos dinámicamente `[BLOCKER]`
- [ ] Subtipo de evento (dropdown) — Aparece solo al seleccionar tipo, requerido `[BLOCKER]`
- [ ] Descripción — Requerido `[BLOCKER]`
- [ ] Fecha de inicio — Requerido `[BLOCKER]`
- [ ] Ubicación(es) — Selector searchable multi-select carga opciones del backend `[BLOCKER]`

**Campos opcionales:**
- [ ] Número de edición — Acepta texto `[NICE]`
- [ ] Fecha de fin — Opcional `[NICE]`
- [ ] Fechas asincrónicas — Agregar fecha + nota, eliminar fecha de la lista `[CRITICAL]`
- [ ] Toggle "Ubicación personalizada" — Al activar, muestra campos nombre y URL de mapa `[CRITICAL]`
- [ ] URL de mapa (campo maps_url) acepta URL de Google Maps `[NICE]`
- [ ] Asistencia esperada (local, nacional, internacional) — Acepta solo números `[NICE]`
- [ ] Transmisión virtual (checkbox) — Funciona `[NICE]`
- [ ] Sitio web del evento (URL) `[NICE]`
- [ ] Imagen destacada (file upload) — Subir imagen JPG/PNG, previsualización antes de guardar `[CRITICAL]`

**Submit:**
- [ ] Crear evento con datos válidos — Toast de éxito y redirección a `/organizer/events` `[BLOCKER]`
- [ ] El evento creado aparece en la lista con estado `draft` `[BLOCKER]`
- [ ] Cancelar con el botón "Cancelar" vuelve a la página anterior `[NICE]`

### 4.3 Editar Evento — `/organizer/{id}/edit`

- [ ] El formulario de edición carga con todos los datos del evento pre-cargados `[BLOCKER]`
- [ ] Cambiar título y guardar — El cambio persiste al volver al detalle `[BLOCKER]`
- [ ] Cambiar imagen — Nueva imagen se sube a Cloudinary y se refleja en el detalle `[CRITICAL]`
- [ ] Las ubicaciones previamente seleccionadas aparecen como chips en el multi-select `[CRITICAL]`
- [ ] Guardar edición — Toast de éxito `[BLOCKER]`
- [ ] Un evento en estado `pending_internal_approval` o superior NO debería ser editable (verificar que el botón de editar está deshabilitado o el formulario bloqueado) `[CRITICAL]`

### 4.4 Detalle de Evento del Organizador — `/organizer/{id}`

- [ ] La página carga con breadcrumb, título, badge de estado y acciones `[BLOCKER]`
- [ ] Imagen carga desde Cloudinary `[CRITICAL]`
- [ ] Fechas formateadas en español argentino `[NICE]`
- [ ] Link "Ver en Google Maps →" visible si tiene maps_url y abre en nueva pestaña `[NICE]`
- [ ] Badges de asistencia visibles si están cargados `[NICE]`
- [ ] Botón "Editar" navega a `/organizer/{id}/edit` `[BLOCKER]`

**Botón "Enviar a revisión" (Submit for Review):**
- [ ] El botón "Enviar a revisión" es visible para eventos en estado `draft` o `requires_changes` `[BLOCKER]`
- [ ] Click en "Enviar a revisión" abre modal de confirmación con mensaje correcto `[BLOCKER]`
- [ ] Si el evento tiene campos faltantes, el modal muestra un warning con los campos que faltan `[CRITICAL]`
- [ ] Confirmar el envío — Estado cambia a `pending_internal_approval`, botón desaparece `[BLOCKER]`
- [ ] El botón "Eliminar" es visible para eventos en estado `draft` `[CRITICAL]`
- [ ] Click "Eliminar" + confirmar — Evento eliminado, redirección al dashboard `[CRITICAL]`

### 4.5 Lista de Eventos del Organizador — `/organizer/events`

- [ ] La página carga con tabla/lista de los eventos del organizador `[BLOCKER]`
- [ ] Filtro por estado funciona `[CRITICAL]`
- [ ] Paginación funciona `[CRITICAL]`
- [ ] Botón "Ver" navega a `/organizer/{id}` `[BLOCKER]`
- [ ] Botón "Editar" navega a `/organizer/{id}/edit` `[BLOCKER]`

### 4.6 Calendario del Organizador — `/organizer/calendar`

- [ ] La página carga y muestra el calendario con los eventos del organizador `[CRITICAL]`

### 4.7 Aislamiento de datos (seguridad)

Loguearse como: **juan.perez@larural.com.ar**

- [ ] Solo ve sus propios eventos — No ve eventos de Sheraton ni de otros organizadores `[BLOCKER]`
- [ ] Intentar navegar a `/events` (admin) redirige a su dashboard o muestra 403 — NO accede a datos del admin `[BLOCKER]`
- [ ] Intentar navegar a `/event-types`, `/locations`, `/sectors` redirige o bloquea acceso `[BLOCKER]`
- [ ] Intentar navegar a `/organizations` redirige o bloquea acceso `[BLOCKER]`
- [ ] Intentar navegar a `/users` redirige o bloquea acceso `[BLOCKER]`
- [ ] Intentar navegar a `/internal-calendar` redirige o bloquea acceso `[BLOCKER]`

---

## Section 5: Flujo Completo End-to-End

Estos tests combinan múltiples roles y deben ejecutarse en orden.

### 5.1 Flujo Completo de Publicación de Evento

- [ ] **Como Organizer (maria.rodriguez):** Crear nuevo evento con todos los campos completos `[BLOCKER]`
- [ ] **Como Organizer:** Enviar evento a revisión — Estado pasa a `pending_internal_approval` `[BLOCKER]`
- [ ] **Como Entity Admin (ana.garcia):** Ver el evento en la lista con estado "Pendiente Aprobación Interna" `[BLOCKER]`
- [ ] **Como Entity Admin:** Abrir modal, aprobar internamente — Estado → `approved_internal` `[BLOCKER]`
- [ ] **Como Entity Admin:** Enviar a aprobación pública — Estado → `pending_public_approval` `[BLOCKER]`
- [ ] **Como Entity Admin:** Publicar el evento — Estado → `published` `[BLOCKER]`
- [ ] **Sin login:** Verificar que el evento aparece en `/calendar` y en `/calendar/{id}` `[BLOCKER]`
- [ ] El historial de aprobaciones en el modal muestra todos los pasos con timestamps `[CRITICAL]`

### 5.2 Flujo de Rechazo y Reenvío

- [ ] **Como Entity Admin:** Enviar acción "Solicitar cambios" a un evento — Ingresar comentario, confirmar `[BLOCKER]`
- [ ] **Como Organizer:** Ver que el evento ahora muestra estado `requires_changes` — El comentario/motivo es visible `[CRITICAL]`
- [ ] **Como Organizer:** Editar el evento para corregir los cambios solicitados `[CRITICAL]`
- [ ] **Como Organizer:** Reenviar a revisión — Estado vuelve a `pending_internal_approval` `[BLOCKER]`

### 5.3 Flujo de Solicitud de Registro de Organización

- [ ] **Sin login:** Completar formulario en `/register-request` — Solicitud enviada `[BLOCKER]`
- [ ] **Como Entity Admin:** Ver solicitud pendiente en `/organizations` tab "Solicitudes" `[BLOCKER]`
- [ ] **Como Entity Admin:** Ver detalle de la solicitud en el panel lateral `[CRITICAL]`
- [ ] **Como Entity Admin:** Aprobar solicitud — Toast de éxito, estado cambia a "Aprobado" `[BLOCKER]`

---

## Section 6: Responsividad y Cross-Browser

### 6.1 Mobile — iPhone 14 Pro (390x844, DevTools Emulation)

- [ ] Landing page: Hero visible, imagen de fondo, botón "Explorar" accesible `[BLOCKER]`
- [ ] Landing: Cards de eventos destacados en 1 columna o scroll horizontal funcional `[CRITICAL]`
- [ ] Calendario público: vista calendario usa diseño compacto (7 columnas días, texto chico) `[BLOCKER]`
- [ ] Detalle de evento: sin overflow horizontal, texto legible `[CRITICAL]`
- [ ] Formulario de registro de solicitud: inputs a full width, sin overflow `[BLOCKER]`
- [ ] Login: formulario centrado, inputs a full width `[BLOCKER]`
- [ ] Panel admin: si existe nav lateral, colapsa o tiene hamburger en mobile `[CRITICAL]`
- [ ] Modal de gestión de eventos: scroll funciona dentro del modal en mobile `[CRITICAL]`
- [ ] Formulario de creación de evento: todos los campos accesibles sin scroll horizontal `[CRITICAL]`

### 6.2 Tablet — iPad (768x1024, DevTools Emulation)

- [ ] Landing page: layout de 2 columnas en sección de eventos featured `[NICE]`
- [ ] Panel admin: sidebar y contenido principal visibles simultáneamente `[CRITICAL]`
- [ ] Tabla de tipos de evento / ubicaciones / sectores: columnas visibles sin overflow `[CRITICAL]`

### 6.3 Cross-Browser

- [ ] **Chrome (último):** Probar landing, calendar y login — Sin diferencias visuales `[BLOCKER]`
- [ ] **Safari (último):** Probar landing, calendar y login — Sin diferencias visuales `[CRITICAL]`
- [ ] **Safari:** Verificar que los date inputs (`<input type="date">`) funcionan correctamente `[CRITICAL]`
- [ ] **Firefox (opcional):** Landing y login funcionan `[NICE]`

---

## Section 7: Performance

- [ ] Landing (warm server): carga completa en menos de 5 segundos — Medir con DevTools Network `[BLOCKER]`
- [ ] Calendario público (warm): carga completa en menos de 5 segundos `[BLOCKER]`
- [ ] Dashboard del admin (warm): stats y lista de eventos cargan en menos de 5 segundos `[CRITICAL]`
- [ ] Dashboard del organizer (warm): stats y lista cargan en menos de 5 segundos `[CRITICAL]`
- [ ] Las imágenes cargan desde `res.cloudinary.com` — No desde el propio backend `[CRITICAL]`
- [ ] No hay console.error ni console.warn inesperados en ninguna página — Consola limpia en Chrome `[CRITICAL]`
- [ ] Lighthouse Performance Score > 70 en landing y calendario (DevTools > Lighthouse) `[NICE]`

---

## Section 8: Edge Cases y Comportamientos Límite

### 8.1 Backend Cold Start (Render Free Tier)

- [ ] El primer request tras inactividad puede tardar 30-60 segundos — La app muestra loading spinner, NO crash ni timeout de browser `[BLOCKER]`
- [ ] El landing tiene ISR (`revalidate = 60`): si el backend está frío, sirve contenido cacheado de la última build `[CRITICAL]`
- [ ] Abrir DevTools > Network, filtrar por XHR/Fetch, cargar el dashboard — Ver que los requests al backend Render responden (aunque con demora) `[CRITICAL]`

### 8.2 Sin Datos / Listas Vacías

- [ ] Calendario público sin eventos publicados: se muestra empty state, NO crash `[BLOCKER]`
- [ ] Lista de eventos del admin con todos los filtros activos sin resultados: empty state visible `[CRITICAL]`
- [ ] Lista de eventos del organizer vacía: empty state con mensaje apropiado `[CRITICAL]`
- [ ] Tipos de evento sin subtipos al expandir: se muestra mensaje "sin subtipos" o botón para crear el primero `[NICE]`

### 8.3 Títulos y Textos Largos

- [ ] Evento con título de 100+ caracteres: no rompe el layout en cards ni en la tabla `[CRITICAL]`
- [ ] Descripción de evento larga (5+ párrafos): scroll o truncado, sin overflow `[NICE]`

### 8.4 Validaciones de Formulario

- [ ] Formulario de evento: fecha de fin anterior a fecha de inicio — Se muestra error de validación `[CRITICAL]`
- [ ] Formulario de evento: URL inválida en campo sitio web — Error de validación o warning `[NICE]`
- [ ] Formulario de evento: subir imagen de más de 5MB — Se muestra error (si aplica límite) `[NICE]`
- [ ] Formulario de sector/tipo con nombre duplicado — Backend devuelve error y se muestra en UI `[CRITICAL]`

### 8.5 Concurrencia y Stale Data

- [ ] Aprobar un evento como admin y verificar que la lista se actualiza automáticamente (sin reload manual) `[CRITICAL]`
- [ ] Crear un evento como organizador y volver al dashboard — El nuevo evento aparece sin reload `[CRITICAL]`

---

## Section 9: SEO y Metadatos (verificación rápida)

- [ ] `/` — `<title>` contiene "Eventos Tucumán" `[NICE]`
- [ ] `/calendar/{id}` — `<title>` contiene el nombre del evento `[NICE]`
- [ ] `/robots.txt` — Responde con contenido (acceder a `/robots.txt`) `[NICE]`
- [ ] `/sitemap.xml` — Responde con contenido XML `[NICE]`

---

## Checklist de Firma Final

Antes de presentar al Ente, confirmar:

- [ ] Todos los items **BLOCKER** pasaron
- [ ] Todos los items **CRITICAL** pasaron o tienen workaround documentado
- [ ] No hay errores de consola en las páginas públicas
- [ ] No hay errores de consola en el dashboard del admin durante el flujo E2E completo
- [ ] Las imágenes de Cloudinary cargan en todas las páginas relevantes
- [ ] El flujo E2E de publicación (Section 5.1) fue ejecutado completo al menos una vez
- [ ] El flujo E2E de rechazo/reenvío (Section 5.2) fue ejecutado completo
- [ ] Se probó en Chrome Y Safari

---

*Generado a partir del código fuente del repositorio — plataforma-calendario-monorepo.*
*Rutas verificadas contra la estructura de `frontend/src/app/` y los smart containers de `frontend/src/features/`.*
*Workflow de estados verificado contra `ApprovalStateMachine.php`.*
