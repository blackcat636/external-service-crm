"use client";

import { useState } from "react";
import { ExternalLink, Sparkles, FileText, X, Hash } from "lucide-react";
import { TelegramPost, TelegramPostLocalData } from "@/types";
import { Button } from "@/components/shared/Button";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: TelegramPost;
  localData: TelegramPostLocalData;
  onUnique?: (postId: number, text: string) => Promise<string | null>;
  isUniquing?: boolean;
}

function parseMediaUrls(media: string): string[] {
  try {
    const parsed = JSON.parse(media);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function PostCard({ post, localData, onUnique, isUniquing = false }: PostCardProps) {
  const [showUniqueDialog, setShowUniqueDialog] = useState(false);
  const [expandCaption, setExpandCaption] = useState(false);

  const mediaUrls = parseMediaUrls(post.media);
  const uniqueText = localData.unique_text;
  const caption = post.caption || "";
  const truncatedCaption = caption.length > 200 ? caption.slice(0, 200) + "..." : caption;

  const handleUnique = async () => {
    if (onUnique) {
      await onUnique(post.id, caption);
    }
  };

  const handleOpenPostPage = () => {
    window.open(`/telegram/post/${post.id}`, "_blank");
  };

  return (
    <>
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden transition-all duration-300 backdrop-blur-sm hover:bg-white/10">
        {/* Images Grid */}
        {mediaUrls.length > 0 && (
          <div className={cn(
            "grid gap-0.5 bg-black",
            mediaUrls.length === 1 && "grid-cols-1",
            mediaUrls.length === 2 && "grid-cols-2",
            mediaUrls.length >= 3 && "grid-cols-2"
          )}>
            {mediaUrls.slice(0, 4).map((url, index) => (
              <div
                key={index}
                className={cn(
                  "relative aspect-square overflow-hidden",
                  mediaUrls.length === 1 && "aspect-[4/3]",
                  mediaUrls.length === 3 && index === 0 && "row-span-2"
                )}
              >
                <img
                  src={url}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 3 && mediaUrls.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">+{mediaUrls.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {/* Channel Name Badge */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-500/30">
              <Hash className="h-3 w-3 text-blue-400" />
              <span className="text-xs font-medium text-blue-300">{post.channel_name}</span>
            </div>
          </div>

          {/* Caption */}
          <div className="mb-4">
            <p className="text-white/70 text-sm whitespace-pre-wrap">
              {expandCaption ? caption : truncatedCaption}
            </p>
            {caption.length > 200 && (
              <button
                onClick={() => setExpandCaption(!expandCaption)}
                className="text-blue-400 text-sm mt-1 hover:text-blue-300"
              >
                {expandCaption ? "Show less" : "Read more"}
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 border-t border-white/10">
            {uniqueText ? (
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => setShowUniqueDialog(true)}
              >
                <FileText className="h-4 w-4 mr-1" />
                View Unique
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={handleUnique}
                loading={isUniquing}
                disabled={isUniquing || !caption.trim()}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Make Unique
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              onClick={handleOpenPostPage}
              disabled={!uniqueText}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Edit Post
            </Button>
          </div>
        </div>
      </div>

      {/* Unique Text Dialog */}
      {showUniqueDialog && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowUniqueDialog(false)}
        >
          <div
            className="bg-[#0f0f0f] rounded-xl border border-white/10 p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Unique Version
              </h3>
              <button
                onClick={() => setShowUniqueDialog(false)}
                className="text-white/40 hover:text-white/60 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
              <p className="text-white/70 whitespace-pre-wrap font-mono text-sm">
                {uniqueText}
              </p>
            </div>
            <button
              className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-white/70"
              onClick={() => setShowUniqueDialog(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
