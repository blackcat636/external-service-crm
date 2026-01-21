# Guide for AI Agent - Content Zavod

> **Important**: This guide is intended for AI agents (neural networks) that help programmers work with the project. It contains rules and examples for safe code work.

## 🎯 Main Project Rule

**This project can be cloned and transformed into a completely different site with new design, pages, and functionality. BUT the authentication mechanism and API communication must remain unchanged.**

### What can be changed:
- ✅ All design and UI
- ✅ All pages (create new, delete old)
- ✅ All functionality (add new features)
- ✅ Project structure (reorganize folders)

### What must remain:
- ❌ **Authentication mechanism** (`lib/auth.ts`, `hooks/useAuth.ts`, `components/auth/AuthGuard.tsx`)
- ❌ **API client** (`lib/api.ts` - automatic token addition)
- ❌ **SSO callback page** (`app/(auth)/sso-callback/page.tsx` - handling logic)

### If creating a new authentication page:
**MUST integrate existing authentication mechanism!** See section [Authentication Integration in New Pages](#authentication-integration-in-new-pages).

## 📋 Table of Contents

1. [Project Architecture](#project-architecture)
2. [Authentication and API](#authentication-and-api)
3. [Authentication Integration in New Pages](#authentication-integration-in-new-pages)
4. [Backend Communication](#backend-communication)
5. [Main Hooks and Their Usage](#main-hooks-and-their-usage)
6. [Working with Data](#working-with-data)
7. [Creating New Components](#creating-new-components)
8. [Creating New Hooks](#creating-new-hooks)
9. [Adding New API Endpoints](#adding-new-api-endpoints)
10. [Styling and UI](#styling-and-ui)
11. [Forbidden Actions](#forbidden-actions)
12. [Code Examples](#code-examples)

---

## 🏗️ Project Architecture

### Folder Structure

```
contentzavod/
├── app/                    # Next.js App Router (pages)
│   ├── (auth)/            # Authentication
│   └── (dashboard)/       # Main application pages
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── layout/            # Layout components (Sidebar, NavLink)
│   ├── shared/            # Shared components (Button, LoadingSpinner)
│   ├── authors/           # Components for authors
│   ├── tracking/          # Components for videos
│   └── telegram/          # Components for Telegram
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and API client
│   ├── api.ts            # API client (apiClient)
│   ├── auth.ts           # Authentication (SSO)
│   └── utils.ts          # Utilities
└── types/                 # TypeScript types
```

### Technologies

- **Frontend**: Next.js 18 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Backend**: External NestJS service (`crm_external_service`)
- **Authentication**: SSO through main CRM server
- **Storage**: localStorage for local data

---

## 🔐 Authentication and API

### ⚠️ IMPORTANT: Do not change authentication logic!

**DO NOT DELETE and DO NOT CHANGE:**
- `lib/auth.ts` - SSO authentication logic
- `lib/api.ts` - API client
- `hooks/useAuth.ts` - authentication hook
- `components/auth/AuthGuard.tsx` - route protection

### How authentication works

1. **Token is stored in localStorage** under key `contentzavod-service-token`
2. **API client automatically adds token** to all requests
3. **On 401 error** - automatic redirect to SSO

### Using API Client

```typescript
import { apiClient } from "@/lib/api";

// GET request
const authors = await apiClient<Author[]>("/operations/contentzavod/authors");

// POST request
const newAuthor = await apiClient<Author>("/operations/contentzavod/authors/add", {
  method: "POST",
  body: { url: "https://instagram.com/..." },
});

// POST with Telegram username (adds X-Telegram-Username header)
const channels = await apiClient<TelegramChannel[]>(
  "/operations/contentzavod/telegram/channels",
  {
    includeTelegramUsername: true,
  }
);
```

### Authentication Check

```typescript
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <div>Please login</div>;
  
  // Your code
}
```

---

## 🔗 Authentication Integration in New Pages

### ⚠️ CRITICALLY IMPORTANT

If you are creating a **new authentication page** or **new protected route**, you **MUST** integrate the existing authentication mechanism. **DO NOT create a new mechanism!**

### Creating a New Authentication Page

If you want to create a new login page with a different design, use existing functions:

```typescript
"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
    // ✅ CORRECT - use existing function
    initiateSSO();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  // Your new authentication page design
  return (
    <div className="your-new-design">
      <h1>Welcome to My New Site</h1>
      <button onClick={handleLogin}>
        Sign in through AIPills service
      </button>
    </div>
  );
}
```

**❌ INCORRECT - creating new mechanism:**

```typescript
// ❌ DO NOT DO THIS!
export default function MyNewLoginPage() {
  const handleLogin = async () => {
    // DO NOT create new authentication mechanism!
    const response = await fetch("/api/my-auth", { ... });
    // This will break integration with main server!
  };
}
```

### Creating a New Protected Route

If you want to protect a new page, use `AuthGuard`:

```typescript
"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";

export default function MyNewProtectedPage() {
  return (
    <AuthGuard>
      {/* ✅ CORRECT - use AuthGuard */}
      <div>
        <h1>My Protected Content</h1>
        {/* Your content */}
      </div>
    </AuthGuard>
  );
}
```

**Alternative - check in component:**

```typescript
"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MyNewProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Redirect already executed
  }

  return (
    <div>
      <h1>My Protected Content</h1>
      {/* Your content */}
    </div>
  );
}
```

### Creating a New API Request

**ALWAYS use `apiClient`** - it will automatically add the token:

```typescript
import { apiClient } from "@/lib/api";

// ✅ CORRECT - token will be added automatically
const data = await apiClient<MyType[]>("/operations/contentzavod/my-endpoint");
```

**❌ INCORRECT - using fetch directly:**

```typescript
// ❌ DO NOT DO THIS!
const response = await fetch("/api/endpoint", {
  headers: {
    Authorization: `Bearer ${token}`, // DO NOT add token manually!
  },
});
```

### Creating a New SSO Callback (if needed)

If you want to change the callback page design, preserve the logic:

```typescript
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

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
        // ✅ CORRECT - use existing function
        await handleSSOCallback(code);
        // Redirect happens automatically in handleSSOCallback
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
      <div className="your-error-design">
        <p>{error}</p>
        <button onClick={() => router.push("/login")}>
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="your-loading-design">
      <div>Completing authentication...</div>
    </div>
  );
}

export default function SSOCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SSOCallbackContent />
    </Suspense>
  );
}
```

### Authentication Integration Checklist

Before creating a new authentication page or protected route:

- [ ] Used `useAuth()` for authentication check
- [ ] Used `initiateSSO()` for login initiation (did not create new mechanism)
- [ ] Used `AuthGuard` for route protection (or check in component)
- [ ] Used `apiClient` for API requests (not fetch directly)
- [ ] Did NOT change authentication files (`lib/auth.ts`, `lib/api.ts`, `hooks/useAuth.ts`)
- [ ] Did NOT create new token storage mechanism
- [ ] Did NOT change localStorage key for token (`contentzavod-service-token`)

---

## 🎣 Main Hooks and Their Usage

### useAuth - Authentication

```typescript
import { useAuth } from "@/hooks/useAuth";

const { 
  token,              // string | null - token
  isLoading,          // boolean - loading
  isAuthenticated,    // boolean - is authenticated
  initiateSSO,        // () => void - initiate SSO
  logout,             // () => void - logout
} = useAuth();
```

**Usage:**
- Authentication check
- Logout
- **DO NOT call `initiateSSO()` manually** - AuthGuard does this

### useAuthors - Instagram Authors

```typescript
import { useAuthors } from "@/hooks/useAuthors";

const {
  authors,              // Author[] - list of authors
  loading,              // boolean - loading
  error,                // string | null - error
  addAuthor,            // (url: string) => Promise<boolean>
  refreshAuthor,        // (authorId: number) => Promise<boolean>
  deleteAuthor,         // (authorId: number) => Promise<boolean>
  refetch,              // () => Promise<void>
  addingAuthor,         // boolean - adding in progress
  refreshingAuthorId,   // number | null - ID of author being updated
  deletingAuthorId,     // number | null - ID of author being deleted
} = useAuthors();
```

**Usage Example:**
```typescript
function AuthorsPage() {
  const { authors, addAuthor, loading, addingAuthor } = useAuthors();
  
  const handleAdd = async (url: string) => {
    const success = await addAuthor(url);
    if (success) {
      // Author added, list will update automatically
    }
  };
  
  return (
    <div>
      {authors.map(author => (
        <AuthorCard key={author.id} author={author} />
      ))}
    </div>
  );
}
```

### useVideos - Instagram Videos

```typescript
import { useVideos } from "@/hooks/useVideos";

const {
  videos,                // Video[] - list of videos
  localData,             // Record<string, VideoLocalData> - local data
  loading,               // boolean
  error,                 // string | null
  refetch,               // () => Promise<void>
  transcribeVideo,       // (videoId: number, videoUrl: string) => Promise<string | null>
  uniqueText,            // (videoId: number, text: string) => Promise<string | null>
  transcribingVideoId,   // number | null
  uniquingVideoId,       // number | null
  getLocalData,          // (videoId: number) => VideoLocalData
  updateLocalData,       // (videoId: number, data: Partial<VideoLocalData>) => void
} = useVideos();
```

**Usage Example:**
```typescript
function VideoCard({ video }: { video: Video }) {
  const { 
    transcribeVideo, 
    uniqueText, 
    getLocalData,
    transcribingVideoId 
  } = useVideos();
  
  const localData = getLocalData(video.id);
  const isTranscribing = transcribingVideoId === video.id;
  
  const handleTranscribe = async () => {
    const text = await transcribeVideo(video.id, video.video_url);
    // Text saved to localStorage automatically
  };
  
  return (
    <div>
      {localData.transcribed_text && (
        <p>{localData.transcribed_text}</p>
      )}
      <button onClick={handleTranscribe} disabled={isTranscribing}>
        {isTranscribing ? "Transcribing..." : "Transcribe"}
      </button>
    </div>
  );
}
```

### useEditWithAI - AI Text Editing

```typescript
import { useEditWithAI } from "@/hooks/useEditWithAI";

const {
  editWithAI,    // (text: string, prompt: string) => Promise<string | null>
  isEditing,     // boolean
  error,         // string | null
} = useEditWithAI();
```

**Usage Example:**
```typescript
function EditDialog({ text, onSave }: Props) {
  const { editWithAI, isEditing } = useEditWithAI();
  const [prompt, setPrompt] = useState("");
  
  const handleEdit = async () => {
    const edited = await editWithAI(text, prompt);
    if (edited) {
      onSave(edited);
    }
  };
  
  return (
    <div>
      <textarea 
        value={prompt} 
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe how to change the text..."
      />
      <button onClick={handleEdit} disabled={isEditing}>
        {isEditing ? "Editing..." : "Edit with AI"}
      </button>
    </div>
  );
}
```

### useTelegramChannels - Telegram Channels

```typescript
import { useTelegramChannels } from "@/hooks/useTelegramChannels";

const {
  channels,           // TelegramChannel[]
  loading,
  error,
  deleteChannel,      // (id: number) => Promise<boolean>
  refetch,
  deletingChannelId, // number | null
} = useTelegramChannels();
```

### useTelegramPosts - Telegram Posts

```typescript
import { useTelegramPosts } from "@/hooks/useTelegramPosts";

const {
  posts,              // TelegramPost[]
  localData,          // Record<string, TelegramPostLocalData>
  loading,
  error,
  refetch,
  uniqueText,        // (postId: number, text: string) => Promise<string | null>
  uniquingPostId,    // number | null
  getLocalData,      // (postId: number) => TelegramPostLocalData
  updateLocalData,   // (postId: number, data: Partial<TelegramPostLocalData>) => void
} = useTelegramPosts();
```

---

## 💾 Working with Data

### LocalStorage

**IMPORTANT**: Some data is stored in localStorage, not in the database!

#### localStorage Keys:

```typescript
// Authentication token
"contentzavod-service-token"

// Telegram username
"telegram-username"

// Video data (transcriptions, unique text, generated videos)
"video_local_data"  // { [videoId]: VideoLocalData }

// Telegram post data (unique text)
"telegram_post_local_data"  // { [postId]: TelegramPostLocalData }

// Sidebar state (expanded sections)
"sidebar_expanded_sections"
```

#### Working with video_local_data

```typescript
// DO NOT use localStorage directly!
// Use methods from useVideos:

const { getLocalData, updateLocalData } = useVideos();

// Get data
const localData = getLocalData(videoId);
const transcribedText = localData.transcribed_text;
const uniqueText = localData.unique_text;

// Update data
updateLocalData(videoId, {
  transcribed_text: "New transcription",
  unique_text: "New unique text",
});
```

#### Working with telegram_post_local_data

```typescript
// Use methods from useTelegramPosts:

const { getLocalData, updateLocalData } = useTelegramPosts();

// Get data
const localData = getLocalData(postId);
const uniqueText = localData.unique_text;

// Update data
updateLocalData(postId, {
  unique_text: "New unique text",
});
```

---

## 🧩 Creating New Components

### Component Structure

```typescript
"use client"; // Required for client components

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface MyComponentProps {
  // Type all props
  title: string;
  onAction?: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    try {
      // Your logic
      onAction?.();
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="rounded-lg bg-white/5 p-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <Button onClick={handleClick} disabled={loading}>
        {loading ? <LoadingSpinner /> : "Click me"}
      </Button>
    </div>
  );
}
```

### Using Shared Components

```typescript
// Button
import { Button } from "@/components/shared/Button";
<Button onClick={handleClick} disabled={loading}>Click</Button>

// LoadingSpinner
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
<LoadingSpinner />

// EmptyState
import { EmptyState } from "@/components/shared/EmptyState";
<EmptyState message="No data found" />

// ErrorMessage
import { ErrorMessage } from "@/components/shared/ErrorMessage";
<ErrorMessage message={error} />

// EditWithAIDialog
import { EditWithAIDialog } from "@/components/shared/EditWithAIDialog";
<EditWithAIDialog 
  text={text}
  onSave={(edited) => setText(edited)}
/>
```

### Component Styling

**Use Tailwind CSS with dark theme:**

```typescript
// Basic classes for dark theme
className="bg-white/5"           // Semi-transparent white background
className="bg-white/10"           // Slightly lighter
className="rounded-lg"            // Rounded corners
className="p-4"                   // Padding
className="text-white"            // White text
className="text-gray-400"         // Gray text
className="border border-white/10" // Thin border

// Platform gradients
className="bg-gradient-to-r from-purple-500 to-pink-500"  // Instagram
className="bg-gradient-to-r from-blue-500 to-cyan-500"    // Telegram
className="bg-gradient-to-r from-red-500 to-orange-500"   // YouTube
```

---

## 🎣 Creating New Hooks

### Hook Template

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";

interface UseMyFeatureReturn {
  data: MyDataType[];
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  createItem: (data: CreateDto) => Promise<boolean>;
  updateItem: (id: number, data: UpdateDto) => Promise<boolean>;
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

  const createItem = useCallback(async (createDto: CreateDto): Promise<boolean> => {
    try {
      setCreating(true);
      setError(null);
      await apiClient<MyDataType>("/operations/contentzavod/my-feature/create", {
        method: "POST",
        body: createDto,
      });
      await fetchData(); // Update list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create item");
      return false;
    } finally {
      setCreating(false);
    }
  }, [fetchData]);

  const updateItem = useCallback(async (id: number, updateDto: UpdateDto): Promise<boolean> => {
    try {
      setUpdatingId(id);
      setError(null);
      await apiClient<MyDataType>(`/operations/contentzavod/my-feature/${id}`, {
        method: "PUT",
        body: updateDto,
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

### Hook Creation Rules

1. **Always use `useCallback`** for functions
2. **Always handle errors** and set `error` state
3. **Set loading states** for each async action
4. **Update data after create/update** (through `fetchData` or state update)
5. **Return boolean** for create/update/delete operations

---

## 🔌 Backend Communication

### ⚠️ CRITICALLY IMPORTANT: Always use apiClient!

**DO NOT use `fetch` directly!** Use `apiClient` - it automatically:
- Adds authentication token to all requests
- Handles errors (401, etc.)
- Formats backend URL
- Handles response format

### How apiClient Works

**`apiClient` from `lib/api.ts` - this is the only way to communicate with backend:**

1. **Automatically adds token:**
   ```typescript
   // apiClient automatically adds:
   headers: {
     "Authorization": "Bearer <service-token>",
     "Content-Type": "application/json"
   }
   ```

2. **Automatically forms URL:**
   ```typescript
   // If endpoint = "/operations/contentzavod/authors"
   // apiClient will create: "http://localhost:3001/operations/contentzavod/authors"
   // Base URL is taken from NEXT_PUBLIC_EXTERNAL_SERVICE_BACKEND_URL
   ```

3. **Automatically handles errors:**
   - On 401 - throws error "Authentication required"
   - On other errors - extracts message from response

4. **Automatically handles response format:**
   ```typescript
   // Supports two formats:
   // 1. { status: 200, data: {...}, message: "..." }
   // 2. { success: true, data: {...} }
   // apiClient automatically extracts data
   ```

### Backend URL

**Backend URL is configured through environment variable:**
```env
NEXT_PUBLIC_EXTERNAL_SERVICE_BACKEND_URL=http://localhost:3001
```

**apiClient automatically uses this URL for all requests.**

### Request Format

```typescript
import { apiClient } from "@/lib/api";

// GET request
const data = await apiClient<DataType[]>("/operations/contentzavod/endpoint");

// POST request
const result = await apiClient<ResultType>("/operations/contentzavod/endpoint", {
  method: "POST",
  body: { field1: "value1", field2: "value2" },
});

// PUT request
const updated = await apiClient<ResultType>("/operations/contentzavod/endpoint/123", {
  method: "PUT",
  body: { field1: "newValue" },
});

// DELETE request (via POST, as in project)
const deleted = await apiClient("/operations/contentzavod/endpoint/delete", {
  method: "POST",
  body: { id: 123 },
});
```

### Special Headers

**Telegram username header:**
```typescript
// For requests that require Telegram username
const channels = await apiClient<TelegramChannel[]>(
  "/operations/contentzavod/telegram/channels",
  {
    includeTelegramUsername: true, // Will add X-Telegram-Username header
  }
);
```

**Custom headers:**
```typescript
const data = await apiClient<DataType>("/operations/contentzavod/endpoint", {
  headers: {
    "X-Custom-Header": "value",
  },
});
```

### Error Handling

```typescript
import { apiClient } from "@/lib/api";

try {
  const data = await apiClient<DataType[]>("/operations/contentzavod/endpoint");
  // Success
} catch (error) {
  if (error instanceof Error) {
    if (error.message === "Not authenticated") {
      // Token missing - user not authenticated
      // AuthGuard or login page will handle this
    } else if (error.message === "Authentication required") {
      // 401 error - token invalid
      // apiClient already handled this
    } else {
      // Other error
      console.error("API Error:", error.message);
      // Show error to user
    }
  }
}
```

### Backend Response Format

**Backend can return two formats:**

1. **New format (recommended):**
```json
{
  "status": 200,
  "data": { ... },
  "message": "Success"
}
```

2. **Old format (for compatibility):**
```json
{
  "success": true,
  "data": { ... }
}
```

**apiClient automatically extracts `data` from both formats.**

### ❌ INCORRECT - using fetch directly

```typescript
// ❌ DO NOT DO THIS!
const response = await fetch("http://localhost:3001/operations/contentzavod/endpoint", {
  headers: {
    "Authorization": `Bearer ${token}`, // DO NOT add token manually!
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ ... }),
});

// Problems:
// 1. Token may be invalid
// 2. 401 errors are not handled
// 3. Response format is not handled
// 4. Hardcoded URL
```

### ✅ CORRECT - using apiClient

```typescript
// ✅ CORRECT
import { apiClient } from "@/lib/api";

const data = await apiClient<DataType[]>("/operations/contentzavod/endpoint");
// Everything is handled automatically!
```

---

## 🔌 Adding New API Endpoints

### ⚠️ IMPORTANT: Do not change existing endpoints!

**DO NOT CHANGE:**
- `lib/api.ts` - API client (only add new methods if needed)
- Existing endpoints in backend

### Using Existing Endpoints

```typescript
// GET request
const data = await apiClient<DataType[]>("/operations/contentzavod/endpoint");

// POST request
const result = await apiClient<ResultType>("/operations/contentzavod/endpoint", {
  method: "POST",
  body: { field1: "value1", field2: "value2" },
});

// With Telegram username header
const data = await apiClient<DataType>("/operations/contentzavod/endpoint", {
  includeTelegramUsername: true,
});
```

### Creating a New Endpoint (if needed)

**If you need to add a new endpoint, create a separate file:**

```typescript
// lib/my-feature-api.ts
import { apiClient } from "./api";

export async function getMyFeatureData(): Promise<MyDataType[]> {
  return apiClient<MyDataType[]>("/operations/contentzavod/my-feature");
}

export async function createMyFeature(data: CreateDto): Promise<MyDataType> {
  return apiClient<MyDataType>("/operations/contentzavod/my-feature/create", {
    method: "POST",
    body: data,
  });
}
```

**Then use in hooks:**

```typescript
import { getMyFeatureData, createMyFeature } from "@/lib/my-feature-api";

const data = await getMyFeatureData();
const newItem = await createMyFeature({ ... });
```

---

## 🎨 Styling and UI

### Dark Theme

**Colors:**
- Background: `#050505` to `#0f0f0f`
- Cards: `bg-white/5` to `bg-white/10`
- Text: `text-white` for main, `text-gray-400` for secondary
- Accent: `#2563eb` (blue)

### Components with Effects

```typescript
// Glass-morphism card
<div className="rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 p-4">
  {/* Content */}
</div>

// Gradient badge
<span className="bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-full text-white text-sm">
  Instagram
</span>

// Hover effect
<button className="hover:bg-white/10 transition-colors rounded-lg p-2">
  Click me
</button>
```

### Engagement/Viral Percentage Tiers

```typescript
// 0-25% - Gray
className="text-gray-400"

// 26-50% - Blue
className="text-blue-400 border-blue-400"

// 51-75% - Green with glow
className="text-green-400 border-green-400 ring-2 ring-green-400/50"

// 76-100% - Gold with animation
className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-orange-400 animate-pulse"
```

---

## 🚫 Forbidden Actions

### ❌ DO NOT DO:

1. **DO NOT change authentication mechanism:**
   - `lib/auth.ts` - all functions must remain
   - `lib/api.ts` - token addition logic must remain
   - `hooks/useAuth.ts` - all methods must remain
   - `components/auth/AuthGuard.tsx` - check logic must remain

2. **DO NOT create new authentication mechanism:**
   - DO NOT create new functions for SSO
   - DO NOT create new way to store tokens
   - DO NOT use fetch directly instead of apiClient

3. **DO NOT change localStorage keys for authentication:**
   - `contentzavod-service-token` - must remain

4. **DO NOT change authentication API endpoints:**
   - `/auth/sso/initiate`
   - `/auth/sso/exchange`
   - `/auth/check`

### ✅ DO:

1. **Create new components** for new features
2. **Create new hooks** for new logic
3. **Add new pages** in `app/` (including new authentication pages)
4. **Change design** - all styles, UI components
5. **Change structure** - reorganize folders (except authentication)
6. **Use existing hooks** for working with data
7. **Add new styles** with Tailwind CSS
8. **Create new types** in `types/` for new data
9. **Integrate authentication** into new pages through `useAuth()` and `AuthGuard`

---

## 📝 Code Examples

### Example 1: New Component Using Hook

```typescript
"use client";

import { useAuthors } from "@/hooks/useAuthors";
import { Button } from "@/components/shared/Button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";

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

  return (
    <div className="space-y-4">
      {authors.map((author) => (
        <div 
          key={author.id} 
          className="rounded-lg bg-white/5 p-4 border border-white/10"
        >
          <h3 className="text-white font-semibold">{author.full_name}</h3>
          <p className="text-gray-400">{author.username}</p>
          <Button
            onClick={() => deleteAuthor(author.id)}
            disabled={deletingAuthorId === author.id}
          >
            {deletingAuthorId === author.id ? "Deleting..." : "Delete"}
          </Button>
        </div>
      ))}
    </div>
  );
}
```

### Example 2: New Hook for New Feature

```typescript
"use client";

import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api";

interface UseMyNewFeatureReturn {
  data: MyDataType | null;
  loading: boolean;
  error: string | null;
  fetchData: (id: number) => Promise<void>;
  updateData: (id: number, data: UpdateDto) => Promise<boolean>;
}

export function useMyNewFeature(): UseMyNewFeatureReturn {
  const [data, setData] = useState<MyDataType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient<MyDataType>(`/operations/contentzavod/my-feature/${id}`);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateData = useCallback(async (id: number, updateDto: UpdateDto): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await apiClient<MyDataType>(`/operations/contentzavod/my-feature/${id}`, {
        method: "PUT",
        body: updateDto,
      });
      await fetchData(id); // Update data
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update data");
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    fetchData,
    updateData,
  };
}
```

### Example 3: Working with localStorage

```typescript
"use client";

import { useState, useEffect } from "react";

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

### Example 4: Using EditWithAIDialog

```typescript
"use client";

import { useState } from "react";
import { EditWithAIDialog } from "@/components/shared/EditWithAIDialog";
import { Button } from "@/components/shared/Button";

export function EditableText({ initialText }: { initialText: string }) {
  const [text, setText] = useState(initialText);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div>
      <textarea 
        value={text} 
        onChange={(e) => setText(e.target.value)}
        className="w-full p-4 bg-white/5 rounded-lg text-white"
      />
      <Button onClick={() => setIsDialogOpen(true)}>
        Edit with AI
      </Button>
      
      <EditWithAIDialog
        text={text}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={(edited) => {
          setText(edited);
          setIsDialogOpen(false);
        }}
      />
    </div>
  );
}
```

---

## 🔍 API Endpoints Reference

### Instagram

```typescript
// Get authors
GET /operations/contentzavod/authors

// Add author
POST /operations/contentzavod/authors/add
Body: { url: string }

// Delete author
POST /operations/contentzavod/authors/delete
Body: { id: number }

// Get videos
GET /operations/contentzavod/videos

// Transcribe video
POST /operations/contentzavod/videos/transcribe
Body: { videoUrl: string }

// Make text unique
POST /operations/contentzavod/videos/unique
Body: { text: string }

// Start video generation (async)
POST /operations/contentzavod/videos/generate/start
Body: { type: "veo3" | "sora" | "avatar", videoId: string, text: string, orientation: "9:16" | "16:9" }

// Check generation status
GET /operations/contentzavod/videos/generate/status?jobId=xxx
```

### Telegram

```typescript
// Get channels (requires X-Telegram-Username header)
GET /operations/contentzavod/telegram/channels
Headers: { "X-Telegram-Username": string }

// Delete channel
POST /operations/contentzavod/telegram/channels/delete
Body: { id: number }

// Get posts (requires X-Telegram-Username header)
GET /operations/contentzavod/telegram/posts
Headers: { "X-Telegram-Username": string }

// Make text unique
POST /operations/contentzavod/telegram/posts/unique
Body: { text: string }
```

### Shared

```typescript
// Edit text with AI
POST /operations/contentzavod/edit-with-ai
Body: { text: string, prompt: string }

// Get user profile
GET /operations/profile

// Get dashboard statistics
GET /operations/contentzavod/dashboard
```

---

## 📚 Useful Links

- **README.md** - Full project documentation
- **types/** - All TypeScript types
- **components/shared/** - Shared components
- **hooks/** - All hooks for working with data

---

## ✅ Checklist for New Features

Before adding a new feature, check:

- [ ] Existing hooks are used where possible
- [ ] New types created in `types/` if needed
- [ ] Components styled with dark theme
- [ ] All errors handled
- [ ] Loading states added
- [ ] Shared components used (Button, LoadingSpinner, etc.)
- [ ] Authentication logic is NOT changed
- [ ] Existing API endpoints are NOT changed
- [ ] LocalStorage is used correctly (if needed)

---

**Created for AI agents working with Content Zavod project**
