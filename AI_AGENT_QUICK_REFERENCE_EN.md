# Quick Reference for AI Agent - Content Zavod

> Short guide for quick start

## 🎯 Main Rule

**Project can be cloned and changed (design, pages, functionality), but authentication mechanism must remain unchanged!**

## 🚀 Quick Start

### Basic Rules

1. **DO NOT change** `lib/auth.ts`, `lib/api.ts`, `hooks/useAuth.ts`, `components/auth/AuthGuard.tsx`
2. **Integrate authentication** into new pages through `useAuth()` and `AuthGuard`
3. **Use existing hooks** for working with data
4. **Create new components** in `components/`
5. **Use Tailwind CSS** for styling

## 📦 Main Hooks

```typescript
// Authentication
const { isAuthenticated, isLoading } = useAuth();

// Instagram Authors
const { authors, addAuthor, deleteAuthor, loading } = useAuthors();

// Instagram Videos
const { videos, transcribeVideo, uniqueText, getLocalData } = useVideos();

// AI Editing
const { editWithAI, isEditing } = useEditWithAI();

// Telegram Channels
const { channels, deleteChannel } = useTelegramChannels();

// Telegram Posts
const { posts, uniqueText, getLocalData } = useTelegramPosts();
```

## 🔐 Authentication

### New Login Page

```typescript
import { useAuth } from "@/hooks/useAuth";

const { initiateSSO } = useAuth();
const handleLogin = () => initiateSSO(); // ✅ Use existing function
```

### Protected Route

```typescript
import { AuthGuard } from "@/components/auth/AuthGuard";

<AuthGuard>
  {/* Your content */}
</AuthGuard>
```

### Check Authentication

```typescript
import { useAuth } from "@/hooks/useAuth";

const { isAuthenticated, isLoading } = useAuth();
```

## 🔌 Backend Communication

### ⚠️ IMPORTANT: Always use apiClient!

**apiClient automatically:**
- Adds authentication token
- Forms correct backend URL
- Handles errors (401, etc.)
- Handles response format

```typescript
import { apiClient } from "@/lib/api";

// GET (token will be added automatically)
const data = await apiClient<Type[]>("/operations/contentzavod/endpoint");

// POST
const result = await apiClient<Type>("/operations/contentzavod/endpoint", {
  method: "POST",
  body: { field: "value" },
});

// With Telegram username header
const data = await apiClient<Type>("/operations/contentzavod/endpoint", {
  includeTelegramUsername: true,
});

// Error handling
try {
  const data = await apiClient<Type[]>("/operations/contentzavod/endpoint");
} catch (error) {
  if (error instanceof Error) {
    console.error("API Error:", error.message);
  }
}
```

### ❌ DO NOT use fetch directly!

```typescript
// ❌ INCORRECT
const response = await fetch("http://localhost:3001/endpoint", {
  headers: { "Authorization": `Bearer ${token}` }
});

// ✅ CORRECT
const data = await apiClient<Type[]>("/operations/contentzavod/endpoint");
```

## 🧩 Components

```typescript
// Shared components
import { Button } from "@/components/shared/Button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { EmptyState } from "@/components/shared/EmptyState";
import { EditWithAIDialog } from "@/components/shared/EditWithAIDialog";
```

## 💾 LocalStorage

```typescript
// DO NOT use localStorage directly!
// Use methods from hooks:

// For videos
const { getLocalData, updateLocalData } = useVideos();
const data = getLocalData(videoId);
updateLocalData(videoId, { transcribed_text: "..." });

// For Telegram posts
const { getLocalData, updateLocalData } = useTelegramPosts();
const data = getLocalData(postId);
updateLocalData(postId, { unique_text: "..." });
```

## 🎨 Styling

```typescript
// Dark theme
className="bg-white/5 rounded-lg p-4 border border-white/10 text-white"

// Platform gradients
className="bg-gradient-to-r from-purple-500 to-pink-500"  // Instagram
className="bg-gradient-to-r from-blue-500 to-cyan-500"  // Telegram
className="bg-gradient-to-r from-red-500 to-orange-500"  // YouTube
```

## 📝 Component Template

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface Props {
  title: string;
}

export function MyComponent({ title }: Props) {
  const [loading, setLoading] = useState(false);
  
  return (
    <div className="rounded-lg bg-white/5 p-4">
      <h2 className="text-white">{title}</h2>
      <Button disabled={loading}>
        {loading ? <LoadingSpinner /> : "Click"}
      </Button>
    </div>
  );
}
```

## 📝 Hook Template

```typescript
"use client";

import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api";

export function useMyFeature() {
  const [data, setData] = useState<Type[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient<Type[]>("/operations/contentzavod/endpoint");
      setData(response || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchData };
}
```

## 🚫 Forbidden

- ❌ Change `lib/auth.ts`, `lib/api.ts`, `hooks/useAuth.ts`, `components/auth/AuthGuard.tsx`
- ❌ Create new authentication mechanism
- ❌ Use `fetch` directly instead of `apiClient`
- ❌ Change localStorage key `contentzavod-service-token`
- ❌ Use localStorage directly (use methods from hooks)

## ✅ Allowed

- ✅ Create new components
- ✅ Create new hooks
- ✅ Add new pages (including new authentication pages)
- ✅ Change entire design and UI
- ✅ Add new styles
- ✅ Create new types
- ✅ Integrate authentication into new pages through `useAuth()` and `AuthGuard`

## 📚 Full Documentation

- **AI_AGENT_GUIDE_EN.md** - Full guide (English)
- **AI_AGENT_GUIDE.md** - Full guide (Ukrainian)
