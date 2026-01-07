import { Author } from "@/types";
import { AuthorCard } from "./AuthorCard";

interface AuthorListProps {
  authors: Author[];
  onRefresh: (authorId: number) => void;
  onDelete?: (authorId: number) => void;
  refreshingAuthorId: number | null;
  deletingAuthorId?: number | null;
}

export function AuthorList({
  authors,
  onRefresh,
  onDelete,
  refreshingAuthorId,
  deletingAuthorId,
}: AuthorListProps) {
  // Filter out invalid authors and sort by viral percentage (highest first)
  const validAuthors = authors
    .filter((author) => author && author.id && author.username)
    .sort((a, b) => (b.viral_percentage || 0) - (a.viral_percentage || 0));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {validAuthors.map((author) => (
        <AuthorCard
          key={author.id}
          author={author}
          onRefresh={onRefresh}
          onDelete={onDelete}
          refreshing={refreshingAuthorId === author.id}
          deleting={deletingAuthorId === author.id}
        />
      ))}
    </div>
  );
}
