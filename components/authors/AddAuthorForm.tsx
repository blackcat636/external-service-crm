"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { isValidInstagramURL } from "@/lib/utils";

interface AddAuthorFormProps {
  onSubmit: (url: string) => Promise<boolean>;
  loading: boolean;
}

export function AddAuthorForm({ onSubmit, loading }: AddAuthorFormProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError("Please enter an Instagram profile URL");
      return;
    }

    if (!isValidInstagramURL(trimmedUrl)) {
      setError("Please enter a valid Instagram profile URL (e.g., https://instagram.com/username)");
      return;
    }

    const success = await onSubmit(trimmedUrl);
    if (success) {
      setUrl("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/5 rounded-xl border border-white/10 p-6 backdrop-blur-sm">
      <h2 className="font-mono text-xs tracking-widest text-white/40 uppercase mb-4">Add Instagram Author</h2>
      <div className="flex gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://instagram.com/username"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300 font-mono text-sm"
            disabled={loading}
          />
          {error && <p className="mt-2 text-sm text-red-400 font-mono">{error}</p>}
        </div>
        <Button type="submit" loading={loading} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          Add Author
        </Button>
      </div>
    </form>
  );
}
