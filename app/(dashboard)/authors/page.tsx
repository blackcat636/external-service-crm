"use client";
export const runtime = 'edge';

import { Users } from "lucide-react";
import { useAuthors } from "@/hooks/useAuthors";
import { AddAuthorForm } from "@/components/authors/AddAuthorForm";
import { AuthorList } from "@/components/authors/AuthorList";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { EmptyState } from "@/components/shared/EmptyState";

export default function AuthorsPage() {
  const {
    authors,
    loading,
    error,
    addAuthor,
    refreshAuthor,
    deleteAuthor,
    refetch,
    addingAuthor,
    refreshingAuthorId,
    deletingAuthorId,
  } = useAuthors();

  if (loading) {
    return <PageLoader message="Loading authors..." />;
  }

  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-xs tracking-[0.3em] text-white/40 mb-2">02 — CREATORS</p>
        <h1 className="text-3xl font-light text-white">Authors</h1>
      </div>

      <div className="mb-8">
        <AddAuthorForm onSubmit={addAuthor} loading={addingAuthor} />
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} retry={refetch} />
        </div>
      )}

      {authors.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No authors tracked yet"
          description="Add your first Instagram author using the form above to start tracking their content performance"
        />
      ) : (
        <AuthorList
          authors={authors}
          onRefresh={refreshAuthor}
          onDelete={deleteAuthor}
          refreshingAuthorId={refreshingAuthorId}
          deletingAuthorId={deletingAuthorId}
        />
      )}
    </div>
  );
}
