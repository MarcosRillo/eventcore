import { useSanitizedHTML } from '@/features/public-calendar/hooks/useSanitizedHTML';

/**
 * useSanitizedHTML Hook Tests (CAPA 3 - Frontend Sanitization)
 *
 * These tests verify the third and final layer of our triple-layer XSS defense.
 * Tests that DOMPurify correctly sanitizes HTML on the client-side.
 *
 * Created: Dec 18, 2025 (Sprint 3 - Security Audit)
 */
describe('useSanitizedHTML', () => {
  /**
   * Test that malicious script tags are removed
   */
  it('removes malicious script tags', () => {
    const dirtyHTML = 'Hello <script>alert("XSS")</script> World';
    const clean = useSanitizedHTML(dirtyHTML);

    expect(clean).not.toContain('<script>');
    expect(clean).not.toContain('alert');
    expect(clean).toContain('Hello');
    expect(clean).toContain('World');
  });

  /**
   * Test that event handlers are removed from allowed tags
   */
  it('removes event handlers from allowed tags', () => {
    const dirtyHTML = '<p onclick="alert(1)">Click</p><a href="javascript:void(0)">Link</a>';
    const clean = useSanitizedHTML(dirtyHTML);

    expect(clean).not.toContain('onclick');
    expect(clean).not.toContain('javascript:');
    expect(clean).toContain('<p>Click</p>');
  });

  /**
   * Test that allowed HTML tags are preserved
   */
  it('preserves allowed HTML tags', () => {
    const safeHTML = '<p><strong>Bold</strong> and <em>italic</em></p>';
    const clean = useSanitizedHTML(safeHTML);

    expect(clean).toContain('<p>');
    expect(clean).toContain('<strong>Bold</strong>');
    expect(clean).toContain('<em>italic</em>');
  });

  /**
   * Test that safe links are preserved
   */
  it('preserves safe links', () => {
    const safeHTML = '<a href="https://example.com" title="Example">Link</a>';
    const clean = useSanitizedHTML(safeHTML);

    expect(clean).toContain('<a href="https://example.com"');
    expect(clean).toContain('title="Example"');
  });

  /**
   * Test that forbidden tags like iframe are removed
   */
  it('removes forbidden tags like iframe', () => {
    const dirtyHTML = '<p>Text</p><iframe src="evil.com"></iframe><p>More</p>';
    const clean = useSanitizedHTML(dirtyHTML);

    expect(clean).not.toContain('<iframe>');
    expect(clean).not.toContain('evil.com');
    expect(clean).toContain('<p>Text</p>');
    expect(clean).toContain('<p>More</p>');
  });

  /**
   * Test that empty strings are handled gracefully
   */
  it('handles empty strings gracefully', () => {
    const clean = useSanitizedHTML('');

    expect(clean).toBe('');
  });

  /**
   * Test that plain text without HTML is preserved
   */
  it('preserves plain text without HTML', () => {
    const plainText = 'This is just plain text without any HTML';
    const clean = useSanitizedHTML(plainText);

    expect(clean).toBe(plainText);
  });

  /**
   * Test that multiple layers of malicious code are removed
   */
  it('removes multiple layers of malicious code', () => {
    const dirtyHTML = `
      <div onclick="hack()">
        <script>alert('XSS')</script>
        <p>Safe content</p>
        <img src="x" onerror="alert('XSS2')">
      </div>
    `;
    const clean = useSanitizedHTML(dirtyHTML);

    expect(clean).not.toContain('<script>');
    expect(clean).not.toContain('onclick');
    expect(clean).not.toContain('onerror');
    expect(clean).not.toContain('alert');
    expect(clean).not.toContain('hack');
    expect(clean).toContain('<p>Safe content</p>');
  });
});
