"use client";

import { TelegramPost, TelegramPostLocalData } from "@/types";
import { PostCard } from "./PostCard";

interface PostListProps {
  posts: TelegramPost[];
  localData: Record<string, TelegramPostLocalData>;
  onUnique?: (postId: number, text: string) => Promise<string | null>;
  uniquingPostId?: number | null;
}

export function PostList({ posts, localData, onUnique, uniquingPostId }: PostListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          localData={localData[post.id.toString()] || {}}
          onUnique={onUnique}
          isUniquing={uniquingPostId === post.id}
        />
      ))}
    </div>
  );
}
