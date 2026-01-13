"use client";
export const runtime = 'edge';

import { Video } from "lucide-react";
import { useVideos } from "@/hooks/useVideos";
import { VideoList } from "@/components/tracking/VideoList";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { EmptyState } from "@/components/shared/EmptyState";
import { useRouter } from "next/navigation";

export default function TrackingPage() {
  const {
    videos,
    localData,
    loading,
    error,
    refetch,
    transcribeVideo,
    uniqueText,
    transcribingVideoId,
    uniquingVideoId,
    getLocalData,
    updateLocalData,
  } = useVideos();
  const router = useRouter();

  if (loading) {
    return <PageLoader message="Loading videos..." />;
  }

  if (error) {
    return <ErrorMessage message={error} retry={refetch} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-xs tracking-[0.3em] text-white/40 mb-2">03 — CONTENT</p>
          <h1 className="text-3xl font-light text-white">Tracking</h1>
        </div>
        {videos.length > 0 && (
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{videos.length}</p>
            <p className="font-mono text-xs text-white/40 uppercase">Videos Tracked</p>
          </div>
        )}
      </div>

      {videos.length === 0 ? (
        <EmptyState
          icon={<Video className="h-12 w-12" />}
          title="No videos tracked yet"
          description="Videos will appear here once your tracked authors post new content. Add some authors first!"
          action={{
            label: "Go to Authors",
            onClick: () => router.push("/authors"),
          }}
        />
      ) : (
        <VideoList
          videos={videos}
          localData={localData}
          onTranscribe={transcribeVideo}
          onUnique={uniqueText}
          transcribingVideoId={transcribingVideoId}
          uniquingVideoId={uniquingVideoId}
        />
      )}
    </div>
  );
}
