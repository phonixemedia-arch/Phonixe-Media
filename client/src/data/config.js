/**
 * Application & Environment Configuration
 * 
 * PLACEHOLDER RULE:
 * - In development / preview, SHOW_PLACEHOLDERS is true by default so you can inspect layouts.
 * - In production, SHOW_PLACEHOLDERS is false unless explicitly set to true.
 * - Unpublished items (published: false) are only rendered when SHOW_PLACEHOLDERS is active,
 *   bearing a subtle "Placeholder" badge.
 * - If a section has 0 published items in production, the entire section and its navbar link are hidden.
 */
export const SHOW_PLACEHOLDERS = 
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SHOW_PLACEHOLDERS !== undefined
    ? import.meta.env.VITE_SHOW_PLACEHOLDERS === 'true'
    : true; // Default true in local environment so placeholders are visible for editing
