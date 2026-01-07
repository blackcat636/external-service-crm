"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { SentientSphere } from "@/components/sentient-sphere";

function LoginContent() {
  const { isAuthenticated, isLoading, initiateSSO } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    } else if (!isLoading && !isAuthenticated) {
      // Check if there's a code parameter (SSO callback)
      const code = searchParams.get("code");
      if (code) {
        // Redirect to SSO callback handler
        router.push(`/sso-callback?code=${code}`);
        return;
      }
      // Auto-redirect to SSO
      initiateSSO();
    }
  }, [isLoading, isAuthenticated, router, searchParams, initiateSSO]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050505]">
      {/* 3D Sphere Background */}
      <div className="absolute inset-0 opacity-60">
        <SentientSphere />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-12"
        >
          <p className="font-mono text-xs tracking-[0.3em] text-white/40 mb-4">
            CONTENT ZAVOD
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white">
            Performance
            <br />
            <span className="italic text-white/80">Tracker</span>
          </h1>
        </motion.div>

        {/* Loading State */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-sm text-center"
        >
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-xs text-white/40 uppercase tracking-widest">
            Redirecting to authentication...
          </p>
        </motion.div>

        {/* Bottom Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2563eb] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2563eb]" />
            </span>
            <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase">
              System Ready
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
