"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { TelegramChannel } from "@/types";
import { hasTelegramUsername } from "@/lib/telegram-auth";

interface TelegramChannelsResponse {
  success: boolean;
  data: TelegramChannel[];
}

interface UseTelegramChannelsReturn {
  channels: TelegramChannel[];
  loading: boolean;
  error: string | null;
  deleteChannel: (channelId: number) => Promise<boolean>;
  refetch: () => Promise<void>;
  deletingChannelId: number | null;
}

export function useTelegramChannels(): UseTelegramChannelsReturn {
  const [channels, setChannels] = useState<TelegramChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingChannelId, setDeletingChannelId] = useState<number | null>(null);

  const fetchChannels = useCallback(async () => {
    // Don't fetch if no telegram username is set
    if (!hasTelegramUsername()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient<TelegramChannel[]>("/operations/contentzavod/telegram/channels", {
        includeTelegramUsername: true,
      });
      setChannels(response || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load channels");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const deleteChannel = useCallback(async (channelId: number): Promise<boolean> => {
    try {
      setDeletingChannelId(channelId);
      setError(null);
      await apiClient("/operations/contentzavod/telegram/channels/delete", {
        method: "POST",
        body: { id: channelId },
        includeTelegramUsername: true,
      });
      setChannels((prev) => prev.filter((c) => c.id !== channelId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete channel");
      return false;
    } finally {
      setDeletingChannelId(null);
    }
  }, []);

  return {
    channels,
    loading,
    error,
    deleteChannel,
    refetch: fetchChannels,
    deletingChannelId,
  };
}
