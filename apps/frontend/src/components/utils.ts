/**
 * Utility functions for React components
 *
 * This module contains shared utility functions used across components
 * to keep component files clean and maintainable.
 */

/**
 * ANSI escape code mappings for better observability and debugging
 * Each code is named clearly so we know exactly what we're replacing
 */
export const ANSI_CODES = {
  // Reset and formatting
  RESET: '\u001b[0m',
  BOLD: '\u001b[1m',
  NORMAL_INTENSITY: '\u001b[22m',

  // Text colors (normal)
  BLACK: '\u001b[30m',
  RED: '\u001b[31m',
  GREEN: '\u001b[32m',
  YELLOW: '\u001b[33m',
  BLUE: '\u001b[34m',
  MAGENTA: '\u001b[35m',
  CYAN: '\u001b[36m',
  WHITE: '\u001b[37m',
  DEFAULT_FOREGROUND: '\u001b[39m',

  // Text colors (bright)
  BRIGHT_BLACK: '\u001b[90m',
  BRIGHT_RED: '\u001b[91m',
  BRIGHT_GREEN: '\u001b[92m',
  BRIGHT_YELLOW: '\u001b[93m',
  BRIGHT_BLUE: '\u001b[94m',
  BRIGHT_MAGENTA: '\u001b[95m',
  BRIGHT_CYAN: '\u001b[96m',
  BRIGHT_WHITE: '\u001b[97m',

  // Background colors (normal)
  BG_BLACK: '\u001b[40m',
  BG_RED: '\u001b[41m',
  BG_GREEN: '\u001b[42m',
  BG_YELLOW: '\u001b[43m',
  BG_BLUE: '\u001b[44m',
  BG_MAGENTA: '\u001b[45m',
  BG_CYAN: '\u001b[46m',
  BG_WHITE: '\u001b[47m',
} as const;

/**
 * ANSI code groups for systematic cleanup - each pattern clearly named for its purpose
 */
export const ANSI_PATTERNS = {
  // Basic formatting codes: [0m=reset, [1m=bold, [2m=dim, [3m=italic, [4m=underline, [5m=blink, [6m=fast-blink, [7m=reverse, [8m=hidden, [9m=strikethrough
  BASIC_FORMATTING: [
    '[0m', // reset
    '[1m', // bold
    '[2m', // dim
    '[3m', // italic
    '[4m', // underline
    '[5m', // blink
    '[6m', // fast-blink
    '[7m', // reverse
    '[8m', // hidden
    '[9m', // strikethrough
  ],

  // Standard text colors: [30m=black, [31m=red, [32m=green, [33m=yellow, [34m=blue, [35m=magenta, [36m=cyan, [37m=white, [38m=default, [39m=default
  STANDARD_TEXT_COLORS: [
    '[30m', // black
    '[31m', // red
    '[32m', // green
    '[33m', // yellow
    '[34m', // blue
    '[35m', // magenta
    '[36m', // cyan
    '[37m', // white
    '[38m', // default
    '[39m', // default
  ],

  // Bright text colors: [90m=bright-black, [91m=bright-red, [92m=bright-green, [93m=bright-yellow, [94m=bright-blue, [95m=bright-magenta, [96m=bright-cyan, [97m=bright-white
  BRIGHT_TEXT_COLORS: [
    '[90m', // bright-black
    '[91m', // bright-red
    '[92m', // bright-green
    '[93m', // bright-yellow
    '[94m', // bright-blue
    '[95m', // bright-magenta
    '[96m', // bright-cyan
    '[97m', // bright-white
  ],

  // Background colors: [40m=black-bg, [41m=red-bg, [42m=green-bg, [43m=yellow-bg, [44m=blue-bg, [45m=magenta-bg, [46m=cyan-bg, [47m=white-bg
  BACKGROUND_COLORS: [
    '[40m', // black background
    '[41m', // red background
    '[42m', // green background
    '[43m', // yellow background
    '[44m', // blue background
    '[45m', // magenta background
    '[46m', // cyan background
    '[47m', // white background
  ],

  // Bright background colors: [100m=bright-black-bg, [101m=bright-red-bg, [102m=bright-green-bg, [103m=bright-yellow-bg, [104m=bright-blue-bg, [105m=bright-magenta-bg, [106m=bright-cyan-bg, [107m=bright-white-bg
  BRIGHT_BACKGROUND_COLORS: [
    '[100m', // bright-black background
    '[101m', // bright-red background
    '[102m', // bright-green background
    '[103m', // bright-yellow background
    '[104m', // bright-blue background
    '[105m', // bright-magenta background
    '[106m', // bright-cyan background
    '[107m', // bright-white background
  ],
} as const;

/**
 * Clean ANSI escape codes from error messages without using regex control characters
 */
