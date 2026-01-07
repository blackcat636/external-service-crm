"use client";

import { useCallback } from "react";
import { Bot, Hash, RefreshCw } from "lucide-react";
import { TelegramUsernameGuard, ChannelList } from "@/components/telegram";
import { useTelegramChannels } from "@/hooks/useTelegramChannels";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/shared/Button";

function ChannelListContainer() {
  const { channels, loading, error, deleteChannel, refetch, deletingChannelId } = useTelegramChannels();

  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <LoadingSpinner message="Loading channels..." />
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

  if (channels.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
            <Hash className="h-8 w-8 text-white/30" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No channels yet</h3>
        <p className="text-white/50 max-w-md mx-auto">
          Invite the bot to a Telegram channel to start tracking posts.
          The channel will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-white/50 text-sm">
          {channels.length} channel{channels.length !== 1 ? "s" : ""} tracked
        </p>
        <Button variant="ghost" size="sm" onClick={handleRefetch}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>
      <ChannelList
        channels={channels}
        onDelete={deleteChannel}
        deletingChannelId={deletingChannelId}
      />
    </div>
  );
}

export default function TelegramChannelsPage() {
  return (
    <TelegramUsernameGuard>
      <div>
        <div className="mb-8">
          <p className="font-mono text-xs tracking-[0.3em] text-white/40 mb-2">
            TELEGRAM — CHANNELS
          </p>
          <h1 className="text-3xl font-light text-white">Telegram Channels</h1>
        </div>

        {/* Instruction Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">Add a Channel</h3>
              <p className="text-blue-300/80 text-sm">
                To add a new channel, invite this bot{" "}
                <span className="font-mono font-bold text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded">
                  @alexand_content_bot
                </span>{" "}
                to your Telegram channel as an admin.
              </p>
            </div>
          </div>
        </div>

        <ChannelListContainer />
      </div>
    </TelegramUsernameGuard>
  );
}
