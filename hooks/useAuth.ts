"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getServiceToken,
  setServiceToken,
  clearServiceToken,
  isAuthenticated,
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

  useEffect(() => {
    const storedToken = getServiceToken();
    setTokenState(storedToken);
    setIsLoading(false);
  }, []);

  const handleInitiateSSO = useCallback(() => {
    initiateSSO();
  }, []);

  const handleSSOCallbackWrapper = useCallback(
    async (code: string) => {
      try {
        await handleSSOCallback(code);
        const newToken = getServiceToken();
        setTokenState(newToken);
        router.push("/dashboard");
      } catch (error) {
        console.error("SSO callback failed:", error);
        router.push("/login");
      }
    },
    [router],
  );

  const logout = useCallback(() => {
    clearServiceToken();
    setTokenState(null);
    router.push("/login");
  }, [router]);

  return {
    token,
    isLoading,
    isAuthenticated: isAuthenticated(),
    initiateSSO: handleInitiateSSO,
    handleSSOCallback: handleSSOCallbackWrapper,
    logout,
  };
}