export const cleanANSIFromBackend = (message: string): string => {
  if (!message.includes('\u001b[')) {
    return message;
  }

  let cleaned = message;

  // Remove all known ANSI patterns systematically
  const allPatterns = [
    ...ANSI_PATTERNS.BASIC_FORMATTING,
    ...ANSI_PATTERNS.STANDARD_TEXT_COLORS,
    ...ANSI_PATTERNS.BRIGHT_TEXT_COLORS,
    ...ANSI_PATTERNS.BACKGROUND_COLORS,
    ...ANSI_PATTERNS.BRIGHT_BACKGROUND_COLORS,
  ];

  // Use string replacement instead of regex to avoid control character issues
  allPatterns.forEach(pattern => {
    const escapeSequence = '\u001b' + pattern;
    const parts = cleaned.split(escapeSequence);
    cleaned = parts.join('');
  });

  // Clean up any remaining ESC sequences that don't match our known patterns
  // This handles cases like [0;31m or other complex sequences using string operations
  let result = '';
  let i = 0;
  while (i < cleaned.length) {
    const currentChar = cleaned[i];
    const nextChar = i + 1 < cleaned.length ? cleaned[i + 1] : '';

    if (currentChar === '\u001b' && nextChar === '[') {
      // Skip until we find a letter (end of ANSI sequence)
      let j = i + 2;
      while (j < cleaned.length) {
        const charAtJ = cleaned[j];
        if (charAtJ && /[A-Za-z]/.test(charAtJ)) {
          break;
        }
        j++;
      }
      if (j < cleaned.length) {
        const charAtJ = cleaned[j];
        if (charAtJ && /[A-Za-z]/.test(charAtJ)) {
          i = j + 1; // Skip the entire sequence
        } else {
          result += currentChar; // Not a valid sequence, keep the ESC
          i++;
        }
      } else {
        result += currentChar; // Not a valid sequence, keep the ESC
        i++;
      }
    } else {
      result += currentChar;
      i++;
    }
  }
  cleaned = result;

  return cleaned;
};

/**
 * Get the type of error from an error message
 */
export const getErrorType = (errorMessage: string): string => {
  if (
    errorMessage.includes('SyntaxError') ||
    errorMessage.includes('Missing semicolon')
  ) {
    return 'Syntax Error';
  }
  if (errorMessage.includes('ReferenceError')) return 'Reference Error';
  if (errorMessage.includes('TypeError')) return 'Type Error';
  return 'Error';
};

/**
 * Clean and format error messages by removing ANSI escape codes and extracting useful information
 */
export const cleanErrorMessage = (errorMessage: string): string => {
  console.log('🔍 Processing error message:', errorMessage);

  // ANSI codes are now cleaned at the backend, so this is mainly for formatting
  let cleaned = errorMessage;

  // Basic cleanup for any remaining ANSI codes that might slip through
  // eslint-disable-next-line no-control-regex
  cleaned = cleaned.replace(/\u001b\[[0-9;]*m/g, '');

  // Extract the main error message from JSON response if present
  if (cleaned.includes('"error":')) {
    try {
      const jsonMatch = cleaned.match(/"error":"([^"]+)"/);
      if (jsonMatch && jsonMatch[1]) {
        cleaned = jsonMatch[1];
        // Unescape JSON string
        cleaned = cleaned
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\t/g, '\t');
      }
    } catch {
      // If JSON parsing fails, continue with original cleaning
    }
  }

  // Clean up common error prefixes
  cleaned = cleaned.replace(/^Transform failed:.*?-/i, '').trim();
  cleaned = cleaned.replace(/^Internal Server Error\s*-\s*/i, '').trim();

  // Extract just the error message, not the full stack if it's too long
  const lines = cleaned.split('\n');
  if (lines.length > 10) {
    // Keep only the first few lines and the main error
    const mainError = lines.find(
      line =>
        line.includes('Error:') ||
        line.includes('Missing') ||
        line.includes('Unexpected')
    );
    const location = lines.find(line => /^\s*>\s*\d+\s*\|/.test(line));
    const context = lines
      .slice(0, 3)
      .filter(
        line => !line.includes('at ') && !line.includes('Transform failed')
      );

    cleaned = [mainError, location, ...context.filter(line => line.trim())]
      .filter(Boolean)
      .join('\n');
  }

  console.log('✅ Final processed error:', cleaned.trim());
  return cleaned.trim();
};

/**
 * Debounce function to limit the rate of function execution
 * Useful for performance optimization in components with frequent updates
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Check if a string is a valid JSON
 */
export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * Safely parse JSON with error handling
 */
export const safeJSONParse = <T = unknown>(str: string, fallback: T): T => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

/**
 * Generate a unique ID for components
 */
export const generateUniqueId = (prefix = 'id'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if code contains potential syntax errors
 * Basic check for common issues before sending to API
 */
export const hasPotentialSyntaxErrors = (code: string): boolean => {
  // Check for unmatched braces, brackets, parentheses
  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  const openBrackets = (code.match(/\[/g) || []).length;
  const closeBrackets = (code.match(/\]/g) || []).length;
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;

  return (
    openBraces !== closeBraces ||
    openBrackets !== closeBrackets ||
    openParens !== closeParens
  );
};

/**
 * Test function to verify ANSI code removal is working
 * This can be called from console for debugging
 */
export const testANSICleaning = (): void => {
  const testError =
    'unknown: Missing semicolon. (6:7)\n\n\u001b[0m \u001b[90m 4 |\u001b[39m }\n \u001b[90m 5 |\u001b[39m\n\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 6 |\u001b[39m function ProgressBar({ progress }: { progress: number }): React.ReactElement {\n \u001b[90m   |\u001b[39m        \u001b[31m\u001b[1m^\u001b[22m\u001b[39m\n \u001b[90m 7 |\u001b[39m   \u001b[36mreturn\u001b[39m (\n \u001b[90m 8 |\u001b[39m     \u001b[33m<\u001b[39m\u001b[33mdiv\u001b[39m className=\u001b[33m"\u001b[39m\u001b[32mouter\u001b[39m\u001b[33m"\u001b[39m\u001b[33m>\u001b[39m\u001b[0m';

  const cleaned = cleanErrorMessage(testError);
  console.log('🧪 ANSI Cleaning Test:');
  console.log('Original length:', testError.length);
  console.log('Cleaned length:', cleaned.length);
  console.log('Contains ANSI codes:', cleaned.includes('\u001b'));
  console.log('Cleaned result:', cleaned);
};
