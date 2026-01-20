const SERVICE_TOKEN_KEY = "contentzavod-service-token";
const SSO_REDIRECT_FLAG = "contentzavod-sso-redirecting";

// Флаг для запобігання багаторазовим викликам initiateSSO
let isRedirecting = false;

export function getServiceToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SERVICE_TOKEN_KEY);
}

export function setServiceToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SERVICE_TOKEN_KEY, token);
  // Очистити флаг redirecting при успішній авторизації
  localStorage.removeItem(SSO_REDIRECT_FLAG);
  isRedirecting = false;
  console.log("[Auth] Service token set successfully");
}

export function clearServiceToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SERVICE_TOKEN_KEY);
  localStorage.removeItem(SSO_REDIRECT_FLAG);
  isRedirecting = false;
  console.log("[Auth] Service token cleared");
}

export function isAuthenticated(): boolean {
  const token = getServiceToken();
  const authenticated = !!token;
  
  if (typeof window !== "undefined") {
    console.log("[Auth] Checking authentication:", { hasToken: !!token, authenticated });
  }
  
  return authenticated;
}

/**
 * Перевіряє, чи вже відбувається перенаправлення на SSO
 */
export function isRedirectingToSSO(): boolean {
  if (typeof window === "undefined") return false;
  
  // Перевіряємо в пам'яті
  if (isRedirecting) {
    console.log("[Auth] Already redirecting (in memory)");
    return true;
  }
  
  // Перевіряємо в localStorage (на випадок перезавантаження)
  const flag = localStorage.getItem(SSO_REDIRECT_FLAG);
  if (flag && flag.startsWith("true:")) {
    // Перевіряємо, чи не застарілий флаг (старіше 5 секунд)
    const timestamp = parseInt(flag.split(":")[1] || "0", 10);
    if (timestamp && Date.now() - timestamp > 5000) {
      localStorage.removeItem(SSO_REDIRECT_FLAG);
      isRedirecting = false;
      console.log("[Auth] Redirect flag expired, clearing");
      return false;
    }
    isRedirecting = true;
    console.log("[Auth] Already redirecting (from localStorage)");
    return true;
  }
  
  return false;
}

// Фронтенд основного сервісу (для SSO initiate)
const EXTERNAL_SERVICE_FRONTEND_URL =
  process.env.NEXT_PUBLIC_EXTERNAL_SERVICE_URL || "http://localhost:3000";

// Бекенд стороннього сервісу (для SSO exchange та API запитів)
const EXTERNAL_SERVICE_BACKEND_URL =
  process.env.NEXT_PUBLIC_EXTERNAL_SERVICE_BACKEND_URL || "http://localhost:3001";

/**
 * Initiate SSO login flow
 * Redirects to external service SSO initiate endpoint (фронтенд основного сервісу)
 * Захищено від багаторазових викликів - викликається ТІЛЬКИ при відсутності токену
 * 
 * ВАЖЛИВО: redirect_uri ЗАВЖДИ має бути /sso-callback, а не поточна сторінка!
 */
export function initiateSSO(): void {
  if (typeof window === "undefined") {
    console.log("[Auth] initiateSSO called on server, skipping");
    return;
  }
  
  // Перевіряємо, чи вже є токен - якщо так, не ініціюємо SSO
  if (isAuthenticated()) {
    console.log("[Auth] Already authenticated, skipping SSO initiation");
    return;
  }
  
  // Перевіряємо, чи вже відбувається перенаправлення
  if (isRedirectingToSSO()) {
    console.log("[Auth] SSO redirect already in progress, skipping");
    return;
  }
  
  // Встановлюємо флаги
  isRedirecting = true;
  localStorage.setItem(SSO_REDIRECT_FLAG, `true:${Date.now()}`);
  
  // ВАЖЛИВО: redirect_uri ЗАВЖДИ має бути /sso-callback, а не поточна сторінка!
  // Після авторизації користувач буде перенаправлений на /sso-callback,
  // де буде оброблено код та збережено токен
  const callbackUrl = window.location.origin + '/sso-callback';
  const redirectUri = encodeURIComponent(callbackUrl);
  
  const ssoUrl = `${EXTERNAL_SERVICE_FRONTEND_URL}/auth/sso/initiate?redirect_uri=${redirectUri}`;
  
  console.log("[Auth] Initiating SSO redirect:");
  console.log("  - From:", window.location.pathname);
  console.log("  - To:", ssoUrl);
  console.log("  - Callback URL:", callbackUrl);
  
  // Використовуємо setTimeout для дозволу іншим операціям завершитися
  setTimeout(() => {
    // Перевіряємо ще раз перед redirect
    if (isRedirecting && !isAuthenticated()) {
      window.location.href = ssoUrl;
    } else {
      console.log("[Auth] Auth state changed before redirect, canceling");
      isRedirecting = false;
      localStorage.removeItem(SSO_REDIRECT_FLAG);
    }
  }, 100);
}

/**
 * Handle SSO callback - exchange code for service token
 * Використовує бекенд стороннього сервісу для exchange
 */
export async function handleSSOCallback(code: string): Promise<void> {
  if (typeof window === "undefined") return;
  
  const callbackUrl = window.location.origin + '/sso-callback';
  const redirectUri = encodeURIComponent(callbackUrl);
  
  console.log("[Auth] Handling SSO callback with code:", code.substring(0, 10) + "...");
  
  try {
    const response = await fetch(`${EXTERNAL_SERVICE_BACKEND_URL}/auth/sso/exchange`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        redirect_uri: redirectUri,
      }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to exchange SSO code");
    }
    
    const data = await response.json();
    
    if (data.data?.serviceToken) {
      setServiceToken(data.data.serviceToken);
      console.log("[Auth] SSO callback successful, token saved");
    } else {
      throw new Error("Service token not found in response");
    }
  } catch (error) {
    console.error("[Auth] SSO callback error:", error);
    throw error;
  }
}

// Legacy functions for backward compatibility (deprecated)
export function getLogin(): string | null {
  console.warn("getLogin() is deprecated. Use getServiceToken() instead.");
  return getServiceToken();
}

export function setLogin(token: string): void {
  console.warn("setLogin() is deprecated. Use setServiceToken() instead.");
  setServiceToken(token);
}

export function clearLogin(): void {
  console.warn("clearLogin() is deprecated. Use clearServiceToken() instead.");
  clearServiceToken();
}
