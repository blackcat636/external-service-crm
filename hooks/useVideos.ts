"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { Video, VideoLocalData, VideosResponse } from "@/types";

interface TranscribeResponse {
  data: { transcription: string };
}

interface UniqueResponse {
  data: { unique_text: string };
}

// LocalStorage helpers
const STORAGE_KEY = "video_local_data";

function getVideoLocalData(videoId: number): VideoLocalData {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return {};
  const allData = JSON.parse(stored) as Record<string, VideoLocalData>;
  return allData[videoId.toString()] || {};
}

function setVideoLocalData(videoId: number, data: Partial<VideoLocalData>) {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(STORAGE_KEY);
  const allData = stored ? JSON.parse(stored) as Record<string, VideoLocalData> : {};
  allData[videoId.toString()] = { ...allData[videoId.toString()], ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
}

function getAllVideoLocalData(): Record<string, VideoLocalData> {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return {};
  return JSON.parse(stored);
}

interface UseVideosReturn {
  videos: Video[];
  localData: Record<string, VideoLocalData>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  transcribeVideo: (videoId: number, videoUrl: string) => Promise<string | null>;
  uniqueText: (videoId: number, text: string) => Promise<string | null>;
  transcribingVideoId: number | null;
  uniquingVideoId: number | null;
  getLocalData: (videoId: number) => VideoLocalData;
  updateLocalData: (videoId: number, data: Partial<VideoLocalData>) => void;
}

export function useVideos(): UseVideosReturn {
  const [videos, setVideos] = useState<Video[]>([]);
  const [localData, setLocalData] = useState<Record<string, VideoLocalData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transcribingVideoId, setTranscribingVideoId] = useState<number | null>(null);
  const [uniquingVideoId, setUniquingVideoId] = useState<number | null>(null);

  // Load localStorage data on mount
  useEffect(() => {
    setLocalData(getAllVideoLocalData());
  }, []);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient<Video[]>("/operations/contentzavod/videos");
      setVideos(response || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load videos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const transcribeVideo = useCallback(async (videoId: number, videoUrl: string): Promise<string | null> => {
    try {
      setTranscribingVideoId(videoId);
      setError(null);
      const response = await apiClient<{ transcription: string }>("/operations/contentzavod/videos/transcribe", {
        method: "POST",
        body: { videoUrl },
      });
      const transcribed_text = response?.transcription || "";

      // Store in localStorage
      setVideoLocalData(videoId, { transcribed_text });
      setLocalData(getAllVideoLocalData());

      return transcribed_text;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to transcribe video");
      return null;
    } finally {
      setTranscribingVideoId(null);
    }
  }, []);

  const uniqueText = useCallback(async (videoId: number, text: string): Promise<string | null> => {
    try {
      setUniquingVideoId(videoId);
      setError(null);
      const response = await apiClient<{ unique_text: string }>("/operations/contentzavod/videos/unique", {
        method: "POST",
        body: { text },
      });
      const unique_text = response?.unique_text || "";

      // Store in localStorage
      setVideoLocalData(videoId, { unique_text });
      setLocalData(getAllVideoLocalData());

      return unique_text;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to make text unique");
      return null;
    } finally {
      setUniquingVideoId(null);
    }
  }, []);

  const getLocalData = useCallback((videoId: number): VideoLocalData => {
    return localData[videoId.toString()] || {};
  }, [localData]);

  const updateLocalData = useCallback((videoId: number, data: Partial<VideoLocalData>) => {
    setVideoLocalData(videoId, data);
    setLocalData(getAllVideoLocalData());
  }, []);

  return {
    videos,
    localData,
    loading,
    error,
    refetch: fetchVideos,
    transcribeVideo,
    uniqueText,
    transcribingVideoId,
    uniquingVideoId,
    getLocalData,
    updateLocalData,
  };
}
