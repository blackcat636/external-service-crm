const TELEGRAM_USERNAME_KEY = "telegram-username";

/**
 * Get the stored Telegram username from localStorage
 */
export function getTelegramUsername(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TELEGRAM_USERNAME_KEY);
}

/**
 * Sanitize and store a Telegram username
 * Removes @ symbol, spaces, and other special characters
 */
export function setTelegramUsername(username: string): void {
  if (typeof window === "undefined") return;
  // Sanitize: remove @ and spaces, trim whitespace
  const sanitized = username.replace(/[@\s]/g, "").trim();
  localStorage.setItem(TELEGRAM_USERNAME_KEY, sanitized);
}

/**
 * Clear the stored Telegram username
 */
export function clearTelegramUsername(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TELEGRAM_USERNAME_KEY);
}

/**
 * Check if a Telegram username is set
 */
export function hasTelegramUsername(): boolean {
  return !!getTelegramUsername();
}
