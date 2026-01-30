/**
 * InternalShareButtons Component Tests
 *
 * Tests for social media share buttons with browser API mocking.
 * Updated to test useToast instead of alert (Dec 10, 2025).
 */

import { fireEvent,render, screen } from '@testing-library/react';

import { InternalShareButtons } from '@/features/internal-calendar/components/dumb/InternalShareButtons';
import { useToast } from '@/shared/context';

// Mock useToast
jest.mock('@/shared/context', () => ({
  useToast: jest.fn(),
}));

describe('InternalShareButtons', () => {
  const mockEventId = 123;
  const mockEventTitle = 'Test Event';

  // Mock browser APIs
  const mockWindowOpen = jest.fn();
  const mockClipboardWriteText = jest.fn(() => Promise.resolve());
  const mockAddToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock window.open
    global.window.open = mockWindowOpen;

    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: mockClipboardWriteText,
      },
    });

    // Mock useToast hook
    (useToast as jest.Mock).mockReturnValue({
      addToast: mockAddToast,
    });
  });

  test('renders all 4 share buttons', () => {
    render(
      <InternalShareButtons eventId={mockEventId} eventTitle={mockEventTitle} />
    );

    // Verify all 4 buttons are rendered with correct labels
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    expect(screen.getByText('Copiar enlace')).toBeInTheDocument();

    // Verify all 4 buttons have aria-labels
    expect(screen.getByLabelText('Compartir en Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('Compartir en Twitter')).toBeInTheDocument();
    expect(screen.getByLabelText('Compartir en WhatsApp')).toBeInTheDocument();
    expect(screen.getByLabelText('Copiar enlace')).toBeInTheDocument();
  });

  test('Facebook button opens share window with correct URL', () => {
    render(
      <InternalShareButtons eventId={mockEventId} eventTitle={mockEventTitle} />
    );

    const facebookButton = screen.getByLabelText('Compartir en Facebook');

    // Click Facebook button
    fireEvent.click(facebookButton);

    // Should call window.open with Facebook share URL
    expect(mockWindowOpen).toHaveBeenCalledTimes(1);

    // Check that it was called with Facebook share URL containing the event path (URL-encoded)
    const callArgs = mockWindowOpen.mock.calls[0];
    expect(callArgs[0]).toContain('https://www.facebook.com/sharer/sharer.php?u=');
    expect(callArgs[0]).toContain(`internal-calendar%2F${mockEventId}`);
    expect(callArgs[1]).toBe('_blank');
    expect(callArgs[2]).toBe('width=600,height=400');
  });

  test('Twitter button opens share window with correct URL', () => {
    render(
      <InternalShareButtons eventId={mockEventId} eventTitle={mockEventTitle} />
    );

    const twitterButton = screen.getByLabelText('Compartir en Twitter');

    // Click Twitter button
    fireEvent.click(twitterButton);

    // Should call window.open with Twitter share URL
    expect(mockWindowOpen).toHaveBeenCalledTimes(1);

    // Check that it was called with Twitter share URL containing the event path and title (URL-encoded)
    const callArgs = mockWindowOpen.mock.calls[0];
    expect(callArgs[0]).toContain('https://twitter.com/intent/tweet?url=');
    expect(callArgs[0]).toContain(`internal-calendar%2F${mockEventId}`);
    expect(callArgs[0]).toContain(`text=${encodeURIComponent(mockEventTitle)}`);
    expect(callArgs[1]).toBe('_blank');
    expect(callArgs[2]).toBe('width=600,height=400');
  });

  test('WhatsApp button opens share window with correct URL', () => {
    render(
      <InternalShareButtons eventId={mockEventId} eventTitle={mockEventTitle} />
    );

    const whatsappButton = screen.getByLabelText('Compartir en WhatsApp');

    // Click WhatsApp button
    fireEvent.click(whatsappButton);

    // Should call window.open with WhatsApp share URL
    expect(mockWindowOpen).toHaveBeenCalledTimes(1);

    // Check that it was called with WhatsApp share URL containing the event path and title (URL-encoded)
    const callArgs = mockWindowOpen.mock.calls[0];
    expect(callArgs[0]).toContain('https://wa.me/?text=');
    expect(callArgs[0]).toContain(encodeURIComponent(mockEventTitle));
    expect(callArgs[0]).toContain(`internal-calendar%2F${mockEventId}`);
    expect(callArgs[1]).toBe('_blank');
  });

  test('Copy link button copies URL to clipboard', async () => {
    render(
      <InternalShareButtons eventId={mockEventId} eventTitle={mockEventTitle} />
    );

    const copyButton = screen.getByLabelText('Copiar enlace');

    // Click Copy Link button
    fireEvent.click(copyButton);

    // Should call navigator.clipboard.writeText with event URL containing correct path
    expect(mockClipboardWriteText).toHaveBeenCalledTimes(1);

    // Check that the URL contains the correct event path
    const copiedUrl = mockClipboardWriteText.mock.calls[0][0];
    expect(copiedUrl).toContain(`/internal-calendar/${mockEventId}`);
  });

  test('Copy link shows toast notification on success', async () => {
    render(
      <InternalShareButtons eventId={mockEventId} eventTitle={mockEventTitle} />
    );

    const copyButton = screen.getByLabelText('Copiar enlace');

    // Click Copy Link button
    fireEvent.click(copyButton);

    // Wait for promise to resolve
    await Promise.resolve();

    // Should show success toast
    expect(mockAddToast).toHaveBeenCalledTimes(1);
    expect(mockAddToast).toHaveBeenCalledWith({
      message: 'Enlace copiado al portapapeles',
      type: 'success',
    });
  });
});
