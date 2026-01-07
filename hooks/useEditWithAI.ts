"use client";

import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api";

interface EditWithAIResponse {
  data: { text: string };
}

interface UseEditWithAIReturn {
  editWithAI: (text: string, prompt: string) => Promise<string | null>;
  isEditing: boolean;
  error: string | null;
}

export function useEditWithAI(): UseEditWithAIReturn {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editWithAI = useCallback(async (text: string, prompt: string): Promise<string | null> => {
    try {
      setIsEditing(true);
      setError(null);
      const response = await apiClient<{ text: string }>("/operations/contentzavod/edit-with-ai", {
        method: "POST",
        body: { text, prompt },
      });
      return response?.text || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to edit with AI");
      return null;
    } finally {
      setIsEditing(false);
    }
  }, []);

  return {
    editWithAI,
    isEditing,
    error,
  };
}
