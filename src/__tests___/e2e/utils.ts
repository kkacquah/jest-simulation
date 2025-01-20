/**
 * Normalizes special characters in the given string to ensure consistent output across different platforms.
 * This function is used to standardize the representation of icons in test output.
 * 
 * @param str The input string to be normalized
 * @returns The normalized string
 * 
 * @copyright Jest
 * @license MIT
 */
export function normalizeIcons(str: string): string {
    if (!str) {
      return str;
    }
    // Make sure to keep in sync with `jest-util/src/specialChars`
    return str
      .replaceAll(new RegExp('\u00D7', 'gu'), '\u2715')
      .replaceAll(new RegExp('\u221A', 'gu'), '\u2713');
  }