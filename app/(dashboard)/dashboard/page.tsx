"use client";
export const runtime = 'edge';

import { Instagram, Users, Video, Eye } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatNumber } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Custom YouTube Icon
function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

// Custom Telegram Icon
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

export default function DashboardPage() {
  const { stats, loading, error, refetch } = useDashboard();
  const router = useRouter();

  if (loading) {
    return <PageLoader message="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} retry={refetch} />;
  }

  const totalAuthors = parseInt(stats?.authors || "0");

  if (!stats || totalAuthors === 0) {
    return (
      <div>
        <div className="mb-8">
          <p className="font-mono text-xs tracking-[0.3em] text-white/40 mb-2">01 — OVERVIEW</p>
          <h1 className="text-3xl font-light text-white">Dashboard</h1>
        </div>
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="Welcome to Content Zavod"
          description="Start by adding Instagram authors to track their video performance"
          action={{
            label: "Add Your First Author",
            onClick: () => router.push("/authors"),
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-xs tracking-[0.3em] text-white/40 mb-2">01 — OVERVIEW</p>
        <h1 className="text-3xl font-light text-white">Dashboard</h1>
      </div>

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Instagram Card - Active */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/30">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                <Instagram className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-white">Instagram</h2>
                <p className="font-mono text-xs text-white/50 uppercase tracking-wider">Connected</p>
              </div>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{totalAuthors}</p>
            <p className="font-mono text-sm text-white/60">Accounts Tracked</p>
          </div>
          <div className="absolute top-4 right-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500" />
            </span>
          </div>
        </div>

        {/* YouTube Card - Coming Soon */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600/10 to-red-500/10 rounded-xl p-6 border border-red-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-red-500/5" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-red-600 to-red-500 opacity-50">
                <YouTubeIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-white/50">YouTube</h2>
                <p className="font-mono text-xs text-white/30 uppercase tracking-wider">Coming Soon</p>
              </div>
            </div>
            <p className="text-4xl font-bold text-white/30 mb-1">0</p>
            <p className="font-mono text-sm text-white/30">Channels Tracked</p>
          </div>
          <div className="absolute top-4 right-4">
            <span className="relative flex h-3 w-3">
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white/20" />
            </span>
          </div>
        </div>

        {/* Telegram Card - Coming Soon */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 opacity-50">
                <TelegramIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-white/50">Telegram</h2>
                <p className="font-mono text-xs text-white/30 uppercase tracking-wider">Coming Soon</p>
              </div>
            </div>
            <p className="text-4xl font-bold text-white/30 mb-1">0</p>
            <p className="font-mono text-sm text-white/30">Channels Tracked</p>
          </div>
          <div className="absolute top-4 right-4">
            <span className="relative flex h-3 w-3">
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white/20" />
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Followers"
          value={formatNumber(stats.followers)}
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          title="Total Videos"
          value={stats.number_of_videos}
          icon={<Video className="h-6 w-6" />}
        />
        <StatCard
          title="Total Views"
          value={formatNumber(stats.total_views)}
          icon={<Eye className="h-6 w-6" />}
        />
      </div>
    </div>
  );
}
