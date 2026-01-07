"use client";

import { useCallback } from "react";
import { FileText, RefreshCw } from "lucide-react";
import { TelegramUsernameGuard, PostList } from "@/components/telegram";
import { useTelegramPosts } from "@/hooks/useTelegramPosts";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/shared/Button";
import Link from "next/link";

function PostListContainer() {
  const { posts, localData, loading, error, refetch, uniqueText, uniquingPostId } = useTelegramPosts();

  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner message="Loading posts..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <Button variant="secondary" onClick={handleRefetch}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
            <FileText className="h-8 w-8 text-white/30" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No posts yet</h3>
        <p className="text-white/50 max-w-md mx-auto mb-4">
          Posts from your tracked channels will appear here.
          Make sure you have added at least one channel.
        </p>
        <Link href="/telegram/authors">
          <Button variant="secondary">
            Go to Channels
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-white/50 text-sm">
          {posts.length} post{posts.length !== 1 ? "s" : ""} found
        </p>
        <Button variant="ghost" size="sm" onClick={handleRefetch}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>
      <PostList
        posts={posts}
        localData={localData}
        onUnique={uniqueText}
        uniquingPostId={uniquingPostId}
      />
    </div>
  );
}

export default function TelegramPostsPage() {
  return (
    <TelegramUsernameGuard>
      <div>
        <div className="mb-8">
          <p className="font-mono text-xs tracking-[0.3em] text-white/40 mb-2">
            TELEGRAM — POSTS
          </p>
          <h1 className="text-3xl font-light text-white">Telegram Posts</h1>
        </div>

        <PostListContainer />
      </div>
    </TelegramUsernameGuard>
  );
}
