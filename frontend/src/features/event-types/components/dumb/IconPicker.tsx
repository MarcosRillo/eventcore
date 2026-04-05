'use client';

import { Search, X } from 'lucide-react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';

import {
  EVENT_TYPE_ICON_CATEGORIES,
  EVENT_TYPE_ICONS,
  type EventTypeIconOption,
} from '@/features/event-types/constants/eventTypeIcons';

interface IconPickerProps {
  value: string | null;
  onChange: (icon: string | null) => void;
  accentColor?: string;
  disabled?: boolean;
}

export const IconPicker = memo(function IconPicker({
  value,
  onChange,
  accentColor = 'var(--color-primary-500)',
  disabled = false,
}: IconPickerProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(
    () => (value ? EVENT_TYPE_ICONS.find((i) => i.key === value) ?? null : null),
    [value]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (q) {
      return EVENT_TYPE_ICONS.filter(
        (i) =>
          i.label.toLowerCase().includes(q) ||
          i.key.includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }
    if (activeCategory === 'all') return EVENT_TYPE_ICONS;
    return EVENT_TYPE_ICONS.filter((i) => i.category === activeCategory);
  }, [search, activeCategory]);

  useEffect(() => {
    const idx = value ? filtered.findIndex((i) => i.key === value) : -1;
    setFocusedIndex(idx >= 0 ? idx : 0);
  }, [filtered, value]);

  useEffect(() => {
    const el = gridRef.current?.querySelector(`[data-index="${focusedIndex}"]`) as HTMLElement;
    el?.focus();
  }, [focusedIndex]);

  function handleSelect(option: EventTypeIconOption) {
    if (disabled) return;
    onChange(value === option.key ? null : option.key);
  }

  function handleGridKeyDown(e: React.KeyboardEvent) {
    const len = filtered.length;
    if (!len) return;
    let next = focusedIndex;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        next = (focusedIndex + 1) % len;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        next = (focusedIndex - 1 + len) % len;
        break;
      case 'Home':
        e.preventDefault();
        next = 0;
        break;
      case 'End':
        e.preventDefault();
        next = len - 1;
        break;
      default:
        return;
    }
    setFocusedIndex(next);
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setActiveCategory('all');
  }

  function handleCategoryClick(cat: string) {
    setActiveCategory(cat);
    setSearch('');
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Preview zone */}
      {selectedOption && (
        <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5">
          <selectedOption.icon
            className="h-5 w-5 flex-shrink-0"
            style={{ color: accentColor }}
            aria-hidden="true"
          />
          <span className="flex-1 text-sm text-neutral-700">{selectedOption.label}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={disabled}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Quitar icono seleccionado"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <input
          type="text"
          placeholder="Buscar icono..."
          value={search}
          onChange={handleSearchChange}
          disabled={disabled}
          className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-9 text-sm text-neutral-900 placeholder-neutral-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-neutral-600"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category tabs */}
      {!search && (
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {(['all', ...EVENT_TYPE_ICON_CATEGORIES] as string[]).map((cat) => {
            const label = cat === 'all' ? 'Todos' : cat;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                disabled={disabled}
                className={[
                  'flex-shrink-0 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                ].join(' ')}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Icon grid */}
      <div
        role="radiogroup"
        aria-label="Seleccionar icono"
        ref={gridRef}
        onKeyDown={handleGridKeyDown}
        className="max-h-48 overflow-y-auto sm:max-h-56"
      >
        {filtered.length === 0 ? (
          <p className="py-4 text-center text-sm text-neutral-500">
            No se encontraron iconos{search ? ` para "${search}"` : ''}
          </p>
        ) : (
          <div className="grid grid-cols-6 gap-1 sm:grid-cols-7">
            {filtered.map((option, i) => {
              const isSelected = value === option.key;
              const Icon = option.icon;

              return (
                <button
                  key={option.key}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={option.label}
                  title={option.label}
                  disabled={disabled}
                  data-index={i}
                  tabIndex={i === focusedIndex ? 0 : -1}
                  onClick={() => handleSelect(option)}
                  className={[
                    'flex aspect-square items-center justify-center rounded-lg border border-transparent transition-all motion-reduce:transition-none active:scale-95',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    isSelected ? '' : 'hover:border-neutral-200 hover:bg-neutral-50',
                  ].join(' ')}
                  style={
                    isSelected
                      ? {
                          borderColor: accentColor,
                          boxShadow: `0 0 0 2px ${accentColor}`,
                          backgroundColor: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
                        }
                      : undefined
                  }
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color: isSelected ? accentColor : '#525252' }}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});
