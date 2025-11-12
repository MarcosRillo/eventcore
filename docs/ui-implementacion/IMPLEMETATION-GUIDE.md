# 🎨 TASK: Implementar Paleta Híbrida Profesional

## CONTEXT

**Objetivo:** Refactorizar sistema de colores del MVP para mejorar UX/UI con paleta profesional, accesible y contextualmente apropiada para plataforma de eventos turísticos.

**Status Actual:**
- MVP 100% funcional con 305 tests passing
- Paleta actual: Genérica (slate/gray/blue)
- Modal de eventos: Background oscuro (#1e293b) con bajo contraste
- Sin identidad visual contextual (turismo/naturaleza Tucumán)

**Paleta Elegida:** C - "Híbrida Profesional"
- Primary: Azul institucional (#2563eb) - confianza gobierno
- Secondary: Verde Tucumán (#10b981) - identidad "Jardín República"
- Accent: Naranja (#ea580c) - energía, CTAs
- WCAG 2.1 Level AA compliant (algunos AAA)

**Archivos de Referencia:**
- `/docs/design-tokens.md` - Sistema completo de colores
- `tailwind.config.ts` actualizado con nueva paleta

---

## OBJECTIVES

### Prioridad ALTA (Fase 1 - Completar HOY)

1. ✅ **Update Tailwind Config**
   - Reemplazar `tailwind.config.ts` con nueva paleta
   - Verificar compilación sin errores

2. ✅ **Refactor Modal Crear Evento** (CRITICAL)
   - Background: #1e293b → #ffffff
   - Labels: text-gray-400 → text-neutral-600
   - Inputs: border-gray-600 → border-neutral-300, bg-neutral-50
   - Primary button: bg-green-600 → bg-primary-500
   - Secondary button: bg-neutral-50 border-neutral-300
   - Espaciado: aumentar gaps de 3 a 4

3. ✅ **Refactor Buttons (Todos)**
   - Primary: bg-primary-500 hover:bg-primary-600 text-white
   - Secondary: bg-neutral-50 hover:bg-neutral-100 border-neutral-300 text-neutral-700
   - Success: bg-secondary-500 hover:bg-secondary-600 text-white
   - Destructive: bg-red-600 hover:bg-red-700 text-white
   - Ghost: hover:bg-neutral-100 text-neutral-700

4. ✅ **Refactor Form Inputs (Todos)**
   - Background: bg-neutral-50
   - Border: border-neutral-300
   - Focus: focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
   - Text: text-neutral-900
   - Placeholder: placeholder:text-neutral-400
   - Label: text-neutral-600 font-medium

### Prioridad MEDIA (Fase 2 - MAÑANA si hay tiempo)

5. ⏳ **Refactor Cards** (Event cards, stats)
   - Background: bg-white
   - Border: border-neutral-200
   - Shadow: shadow-sm hover:shadow-md
   - Title: text-neutral-900 font-semibold
   - Body: text-neutral-600

6. ⏳ **Refactor Alerts/Toasts**
   - Success: bg-secondary-100 text-secondary-800 border-l-4 border-secondary-500
   - Error: bg-red-100 text-red-800 border-l-4 border-red-600
   - Warning: bg-amber-100 text-amber-800 border-l-4 border-amber-500
   - Info: bg-primary-100 text-primary-800 border-l-4 border-primary-500

### Prioridad BAJA (Post-MVP)

7. 🔮 **Category Color-Coding**
   - Gastronomía: category-gastronomia
   - Cultura: category-cultura
   - Naturaleza: category-naturaleza
   - Deportes: category-deportes
   - Música: category-musica
   - Historia: category-historia

---

## TASKS

### TASK 1: Update Tailwind Config (10 min)

**Ubicación:** `/frontend/tailwind.config.ts`

```bash
# 1. Backup actual config
cp tailwind.config.ts tailwind.config.ts.backup

# 2. Reemplazar con nuevo config
# (usar archivo /home/claude/tailwind.config.ts generado)

# 3. Verificar compilación
npm run build

# Expected: Compiled successfully
```

**Validation:**
- [ ] Build exitoso sin warnings
- [ ] No errores TypeScript relacionados con colores
- [ ] Dev server arranca correctamente

---

### TASK 2: Refactor Modal Crear Evento (30-45 min)

**Ubicación:** `src/features/organizer/components/EventForm/EventForm.tsx`

**Changes Required:**

```typescript
// BEFORE (Actual)
<div className="fixed inset-0 bg-slate-800 bg-opacity-50">
  <div className="bg-slate-900 rounded-lg">
    <h2 className="text-white text-xl">Crear Nuevo Evento</h2>
    
    <label className="text-gray-400 text-sm">Título *</label>
    <input className="bg-slate-800 border-gray-600 text-white" />
    
    <button className="bg-green-600 hover:bg-green-700">
      Crear Evento
    </button>
  </div>
</div>

// AFTER (Nuevo)
<div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm">
  <div className="bg-white rounded-xl shadow-2xl">
    <h2 className="text-neutral-900 text-xl font-semibold">
      Crear Nuevo Evento
    </h2>
    
    <label className="text-neutral-600 text-sm font-medium">
      Título *
    </label>
    <input className="
      bg-neutral-50 
      border-neutral-300 
      text-neutral-900
      placeholder:text-neutral-400
      focus:border-primary-500 
      focus:ring-2 
      focus:ring-primary-500/20
      focus:outline-none
      transition-all
    " />
    
    <button className="
      bg-primary-500 
      hover:bg-primary-600 
      active:bg-primary-700
      text-white 
      font-semibold
      shadow-sm 
      hover:shadow-md
      transition-all
    ">
      Crear Evento
    </button>
    
    <button className="
      bg-neutral-50 
      hover:bg-neutral-100
      border border-neutral-300
      text-neutral-700
      hover:text-neutral-900
      font-medium
      transition-all
    ">
      Cancelar
    </button>
  </div>
</div>
```

**Specific Changes:**
1. Modal backdrop: `bg-slate-800` → `bg-neutral-900/50 backdrop-blur-sm`
2. Modal container: `bg-slate-900` → `bg-white`
3. Modal border-radius: `rounded-lg` → `rounded-xl`
4. Modal shadow: add `shadow-2xl`
5. Title color: `text-white` → `text-neutral-900`
6. Title weight: add `font-semibold`
7. All labels: `text-gray-400` → `text-neutral-600 font-medium`
8. All inputs:
   - Background: → `bg-neutral-50`
   - Border: → `border-neutral-300`
   - Text: → `text-neutral-900`
   - Placeholder: → `placeholder:text-neutral-400`
   - Focus: → `focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20`
9. Primary button: `bg-green-600` → `bg-primary-500 hover:bg-primary-600`
10. Secondary button: create new style `bg-neutral-50 border-neutral-300`
11. Spacing: aumentar `gap-3` → `gap-4` entre fields

**Files to Update:**
- `EventForm.tsx`
- `EventFormModal.tsx` (si existe separado)

**Tests to Run:**
```bash
npm test -- EventForm
npm test -- EventFormModal
```

**Validation:**
- [ ] Modal background blanco (no oscuro)
- [ ] Labels legibles (contraste ≥4.5:1)
- [ ] Inputs con bg claro y border visible
- [ ] Primary button azul
- [ ] Secondary button gris claro con border
- [ ] Focus states visibles (ring azul)
- [ ] Tests passing (13 tests EventForm)

---

### TASK 3: Refactor Button Component (20 min)

**Ubicación:** 
- `src/features/organizer/components/EventActionButtons/EventActionButtons.tsx`
- Cualquier otro componente de botones shared

**Variants to Implement:**

```typescript
// 1. Primary Button
className="
  bg-primary-500 
  hover:bg-primary-600 
  active:bg-primary-700
  text-white 
  font-semibold 
  px-4 py-2 
  rounded 
  shadow-sm 
  hover:shadow-md
  transition-all
  focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
"

// 2. Secondary Button
className="
  bg-neutral-50 
  hover:bg-neutral-100
  active:bg-neutral-200
  border border-neutral-300
  text-neutral-700
  hover:text-neutral-900
  font-medium
  px-4 py-2
  rounded
  transition-all
  focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
"

// 3. Success Button (Aprobar)
className="
  bg-secondary-500
  hover:bg-secondary-600
  active:bg-secondary-700
  text-white
  font-semibold
  px-4 py-2
  rounded
  shadow-sm
  transition-all
  focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2
"

// 4. Destructive Button (Eliminar, Rechazar)
className="
  bg-red-600
  hover:bg-red-700
  active:bg-red-800
  text-white
  font-semibold
  px-4 py-2
  rounded
  shadow-sm
  transition-all
  focus:ring-2 focus:ring-red-500 focus:ring-offset-2
"

// 5. Ghost Button
className="
  hover:bg-neutral-100
  text-neutral-700
  hover:text-neutral-900
  font-medium
  px-4 py-2
  rounded
  transition-all
"
```

**Files to Update:**
- `EventActionButtons.tsx`
- Any shared Button component
- `DeleteConfirmModal.tsx` (botones del modal)

**Tests to Run:**
```bash
npm test -- EventActionButtons
npm test -- Button
```

**Validation:**
- [ ] Primary button azul (#2563eb)
- [ ] Secondary button gris claro con border
- [ ] Success button verde (#10b981)
- [ ] Destructive button rojo
- [ ] Hover states funcionando
- [ ] Focus rings visibles
- [ ] Tests passing

---

### TASK 4: Refactor Form Inputs (20 min)

**Ubicación:** Todos los inputs en:
- `EventForm.tsx`
- `OrganizerEventFilters.tsx`
- Cualquier otro formulario

**Standard Input Pattern:**

```typescript
// Container
<div className="space-y-2">
  {/* Label */}
  <label className="
    block 
    text-sm 
    font-medium 
    text-neutral-600
  ">
    {label} {required && <span className="text-red-600">*</span>}
  </label>
  
  {/* Input */}
  <input
    type="text"
    className="
      w-full
      px-3 py-2
      bg-neutral-50
      border border-neutral-300
      rounded-sm
      text-neutral-900
      text-base
      placeholder:text-neutral-400
      focus:bg-white
      focus:border-primary-500
      focus:ring-2
      focus:ring-primary-500/20
      focus:outline-none
      transition-all
      disabled:opacity-50
      disabled:cursor-not-allowed
    "
    placeholder={placeholder}
  />
  
  {/* Error message (si existe) */}
  {error && (
    <p className="text-sm text-red-600 mt-1">
      {error}
    </p>
  )}
</div>
```

**Specific Changes:**
1. Labels: `text-gray-400` → `text-neutral-600 font-medium`
2. Input background: cualquier oscuro → `bg-neutral-50`
3. Input border: `border-gray-600` → `border-neutral-300`
4. Input text: → `text-neutral-900`
5. Placeholder: → `placeholder:text-neutral-400`
6. Focus border: → `focus:border-primary-500`
7. Focus ring: → `focus:ring-2 focus:ring-primary-500/20`
8. Focus background: → `focus:bg-white` (más claro en focus)
9. Error text: → `text-red-600` (no text-red-500)
10. Required asterisk: → `text-red-600`

**Input Types to Update:**
- [x] Text inputs
- [x] Textareas
- [x] Select dropdowns
- [x] Date inputs
- [x] Number inputs

**Files to Update:**
- `EventForm.tsx` (todos los inputs)
- `OrganizerEventFilters.tsx` (filtros)
- Any shared Input component

**Tests to Run:**
```bash
npm test -- EventForm
npm test -- filters
```

**Validation:**
- [ ] Labels legibles (neutral-600)
- [ ] Inputs con bg claro (neutral-50)
- [ ] Borders visibles (neutral-300)
- [ ] Focus state azul visible
- [ ] Error messages rojos
- [ ] Tests passing

---

### TASK 5: Refactor Event Cards (OPCIONAL - Si hay tiempo)

**Ubicación:** 
- `src/features/organizer/components/OrganizerEventList/EventCard.tsx`
- `src/features/public-calendar/components/EventCard.tsx`

**Changes Required:**

```typescript
// Card Container
<div className="
  bg-white
  border border-neutral-200
  rounded-lg
  p-6
  shadow-sm
  hover:shadow-md
  transition-shadow
  cursor-pointer
">
  {/* Title */}
  <h3 className="
    text-xl 
    font-semibold 
    text-neutral-900 
    mb-2
  ">
    {title}
  </h3>
  
  {/* Description */}
  <p className="
    text-base 
    text-neutral-600 
    mb-4
  ">
    {description}
  </p>
  
  {/* Metadata (date, location, etc) */}
  <div className="
    flex 
    items-center 
    gap-4 
    text-sm 
    text-neutral-500
  ">
    <span className="flex items-center gap-1">
      <IconCalendar className="w-4 h-4" />
      {date}
    </span>
    <span className="flex items-center gap-1">
      <IconMapPin className="w-4 h-4" />
      {location}
    </span>
  </div>
  
  {/* Status Badge */}
  <span className={cn(
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
    status === 'published' && "bg-secondary-100 text-secondary-800",
    status === 'pending' && "bg-amber-100 text-amber-800",
    status === 'draft' && "bg-neutral-100 text-neutral-800",
  )}>
    {statusLabel}
  </span>
</div>
```

**Files to Update:**
- `EventCard.tsx` (organizer)
- `EventCard.tsx` (public-calendar)

**Tests to Run:**
```bash
npm test -- EventCard
```

**Validation:**
- [ ] Cards con bg blanco
- [ ] Border gris claro visible
- [ ] Shadow sutil con hover más pronunciado
- [ ] Title negro semibold
- [ ] Description gris legible
- [ ] Metadata gris más claro
- [ ] Status badges con colores semánticos
- [ ] Tests passing

---

## VALIDATION CHECKLIST

### Pre-Implementation
- [x] Tailwind config actualizado
- [x] Design tokens documentados
- [x] Build exitoso

### Post-Implementation (CRITICAL)
- [ ] **Visual Check:** Modal evento con background blanco
- [ ] **Visual Check:** Labels legibles (no gris claro)
- [ ] **Visual Check:** Inputs con bg claro y border visible
- [ ] **Visual Check:** Primary buttons azules
- [ ] **Visual Check:** Secondary buttons grises con border
- [ ] **Contrast Check:** Text ≥4.5:1 (usar DevTools)
- [ ] **Focus Check:** Focus rings visibles al tabular
- [ ] **Tests:** `npm test` - 271/271 passing
- [ ] **Build:** `npm run build` - exitoso sin warnings
- [ ] **TypeScript:** 0 errors
- [ ] **ESLint:** 0 warnings

### Accessibility (usar Chrome DevTools)
- [ ] Lighthouse Accessibility Score ≥90
- [ ] No WCAG violations en Axe
- [ ] Focus order lógico
- [ ] Color contrast AA en todos los textos

---

## COMMIT STRATEGY

### Commits Separados por Fase:

```bash
# Commit 1: Config
git add tailwind.config.ts
git commit -m "refactor(design): update tailwind config with hybrid professional palette

- Add primary colors (blue institutional)
- Add secondary colors (green Tucumán)  
- Add accent colors (orange energy)
- Add semantic & role colors
- WCAG 2.1 Level AA compliant
- Refs: design-tokens.md"

# Commit 2: Modal
git add src/features/organizer/components/EventForm/
git commit -m "refactor(ui): redesign event form modal with new color palette

- Change background from dark to white
- Update labels from gray-400 to neutral-600
- Update inputs with neutral-50 bg and neutral-300 borders
- Replace green buttons with primary-500 blue
- Add secondary button variant
- Improve spacing and focus states
- Tests: 13 passing
- WCAG AA compliant"

# Commit 3: Buttons
git add src/features/organizer/components/EventActionButtons/
git commit -m "refactor(ui): update button variants with new color system

- Primary: blue (#2563eb)
- Secondary: gray with border
- Success: green (#10b981)
- Destructive: red
- Add focus rings and hover states
- Tests: passing"

# Commit 4: Inputs
git add src/features/organizer/components/EventForm/
git add src/features/organizer/components/OrganizerEventList/filters
git commit -m "refactor(ui): standardize form inputs with accessibility improvements

- Consistent bg-neutral-50 and border-neutral-300
- Clear focus states with blue ring
- Improved label visibility
- Error states in red-600
- WCAG AA contrast ratios
- Tests: passing"

# Commit 5: Cards (opcional)
git add src/features/*/components/*Card*
git commit -m "refactor(ui): update event cards with new design system

- White bg with subtle border
- Improved shadow on hover
- Semantic colors for status badges
- Better typography hierarchy
- Tests: passing"

# Commit 6: Final
git add docs/design-tokens.md
git commit -m "docs(design): add comprehensive design system documentation

- Complete color palette with contrast ratios
- Typography scale and spacing system
- Component patterns and examples
- Accessibility guidelines
- WCAG 2.1 compliance documentation"
```

---

## ROLLBACK PLAN

Si algo falla:

```bash
# Opción 1: Revert last commit
git revert HEAD

# Opción 2: Reset to backup
cp tailwind.config.ts.backup tailwind.config.ts
npm run build

# Opción 3: Stash changes
git stash
npm run build
# Revisar qué falló, arreglar, git stash pop
```

---

## ESTIMATED TIME

- Task 1 (Tailwind): **10 min**
- Task 2 (Modal): **45 min**
- Task 3 (Buttons): **20 min**
- Task 4 (Inputs): **20 min**
- Task 5 (Cards): **30 min** (opcional)
- Testing & validation: **30 min**

**Total Fase 1 (Priority HIGH):** ~2 horas  
**Total Fase 2 (con cards):** ~2.5 horas

---

## SUCCESS CRITERIA

✅ MVP mantiene 100% funcionalidad  
✅ 271/271 tests passing  
✅ 0 TypeScript errors  
✅ 0 ESLint warnings  
✅ WCAG AA compliance (contrast ≥4.5:1)  
✅ Modal evento con background blanco profesional  
✅ Paleta consistente en toda la app  
✅ Focus states accesibles  
✅ Build exitoso  

---

## NOTES

- **NO tocar lógica de negocio** - solo estilos
- **NO cambiar estructura de componentes** - solo className
- **NO refactorizar tests** - deben seguir pasando
- Si un componente tiene tests fallando por colores → actualizar snapshot
- Priorizar accesibilidad sobre "belleza"
- Usar tokens de Tailwind, NO hex values hardcoded

---

**Ready to implement?** 🚀  
Pasar este archivo + prompt corto a Claude Code.