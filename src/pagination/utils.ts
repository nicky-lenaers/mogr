/**
 * Escape a Regular Expression String.
 *
 * @param value       String
 * @returns           Escaped String
 */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Retrieve a Field Key.
 *
 * @param field       Field
 * @returns           Field Key
 */
export function fieldKey(field: string): string {
  return field === 'id' ? `_${field}` : field;
}

/**
 * Encode a string to Base64.
 *
 * @param input       Input string
 * @returns           Encoded string
 */
export function base64Encode(input: string): string {
  return Buffer.from(input.toString()).toString('base64');
}

/**
 * Decode a Base64 string.
 *
 * @param input       Base64 encoded string
 * @returns           Decoded string
 */
export function base64Decode(input: string): string {
  return Buffer.from(input, 'base64').toString('ascii');
}

/**
 * Test whether a string contains only digits.
 *
 * @param value       String
 * @returns           Whether or not the value contains only digits
 */
export function isNumericString(value: string): boolean {
  return /^\d+$/.test(value);
}

/**
 * Check if a given value is of type number.
 *
 * @param value       Value
 * @returns           Whether or not the value is of type number
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number';
}

/**
 * Check if a given value is of type string.
 *
 * @param value       Value
 * @returns           Whether or not the value is of type string
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}
