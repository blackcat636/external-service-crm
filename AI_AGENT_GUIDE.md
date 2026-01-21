# Інструкція для AI Агента - Content Zavod

> **Важливо**: Ця інструкція призначена для AI агентів (нейронок), які допомагають програмістам працювати з проєктом. Вона містить правила та приклади для безпечної роботи з кодом.

## 🎯 Головне правило проєкту

**Цей проєкт може бути клонований і перетворений на повністю інший сайт з новим дизайном, сторінками та функціоналом. АЛЕ механізм авторизації та спілкування з API має залишатися незмінним.**

### Що можна змінювати:
- ✅ Весь дизайн та UI
- ✅ Всі сторінки (створювати нові, видаляти старі)
- ✅ Весь функціонал (додавати нові можливості)
- ✅ Структуру проєкту (реорганізувати папки)

### Що має залишатися:
- ❌ **Механізм авторизації** (`lib/auth.ts`, `hooks/useAuth.ts`, `components/auth/AuthGuard.tsx`)
- ❌ **API клієнт** (`lib/api.ts` - автоматичне додавання токену)
- ❌ **SSO callback сторінка** (`app/(auth)/sso-callback/page.tsx` - логіка обробки)

### Якщо створюєте нову сторінку авторизації:
**ОБОВ'ЯЗКОВО інтегруйте існуючий механізм авторизації!** Дивіться розділ [Інтеграція авторизації в нові сторінки](#інтеграція-авторизації-в-нові-сторінки).

## 📋 Зміст

