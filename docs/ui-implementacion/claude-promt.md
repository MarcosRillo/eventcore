# PROMPT PARA CLAUDE CODE

Refactorizar sistema de colores del MVP con Paleta Híbrida Profesional (azul institucional + verde Tucumán).

## CONTEXT
- MVP 100% funcional (305 tests passing)
- Implementar paleta WCAG AA compliant
- Prioridad: Modal evento + buttons + inputs (Fase 1)

## INSTRUCTIONS
Leer archivo completo `/home/claude/IMPLEMENTATION-GUIDE.md` y ejecutar:

### FASE 1 (Priority HIGH - Completar HOY):
1. Update `tailwind.config.ts` (usar `/home/claude/tailwind.config.ts`)
2. Refactor Modal Crear Evento (background blanco, labels legibles, inputs claros)
3. Refactor Buttons (5 variants: primary/secondary/success/destructive/ghost)
4. Refactor Form Inputs (consistent styling, focus states)

### FASE 2 (OPCIONAL - Si hay tiempo):
5. Refactor Event Cards
6. Refactor Alerts/Toasts

## VALIDATION REQUIRED
- [ ] 271/271 tests passing
- [ ] 0 TypeScript errors
- [ ] Modal con background blanco (NO oscuro)
- [ ] Contrast ratios ≥4.5:1 (verificar con DevTools)
- [ ] Build exitoso

## COMMIT STRATEGY
Seguir estructura de commits en IMPLEMENTATION-GUIDE.md (6 commits separados por componente).

## CRITICAL
- NO tocar lógica de negocio
- NO cambiar estructura de componentes
- Solo actualizar className values
- Mantener tests passing

## REFERENCES
- `/home/claude/design-tokens.md` - Sistema completo de colores
- `/home/claude/tailwind.config.ts` - Config actualizado
- `/home/claude/IMPLEMENTATION-GUIDE.md` - Instrucciones detalladas

Ejecutar Fase 1 completa (~2 horas). Report status after each task.