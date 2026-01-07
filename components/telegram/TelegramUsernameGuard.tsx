"use client";

import { useState, useEffect } from "react";
import { getTelegramUsername, setTelegramUsername, hasTelegramUsername } from "@/lib/telegram-auth";
import { Button } from "@/components/shared/Button";
import { AtSign } from "lucide-react";

interface TelegramUsernameGuardProps {
  children: React.ReactNode;
  onUsernameSet?: () => void;
}

export function TelegramUsernameGuard({ children, onUsernameSet }: TelegramUsernameGuardProps) {
  const [hasUsername, setHasUsername] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHasUsername(hasTelegramUsername());
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setTelegramUsername(username);
      setHasUsername(true);
      onUsernameSet?.();
    }
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!hasUsername) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-white/5 rounded-xl border border-white/10 p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
              <AtSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-white">
                Telegram Username
              </h2>
              <p className="text-white/50 text-sm">
                Required to access Telegram features
              </p>
            </div>
          </div>

          <p className="text-white/60 text-sm mb-6">
            Enter your Telegram username to start tracking channels and posts.
            This will be used to identify your channels in the system.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              disabled={!username.trim()}
            >
              Continue
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
