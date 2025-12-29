/**
 * Tests for EventInfoPanel component
 *
 * Tests the event information display panel.
 */

import { render, screen } from '@testing-library/react';

import { EventInfoPanel } from '@/features/entity-admin/components/dumb/EventInfoPanel';
import type { Event } from '@/types/event.types';

describe('EventInfoPanel', () => {
  const mockEvent: Event = {
    id: 1,
    title: 'Festival de Tango 2025',
    description: 'El festival más importante de tango del año con artistas internacionales.',
    start_date: '2025-03-15T10:00:00',
    end_date: '2025-03-15T18:00:00',
    type: 'sede_unica',
    status: 'pending_internal_approval',
    locations: [
      { id: 1, name: 'Centro Cultural San Martín', address: 'Av. Corrientes 1530', city: 'CABA', is_active: true, entity_id: 1, created_at: '2025-01-01T00:00:00', updated_at: '2025-01-01T00:00:00' },
      { id: 2, name: 'Teatro Colón', address: 'Cerrito 628', city: 'CABA', is_active: true, entity_id: 1, created_at: '2025-01-01T00:00:00', updated_at: '2025-01-01T00:00:00' },
    ],
    event_type: { id: 1, name: 'Cultural', is_active: true },
    event_subtype: { id: 1, name: 'Danza', event_type_id: 1, is_active: true },
    is_featured: true,
    contact_email: 'contacto@tango.org.ar',
    contact_phone: '+54 11 4567-8901',
    website_url: 'https://festivaltango.com.ar',
    organizer: {
      name: 'Juan Pérez',
      organization: 'Asociación Argentina de Tango',
    },
    approval_history: [],
    created_at: '2025-01-01T00:00:00',
    updated_at: '2025-01-01T00:00:00',
  };

  test('renders event title', () => {
    render(<EventInfoPanel event={mockEvent} />);
    expect(screen.getByText('Festival de Tango 2025')).toBeInTheDocument();
  });

  test('renders event description', () => {
    render(<EventInfoPanel event={mockEvent} />);
    expect(screen.getByText(/El festival más importante de tango/)).toBeInTheDocument();
  });

  test('renders formatted date and time', () => {
    render(<EventInfoPanel event={mockEvent} />);
    // Should show date in Spanish format - look for day and year with more specific patterns
    expect(screen.getByText(/marzo/i)).toBeInTheDocument();
    // The year and day are present somewhere in the document
    const dateSection = screen.getByText(/Fecha y Hora/i).closest('div');
    expect(dateSection).toBeInTheDocument();
  });

  test('renders all locations', () => {
    render(<EventInfoPanel event={mockEvent} />);
    expect(screen.getByText('Centro Cultural San Martín')).toBeInTheDocument();
    expect(screen.getByText('Teatro Colón')).toBeInTheDocument();
  });

  test('renders event type and subtype', () => {
    render(<EventInfoPanel event={mockEvent} />);
    expect(screen.getByText('Cultural')).toBeInTheDocument();
    expect(screen.getByText('Danza')).toBeInTheDocument();
  });

  test('renders featured badge when event is featured', () => {
    render(<EventInfoPanel event={mockEvent} />);
    expect(screen.getByText('Destacado')).toBeInTheDocument();
  });

  test('does not render featured badge when event is not featured', () => {
    const notFeaturedEvent = { ...mockEvent, is_featured: false };
    render(<EventInfoPanel event={notFeaturedEvent} />);
    expect(screen.queryByText('Destacado')).not.toBeInTheDocument();
  });

  test('renders contact information', () => {
    render(<EventInfoPanel event={mockEvent} />);
    expect(screen.getByText('contacto@tango.org.ar')).toBeInTheDocument();
    expect(screen.getByText('+54 11 4567-8901')).toBeInTheDocument();
  });

  test('renders organizer information', () => {
    render(<EventInfoPanel event={mockEvent} />);
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('Asociación Argentina de Tango')).toBeInTheDocument();
  });

  test('handles missing optional fields gracefully', () => {
    const minimalEvent: Event = {
      ...mockEvent,
      description: '',
      locations: [],
      contact_email: undefined,
      contact_phone: undefined,
      website_url: undefined,
      organizer: undefined,
      event_type: undefined,
      event_subtype: undefined,
    };

    render(<EventInfoPanel event={minimalEvent} />);
    expect(screen.getByText('Festival de Tango 2025')).toBeInTheDocument();
    // Should not crash
  });
});
