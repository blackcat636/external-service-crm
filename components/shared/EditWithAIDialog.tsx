"use client";

import { useState } from "react";
import { Wand2, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { useEditWithAI } from "@/hooks/useEditWithAI";

interface EditWithAIDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentText: string;
  onTextUpdated: (newText: string) => void;
}

export function EditWithAIDialog({
  isOpen,
  onClose,
  currentText,
  onTextUpdated,
}: EditWithAIDialogProps) {
  const [prompt, setPrompt] = useState("");
  const { editWithAI, isEditing, error } = useEditWithAI();

  const handleEdit = async () => {
    if (!prompt.trim()) return;

    const result = await editWithAI(currentText, prompt);
    if (result) {
      onTextUpdated(result);
      setPrompt("");
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isEditing) {
      e.preventDefault();
      handleEdit();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0f0f0f] rounded-xl border border-white/10 p-6 max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-400" />
            Edit with AI
          </h3>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/60 transition-colors"
            disabled={isEditing}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-white/50 text-sm mb-4">
          Describe the changes you want to make to the text. The AI will rewrite
          it based on your instructions.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-white/70 mb-2">
            Current Text Preview
          </label>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10 max-h-32 overflow-y-auto">
            <p className="text-white/60 text-sm whitespace-pre-wrap line-clamp-4">
              {currentText.slice(0, 300)}
              {currentText.length > 300 && "..."}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-white/70 mb-2">
            What changes do you want?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Make it more professional, add emojis, translate to English, make it shorter..."
            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
            rows={3}
            disabled={isEditing}
            autoFocus
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={isEditing}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            onClick={handleEdit}
            disabled={!prompt.trim() || isEditing}
          >
            {isEditing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Editing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Apply Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
