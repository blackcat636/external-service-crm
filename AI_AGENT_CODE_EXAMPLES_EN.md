# Code Examples for AI Agent - Content Zavod

> Ready-to-use code examples for quick copying and adaptation

## ⚠️ IMPORTANT

**If you are creating a new authentication page or protected route, MUST integrate existing authentication mechanism!** See section [Authentication Integration](#authentication-integration).

## 📋 Table of Contents

1. [Authentication Integration](#authentication-integration)
2. [Components](#components)
3. [Hooks](#hooks)
4. [API Requests](#api-requests)
5. [LocalStorage](#localstorage)
6. [Styling](#styling)

---

## 🔗 Authentication Integration

### New Authentication Page (with different design)

```typescript
"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/shared/Button";

export default function MyNewLoginPage() {
  const { isAuthenticated, isLoading, initiateSSO } = useAuth();
  const router = useRouter();

  // If already authenticated - redirect
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogin = () => {
    // ✅ USE EXISTING FUNCTION
    initiateSSO();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  // Your new design
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
        <h1 className="text-4xl font-bold text-white mb-4">Welcome</h1>
        <p className="text-white/80 mb-6">Sign in to continue</p>
        <Button onClick={handleLogin} className="w-full">
          Sign in through AIPills service
        </Button>
      </div>
    </div>
  );
}
```

### New Protected Route (with AuthGuard)

```typescript
"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";

export default function MyNewProtectedPage() {
  return (
    <AuthGuard>
      {/* ✅ USE AuthGuard */}
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white">Protected Content</h1>
        <p className="text-gray-400 mt-4">This content is protected</p>
      </div>
    </AuthGuard>
  );
}
```

### New Protected Route (with check in component)

```typescript
"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function MyNewProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null; // Redirect already executed
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white">Protected Content</h1>
      <p className="text-gray-400 mt-4">This content is protected</p>
    </div>
  );
}
```

### New SSO Callback Page (with different design)

```typescript
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";

function SSOCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleSSOCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      setError("No authorization code provided");
      setIsProcessing(false);
      return;
    }

    const processCallback = async () => {
      try {
        // ✅ USE EXISTING FUNCTION
        await handleSSOCallback(code);
        // Redirect happens automatically
      } catch (err) {
        console.error("SSO callback error:", err);
        setError(err instanceof Error ? err.message : "Failed to authenticate");
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, handleSSOCallback]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="text-center">
          <ErrorMessage message={error} />
          <button
            onClick={() => router.push("/login")}
            className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-white/60">Completing authentication...</p>
      </div>
    </div>
  );
}

export default function SSOCallbackPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SSOCallbackContent />
    </Suspense>
  );
}
```

### Component with Authentication Check

```typescript
"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export function ProtectedComponent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
        <p className="text-red-400">Please login to view this content</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-white">Protected Content</h2>
      {/* Your content */}
    </div>
  );
}
```

---

## 🧩 Components

### Basic Component with Hook

```typescript
"use client";

import { useAuthors } from "@/hooks/useAuthors";
import { Button } from "@/components/shared/Button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { EmptyState } from "@/components/shared/EmptyState";

export function AuthorsList() {
  const { 
    authors, 
    loading, 
    error, 
    deleteAuthor, 
    deletingAuthorId 
  } = useAuthors();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (authors.length === 0) return <EmptyState message="No authors found" />;

  return (
    <div className="space-y-4">
      {authors.map((author) => (
        <div 
          key={author.id} 
          className="rounded-lg bg-white/5 p-4 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <h3 className="text-white font-semibold">{author.full_name}</h3>
          <p className="text-gray-400 text-sm">{author.username}</p>
          <Button
            onClick={() => deleteAuthor(author.id)}
            disabled={deletingAuthorId === author.id}
            className="mt-2"
          >
            {deletingAuthorId === author.id ? "Deleting..." : "Delete"}
          </Button>
        </div>
      ))}
    </div>
  );
}
```

### Component with Form

```typescript
"use client";

import { useState } from "react";
import { useAuthors } from "@/hooks/useAuthors";
import { Button } from "@/components/shared/Button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export function AddAuthorForm() {
  const [url, setUrl] = useState("");
  const { addAuthor, addingAuthor } = useAuthors();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addAuthor(url);
    if (success) {
      setUrl(""); // Clear form
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Instagram URL"
        className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400"
        required
      />
      <Button type="submit" disabled={addingAuthor}>
        {addingAuthor ? <LoadingSpinner /> : "Add Author"}
      </Button>
    </form>
  );
}
```

### Component with EditWithAI

```typescript
"use client";

import { useState } from "react";
import { EditWithAIDialog } from "@/components/shared/EditWithAIDialog";
import { Button } from "@/components/shared/Button";

interface EditableTextProps {
  initialText: string;
  onSave: (text: string) => void;
}

export function EditableText({ initialText, onSave }: EditableTextProps) {
  const [text, setText] = useState(initialText);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSave = (edited: string) => {
    setText(edited);
    onSave(edited);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-2">
      <textarea 
        value={text} 
        onChange={(e) => setText(e.target.value)}
        className="w-full p-4 bg-white/5 rounded-lg text-white border border-white/10 min-h-[200px]"
      />
      <div className="flex gap-2">
        <Button onClick={() => setIsDialogOpen(true)}>
          Edit with AI
        </Button>
        <Button onClick={() => onSave(text)} variant="outline">
          Save
        </Button>
      </div>
      
      <EditWithAIDialog
        text={text}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
      />
    </div>
  );
}
```

### Component with Video and Transcription

```typescript
"use client";

import { useVideos } from "@/hooks/useVideos";
import { Button } from "@/components/shared/Button";
import { Video } from "@/types";

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const { 
    transcribeVideo, 
    uniqueText, 
    getLocalData,
    transcribingVideoId,
    uniquingVideoId 
  } = useVideos();

  const localData = getLocalData(video.id);
  const isTranscribing = transcribingVideoId === video.id;
  const isUniquing = uniquingVideoId === video.id;

  const handleTranscribe = async () => {
    await transcribeVideo(video.id, video.video_url);
  };

  const handleUnique = async () => {
    if (localData.transcribed_text) {
      await uniqueText(video.id, localData.transcribed_text);
    }
  };

  return (
    <div className="rounded-lg bg-white/5 p-4 border border-white/10">
      <video 
        src={video.video_url} 
        controls 
        className="w-full rounded-lg mb-4"
      />
      
      <div className="space-y-2">
        <p className="text-gray-400">Views: {video.views || "N/A"}</p>
        <p className="text-gray-400">Likes: {video.likes}</p>
        
        {localData.transcribed_text && (
          <div className="mt-4 p-3 bg-white/5 rounded">
            <p className="text-white text-sm">{localData.transcribed_text}</p>
          </div>
        )}
        
        <div className="flex gap-2">
          {!localData.transcribed_text && (
            <Button onClick={handleTranscribe} disabled={isTranscribing}>
              {isTranscribing ? "Transcribing..." : "Transcribe"}
            </Button>
          )}
          
          {localData.transcribed_text && !localData.unique_text && (
            <Button onClick={handleUnique} disabled={isUniquing}>
              {isUniquing ? "Making unique..." : "Make Unique"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 🎣 Hooks

### New Hook for CRUD Operations

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";

interface MyDataType {
  id: number;
  name: string;
  description: string;
}

interface CreateDto {
  name: string;
  description: string;
}

interface UpdateDto {
  name?: string;
  description?: string;
}

interface UseMyFeatureReturn {
  data: MyDataType[];
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  createItem: (dto: CreateDto) => Promise<boolean>;
  updateItem: (id: number, dto: UpdateDto) => Promise<boolean>;
  deleteItem: (id: number) => Promise<boolean>;
  creating: boolean;
  updatingId: number | null;
  deletingId: number | null;
}

export function useMyFeature(): UseMyFeatureReturn {
  const [data, setData] = useState<MyDataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient<MyDataType[]>("/operations/contentzavod/my-feature");
      setData(response || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createItem = useCallback(async (dto: CreateDto): Promise<boolean> => {
    try {
      setCreating(true);
      setError(null);
      await apiClient<MyDataType>("/operations/contentzavod/my-feature/create", {
        method: "POST",
        body: dto,
      });
      await fetchData();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create item");
      return false;
    } finally {
      setCreating(false);
    }
  }, [fetchData]);

  const updateItem = useCallback(async (id: number, dto: UpdateDto): Promise<boolean> => {
    try {
      setUpdatingId(id);
      setError(null);
      await apiClient<MyDataType>(`/operations/contentzavod/my-feature/${id}`, {
        method: "PUT",
        body: dto,
      });
      await fetchData();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item");
      return false;
    } finally {
      setUpdatingId(null);
    }
  }, [fetchData]);

  const deleteItem = useCallback(async (id: number): Promise<boolean> => {
    try {
      setDeletingId(id);
      setError(null);
      await apiClient(`/operations/contentzavod/my-feature/delete`, {
        method: "POST",
        body: { id },
      });
      setData((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
      return false;
    } finally {
      setDeletingId(null);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchData,
    createItem,
    updateItem,
    deleteItem,
    creating,
    updatingId,
    deletingId,
  };
}
```

### Hook for Single Item

```typescript
"use client";

import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api";

interface MyDataType {
  id: number;
  name: string;
}

interface UseMyItemReturn {
  data: MyDataType | null;
  loading: boolean;
  error: string | null;
  fetchItem: (id: number) => Promise<void>;
  updateItem: (id: number, data: Partial<MyDataType>) => Promise<boolean>;
}

export function useMyItem(): UseMyItemReturn {
  const [data, setData] = useState<MyDataType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient<MyDataType>(`/operations/contentzavod/my-feature/${id}`);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load item");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (id: number, updateData: Partial<MyDataType>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const updated = await apiClient<MyDataType>(`/operations/contentzavod/my-feature/${id}`, {
        method: "PUT",
        body: updateData,
      });
      setData(updated);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchItem,
    updateItem,
  };
}
```

---

## 🔌 Backend Communication

### ⚠️ IMPORTANT: Always use apiClient!

**apiClient automatically:**
- Adds authentication token to all requests
- Forms correct backend URL (from `NEXT_PUBLIC_EXTERNAL_SERVICE_BACKEND_URL`)
- Handles errors (401, etc.)
- Handles response format (`{ status, data }` or `{ success, data }`)

### Basic GET Request

```typescript
import { apiClient } from "@/lib/api";

// Token will be added automatically
const data = await apiClient<MyType[]>("/operations/contentzavod/endpoint");
```

### POST Request with Body

```typescript
import { apiClient } from "@/lib/api";

const result = await apiClient<ResultType>("/operations/contentzavod/endpoint", {
  method: "POST",
  body: {
    field1: "value1",
    field2: "value2",
  },
});
```

### Request with Telegram Username

```typescript
import { apiClient } from "@/lib/api";

const channels = await apiClient<TelegramChannel[]>(
  "/operations/contentzavod/telegram/channels",
  {
    includeTelegramUsername: true,
  }
);
```

### Error Handling

```typescript
import { apiClient } from "@/lib/api";

try {
  const data = await apiClient<MyType[]>("/operations/contentzavod/endpoint");
  // Success
} catch (error) {
  if (error instanceof Error) {
    if (error.message === "Not authenticated") {
      // Token missing - AuthGuard will handle this
    } else if (error.message === "Authentication required") {
      // 401 error - token invalid
    } else {
      // Other error
      console.error("API Error:", error.message);
      // Show error to user
    }
  }
}
```

### ❌ INCORRECT - using fetch directly

```typescript
// ❌ DO NOT DO THIS!
const token = localStorage.getItem("contentzavod-service-token");
const response = await fetch("http://localhost:3001/operations/contentzavod/endpoint", {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

// Problems:
// 1. Hardcoded URL
// 2. Token may be invalid
// 3. 401 errors are not handled
// 4. Response format is not handled
```

### ✅ CORRECT - using apiClient

```typescript
// ✅ CORRECT
import { apiClient } from "@/lib/api";

const data = await apiClient<MyType[]>("/operations/contentzavod/endpoint");
// Everything is handled automatically!
```

---

## 💾 LocalStorage

### Working with video_local_data

```typescript
import { useVideos } from "@/hooks/useVideos";

function MyComponent({ videoId }: { videoId: number }) {
  const { getLocalData, updateLocalData } = useVideos();
  
  // Get data
  const localData = getLocalData(videoId);
  const transcribedText = localData.transcribed_text;
  const uniqueText = localData.unique_text;
  const soraVideo = localData.sora_video;
  const veo3Video = localData.veo3_video;
  
  // Update data
  const handleSave = () => {
    updateLocalData(videoId, {
      transcribed_text: "New transcription",
      unique_text: "New unique text",
      sora_video: "https://...",
    });
  };
  
  return (
    <div>
      {transcribedText && <p>{transcribedText}</p>}
      {uniqueText && <p>{uniqueText}</p>}
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

### Working with telegram_post_local_data

```typescript
import { useTelegramPosts } from "@/hooks/useTelegramPosts";

function MyComponent({ postId }: { postId: number }) {
  const { getLocalData, updateLocalData } = useTelegramPosts();
  
  // Get data
  const localData = getLocalData(postId);
  const uniqueText = localData.unique_text;
  const originalCaption = localData.original_caption;
  
  // Update data
  const handleSave = () => {
    updateLocalData(postId, {
      unique_text: "New unique text",
    });
  };
  
  return (
    <div>
      {originalCaption && <p>Original: {originalCaption}</p>}
      {uniqueText && <p>Unique: {uniqueText}</p>}
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

### Creating New localStorage Key (if needed)

```typescript
"use client";

const STORAGE_KEY = "my_feature_data";

interface MyLocalData {
  field1: string;
  field2: number;
}

function getLocalData(id: number): MyLocalData | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  const allData = JSON.parse(stored) as Record<string, MyLocalData>;
  return allData[id.toString()] || null;
}

function setLocalData(id: number, data: MyLocalData) {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem(STORAGE_KEY);
  const allData = stored ? JSON.parse(stored) as Record<string, MyLocalData> : {};
  allData[id.toString()] = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
}

// Usage
export function MyComponent({ id }: { id: number }) {
  const [localData, setLocalDataState] = useState<MyLocalData | null>(null);

  useEffect(() => {
    setLocalDataState(getLocalData(id));
  }, [id]);

  const handleSave = (data: MyLocalData) => {
    setLocalData(id, data);
    setLocalDataState(data);
  };

  return (
    <div>
      {localData && (
        <div>
          <p>{localData.field1}</p>
          <p>{localData.field2}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 🎨 Styling

### Basic Classes for Dark Theme

```typescript
// Card
className="rounded-lg bg-white/5 p-4 border border-white/10"

// Hover effect
className="hover:bg-white/10 transition-colors"

// Text
className="text-white"           // Main text
className="text-gray-400"        // Secondary text
className="text-sm"               // Small text

// Buttons
className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
```

### Platform Gradients

```typescript
// Instagram
className="bg-gradient-to-r from-purple-500 to-pink-500"

// Telegram
className="bg-gradient-to-r from-blue-500 to-cyan-500"

// YouTube
className="bg-gradient-to-r from-red-500 to-orange-500"
```

### Engagement/Viral Percentage Tiers

```typescript
// 0-25% - Gray
className="text-gray-400 border-gray-400"

// 26-50% - Blue
className="text-blue-400 border-blue-400"

// 51-75% - Green with glow
className="text-green-400 border-green-400 ring-2 ring-green-400/50"

// 76-100% - Gold with animation
className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-orange-400 animate-pulse"
```

### Forms

```typescript
// Input
<input
  type="text"
  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

// Textarea
<textarea
  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

// Select
<select className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
  <option value="">Select...</option>
</select>
```

---

## 🔄 Combined Examples

### Page with CRUD Operations

```typescript
"use client";

import { useMyFeature } from "@/hooks/useMyFeature";
import { Button } from "@/components/shared/Button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { EmptyState } from "@/components/shared/EmptyState";
import { useState } from "react";

export function MyFeaturePage() {
  const {
    data,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    creating,
    updatingId,
    deletingId,
  } = useMyFeature();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createItem(formData);
    if (success) {
      setFormData({ name: "", description: "" });
      setShowForm(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">My Feature</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add New"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-4 bg-white/5 rounded-lg border border-white/10">
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Name"
            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white mb-2"
            required
          />
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description"
            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white mb-2"
            required
          />
          <Button type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create"}
          </Button>
        </form>
      )}

      {data.length === 0 ? (
        <EmptyState message="No items found" />
      ) : (
        <div className="space-y-4">
          {data.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <h3 className="text-white font-semibold">{item.name}</h3>
              <p className="text-gray-400 text-sm">{item.description}</p>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => deleteItem(item.id)}
                  disabled={deletingId === item.id}
                >
                  {deletingId === item.id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

**Use these examples as a basis for creating new components and features!**
