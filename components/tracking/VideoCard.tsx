"use client";

import { useState } from "react";
import {
  ExternalLink,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  FileText,
  Sparkles,
  Video as VideoIcon,
  X,
  VolumeX,
} from "lucide-react";
import { Video, VideoLocalData } from "@/types";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/shared/Button";

const NO_SPEECH_INDICATOR = "no text in this video";

interface VideoCardProps {
  video: Video;
  localData: VideoLocalData;
  onTranscribe?: (videoId: number, videoUrl: string) => Promise<string | null>;
  onUnique?: (videoId: number, text: string) => Promise<string | null>;
  isTranscribing?: boolean;
  isUniquing?: boolean;
}

function getEngagementStyles(percentage: number) {
  if (percentage >= 76) {
    return {
      badge: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg shadow-orange-500/30",
      card: "ring-2 ring-orange-400/50 shadow-xl shadow-orange-500/20",
      glow: true,
      animate: true,
    };
  }
  if (percentage >= 51) {
    return {
      badge: "bg-green-500 text-white shadow-md shadow-green-500/30",
      card: "ring-1 ring-green-400/30 shadow-lg",
      glow: true,
      animate: false,
    };
  }
  if (percentage >= 26) {
    return {
      badge: "bg-[#2563eb] text-white",
      card: "border-[#2563eb]/30",
      glow: false,
      animate: false,
    };
  }
  return {
    badge: "bg-white/20 text-white/60",
    card: "",
    glow: false,
    animate: false,
  };
}

export function VideoCard({
  video,
  localData,
  onTranscribe,
  onUnique,
  isTranscribing = false,
  isUniquing = false,
}: VideoCardProps) {
  const [showTranscriptionDialog, setShowTranscriptionDialog] = useState(false);
  const [showUniqueDialog, setShowUniqueDialog] = useState(false);

  const engagement = parseInt(video.engagement) || 0;
  const engagementStyles = getEngagementStyles(engagement);

  // Get data from localStorage
  const transcribedText = localData.transcribed_text;
  const uniqueText = localData.unique_text;

  // Check if there's no speech in the video
  const hasNoSpeech = transcribedText?.toLowerCase() === NO_SPEECH_INDICATOR;

  const handleTranscribe = async () => {
    if (onTranscribe) {
      await onTranscribe(video.id, video.video_url);
    }
  };

  const handleUnique = async () => {
    if (onUnique && transcribedText) {
      await onUnique(video.id, transcribedText);
    }
  };

  const handleOpenGeneratePage = () => {
    // Open generate page in new tab with video ID
    window.open(`/generate/${video.id}`, "_blank");
  };

  return (
    <>
      <div
        className={cn(
          "bg-white/5 rounded-xl border border-white/10 overflow-hidden transition-all duration-300 backdrop-blur-sm hover:bg-white/10",
          engagementStyles.card,
          engagementStyles.glow && "hover:shadow-2xl"
        )}
      >
        {/* Video Preview - uses object-contain for vertical videos */}
        <div className="relative aspect-[9/16] sm:aspect-video bg-black">
          <video
            src={video.video_url}
            className="w-full h-full object-contain"
            controls
            preload="metadata"
          />

          {/* Engagement Badge */}
          <div
            className={cn(
              "absolute top-2 right-2 px-2.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 z-10",
              engagementStyles.badge,
              engagementStyles.animate && "animate-pulse"
            )}
          >
            <TrendingUp className="h-4 w-4" />
            {engagement}%
            {engagementStyles.animate && (
              <Sparkles className="h-3 w-3 animate-spin" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Author */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {video.username?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <span className="text-sm font-medium text-white">
              @{video.username || "unknown"}
            </span>
            <a
              href={video.url_instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-white/30 hover:text-[#2563eb] transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 py-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Eye className="h-4 w-4 text-white/40" />
              <span>{formatNumber(video.views)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Heart className="h-4 w-4 text-red-400" />
              <span>{formatNumber(video.likes)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <MessageCircle className="h-4 w-4 text-[#2563eb]" />
              <span>{formatNumber(video.comments)}</span>
            </div>
          </div>

          {/* Action Buttons - Show message if no speech, otherwise show buttons */}
          {hasNoSpeech ? (
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center justify-center gap-2 py-4 bg-white/5 rounded-lg border border-white/10">
                <VolumeX className="h-5 w-5 text-white/40" />
                <span className="text-white/50 text-sm font-mono">
                  No speech detected in this video
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex gap-2 pt-3 border-t border-white/10">
                {transcribedText ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowTranscriptionDialog(true)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View Transcription
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={handleTranscribe}
                    loading={isTranscribing}
                    disabled={isTranscribing}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Transcribe
                  </Button>
                )}

                {uniqueText ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowUniqueDialog(true)}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    View Unique
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={handleUnique}
                    loading={isUniquing}
                    disabled={isUniquing || !transcribedText}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Make Unique
                  </Button>
                )}
              </div>

              {/* Generate Video Button - only enabled with unique text */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={handleOpenGeneratePage}
                  disabled={!uniqueText}
                >
                  <VideoIcon className="h-4 w-4 mr-1" />
                  Generate Video
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Transcription Dialog */}
      {showTranscriptionDialog && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowTranscriptionDialog(false)}
        >
          <div
            className="bg-[#0f0f0f] rounded-xl border border-white/10 p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#2563eb]" />
                Transcription
              </h3>
              <button
                onClick={() => setShowTranscriptionDialog(false)}
                className="text-white/40 hover:text-white/60 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-white/70 whitespace-pre-wrap font-mono text-sm">
              {transcribedText}
            </p>
            <button
              className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-white/70"
              onClick={() => setShowTranscriptionDialog(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

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
