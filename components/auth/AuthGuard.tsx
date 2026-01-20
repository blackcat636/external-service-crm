"use client";

import { useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { isAuthenticated as checkAuth } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoading: authIsLoading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false); // Флаг для відстеження, чи вже було перенаправлення
  const checkPerformed = useRef(false); // Флаг для відстеження, чи була виконана перевірка
  
  // Перевіряємо авторизацію напряму з localStorage, щоб уникнути проблем зі станом
  const isAuthenticated = useMemo(() => {
    if (typeof window === "undefined") return false;
    return checkAuth();
  }, []); // Залежність порожня - перевіряємо тільки при монтуванні

  const isLoading = useMemo(() => {
    return authIsLoading || !checkPerformed.current;
  }, [authIsLoading]);

  useEffect(() => {
    // Виконуємо перевірку тільки один раз
    if (checkPerformed.current) return;
    
    checkPerformed.current = true;
    
    // Перевіряємо напряму з localStorage для точності
    const authenticated = checkAuth();
    
    console.log("[AuthGuard] Check performed:", { authenticated, path: window.location.pathname });
    
    // Якщо користувач вже авторизований - дозволяємо доступ
    if (authenticated) {
      console.log("[AuthGuard] User is authenticated, allowing access");
      hasRedirected.current = false;
      return;
    }
    
    // Якщо вже було перенаправлення - не перенаправляємо знову
    if (hasRedirected.current) {
      console.log("[AuthGuard] Already redirected to login, skipping");
      return;
    }
    
    // Якщо користувач не авторизований - перенаправляємо на сторінку авторизації
    // НЕ викликаємо initiateSSO() - це зробить користувач на сторінці авторизації при натисканні кнопки
    console.log("[AuthGuard] User not authenticated, redirecting to login page");
    hasRedirected.current = true;
    
    // Невелика затримка для уникнення race condition
    const timer = setTimeout(() => {
      // Перевіряємо ще раз перед redirect
      if (!checkAuth()) {
        router.push("/login");
      } else {
        console.log("[AuthGuard] Auth state changed before redirect, canceling");
        hasRedirected.current = false;
      }
    }, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, [router]); // Залежність тільки від router

  // Показуємо завантаження під час ініціалізації
  if (isLoading) {
    return <PageLoader message="Checking authentication..." />;
  }

  // Якщо не авторизований - показуємо нічого (redirect вже виконано або відбувається)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
