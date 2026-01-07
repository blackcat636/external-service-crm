"use client";

import { RefreshCw, ExternalLink, TrendingUp, Users, Trash2 } from "lucide-react";
import { Author } from "@/types";
import { Button } from "@/components/shared/Button";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AuthorCardProps {
  author: Author;
  onRefresh: (authorId: number) => void;
  onDelete?: (authorId: number) => void;
  refreshing: boolean;
  deleting?: boolean;
}

function getViralStyles(percentage: number) {
  if (percentage >= 76) {
    return {
      badge: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-orange-500/30",
      card: "ring-2 ring-orange-400/50 shadow-xl shadow-orange-500/20",
      glow: true,
      animate: true,
    };
  }
  if (percentage >= 51) {
    return {
      badge: "bg-green-500 text-white shadow-md shadow-green-500/30",
      card: "ring-1 ring-green-400/30 shadow-lg",
      glow: true,
      animate: false,
    };
  }
  if (percentage >= 26) {
    return {
      badge: "bg-[#2563eb] text-white",
      card: "border-[#2563eb]/30",
      glow: false,
      animate: false,
    };
  }
  return {
    badge: "bg-white/20 text-white/60",
    card: "",
    glow: false,
    animate: false,
  };
}

export function AuthorCard({ author, onRefresh, onDelete, refreshing, deleting = false }: AuthorCardProps) {
  // Guard against incomplete author data
  if (!author || !author.id || !author.username) {
    return null;
  }

  const viralStyles = getViralStyles(author.viral_percentage || 0);

  return (
    <div
      className={cn(
        "bg-white/5 rounded-xl border border-white/10 p-6 transition-all duration-300 backdrop-blur-sm hover:bg-white/10",
        viralStyles.card,
        viralStyles.glow && "hover:shadow-2xl"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 relative">
          {author.profile_picture ? (
            <img
              src={author.profile_picture}
              alt={author.username}
              className={cn(
                "h-16 w-16 rounded-full object-cover border border-white/20",
                viralStyles.animate && "ring-2 ring-orange-400 ring-offset-2 ring-offset-[#0f0f0f]"
              )}
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
              <span className="text-2xl font-bold text-white/40">
                {author.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {viralStyles.animate && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-white truncate">
              @{author.username}
            </h3>
            <a
              href={author.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/30 hover:text-[#2563eb] transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          {author.full_name && (
            <p className="text-sm text-white/50 truncate">{author.full_name}</p>
          )}
          {author.followers !== undefined && (
            <p className="text-sm text-white/40 flex items-center gap-1 font-mono">
              <Users className="h-3 w-3" />
              {formatNumber(author.followers)} followers
            </p>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRefresh(author.id)}
            loading={refreshing}
            disabled={refreshing || deleting}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(author.id)}
              loading={deleting}
              disabled={refreshing || deleting}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Viral Percentage Badge */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/40 font-mono">Viral Score</span>
          <div
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 transition-all",
              viralStyles.badge,
              viralStyles.animate && "animate-pulse"
            )}
          >
            <TrendingUp className="h-4 w-4" />
            {author.viral_percentage}%
          </div>
        </div>

        {/* Viral Progress Bar */}
        <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              author.viral_percentage >= 76
                ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                : author.viral_percentage >= 51
                ? "bg-green-500"
                : author.viral_percentage >= 26
                ? "bg-[#2563eb]"
                : "bg-white/30"
            )}
            style={{ width: `${author.viral_percentage}%` }}
          />
        </div>
      </div>

      <p className="mt-4 text-xs text-white/30 text-right font-mono">
        Updated {formatRelativeTime(author.updatedAt)}
      </p>
    </div>
  );
}
