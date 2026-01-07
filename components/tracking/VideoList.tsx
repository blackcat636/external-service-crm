import { Video, VideoLocalData } from "@/types";
import { VideoCard } from "./VideoCard";

interface VideoListProps {
  videos: Video[];
  localData: Record<string, VideoLocalData>;
  onTranscribe?: (videoId: number, videoUrl: string) => Promise<string | null>;
  onUnique?: (videoId: number, text: string) => Promise<string | null>;
  transcribingVideoId?: number | null;
  uniquingVideoId?: number | null;
}

export function VideoList({
  videos,
  localData,
  onTranscribe,
  onUnique,
  transcribingVideoId,
  uniquingVideoId,
}: VideoListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          localData={localData[video.id.toString()] || {}}
          onTranscribe={onTranscribe}
          onUnique={onUnique}
          isTranscribing={transcribingVideoId === video.id}
          isUniquing={uniquingVideoId === video.id}
        />
      ))}
    </div>
  );
}
