# Modal System Audit

Auditoría completa del sistema de modales. Todos los issues han sido resueltos.

## Issues Resueltos

### Critico

| ID | Archivo | Problema | Impacto | Estado |
|----|---------|----------|---------|--------|
| C1 | `FormModal.tsx:296` | Early return `if (!isOpen) return null` destruye componente antes de animar cierre | Modal desaparece sin animacion de salida | Resuelto |
| C2 | `EventDetailModal.tsx:452-458` | Boton cerrar (X) sin `aria-label` | Lectores de pantalla anuncian "button" sin contexto | Resuelto |
| C3 | `EventDetailModal.tsx:388-550` | Duplica Transition/Dialog/backdrop en vez de usar Modal base | Inconsistencia en backdrop, animaciones, sombras y close button | Resuelto |

### Alto

| ID | Archivo | Problema | Impacto | Estado |
|----|---------|----------|---------|--------|
| A1 | `FormModal.tsx:321` | Footer no responsive (`flex justify-end space-x-3`) | Botones comprimidos en mobile | Resuelto |
| A2 | `EventDetailModal.tsx` | Usa `gray-*` hardcodeado en vez de `neutral-*` design tokens | Inconsistente con el resto del design system | Resuelto |
| A3 | `FormModal.tsx:330-336` | Submit button es `type="button"` con `onClick` manual | Enter en inputs no envia el formulario | Resuelto |
| A4 | `ConfirmDialog.tsx:52-89` | 4 SVGs inline para iconos de variantes | Inconsistente con lucide-react usado en toda la app | Resuelto |

### Medio

| ID | Archivo | Problema | Impacto | Estado |
|----|---------|----------|---------|--------|
| M1 | `FormModal.tsx:93-108` | `ErrorAlert` usa `red-*` hardcodeado en vez de `error-*` tokens | Inconsistente con ConfirmDialog que usa `error-50/500` | Resuelto |
| M2 | `FormModal.tsx:93-108` | `ErrorAlert` usa SVG inline para icono de error | Inconsistente con lucide-react | Resuelto |
| M3 | `EventDetailModal.tsx:62-105` | `ShareButtons` usa `space-x-3` en vez de `gap-3` | Inconsistente con patron `gap-*` del resto de modales | Resuelto |
| M4 | `EventDetailModal.tsx:299-382` | Action buttons usan colores hardcodeados (`bg-blue-600`, `bg-green-600`, etc.) | No siguen design tokens del sistema | Resuelto |
| M5 | `PromptDialog.tsx` | No tiene tests | Sin cobertura de tests | Resuelto |
| M6 | `FormModal.tsx` | No tiene tests | Sin cobertura de tests | Resuelto |
| M7 | `EventDetailModal.tsx` | No tiene tests | Sin cobertura de tests | Resuelto |
| M8 | `Modal.tsx` | No tiene tests | Sin cobertura de tests (componente base) | Resuelto |

### Bajo

| ID | Archivo | Problema | Impacto | Estado |
|----|---------|----------|---------|--------|
| B1 | `ConfirmDialog.tsx`, `PromptDialog.tsx` | Listener manual de ESC duplica funcionalidad de HeadlessUI Dialog | Codigo redundante, posible doble-fire | Resuelto |
| B2 | `FormModal.tsx:127` | JSDoc comment autogenerado con `@param root0.isOpen` etc. | Ruido visual sin valor real | Resuelto |
| B3 | `EventDetailModal.tsx` | Star, badge y virtual link usan colores hardcodeados | Deberia usar tokens semanticos (`warning-*`, `neutral-*`, `primary-*`) | Resuelto |
| B4 | `EventDetailModal.tsx:74` | `ShareButtons` abre ventanas con tamano fijo `600x400` sin `noopener` | No responsive; falta seguridad en window.open | Resuelto |
| B5 | `index.ts` | Barrel export file — revisar que exporta todos los modales actuales | Posible export faltante | Resuelto |
| B6 | `Modal.tsx:38-46` | `sizeClasses` es `Record<string, string>` en vez de tipado estricto | Permite keys invalidos en runtime | Resuelto |
| B7 | `PromptDialog.tsx` | Usa `red-*` hardcodeado, SVG inline, header comment desactualizado | Inconsistente con design system y lucide-react | Resuelto |

## Excepciones Documentadas

### Brand Colors en ShareButtons

Los botones de compartir en `EventDetailModal.tsx` (`ShareButtons` component) usan colores de marca externos que **no** deben migrar a tokens semanticos:

- **Facebook:** `text-blue-600 border-blue-600 hover:bg-blue-50`
- **Twitter:** `text-sky-600 border-sky-600 hover:bg-sky-50`
- **WhatsApp:** `text-green-600 border-green-600 hover:bg-green-50`

Estos son colores oficiales de cada plataforma y cambiarlos romperia el reconocimiento visual de la marca.
