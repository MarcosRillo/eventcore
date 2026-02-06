# Modal System Audit

Auditoría completa del sistema de modales. Issues Crítico, Alto y Medio fueron resueltos. Issues Bajo quedan como backlog.

## Issues Resueltos

### Crítico

| ID | Archivo | Problema | Impacto | Estado |
|----|---------|----------|---------|--------|
| C1 | `FormModal.tsx:296` | Early return `if (!isOpen) return null` destruye componente antes de animar cierre | Modal desaparece sin animación de salida | Resuelto |
| C2 | `EventDetailModal.tsx:452-458` | Botón cerrar (X) sin `aria-label` | Lectores de pantalla anuncian "button" sin contexto | Resuelto |
| C3 | `EventDetailModal.tsx:388-550` | Duplica Transition/Dialog/backdrop en vez de usar Modal base | Inconsistencia en backdrop, animaciones, sombras y close button | Resuelto |

### Alto

| ID | Archivo | Problema | Impacto | Estado |
|----|---------|----------|---------|--------|
| A1 | `FormModal.tsx:321` | Footer no responsive (`flex justify-end space-x-3`) | Botones comprimidos en mobile | Resuelto |
| A2 | `EventDetailModal.tsx` | Usa `gray-*` hardcodeado en vez de `neutral-*` design tokens | Inconsistente con el resto del design system | Resuelto |
| A3 | `FormModal.tsx:330-336` | Submit button es `type="button"` con `onClick` manual | Enter en inputs no envía el formulario | Resuelto |
| A4 | `ConfirmDialog.tsx:52-89` | 4 SVGs inline para iconos de variantes | Inconsistente con lucide-react usado en toda la app | Resuelto |

### Medio

| ID | Archivo | Problema | Impacto | Estado |
|----|---------|----------|---------|--------|
| M1 | `FormModal.tsx:93-108` | `ErrorAlert` usa `red-*` hardcodeado en vez de `error-*` tokens | Inconsistente con ConfirmDialog que usa `error-50/500` | Resuelto |
| M2 | `FormModal.tsx:93-108` | `ErrorAlert` usa SVG inline para icono de error | Inconsistente con lucide-react | Resuelto |
| M3 | `EventDetailModal.tsx:62-105` | `ShareButtons` usa `space-x-3` en vez de `gap-3` | Inconsistente con patrón `gap-*` del resto de modales | Resuelto |
| M4 | `EventDetailModal.tsx:299-382` | Action buttons usan colores hardcodeados (`bg-blue-600`, `bg-green-600`, etc.) | No siguen design tokens del sistema | Resuelto |
| M5 | `PromptDialog.tsx` | No tiene tests | Sin cobertura de tests | Resuelto |
| M6 | `FormModal.tsx` | No tiene tests | Sin cobertura de tests | Resuelto |
| M7 | `EventDetailModal.tsx` | No tiene tests | Sin cobertura de tests | Resuelto |
| M8 | `Modal.tsx` | No tiene tests | Sin cobertura de tests (componente base) | Resuelto |

## Issues Pendientes (Backlog)

### Bajo

| ID | Archivo | Problema | Impacto |
|----|---------|----------|---------|
| B1 | `ConfirmDialog.tsx:36-50` | Listener manual de ESC duplica funcionalidad de HeadlessUI Dialog | Código redundante, posible doble-fire |
| B2 | `FormModal.tsx:127` | JSDoc comment autogenerado con `@param root0.isOpen` etc. | Ruido visual sin valor real |
| B3 | `EventDetailModal.tsx:431` | Badge de status usa `bg-blue-100 text-blue-800` hardcodeado | Debería usar tokens semánticos de status |
| B4 | `EventDetailModal.tsx:62-105` | `ShareButtons` abre ventanas con tamaño fijo `600x400` | No responsive; podría usar `navigator.share` API |
| B5 | `index.ts` | Barrel export file — revisar que exporta todos los modales actuales | Posible export faltante |
| B6 | `Modal.tsx:38-46` | `sizeClasses` es `Record<string, string>` en vez de tipado estricto | Permite keys inválidos en runtime |
