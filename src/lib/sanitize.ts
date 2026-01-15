/**
 * HTML Sanitization Utilities
 * 
 * Provides safe HTML rendering to prevent XSS attacks.
 * Uses DOMPurify for sanitization.
 */

import DOMPurify from 'dompurify';

/**
 * Sanitization configuration for different content types
 */
type SanitizeLevel = 'strict' | 'standard' | 'rich';

interface SanitizeConfig {
  ALLOWED_TAGS: string[];
  ALLOWED_ATTR: string[];
  KEEP_CONTENT?: boolean;
  ADD_ATTR?: string[];
  FORCE_BODY?: boolean;
}

/**
 * Get sanitization config for a given level
 */
function getSanitizeConfig(level: SanitizeLevel): SanitizeConfig {
  switch (level) {
    case 'strict':
      return {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'span'],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true,
      };
    case 'rich':
      return {
        ALLOWED_TAGS: [
          'b', 'i', 'em', 'strong', 'u', 's', 'br', 'p', 'span', 'div',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li',
          'blockquote', 'pre', 'code',
          'a', 'hr', 'img',
          'table', 'thead', 'tbody', 'tr', 'th', 'td',
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'src', 'alt', 'width', 'height'],
        ADD_ATTR: ['target'],
        FORCE_BODY: true,
      };
    case 'standard':
    default:
      return {
        ALLOWED_TAGS: [
          'b', 'i', 'em', 'strong', 'u', 's', 'br', 'p', 'span',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li',
          'blockquote', 'pre', 'code',
          'a', 'hr',
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
        ADD_ATTR: ['target'],
        FORCE_BODY: true,
      };
  }
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * 
 * @param html - The HTML string to sanitize
 * @param level - The sanitization level ('strict' | 'standard' | 'rich')
 * @returns Sanitized HTML string
 * 
 * @example
 * ```tsx
 * const safeHtml = sanitizeHtml(userContent, 'standard');
 * return <div dangerouslySetInnerHTML={{ __html: safeHtml }} />;
 * ```
 */
export function sanitizeHtml(html: string | null | undefined, level: SanitizeLevel = 'standard'): string {
  if (!html) return '';
  
  const config = getSanitizeConfig(level);
  const sanitized = DOMPurify.sanitize(html, config);
  
  return String(sanitized);
}

/**
 * Converts plain text with newlines to sanitized HTML with <br> tags
 * 
 * @param text - Plain text with newlines
 * @returns Sanitized HTML with <br> tags
 */
export function textToHtml(text: string | null | undefined): string {
  if (!text) return '';
  
  // Escape HTML entities first
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  // Then convert newlines to <br>
  return escaped.replace(/\n/g, '<br />');
}

/**
 * Strips all HTML tags and returns plain text
 * 
 * @param html - HTML string
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  
  // Use DOMPurify with no allowed tags
  return String(DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }));
}

/**
 * Validates and sanitizes a URL
 * 
 * @param url - The URL to validate
 * @param allowedProtocols - List of allowed protocols
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(
  url: string | null | undefined,
  allowedProtocols = ['http:', 'https:']
): string {
  if (!url) return '';
  
  try {
    const parsed = new URL(url);
    
    if (!allowedProtocols.includes(parsed.protocol)) {
      console.warn(`Blocked URL with disallowed protocol: ${parsed.protocol}`);
      return '';
    }
    
    return parsed.href;
  } catch {
    // Invalid URL
    return '';
  }
}

/**
 * Encodes a string for safe use in URL parameters
 * 
 * @param value - The value to encode
 * @returns URL-encoded string
 */
export function encodeUrlParam(value: string): string {
  return encodeURIComponent(value);
}
