/**
 * Utility functions
 */

/**
 * Validate Twitter handle format
 */
export function validateHandle(handle: string): boolean {
  // Remove @ if present
  const cleanHandle = handle.replace(/^@/, '').trim();
  
  // Twitter handles: 1-15 characters, alphanumeric and underscores
  // Allow hyphens for flexibility
  const handleRegex = /^[a-zA-Z0-9_\-]{1,15}$/;
  
  return handleRegex.test(cleanHandle);
}

/**
 * Clean handle (remove @ and trim)
 */
export function cleanHandle(handle: string): string {
  return handle.replace(/^@/, '').trim().toLowerCase();
}

