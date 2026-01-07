"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { Video, Sparkles, ExternalLink, ArrowLeft, Monitor, Smartphone, Loader2, Clock, Wand2 } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { EditWithAIDialog } from "@/components/shared/EditWithAIDialog";
import { VideoLocalData, PendingJob, VideoType } from "@/types";
import { apiClient } from "@/lib/api";
import { StartGenerationResponse, GenerationStatusResponse } from "@/types/api";
import Link from "next/link";

const STORAGE_KEY = "video_local_data";
const POLL_INTERVAL = 10000; // 10 seconds
const MAX_POLL_DURATION = 15 * 60 * 1000; // 15 minutes

type Orientation = "vertical" | "horizontal";

function getVideoLocalData(videoId: string): VideoLocalData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return {};
  const allData = JSON.parse(stored) as Record<string, VideoLocalData>;
  return allData[videoId] || {};
}

function setVideoLocalData(videoId: string, data: Partial<VideoLocalData>) {
  const stored = localStorage.getItem(STORAGE_KEY);
  const allData = stored ? JSON.parse(stored) as Record<string, VideoLocalData> : {};
  allData[videoId] = { ...allData[videoId], ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
}

function formatElapsedTime(startedAt: string): string {
  const elapsed = Date.now() - new Date(startedAt).getTime();
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function GeneratePage() {
  const params = useParams();
  const videoId = params.videoId as string;

  const [localData, setLocalData] = useState<VideoLocalData | null>(null);
  const [editedText, setEditedText] = useState("");
  const [orientation, setOrientation] = useState<Orientation>("vertical");
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showEditAIDialog, setShowEditAIDialog] = useState(false);

  // Pending job states
  const [pendingJobs, setPendingJobs] = useState<Record<VideoType, PendingJob | null>>({
    veo3: null,
    sora: null,
    avatar: null,
  });

  // Elapsed time display (updates every second)
  const [, setTick] = useState(0);

  // Refs for polling intervals and pending jobs (to avoid stale closures)
  const pollingRefs = useRef<Record<VideoType, NodeJS.Timeout | null>>({
    veo3: null,
    sora: null,
    avatar: null,
  });
  const pendingJobsRef = useRef(pendingJobs);

  // Keep ref in sync with state
  useEffect(() => {
    pendingJobsRef.current = pendingJobs;
  }, [pendingJobs]);

  // Check job status
  const checkJobStatus = useCallback(async (type: VideoType, jobId: string) => {
    try {
      const response = await apiClient<GenerationStatusResponse['data']>(
        `/operations/contentzavod/videos/generate/status?jobId=${encodeURIComponent(jobId)}`,
        { method: "GET" }
      );

      const { status, link, error: jobError } = response;

      if (status === "completed" && link) {
        // Job completed - save the video URL and clear pending job
        const storageKey = `${type}_video` as keyof VideoLocalData;
        const currentData = getVideoLocalData(videoId);
        const newPendingJobs = { ...currentData.pending_jobs };
        delete newPendingJobs[type];

        setVideoLocalData(videoId, {
          [storageKey]: link,
          pending_jobs: Object.keys(newPendingJobs).length > 0 ? newPendingJobs : undefined
        });

        setLocalData(getVideoLocalData(videoId));
        setPendingJobs(prev => ({ ...prev, [type]: null }));

        // Clear polling interval
        if (pollingRefs.current[type]) {
          clearInterval(pollingRefs.current[type]!);
          pollingRefs.current[type] = null;
        }
      } else if (status === "failed") {
        // Job failed - clear pending job and show error
        const currentData = getVideoLocalData(videoId);
        const newPendingJobs = { ...currentData.pending_jobs };
        delete newPendingJobs[type];

        setVideoLocalData(videoId, {
          pending_jobs: Object.keys(newPendingJobs).length > 0 ? newPendingJobs : undefined
        });

        setLocalData(getVideoLocalData(videoId));
        setPendingJobs(prev => ({ ...prev, [type]: null }));
        setError(jobError || `${type} generation failed`);

        // Clear polling interval
        if (pollingRefs.current[type]) {
          clearInterval(pollingRefs.current[type]!);
          pollingRefs.current[type] = null;
        }
      }
      // If pending or processing, continue polling
    } catch (err) {
      console.error(`Failed to check ${type} status:`, err);
      // Don't stop polling on transient errors
    }
  }, [videoId]);

  // Start polling for a job
  const startPolling = useCallback((type: VideoType, job: PendingJob) => {
    // Check if job has timed out
    const elapsed = Date.now() - new Date(job.startedAt).getTime();
    if (elapsed > MAX_POLL_DURATION) {
      // Job timed out - clear it
      const currentData = getVideoLocalData(videoId);
      const newPendingJobs = { ...currentData.pending_jobs };
      delete newPendingJobs[type];

      setVideoLocalData(videoId, {
        pending_jobs: Object.keys(newPendingJobs).length > 0 ? newPendingJobs : undefined
      });

      setLocalData(getVideoLocalData(videoId));
      setPendingJobs(prev => ({ ...prev, [type]: null }));
      setError(`${type} generation timed out after 15 minutes`);
      return;
    }

    // Clear any existing interval
    if (pollingRefs.current[type]) {
      clearInterval(pollingRefs.current[type]!);
    }

    // Check status immediately
    checkJobStatus(type, job.jobId);

    // Set up polling interval using ref to avoid stale closure
    pollingRefs.current[type] = setInterval(() => {
      const currentJob = pendingJobsRef.current[type];
      if (currentJob) {
        // Check timeout
        const elapsed = Date.now() - new Date(currentJob.startedAt).getTime();
        if (elapsed > MAX_POLL_DURATION) {
          clearInterval(pollingRefs.current[type]!);
          pollingRefs.current[type] = null;

          const currentData = getVideoLocalData(videoId);
          const newPendingJobs = { ...currentData.pending_jobs };
          delete newPendingJobs[type];

          setVideoLocalData(videoId, {
            pending_jobs: Object.keys(newPendingJobs).length > 0 ? newPendingJobs : undefined
          });

          setLocalData(getVideoLocalData(videoId));
          setPendingJobs(prev => ({ ...prev, [type]: null }));
          setError(`${type} generation timed out after 15 minutes`);
          return;
        }

        checkJobStatus(type, currentJob.jobId);
      } else {
        // Job was completed or cleared, stop polling
        clearInterval(pollingRefs.current[type]!);
        pollingRefs.current[type] = null;
      }
    }, POLL_INTERVAL);
  }, [videoId, checkJobStatus]);

  // Load local data and pending jobs on mount
  useEffect(() => {
    const data = getVideoLocalData(videoId);
    setLocalData(data);
    setEditedText(data.unique_text || "");

    // Restore pending jobs from localStorage
    if (data.pending_jobs) {
      const jobs: Record<VideoType, PendingJob | null> = {
        veo3: data.pending_jobs.veo3 || null,
        sora: data.pending_jobs.sora || null,
        avatar: data.pending_jobs.avatar || null,
      };
      setPendingJobs(jobs);
    }

    setMounted(true);
  }, [videoId]);

  // Start polling for any pending jobs on mount
  useEffect(() => {
    if (!mounted) return;

    Object.entries(pendingJobs).forEach(([type, job]) => {
      if (job && !pollingRefs.current[type as VideoType]) {
        startPolling(type as VideoType, job);
      }
    });
  }, [mounted, pendingJobs, startPolling]);

  // Update elapsed time display every second
  useEffect(() => {
    const hasActiveJobs = Object.values(pendingJobs).some(job => job !== null);
    if (!hasActiveJobs) return;

    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [pendingJobs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(pollingRefs.current).forEach(interval => {
        if (interval) clearInterval(interval);
      });
    };
  }, []);

  const handleGenerate = async (type: VideoType) => {
    setError(null);

    try {
      // Call the start endpoint
      const response = await apiClient<StartGenerationResponse['data']>("/operations/contentzavod/videos/generate/start", {
        method: "POST",
        body: {
          type,
          videoId,
          text: editedText.trim(),
          orientation
        },
      });

      const { job_id } = response;
      const pendingJob: PendingJob = {
        jobId: job_id,
        startedAt: new Date().toISOString(),
      };

      // Save pending job to localStorage
      const currentData = getVideoLocalData(videoId);
      setVideoLocalData(videoId, {
        pending_jobs: {
          ...currentData.pending_jobs,
          [type]: pendingJob,
        },
      });

      // Update state
      setPendingJobs(prev => ({ ...prev, [type]: pendingJob }));
      setLocalData(getVideoLocalData(videoId));

      // Start polling
      startPolling(type, pendingJob);
    } catch (err) {
      console.error(`Failed to start ${type} generation:`, err);
      setError(err instanceof Error ? err.message : `Failed to start ${type} generation`);
    }
  };

  const isGenerating = (type: VideoType) => pendingJobs[type] !== null;
  const anyGenerating = Object.values(pendingJobs).some(job => job !== null);

  // Show loading state until client-side data is loaded
  if (!mounted || localData === null) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/tracking"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tracking
          </Link>
        </div>
        <div className="bg-white/5 rounded-xl border border-white/10 p-8 text-center backdrop-blur-sm">
          <Loader2 className="h-12 w-12 text-white/30 mx-auto mb-4 animate-spin" />
          <p className="text-white/50">Loading...</p>
        </div>
      </div>
    );
  }

  if (!localData.unique_text) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/tracking"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tracking
          </Link>
        </div>
        <div className="bg-white/5 rounded-xl border border-white/10 p-8 text-center backdrop-blur-sm">
          <Video className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <h1 className="text-xl font-medium text-white mb-2">
            No Unique Text Found
          </h1>
          <p className="text-white/50">
            Please generate unique text for this video first before creating AI videos.
          </p>
        </div>
      </div>
    );
  }

  const renderGenerationCard = (type: VideoType, title: string, description: string) => {
    const videoKey = `${type}_video` as keyof VideoLocalData;
    const videoUrl = localData[videoKey] as string | undefined;
    const pendingJob = pendingJobs[type];
    const generating = isGenerating(type);

    return (
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
        <div>
          <h3 className="font-medium text-white">{title}</h3>
          <p className="text-sm text-white/50">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-[#2563eb] hover:text-blue-400 transition-colors"
            >
              View <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {generating && pendingJob ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg">
              <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
              <div className="flex items-center gap-1.5 text-sm text-purple-300">
                <Clock className="h-3.5 w-3.5" />
                <span className="font-mono">{formatElapsedTime(pendingJob.startedAt)}</span>
              </div>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleGenerate(type)}
              disabled={anyGenerating || !editedText.trim()}
            >
              Generate
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/tracking"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tracking
        </Link>
      </div>

      <div className="bg-white/5 rounded-xl border border-white/10 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-6">
          <Video className="h-6 w-6 text-purple-400" />
          <h1 className="text-xl font-medium text-white">
            Generate AI Video
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-mono">
            {error}
          </div>
        )}

        {anyGenerating && (
          <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-300 text-sm">
            Video generation is in progress. This may take 5-10 minutes. You can leave this page and come back - your progress will be saved.
          </div>
        )}

        {/* Orientation Selector */}
        <div className="mb-6">
          <label className="block font-mono text-xs tracking-widest text-white/40 uppercase mb-3">
            Video Orientation
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setOrientation("vertical")}
              disabled={anyGenerating}
              className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all ${
                orientation === "vertical"
                  ? "border-purple-500 bg-purple-500/10 text-purple-400"
                  : "border-white/10 bg-white/5 text-white/50 hover:border-white/20"
              } ${anyGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Smartphone className="h-6 w-6" />
              <div className="text-left">
                <div className="font-medium">Vertical</div>
                <div className="text-xs opacity-75 font-mono">9:16 ratio</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setOrientation("horizontal")}
              disabled={anyGenerating}
              className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all ${
                orientation === "horizontal"
                  ? "border-purple-500 bg-purple-500/10 text-purple-400"
                  : "border-white/10 bg-white/5 text-white/50 hover:border-white/20"
              } ${anyGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Monitor className="h-6 w-6" />
              <div className="text-left">
                <div className="font-medium">Horizontal</div>
                <div className="text-xs opacity-75 font-mono">16:9 ratio</div>
              </div>
            </button>
          </div>
        </div>

        {/* Editable Text */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 font-mono text-xs tracking-widest text-white/40 uppercase">
              <Sparkles className="h-4 w-4 text-purple-400" />
              Script (Edit as needed)
            </label>
            <button
              onClick={() => setShowEditAIDialog(true)}
              disabled={anyGenerating || !editedText.trim()}
              className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wand2 className="h-4 w-4" />
              Edit with AI
            </button>
          </div>
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            disabled={anyGenerating}
            className={`w-full h-48 p-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300 font-mono text-sm resize-none ${
              anyGenerating ? "opacity-50 cursor-not-allowed" : ""
            }`}
            placeholder="Your unique text will appear here..."
          />
        </div>

        {/* Generation Buttons */}
        <div className="space-y-3">
          <h2 className="font-mono text-xs tracking-widest text-white/40 uppercase mb-3">
            Choose AI Video Generator
          </h2>

          {renderGenerationCard("veo3", "VEO3", "Google's video generation model")}
          {renderGenerationCard("sora", "SORA", "OpenAI's video generation model")}
          {renderGenerationCard("avatar", "Avatar", "AI avatar with speech")}
        </div>
      </div>

      {/* Edit with AI Dialog */}
      <EditWithAIDialog
        isOpen={showEditAIDialog}
        onClose={() => setShowEditAIDialog(false)}
        currentText={editedText}
        onTextUpdated={(newText) => setEditedText(newText)}
      />
    </div>
  );
}
