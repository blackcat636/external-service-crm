"use client";

import { Trash2, Hash } from "lucide-react";
import { TelegramChannel } from "@/types";
import { Button } from "@/components/shared/Button";
import { formatRelativeTime } from "@/lib/utils";

interface ChannelCardProps {
  channel: TelegramChannel;
  onDelete: (channelId: number) => void;
  deleting: boolean;
}

export function ChannelCard({ channel, onDelete, deleting }: ChannelCardProps) {
  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-6 transition-all duration-300 backdrop-blur-sm hover:bg-white/10 group">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
            <Hash className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white group-hover:text-blue-300 transition-colors">
              {channel.title}
            </h3>
            <p className="text-sm text-white/40 font-mono mt-1">
              Added {formatRelativeTime(channel.createdAt)}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(channel.id)}
          loading={deleting}
          disabled={deleting}
          className="text-white/40 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
