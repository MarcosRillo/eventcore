/**
 * Tests for EventDetailBody Component
 *
 * Tests the shared event detail body rendering: image, title, dates,
 * locations, contact, description modes, slot props, and links.
 */

import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import React from 'react';

import { EventDetailBody } from '@/shared/components/event/EventDetailBody';
import type { EventDetailData } from '@/shared/components/event/EventDetailBody.types';

type NextImageProps = ComponentProps<typeof import('next/image').default>;

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    priority: _priority,
    fill: _fill,
    placeholder: _placeholder,
    blurDataURL: _blurDataURL,
    ...props
  }: Partial<NextImageProps>) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

describe('EventDetailBody', () => {
  const fullEvent: EventDetailData = {
    id: 1,
    title: 'Festival de Música Tucumán',
    description: '<p>Gran festival con artistas nacionales</p>',
    start_date: '2025-11-15T18:00:00.000Z',
    end_date: '2025-11-17T23:00:00.000Z',
    featured_image: 'https://example.com/festival.jpg',
    is_featured: true,
    locations: [
      { id: 1, name: 'Parque 9 de Julio', address: 'Av. Aconquija s/n', city: 'San Miguel de Tucumán' },
    ],
    contact_email: 'info@festival.com',
    contact_phone: '+54 381 4300000',
    website_url: 'https://festival.com',
    cta_text: 'Comprar Entradas',
    cta_link: 'https://festival.com/tickets',
    event_type: { id: 1, name: 'Cultural', color: '#FF5733' },
    event_subtype: { id: 1, name: 'Música' },
    organizer: { name: 'Juan Pérez', organization: 'Fundación Tucumán' },
  };

  describe('Image rendering', () => {
    test('renders featured image when provided', () => {
      render(<EventDetailBody event={fullEvent} />);

      const image = screen.getByAltText('Festival de Música Tucumán');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/festival.jpg');
    });

    test('renders placeholder when no image provided', () => {
      const noImageEvent = { ...fullEvent, featured_image: undefined };
      const { container } = render(<EventDetailBody event={noImageEvent} />);

      expect(container.querySelectorAll('img').length).toBe(0);
    });
  });

  describe('Title', () => {
    test('renders event title as h1', () => {
      render(<EventDetailBody event={fullEvent} />);

      const heading = screen.getByRole('heading', { level: 1, name: /Festival de Música Tucumán/i });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Date formatting', () => {
    test('renders date and time section', () => {
      render(<EventDetailBody event={fullEvent} />);

      expect(screen.getByText(/Fecha y hora/i)).toBeInTheDocument();
    });

    test('formats multi-day events correctly', () => {
      render(<EventDetailBody event={fullEvent} />);

      const content = document.body.textContent || '';
      // Should contain Spanish date formatting
      expect(content).toContain('noviembre');
    });

    test('formats same-day events correctly', () => {
      const sameDayEvent = {
        ...fullEvent,
        start_date: '2025-11-15T18:00:00.000Z',
        end_date: '2025-11-15T23:00:00.000Z',
      };
      render(<EventDetailBody event={sameDayEvent} />);

      const content = document.body.textContent || '';
      // Should show "de X a Y" for same-day
      expect(content).toMatch(/de \d{2}:\d{2} a \d{2}:\d{2}/);
    });
  });

  describe('Locations', () => {
    test('renders location name', () => {
      render(<EventDetailBody event={fullEvent} />);

      expect(screen.getByText(/Parque 9 de Julio/i)).toBeInTheDocument();
    });

    test('renders location address', () => {
      render(<EventDetailBody event={fullEvent} />);

      expect(screen.getByText(/Av\. Aconquija/i)).toBeInTheDocument();
    });

    test('renders virtual link when provided', () => {
      const virtualEvent = {
        ...fullEvent,
        locations: [],
        virtual_link: 'https://zoom.us/meeting',
      };
      render(<EventDetailBody event={virtualEvent} />);

      const link = screen.getByRole('link', { name: /unirse al evento virtual/i });
      expect(link).toHaveAttribute('href', 'https://zoom.us/meeting');
    });

    test('shows fallback when no location provided', () => {
      const noLocEvent = { ...fullEvent, locations: [], location_text: undefined };
      render(<EventDetailBody event={noLocEvent} />);

      expect(screen.getByText(/Ubicación no especificada/i)).toBeInTheDocument();
    });

    test('renders location_text when no locations array', () => {
      const textLocEvent = { ...fullEvent, locations: [], location_text: 'Centro de la ciudad' };
      render(<EventDetailBody event={textLocEvent} />);

      expect(screen.getByText('Centro de la ciudad')).toBeInTheDocument();
    });
  });

  describe('Contact information', () => {
    test('renders contact email', () => {
      render(<EventDetailBody event={fullEvent} />);

      const emailLink = screen.getByRole('link', { name: /info@festival\.com/i });
      expect(emailLink).toHaveAttribute('href', 'mailto:info@festival.com');
    });

    test('renders contact phone', () => {
      render(<EventDetailBody event={fullEvent} />);

      const phoneLink = screen.getByRole('link', { name: /\+54 381 4300000/i });
      expect(phoneLink).toHaveAttribute('href', 'tel:+54 381 4300000');
    });

    test('hides contact section when no contact info', () => {
      const noContactEvent = { ...fullEvent, contact_email: undefined, contact_phone: undefined };
      render(<EventDetailBody event={noContactEvent} />);

      expect(screen.queryByText(/Información de contacto/i)).not.toBeInTheDocument();
    });
  });

  describe('Description modes', () => {
    test('renders sanitized HTML in html mode (default)', () => {
      render(<EventDetailBody event={fullEvent} descriptionMode="html" />);

      const desc = screen.getByText(/Gran festival con artistas/i);
      expect(desc.closest('.prose')).toBeInTheDocument();
    });

    test('renders plain text in text mode', () => {
      const plainEvent = { ...fullEvent, description: 'Plain text description' };
      render(<EventDetailBody event={plainEvent} descriptionMode="text" />);

      const desc = screen.getByText('Plain text description');
      expect(desc.className).toContain('whitespace-pre-wrap');
    });

    test('hides description section when empty', () => {
      const noDescEvent = { ...fullEvent, description: undefined };
      render(<EventDetailBody event={noDescEvent} />);

      expect(screen.queryByText(/Descripción/i)).not.toBeInTheDocument();
    });
  });

  describe('Slot props', () => {
    test('renders headerActions slot', () => {
      render(
        <EventDetailBody
          event={fullEvent}
          headerActions={<span data-testid="header-action">Featured</span>}
        />
      );

      expect(screen.getByTestId('header-action')).toBeInTheDocument();
    });

    test('renders footerActions slot', () => {
      render(
        <EventDetailBody
          event={fullEvent}
          footerActions={<div data-testid="footer-action">Share</div>}
        />
      );

      expect(screen.getByTestId('footer-action')).toBeInTheDocument();
    });

    test('does not render footer border when no footerActions', () => {
      const { container } = render(<EventDetailBody event={fullEvent} />);

      // The border-t divider should not exist when there are no footer actions
      const headerCard = container.querySelector('.bg-white.rounded-lg.shadow-sm');
      expect(headerCard?.querySelector('.border-t')).not.toBeInTheDocument();
    });
  });

  describe('Links and CTA', () => {
    test('renders website link', () => {
      render(<EventDetailBody event={fullEvent} />);

      const link = screen.getByRole('link', { name: /sitio web oficial/i });
      expect(link).toHaveAttribute('href', 'https://festival.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('renders CTA button', () => {
      render(<EventDetailBody event={fullEvent} />);

      const cta = screen.getByRole('link', { name: /comprar entradas/i });
      expect(cta).toHaveAttribute('href', 'https://festival.com/tickets');
    });

    test('hides links section when no links provided', () => {
      const noLinksEvent = { ...fullEvent, website_url: undefined, cta_text: undefined, cta_link: undefined };
      render(<EventDetailBody event={noLinksEvent} />);

      expect(screen.queryByText(/Enlaces relacionados/i)).not.toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    test('handles minimal event data', () => {
      const minimalEvent: EventDetailData = {
        id: 1,
        title: 'Minimal Event',
        start_date: '2025-11-15T18:00:00.000Z',
      };

      render(<EventDetailBody event={minimalEvent} />);

      expect(screen.getByText('Minimal Event')).toBeInTheDocument();
      expect(screen.getByText(/Ubicación no especificada/i)).toBeInTheDocument();
    });

    test('applies custom className', () => {
      const { container } = render(
        <EventDetailBody event={fullEvent} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
