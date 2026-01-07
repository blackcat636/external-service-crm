export interface Video {
  id: number;
  url_instagram: string;
  video_url: string;
  profile_url: string;
  username: string;
  views: number;
  likes: number;
  comments: number;
  engagement: string;
  createdAt: string;
  updatedAt: string;
}

// Stored in localStorage per video ID
export interface VideoLocalData {
  transcribed_text?: string;
  unique_text?: string;
  sora_video?: string;
  veo3_video?: string;
  avatar_video?: string;
  // Pending generation jobs (for polling)
  pending_jobs?: {
    veo3?: PendingJob;
    sora?: PendingJob;
    avatar?: PendingJob;
  };
}

// Job tracking for async video generation
export interface PendingJob {
  jobId: string; // n8n returns job_id as string
  startedAt: string; // ISO timestamp
}

export type VideoType = "veo3" | "sora" | "avatar";
export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface VideoFilters {
  username?: string;
  sortBy?: "engagement" | "views" | "likes" | "date";
  limit?: number;
}
