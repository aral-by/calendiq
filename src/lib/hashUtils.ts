/**
 * Hash utility functions for security
 */

/**
 * Hash a string using SHA-256
 * @param input - The string to hash (e.g., PIN)
 * @returns Hexadecimal hash string
 */
export async function hashString(input: string): Promise<string> {
  // Convert string to Uint8Array
  const encoder = new TextEncoder();
  const data = encoder.encode(input);

  // Hash with SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  return hashHex;
}

/**
 * Hash a PIN (4-digit string)
 */
export async function hashPIN(pin: string): Promise<string> {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error('PIN must be exactly 4 digits');
  }
  return await hashString(pin);
}

/**
 * Verify a PIN against stored hash
 */
export async function verifyPIN(pin: string, storedHash: string): Promise<boolean> {
  try {
    const inputHash = await hashPIN(pin);
    return inputHash === storedHash;
  } catch {
    return false;
  }
}
