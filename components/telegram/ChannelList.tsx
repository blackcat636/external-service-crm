"use client";

import { TelegramChannel } from "@/types";
import { ChannelCard } from "./ChannelCard";

interface ChannelListProps {
  channels: TelegramChannel[];
  onDelete: (channelId: number) => void;
  deletingChannelId: number | null;
}

export function ChannelList({ channels, onDelete, deletingChannelId }: ChannelListProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {channels.map((channel) => (
        <ChannelCard
          key={channel.id}
          channel={channel}
          onDelete={onDelete}
          deleting={deletingChannelId === channel.id}
        />
      ))}
    </div>
  );
}
