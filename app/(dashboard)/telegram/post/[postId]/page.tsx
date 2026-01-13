"use client";
export const runtime = 'edge';

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText, Sparkles, Wand2, ChevronDown, ChevronUp, Check, Copy } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { EditWithAIDialog } from "@/components/shared/EditWithAIDialog";
import { TelegramPostLocalData } from "@/types";
import Link from "next/link";

const STORAGE_KEY = "telegram_post_local_data";

function getPostLocalData(postId: string): TelegramPostLocalData {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return {};
  const allData = JSON.parse(stored) as Record<string, TelegramPostLocalData>;
  return allData[postId] || {};
}

function setPostLocalData(postId: string, data: Partial<TelegramPostLocalData>) {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(STORAGE_KEY);
  const allData = stored ? JSON.parse(stored) as Record<string, TelegramPostLocalData> : {};
  allData[postId] = { ...allData[postId], ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
}

export default function TelegramPostEditPage() {
  const params = useParams();
  const postId = params.postId as string;

  const [localData, setLocalData] = useState<TelegramPostLocalData | null>(null);
  const [editedText, setEditedText] = useState("");
  const [showOriginal, setShowOriginal] = useState(false);
  const [showEditAIDialog, setShowEditAIDialog] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load local data on mount
  useEffect(() => {
    const data = getPostLocalData(postId);
    setLocalData(data);
    setEditedText(data.unique_text || data.original_caption || "");
    setMounted(true);
  }, [postId]);

  // Auto-save when text changes (debounced)
  const handleTextChange = useCallback((newText: string) => {
    setEditedText(newText);
    setSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    setPostLocalData(postId, { unique_text: editedText });
    setLocalData(getPostLocalData(postId));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [postId, editedText]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(editedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [editedText]);

  const handleAIUpdate = useCallback((newText: string) => {
    setEditedText(newText);
    setPostLocalData(postId, { unique_text: newText });
    setLocalData(getPostLocalData(postId));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [postId]);

  // Show loading state until mounted
  if (!mounted || localData === null) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/telegram/tracking"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Posts
          </Link>
        </div>
        <div className="bg-white/5 rounded-xl border border-white/10 p-8 text-center backdrop-blur-sm">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white/50">Loading...</p>
        </div>
      </div>
    );
  }

  if (!localData.unique_text && !localData.original_caption) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/telegram/tracking"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Posts
          </Link>
        </div>
        <div className="bg-white/5 rounded-xl border border-white/10 p-8 text-center backdrop-blur-sm">
          <FileText className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <h1 className="text-xl font-medium text-white mb-2">
            No Text Found
          </h1>
          <p className="text-white/50">
            Please generate unique text for this post first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/telegram/tracking"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Posts
        </Link>
      </div>

      <div className="bg-white/5 rounded-xl border border-white/10 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-6 w-6 text-purple-400" />
          <h1 className="text-xl font-medium text-white">
            Edit Post Text
          </h1>
        </div>

        {/* Original Caption (Collapsible) */}
        {localData.original_caption && (
          <div className="mb-6">
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors mb-2"
            >
              {showOriginal ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <FileText className="h-4 w-4" />
              View Original Caption
            </button>
            {showOriginal && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-white/60 text-sm whitespace-pre-wrap font-mono">
                  {localData.original_caption}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Editable Text */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 font-mono text-xs tracking-widest text-white/40 uppercase">
              <Sparkles className="h-4 w-4 text-purple-400" />
              Unique Text (Edit as needed)
            </label>
            <button
              onClick={() => setShowEditAIDialog(true)}
              disabled={!editedText.trim()}
              className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wand2 className="h-4 w-4" />
              Edit with AI
            </button>
          </div>
          <textarea
            value={editedText}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full h-64 p-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300 font-mono text-sm resize-none"
            placeholder="Your text will appear here..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleCopy}
            className="flex-1"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Text
              </>
            )}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Edit with AI Dialog */}
      <EditWithAIDialog
        isOpen={showEditAIDialog}
        onClose={() => setShowEditAIDialog(false)}
        currentText={editedText}
        onTextUpdated={handleAIUpdate}
      />
    </div>
  );
}
