"use client";
export const runtime = 'edge';

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { SentientSphere } from "@/components/sentient-sphere";
import { useAuth } from "@/hooks/useAuth";

function SSOCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleSSOCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      setError("No authorization code provided");
      setIsProcessing(false);
      return;
    }

    const processCallback = async () => {
      try {
        await handleSSOCallback(code);
        // Redirect will happen in handleSSOCallback
      } catch (err) {
        console.error("SSO callback error:", err);
        setError(err instanceof Error ? err.message : "Failed to authenticate");
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, handleSSOCallback]);

  if (error) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-[#050505]">
        <div className="absolute inset-0 opacity-60">
          <SentientSphere />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]" />
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm text-center"
          >
            <p className="font-mono text-sm text-red-400 mb-4">{error}</p>
            <button
              onClick={() => router.push("/login")}
              className="px-6 py-3 border border-white/20 rounded-lg font-mono text-sm tracking-widest uppercase bg-white/5 text-white hover:bg-white hover:text-black transition-all duration-500"
            >
              Return to Login
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#050505]">
      <div className="absolute inset-0 opacity-60">
        <SentientSphere />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]" />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center"
        >
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-xs text-white/40 uppercase tracking-widest">
            Completing authentication...
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function SSOCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen w-full overflow-hidden bg-[#050505]">
          <div className="absolute inset-0 opacity-60">
            <SentientSphere />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]" />
          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="font-mono text-xs text-white/40 uppercase tracking-widest">
              Loading...
            </p>
          </div>
        </div>
      }
    >
      <SSOCallbackContent />
    </Suspense>
  );
}