1. [Архітектура проєкту](#архітектура-проєкту)
2. [Авторизація та API](#авторизація-та-api)
3. [Інтеграція авторизації в нові сторінки](#інтеграція-авторизації-в-нові-сторінки)
4. [Спілкування з бекендом](#спілкування-з-бекендом)
5. [Основні хуки та їх використання](#основні-хуки-та-їх-використання)
6. [Робота з даними](#робота-з-даними)
7. [Створення нових компонентів](#створення-нових-компонентів)
8. [Створення нових хуків](#створення-нових-хуків)
9. [Додавання нових API ендпоінтів](#додавання-нових-api-ендпоінтів)
10. [Стилізація та UI](#стилізація-та-ui)
11. [Заборонені дії](#заборонені-дії)
12. [Приклади коду](#приклади-коду)

---

## 🏗️ Архітектура проєкту

### Структура папок

```
contentzavod/
├── app/                    # Next.js App Router (сторінки)
│   ├── (auth)/            # Авторизація
│   └── (dashboard)/       # Основні сторінки додатку
├── components/            # React компоненти
│   ├── auth/             # Компоненти авторизації
│   ├── layout/            # Layout компоненти (Sidebar, NavLink)
│   ├── shared/            # Спільні компоненти (Button, LoadingSpinner)
│   ├── authors/           # Компоненти для авторів
│   ├── tracking/          # Компоненти для відео
│   └── telegram/          # Компоненти для Telegram
├── hooks/                 # Custom React хуки
├── lib/                   # Утиліти та API клієнт
│   ├── api.ts            # API клієнт (apiClient)
│   ├── auth.ts           # Авторизація (SSO)
│   └── utils.ts          # Утиліти
└── types/                 # TypeScript типи
```

### Технології

- **Frontend**: Next.js 18 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Backend**: Зовнішній NestJS сервіс (`crm_external_service`)
- **Авторизація**: SSO через основний CRM сервер
- **Зберігання**: localStorage для локальних даних

---

## 🔐 Авторизація та API

### ⚠️ ВАЖЛИВО: Не змінювати логіку авторизації!

**НЕ ВИДАЛЯЙТЕ та НЕ ЗМІНЮЙТЕ:**
- `lib/auth.ts` - логіка SSO авторизації
- `lib/api.ts` - API клієнт
- `hooks/useAuth.ts` - хук авторизації
- `components/auth/AuthGuard.tsx` - захист маршрутів

### Як працює авторизація

1. **Токен зберігається в localStorage** під ключем `contentzavod-service-token`
2. **API клієнт автоматично додає токен** до всіх запитів
3. **При 401 помилці** - автоматичне перенаправлення на SSO

### Використання API клієнта

```typescript
import { apiClient } from "@/lib/api";

// GET запит
const authors = await apiClient<Author[]>("/operations/contentzavod/authors");

// POST запит
const newAuthor = await apiClient<Author>("/operations/contentzavod/authors/add", {
  method: "POST",
  body: { url: "https://instagram.com/..." },
});

// POST з Telegram username (додає X-Telegram-Username header)
const channels = await apiClient<TelegramChannel[]>(
  "/operations/contentzavod/telegram/channels",
  {
    includeTelegramUsername: true,
  }
);
```

### Перевірка авторизації

```typescript
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <div>Please login</div>;
  
  // Ваш код
}
```

---

## 🔗 Інтеграція авторизації в нові сторінки

### ⚠️ КРИТИЧНО ВАЖЛИВО

Якщо ви створюєте **нову сторінку авторизації** або **новий захищений маршрут**, ви **ОБОВ'ЯЗКОВО** маєте інтегрувати існуючий механізм авторизації. **НЕ створюйте новий механізм!**

### Створення нової сторінки авторизації

Якщо ви хочете створити нову сторінку логіну з іншим дизайном, використовуйте існуючі функції:

```typescript
"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MyNewLoginPage() {
  const { isAuthenticated, isLoading, initiateSSO } = useAuth();
  const router = useRouter();

  // Якщо вже авторизований - перенаправляємо
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogin = () => {
    // ✅ ПРАВИЛЬНО - використовуємо існуючу функцію
    initiateSSO();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <div>Redirecting...</div>;
  }

  // Ваш новий дизайн сторінки авторизації
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

**❌ НЕПРАВИЛЬНО - створення нового механізму:**

```typescript
// ❌ НЕ РОБІТЬ ТАК!
export default function MyNewLoginPage() {
  const handleLogin = async () => {
    // НЕ створюйте новий механізм авторизації!
    const response = await fetch("/api/my-auth", { ... });
    // Це порушить інтеграцію з основним сервером!
  };
}
```

### Створення нового захищеного маршруту

Якщо ви хочете захистити нову сторінку, використовуйте `AuthGuard`:

```typescript
"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";

export default function MyNewProtectedPage() {
  return (
    <AuthGuard>
      {/* ✅ ПРАВИЛЬНО - використовуємо AuthGuard */}
      <div>
        <h1>My Protected Content</h1>
        {/* Ваш контент */}
      </div>
    </AuthGuard>
  );
}
```

**Альтернатива - перевірка в компоненті:**

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
    return null; // Redirect вже виконано
  }

  return (
    <div>
      <h1>My Protected Content</h1>
      {/* Ваш контент */}
    </div>
  );
}
```

### Створення нового API запиту

**ЗАВЖДИ використовуйте `apiClient`** - він автоматично додасть токен:

```typescript
import { apiClient } from "@/lib/api";

// ✅ ПРАВИЛЬНО - токен додасться автоматично
const data = await apiClient<MyType[]>("/operations/contentzavod/my-endpoint");
```

**❌ НЕПРАВИЛЬНО - використання fetch напряму:**

```typescript
// ❌ НЕ РОБІТЬ ТАК!
const response = await fetch("/api/endpoint", {
  headers: {
    Authorization: `Bearer ${token}`, // НЕ додавайте токен вручну!
  },
});
```

### Створення нового SSO callback (якщо потрібно)

Якщо ви хочете змінити дизайн сторінки callback, збережіть логіку:

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
        // ✅ ПРАВИЛЬНО - використовуємо існуючу функцію
        await handleSSOCallback(code);
        // Redirect відбувається автоматично в handleSSOCallback
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

### Чеклист інтеграції авторизації

Перед створенням нової сторінки авторизації або захищеного маршруту:

- [ ] Використано `useAuth()` для перевірки авторизації
- [ ] Використано `initiateSSO()` для ініціації логіну (не створено новий механізм)
- [ ] Використано `AuthGuard` для захисту маршрутів (або перевірка в компоненті)
- [ ] Використано `apiClient` для API запитів (не fetch напряму)
- [ ] НЕ змінено файли авторизації (`lib/auth.ts`, `lib/api.ts`, `hooks/useAuth.ts`)
- [ ] НЕ створено новий механізм збереження токенів
- [ ] НЕ змінено ключ localStorage для токену (`contentzavod-service-token`)

---

## 🎣 Основні хуки та їх використання

### useAuth - Авторизація

```typescript
import { useAuth } from "@/hooks/useAuth";

const { 
  token,              // string | null - токен
  isLoading,          // boolean - завантаження
  isAuthenticated,    // boolean - чи авторизований
  initiateSSO,        // () => void - ініціювати SSO
  logout,             // () => void - вийти
} = useAuth();
```

**Використання:**
- Перевірка авторизації
- Вихід з системи
- **НЕ викликайте `initiateSSO()` вручну** - це робить AuthGuard

### useAuthors - Автори Instagram

```typescript
import { useAuthors } from "@/hooks/useAuthors";

const {
  authors,              // Author[] - список авторів
  loading,              // boolean - завантаження
  error,                // string | null - помилка
  addAuthor,            // (url: string) => Promise<boolean>
  refreshAuthor,        // (authorId: number) => Promise<boolean>
  deleteAuthor,         // (authorId: number) => Promise<boolean>
  refetch,              // () => Promise<void>
  addingAuthor,         // boolean - додавання в процесі
  refreshingAuthorId,   // number | null - ID автора, який оновлюється
  deletingAuthorId,     // number | null - ID автора, який видаляється
} = useAuthors();
```

**Приклад використання:**
```typescript
function AuthorsPage() {
  const { authors, addAuthor, loading, addingAuthor } = useAuthors();
  
  const handleAdd = async (url: string) => {
    const success = await addAuthor(url);
    if (success) {
      // Автор додано, список оновиться автоматично
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

### useVideos - Відео Instagram

```typescript
import { useVideos } from "@/hooks/useVideos";

const {
  videos,                // Video[] - список відео
  localData,             // Record<string, VideoLocalData> - локальні дані
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

**Приклад використання:**
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
    // Текст збережено в localStorage автоматично
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

### useEditWithAI - Редагування тексту з AI

```typescript
import { useEditWithAI } from "@/hooks/useEditWithAI";

const {
  editWithAI,    // (text: string, prompt: string) => Promise<string | null>
  isEditing,     // boolean
  error,         // string | null
} = useEditWithAI();
```

**Приклад використання:**
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
        placeholder="Опишіть, як змінити текст..."
      />
      <button onClick={handleEdit} disabled={isEditing}>
        {isEditing ? "Editing..." : "Edit with AI"}
      </button>
    </div>
  );
}
```

### useTelegramChannels - Канали Telegram

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

### useTelegramPosts - Пости Telegram

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

## 💾 Робота з даними

### LocalStorage

**ВАЖЛИВО**: Деякі дані зберігаються в localStorage, а не в базі даних!

#### Ключі localStorage:

```typescript
// Токен авторизації
"contentzavod-service-token"

// Telegram username
"telegram-username"

// Дані відео (транскрипції, унікальний текст, згенеровані відео)
"video_local_data"  // { [videoId]: VideoLocalData }

// Дані постів Telegram (унікальний текст)
"telegram_post_local_data"  // { [postId]: TelegramPostLocalData }

// Стан sidebar (розгорнуті секції)
"sidebar_expanded_sections"
```

#### Робота з video_local_data

```typescript
// НЕ використовуйте localStorage напряму!
// Використовуйте методи з useVideos:

const { getLocalData, updateLocalData } = useVideos();

// Отримати дані
const localData = getLocalData(videoId);
const transcribedText = localData.transcribed_text;
const uniqueText = localData.unique_text;

// Оновити дані
updateLocalData(videoId, {
  transcribed_text: "New transcription",
  unique_text: "New unique text",
});
```

#### Робота з telegram_post_local_data

```typescript
// Використовуйте методи з useTelegramPosts:

const { getLocalData, updateLocalData } = useTelegramPosts();

// Отримати дані
const localData = getLocalData(postId);
const uniqueText = localData.unique_text;

// Оновити дані
updateLocalData(postId, {
  unique_text: "New unique text",
});
```

---

## 🧩 Створення нових компонентів

### Структура компонента

```typescript
"use client"; // Обов'язково для клієнтських компонентів

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface MyComponentProps {
  // Типізуйте всі props
  title: string;
  onAction?: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    try {
      // Ваша логіка
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

### Використання спільних компонентів

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

### Стилізація компонентів

**Використовуйте Tailwind CSS з темною темою:**

```typescript
// Основні класи для темної теми
className="bg-white/5"           // Напівпрозорий білий фон
className="bg-white/10"           // Трохи світліший
className="rounded-lg"            // Закруглені кути
className="p-4"                   // Padding
className="text-white"            // Білий текст
className="text-gray-400"         // Сірий текст
className="border border-white/10" // Тонка рамка

// Градієнти для платформ
className="bg-gradient-to-r from-purple-500 to-pink-500"  // Instagram
className="bg-gradient-to-r from-blue-500 to-cyan-500"    // Telegram
className="bg-gradient-to-r from-red-500 to-orange-500"   // YouTube
```

---

## 🎣 Створення нових хуків

### Шаблон хука

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
      await fetchData(); // Оновити список
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

### Правила створення хуків

1. **Завжди використовуйте `useCallback`** для функцій
2. **Завжди обробляйте помилки** та встановлюйте `error` state
3. **Встановлюйте loading стани** для кожного асинхронного дії
4. **Оновлюйте дані після створення/оновлення** (через `fetchData` або оновлення state)
5. **Повертайте boolean** для операцій створення/оновлення/видалення

---

## 🔌 Спілкування з бекендом

### ⚠️ КРИТИЧНО ВАЖЛИВО: Завжди використовуйте apiClient!

**НЕ використовуйте `fetch` напряму!** Використовуйте `apiClient` - він автоматично:
- Додає токен авторизації до всіх запитів
- Обробляє помилки (401, тощо)
- Форматує URL бекенду
- Обробляє формат відповідей

### Як працює apiClient

**`apiClient` з `lib/api.ts` - це єдиний спосіб спілкування з бекендом:**

1. **Автоматично додає токен:**
   ```typescript
   // apiClient автоматично додає:
   headers: {
     "Authorization": "Bearer <service-token>",
     "Content-Type": "application/json"
   }
   ```

2. **Автоматично формує URL:**
   ```typescript
   // Якщо endpoint = "/operations/contentzavod/authors"
   // apiClient створить: "http://localhost:3001/operations/contentzavod/authors"
   // Базовий URL береться з NEXT_PUBLIC_EXTERNAL_SERVICE_BACKEND_URL
   ```

3. **Автоматично обробляє помилки:**
   - При 401 - кидає помилку "Authentication required"
   - При інших помилках - витягує message з відповіді

4. **Автоматично обробляє формат відповідей:**
   ```typescript
   // Підтримує два формати:
   // 1. { status: 200, data: {...}, message: "..." }
   // 2. { success: true, data: {...} }
   // apiClient автоматично витягне data
   ```

### URL бекенду

**Бекенд URL налаштовується через змінну оточення:**
```env
NEXT_PUBLIC_EXTERNAL_SERVICE_BACKEND_URL=http://localhost:3001
```

**apiClient автоматично використовує цей URL для всіх запитів.**

### Формат запитів

```typescript
import { apiClient } from "@/lib/api";

// GET запит
const data = await apiClient<DataType[]>("/operations/contentzavod/endpoint");

// POST запит
const result = await apiClient<ResultType>("/operations/contentzavod/endpoint", {
  method: "POST",
  body: { field1: "value1", field2: "value2" },
});

// PUT запит
const updated = await apiClient<ResultType>("/operations/contentzavod/endpoint/123", {
  method: "PUT",
  body: { field1: "newValue" },
});

// DELETE запит (через POST, як у проєкті)
const deleted = await apiClient("/operations/contentzavod/endpoint/delete", {
  method: "POST",
  body: { id: 123 },
});
```

### Спеціальні заголовки

**Telegram username header:**
```typescript
// Для запитів, які потребують Telegram username
const channels = await apiClient<TelegramChannel[]>(
  "/operations/contentzavod/telegram/channels",
  {
    includeTelegramUsername: true, // Додасть X-Telegram-Username header
  }
);
```

**Кастомні заголовки:**
```typescript
const data = await apiClient<DataType>("/operations/contentzavod/endpoint", {
  headers: {
    "X-Custom-Header": "value",
  },
});
```

### Обробка помилок

```typescript
import { apiClient } from "@/lib/api";

try {
  const data = await apiClient<DataType[]>("/operations/contentzavod/endpoint");
  // Успіх
} catch (error) {
  if (error instanceof Error) {
    if (error.message === "Not authenticated") {
      // Токен відсутній - користувач не авторизований
      // AuthGuard або login page оброблять це
    } else if (error.message === "Authentication required") {
      // 401 помилка - токен недійсний
      // apiClient вже обробив це
    } else {
      // Інша помилка
      console.error("API Error:", error.message);
      // Показати помилку користувачу
    }
  }
}
```

### Формат відповідей від бекенду

**Бекенд може повертати два формати:**

1. **Новий формат (рекомендований):**
```json
{
  "status": 200,
  "data": { ... },
  "message": "Success"
}
```

2. **Старий формат (для сумісності):**
```json
{
  "success": true,
  "data": { ... }
}
```

**apiClient автоматично витягне `data` з обох форматів.**

### ❌ НЕПРАВИЛЬНО - використання fetch напряму

```typescript
// ❌ НЕ РОБІТЬ ТАК!
const response = await fetch("http://localhost:3001/operations/contentzavod/endpoint", {
  headers: {
    "Authorization": `Bearer ${token}`, // НЕ додавайте токен вручну!
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ ... }),
});

// Проблеми:
// 1. Токен може бути недійсним
// 2. Не обробляються 401 помилки
// 3. Не обробляється формат відповідей
// 4. Hardcoded URL
```

### ✅ ПРАВИЛЬНО - використання apiClient

```typescript
// ✅ ПРАВИЛЬНО
import { apiClient } from "@/lib/api";

const data = await apiClient<DataType[]>("/operations/contentzavod/endpoint");
// Все обробляється автоматично!
```

---

## 🔌 Додавання нових API ендпоінтів

### ⚠️ ВАЖЛИВО: Не змінювати існуючі ендпоінти!

**НЕ ЗМІНЮЙТЕ:**
- `lib/api.ts` - API клієнт (тільки додавайте нові методи, якщо потрібно)
- Існуючі ендпоінти в бекенді

### Використання існуючих ендпоінтів

```typescript
// GET запит
const data = await apiClient<DataType[]>("/operations/contentzavod/endpoint");

// POST запит
const result = await apiClient<ResultType>("/operations/contentzavod/endpoint", {
  method: "POST",
  body: { field1: "value1", field2: "value2" },
});

// З Telegram username header
const data = await apiClient<DataType>("/operations/contentzavod/endpoint", {
  includeTelegramUsername: true,
});
```

### Створення нового ендпоінту (якщо потрібно)

**Якщо потрібно додати новий ендпоінт, створіть окремий файл:**

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

**Потім використовуйте в хуках:**

```typescript
import { getMyFeatureData, createMyFeature } from "@/lib/my-feature-api";

const data = await getMyFeatureData();
const newItem = await createMyFeature({ ... });
```

---

## 🎨 Стилізація та UI

### Темна тема

**Кольори:**
- Фон: `#050505` до `#0f0f0f`
- Картки: `bg-white/5` до `bg-white/10`
- Текст: `text-white` для основного, `text-gray-400` для другорядного
- Акцент: `#2563eb` (синій)

### Компоненти з ефектами

```typescript
// Glass-morphism картка
<div className="rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 p-4">
  {/* Контент */}
</div>

// Градієнтний badge
<span className="bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-full text-white text-sm">
  Instagram
</span>

// Hover ефект
<button className="hover:bg-white/10 transition-colors rounded-lg p-2">
  Click me
</button>
```

### Engagement/Viral процентні рівні

```typescript
// 0-25% - Сірий
className="text-gray-400"

// 26-50% - Синій
className="text-blue-400 border-blue-400"

// 51-75% - Зелений з світінням
className="text-green-400 border-green-400 ring-2 ring-green-400/50"

// 76-100% - Золотий з анімацією
className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-orange-400 animate-pulse"
```

---

## 🚫 Заборонені дії

### ❌ НЕ РОБІТЬ:

1. **НЕ змінюйте механізм авторизації:**
   - `lib/auth.ts` - всі функції мають залишатися
   - `lib/api.ts` - логіка додавання токену має залишатися
   - `hooks/useAuth.ts` - всі методи мають залишатися
   - `components/auth/AuthGuard.tsx` - логіка перевірки має залишатися

2. **НЕ створюйте новий механізм авторизації:**
   - НЕ створюйте нові функції для SSO
   - НЕ створюйте новий спосіб збереження токенів
   - НЕ використовуйте fetch напряму замість apiClient

3. **НЕ змінюйте ключі localStorage для авторизації:**
   - `contentzavod-service-token` - має залишатися

4. **НЕ змінюйте API ендпоінти авторизації:**
   - `/auth/sso/initiate`
   - `/auth/sso/exchange`
   - `/auth/check`

### ✅ РОБІТЬ:

1. **Створюйте нові компоненти** для нових функцій
2. **Створюйте нові хуки** для нової логіки
3. **Додавайте нові сторінки** в `app/` (включаючи нові сторінки авторизації)
4. **Змінюйте дизайн** - всі стилі, компоненти UI
5. **Змінюйте структуру** - реорганізуйте папки (крім авторизації)
6. **Використовуйте існуючі хуки** для роботи з даними
7. **Додавайте нові стилі** з Tailwind CSS
8. **Створюйте нові типи** в `types/` для нових даних
9. **Інтегруйте авторизацію** в нові сторінки через `useAuth()` та `AuthGuard`

---

## 📝 Приклади коду

### Приклад 1: Новий компонент з використанням хука

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

### Приклад 2: Новий хук для нової функції

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
      await fetchData(id); // Оновити дані
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

### Приклад 3: Робота з localStorage

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

### Приклад 4: Використання EditWithAIDialog

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

## 🔍 Довідка по API ендпоінтам

### Instagram

```typescript
// Отримати авторів
GET /operations/contentzavod/authors

// Додати автора
POST /operations/contentzavod/authors/add
Body: { url: string }

// Видалити автора
POST /operations/contentzavod/authors/delete
Body: { id: number }

// Отримати відео
GET /operations/contentzavod/videos

// Транскрибувати відео
POST /operations/contentzavod/videos/transcribe
Body: { videoUrl: string }

// Зробити текст унікальним
POST /operations/contentzavod/videos/unique
Body: { text: string }

// Почати генерацію відео (async)
POST /operations/contentzavod/videos/generate/start
Body: { type: "veo3" | "sora" | "avatar", videoId: string, text: string, orientation: "9:16" | "16:9" }

// Перевірити статус генерації
GET /operations/contentzavod/videos/generate/status?jobId=xxx
```

### Telegram

```typescript
// Отримати канали (потрібен X-Telegram-Username header)
GET /operations/contentzavod/telegram/channels
Headers: { "X-Telegram-Username": string }

// Видалити канал
POST /operations/contentzavod/telegram/channels/delete
Body: { id: number }

// Отримати пости (потрібен X-Telegram-Username header)
GET /operations/contentzavod/telegram/posts
Headers: { "X-Telegram-Username": string }

// Зробити текст унікальним
POST /operations/contentzavod/telegram/posts/unique
Body: { text: string }
```

### Спільні

```typescript
// Редагувати текст з AI
POST /operations/contentzavod/edit-with-ai
Body: { text: string, prompt: string }

// Отримати профіль користувача
GET /operations/profile

// Отримати статистику dashboard
GET /operations/contentzavod/dashboard
```

---

## 📚 Корисні посилання

- **README.md** - Повна документація проєкту
- **types/** - Всі TypeScript типи
- **components/shared/** - Спільні компоненти
- **hooks/** - Всі хуки для роботи з даними

---

## ✅ Чеклист для нових функцій

Перед додаванням нової функції перевірте:

- [ ] Використовуються існуючі хуки, де можливо
- [ ] Створені нові типи в `types/`, якщо потрібно
- [ ] Компоненти стилізовані з темною темою
- [ ] Оброблені всі помилки
- [ ] Додано loading стани
- [ ] Використовуються спільні компоненти (Button, LoadingSpinner, тощо)
- [ ] НЕ змінюється логіка авторизації
- [ ] НЕ змінюються існуючі API ендпоінти
- [ ] LocalStorage використовується правильно (якщо потрібно)

---

**Створено для AI агентів, які працюють з проєктом Content Zavod**
