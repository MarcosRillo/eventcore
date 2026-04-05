/**
 * Event Type Icons
 * Curated set of Lucide icons grouped by category for event type selection
 */

import type { LucideIcon } from 'lucide-react';
import {
  Baby,
  BookOpen,
  Calendar,
  Camera,
  Church,
  Clapperboard,
  Dumbbell,
  Flame,
  GraduationCap,
  Heart,
  Landmark,
  MapPin,
  Mic2,
  Mountain,
  Music,
  Palette,
  PartyPopper,
  Presentation,
  ShoppingBag,
  Star,
  Store,
  Theater,
  TreePine,
  Trophy,
  Users,
  UtensilsCrossed,
  Wine,
} from 'lucide-react';

export interface EventTypeIconOption {
  key: string;
  icon: LucideIcon;
  label: string;
  category: string;
}

export const EVENT_TYPE_ICON_CATEGORIES = [
  'Entretenimiento',
  'Cultura',
  'Deportes',
  'Gastronomía',
  'Turismo',
  'Educación',
  'Comercio',
  'General',
] as const;

export type EventTypeIconCategory = (typeof EVENT_TYPE_ICON_CATEGORIES)[number];

export const EVENT_TYPE_ICONS: EventTypeIconOption[] = [
  // Entretenimiento
  { key: 'music', icon: Music, label: 'Música', category: 'Entretenimiento' },
  { key: 'party-popper', icon: PartyPopper, label: 'Fiesta', category: 'Entretenimiento' },
  { key: 'mic-2', icon: Mic2, label: 'Micrófono', category: 'Entretenimiento' },
  { key: 'clapperboard', icon: Clapperboard, label: 'Cine', category: 'Entretenimiento' },
  // Cultura
  { key: 'palette', icon: Palette, label: 'Arte', category: 'Cultura' },
  { key: 'theater', icon: Theater, label: 'Teatro', category: 'Cultura' },
  { key: 'landmark', icon: Landmark, label: 'Monumento', category: 'Cultura' },
  { key: 'church', icon: Church, label: 'Iglesia', category: 'Cultura' },
  { key: 'camera', icon: Camera, label: 'Fotografía', category: 'Cultura' },
  { key: 'book-open', icon: BookOpen, label: 'Lectura', category: 'Cultura' },
  // Deportes
  { key: 'trophy', icon: Trophy, label: 'Trofeo', category: 'Deportes' },
  { key: 'dumbbell', icon: Dumbbell, label: 'Gimnasio', category: 'Deportes' },
  { key: 'flame', icon: Flame, label: 'Fuego', category: 'Deportes' },
  // Gastronomía
  { key: 'utensils-crossed', icon: UtensilsCrossed, label: 'Gastronomía', category: 'Gastronomía' },
  { key: 'wine', icon: Wine, label: 'Vino', category: 'Gastronomía' },
  // Turismo
  { key: 'map-pin', icon: MapPin, label: 'Ubicación', category: 'Turismo' },
  { key: 'mountain', icon: Mountain, label: 'Montaña', category: 'Turismo' },
  { key: 'tree-pine', icon: TreePine, label: 'Naturaleza', category: 'Turismo' },
  // Educación
  { key: 'presentation', icon: Presentation, label: 'Presentación', category: 'Educación' },
  { key: 'graduation-cap', icon: GraduationCap, label: 'Graduación', category: 'Educación' },
  // Comercio
  { key: 'store', icon: Store, label: 'Tienda', category: 'Comercio' },
  { key: 'shopping-bag', icon: ShoppingBag, label: 'Compras', category: 'Comercio' },
  // General
  { key: 'calendar', icon: Calendar, label: 'Calendario', category: 'General' },
  { key: 'star', icon: Star, label: 'Estrella', category: 'General' },
  { key: 'heart', icon: Heart, label: 'Corazón', category: 'General' },
  { key: 'users', icon: Users, label: 'Personas', category: 'General' },
  { key: 'baby', icon: Baby, label: 'Infantil', category: 'General' },
];

export const EVENT_TYPE_ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  EVENT_TYPE_ICONS.map((i) => [i.key, i.icon])
);

export const DEFAULT_EVENT_TYPE_ICON = Calendar;
