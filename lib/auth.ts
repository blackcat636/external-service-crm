const SERVICE_TOKEN_KEY = "contentzavod-service-token";

export function getServiceToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SERVICE_TOKEN_KEY);
}

export function setServiceToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SERVICE_TOKEN_KEY, token);
}

export function clearServiceToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SERVICE_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getServiceToken();
}

/**
 * Initiate SSO login flow
 * Redirects to external service SSO initiate endpoint
 */
export function initiateSSO(): void {
  if (typeof window === "undefined") return;
  
  const externalServiceUrl = process.env.NEXT_PUBLIC_EXTERNAL_SERVICE_URL || "http://localhost:3001";
  const currentUrl = window.location.origin + window.location.pathname;
  const redirectUri = encodeURIComponent(currentUrl);
  
  window.location.href = `${externalServiceUrl}/auth/sso/initiate?redirect_uri=${redirectUri}`;
}

/**
 * Handle SSO callback - exchange code for service token
 */
export async function handleSSOCallback(code: string): Promise<void> {
  if (typeof window === "undefined") return;
  
  const externalServiceUrl = process.env.NEXT_PUBLIC_EXTERNAL_SERVICE_URL || "http://localhost:3001";
  const currentUrl = window.location.origin + window.location.pathname;
  const redirectUri = encodeURIComponent(currentUrl);
  
  try {
    const response = await fetch(`${externalServiceUrl}/auth/sso/exchange`, {
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
    } else {
      throw new Error("Service token not found in response");
    }
  } catch (error) {
    console.error("SSO callback error:", error);
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
