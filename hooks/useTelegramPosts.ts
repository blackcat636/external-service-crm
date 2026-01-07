"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { TelegramPost, TelegramPostLocalData } from "@/types";
import { hasTelegramUsername } from "@/lib/telegram-auth";

interface TelegramPostsResponse {
  success: boolean;
  data: TelegramPost[];
}

interface UniqueResponse {
  data: { unique_text: string };
}

// LocalStorage helpers
const STORAGE_KEY = "telegram_post_local_data";

function getPostLocalData(postId: number): TelegramPostLocalData {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return {};
  const allData = JSON.parse(stored) as Record<string, TelegramPostLocalData>;
  return allData[postId.toString()] || {};
}

function setPostLocalData(postId: number, data: Partial<TelegramPostLocalData>) {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(STORAGE_KEY);
  const allData = stored ? JSON.parse(stored) as Record<string, TelegramPostLocalData> : {};
  allData[postId.toString()] = { ...allData[postId.toString()], ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
}

function getAllPostLocalData(): Record<string, TelegramPostLocalData> {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return {};
  return JSON.parse(stored);
}

interface UseTelegramPostsReturn {
  posts: TelegramPost[];
  localData: Record<string, TelegramPostLocalData>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  uniqueText: (postId: number, text: string) => Promise<string | null>;
  uniquingPostId: number | null;
  getLocalData: (postId: number) => TelegramPostLocalData;
  updateLocalData: (postId: number, data: Partial<TelegramPostLocalData>) => void;
}

export function useTelegramPosts(): UseTelegramPostsReturn {
  const [posts, setPosts] = useState<TelegramPost[]>([]);
  const [localData, setLocalData] = useState<Record<string, TelegramPostLocalData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uniquingPostId, setUniquingPostId] = useState<number | null>(null);

  // Load localStorage data on mount
  useEffect(() => {
    setLocalData(getAllPostLocalData());
  }, []);

  const fetchPosts = useCallback(async () => {
    // Don't fetch if no telegram username is set
    if (!hasTelegramUsername()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient<TelegramPost[]>("/operations/contentzavod/telegram/posts", {
        includeTelegramUsername: true,
      });
      setPosts(response || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const uniqueText = useCallback(async (postId: number, text: string): Promise<string | null> => {
    try {
      setUniquingPostId(postId);
      setError(null);

      // Store original caption if not already stored
      const existingData = getPostLocalData(postId);
      if (!existingData.original_caption) {
        setPostLocalData(postId, { original_caption: text });
      }

      const response = await apiClient<{ unique_text: string }>("/operations/contentzavod/telegram/posts/unique", {
        method: "POST",
        body: { text },
        includeTelegramUsername: true,
      });
      const unique_text = response?.unique_text || "";

      // Store in localStorage
      setPostLocalData(postId, { unique_text });
      setLocalData(getAllPostLocalData());

      return unique_text;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to make text unique");
      return null;
    } finally {
      setUniquingPostId(null);
    }
  }, []);

  const getLocalData = useCallback((postId: number): TelegramPostLocalData => {
    return localData[postId.toString()] || {};
  }, [localData]);

  const updateLocalData = useCallback((postId: number, data: Partial<TelegramPostLocalData>) => {
    setPostLocalData(postId, data);
    setLocalData(getAllPostLocalData());
  }, []);

  return {
    posts,
    localData,
    loading,
    error,
    refetch: fetchPosts,
    uniqueText,
    uniquingPostId,
    getLocalData,
    updateLocalData,
  };
}
