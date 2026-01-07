"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { Author, AuthorsResponse, AuthorResponse } from "@/types";

interface UseAuthorsReturn {
  authors: Author[];
  loading: boolean;
  error: string | null;
  addAuthor: (url: string) => Promise<boolean>;
  refreshAuthor: (authorId: number) => Promise<boolean>;
  deleteAuthor: (authorId: number) => Promise<boolean>;
  refetch: () => Promise<void>;
  addingAuthor: boolean;
  refreshingAuthorId: number | null;
  deletingAuthorId: number | null;
}

export function useAuthors(): UseAuthorsReturn {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingAuthor, setAddingAuthor] = useState(false);
  const [refreshingAuthorId, setRefreshingAuthorId] = useState<number | null>(null);
  const [deletingAuthorId, setDeletingAuthorId] = useState<number | null>(null);

  const fetchAuthors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient<Author[]>("/operations/contentzavod/authors");
      setAuthors(response || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load authors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  const addAuthor = useCallback(async (url: string): Promise<boolean> => {
    try {
      setAddingAuthor(true);
      setError(null);
      await apiClient<Author>("/operations/contentzavod/authors/add", {
        method: "POST",
        body: { url },
      });
      // Refetch all authors to get the complete data from backend
      await fetchAuthors();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add author");
      return false;
    } finally {
      setAddingAuthor(false);
    }
  }, [fetchAuthors]);

  const refreshAuthor = useCallback(async (authorId: number): Promise<boolean> => {
    try {
      // Find the author to get their instagram_url
      const author = authors.find((a) => a.id === authorId);
      if (!author) {
        setError("Author not found");
        return false;
      }

      setRefreshingAuthorId(authorId);
      setError(null);

      // Use the add endpoint with the same URL - n8n will update existing author
      await apiClient<Author>("/operations/contentzavod/authors/add", {
        method: "POST",
        body: { url: author.instagram_url },
      });

      // Refetch all authors to get the updated data
      await fetchAuthors();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh author");
      return false;
    } finally {
      setRefreshingAuthorId(null);
    }
  }, [authors, fetchAuthors]);

  const deleteAuthor = useCallback(async (authorId: number): Promise<boolean> => {
    try {
      setDeletingAuthorId(authorId);
      setError(null);
      await apiClient("/operations/contentzavod/authors/delete", {
        method: "POST",
        body: { id: authorId },
      });
      setAuthors((prev) => prev.filter((a) => a.id !== authorId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete author");
      return false;
    } finally {
      setDeletingAuthorId(null);
    }
  }, []);

  return {
    authors,
    loading,
    error,
    addAuthor,
    refreshAuthor,
    deleteAuthor,
    refetch: fetchAuthors,
    addingAuthor,
    refreshingAuthorId,
    deletingAuthorId,
  };
}
