import DOMPurify from 'isomorphic-dompurify';

interface UseSanitizedHTMLOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
}

/**
 * CAPA 3: Frontend sanitization hook using DOMPurify.
 *
 * This hook sanitizes HTML on the client-side as the third and final layer
 * of defense in our triple-layer XSS protection strategy.
 *
 * Even though the backend (CAPA 1 and CAPA 2) already sanitizes the content,
 * this frontend layer provides additional protection in case:
 * - Database is compromised
 * - Backend sanitization is bypassed
 * - Old data exists from before sanitization was implemented
 *
 * @param dirtyHTML - Raw HTML string to sanitize
 * @param options - Optional configuration for allowed tags and attributes
 * @returns Sanitized HTML string safe for rendering
 *
 * @example
 * ```tsx
 * const sanitizedDescription = useSanitizedHTML(event.description);
 * <div dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
 * ```
 */
export const useSanitizedHTML = (
  dirtyHTML: string,
  options?: UseSanitizedHTMLOptions
): string => {
  const defaultConfig = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'b', 'i',
      'a', 'ul', 'ol', 'li', 'h2', 'h3', 'h4',
      'span', 'div'
    ],
    ALLOWED_ATTR: ['href', 'title', 'class', 'style'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  };

  const config = options
    ? {
        ...defaultConfig,
        ALLOWED_TAGS: options.allowedTags || defaultConfig.ALLOWED_TAGS,
        ALLOWED_ATTR: options.allowedAttributes
          ? Object.keys(options.allowedAttributes)
          : defaultConfig.ALLOWED_ATTR,
      }
    : defaultConfig;

  return DOMPurify.sanitize(dirtyHTML, config);
};
