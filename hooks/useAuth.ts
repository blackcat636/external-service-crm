"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getServiceToken,
  setServiceToken,
  clearServiceToken,
  isAuthenticated as checkAuth,
  initiateSSO,
  handleSSOCallback,
} from "@/lib/auth";

interface UseAuthReturn {
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initiateSSO: () => void;
  handleSSOCallback: (code: string) => Promise<void>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Завантажуємо токен тільки один раз при ініціалізації
  useEffect(() => {
    const loadAuth = () => {
      const storedToken = getServiceToken();
      const authenticated = !!storedToken;
      
      console.log("[useAuth] Loading auth state:", { hasToken: !!storedToken, authenticated });
      
      setTokenState(storedToken);
      setIsLoading(false);
    };
    
    loadAuth();
  }, []);

  // Перевіряємо авторизацію на основі токену
  const isAuthenticated = useMemo(() => {
    if (isLoading) return false;
    return !!token || checkAuth();
  }, [token, isLoading]);

  const handleInitiateSSO = useCallback(() => {
    // Перевіряємо перед викликом - якщо вже авторизований, не викликаємо
    if (checkAuth()) {
      console.log("[useAuth] Already authenticated, skipping SSO initiation");
      return;
    }
    
    console.log("[useAuth] Initiating SSO from useAuth hook");
    initiateSSO();
  }, []);

  const handleSSOCallbackWrapper = useCallback(
    async (code: string) => {
      try {
        console.log("[useAuth] Handling SSO callback");
        await handleSSOCallback(code);
        const newToken = getServiceToken();
        const authenticated = !!newToken;
        
        setTokenState(newToken);
        router.push("/dashboard");
      } catch (error) {
        console.error("[useAuth] SSO callback failed:", error);
        setTokenState(null);
        router.push("/login");
      }
    },
    [router],
  );

  const logout = useCallback(() => {
    console.log("[useAuth] Logging out");
    clearServiceToken();
    setTokenState(null);
    router.push("/login");
  }, [router]);

  return {
    token,
    isLoading,
    isAuthenticated,
    initiateSSO: handleInitiateSSO,
    handleSSOCallback: handleSSOCallbackWrapper,
    logout,
  };
}
