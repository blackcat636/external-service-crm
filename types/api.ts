import { Author } from "./author";
import { Video } from "./video";
import { DashboardStats } from "./dashboard";

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface APIError {
  success: false;
  error: string;
}

export type AuthorsResponse = APIResponse<Author[]>;
export type AuthorResponse = APIResponse<Author>;
export type VideosResponse = APIResponse<Video[]>;
export type DashboardResponse = APIResponse<DashboardStats>;

export type LoadingState = "idle" | "loading" | "success" | "error";

// Video generation job responses (matches n8n responses)
export interface StartGenerationResponse {
  success: boolean;
  data: {
    job_id: string; // n8n returns job_id as string
    status: "pending";
  };
}

export interface GenerationStatusResponse {
  success: boolean;
  data: {
    id: number;
    status: "pending" | "processing" | "completed" | "failed";
    link: string | null;
    error: string | null;
    createdAt: string;
    updatedAt: string;
  };
}
