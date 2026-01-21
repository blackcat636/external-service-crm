# Швидкий довідник для AI Агента - Content Zavod

> Коротка інструкція для швидкого початку роботи

## 🎯 Головне правило

**Проєкт може бути клонований і змінений (дизайн, сторінки, функціонал), але механізм авторизації має залишатися незмінним!**

## 🚀 Швидкий старт

### Основні правила

1. **НЕ змінюйте** `lib/auth.ts`, `lib/api.ts`, `hooks/useAuth.ts`, `components/auth/AuthGuard.tsx`
2. **Інтегруйте авторизацію** в нові сторінки через `useAuth()` та `AuthGuard`
3. **Використовуйте існуючі хуки** для роботи з даними
4. **Створюйте нові компоненти** в `components/`
5. **Використовуйте Tailwind CSS** для стилізації

## 📦 Основні хуки

```typescript
// Авторизація
const { isAuthenticated, isLoading } = useAuth();

// Автори Instagram
const { authors, addAuthor, deleteAuthor, loading } = useAuthors();

// Відео Instagram
const { videos, transcribeVideo, uniqueText, getLocalData } = useVideos();

// Редагування з AI
const { editWithAI, isEditing } = useEditWithAI();

// Telegram канали
const { channels, deleteChannel } = useTelegramChannels();

// Telegram пости
const { posts, uniqueText, getLocalData } = useTelegramPosts();
```

## 🔐 Авторизація

### Нова сторінка логіну

```typescript
import { useAuth } from "@/hooks/useAuth";

const { initiateSSO } = useAuth();
const handleLogin = () => initiateSSO(); // ✅ Використовуємо існуючу функцію
```

### Захищений маршрут

```typescript
import { AuthGuard } from "@/components/auth/AuthGuard";

<AuthGuard>
  {/* Ваш контент */}
</AuthGuard>
```

### Перевірка авторизації

```typescript
import { useAuth } from "@/hooks/useAuth";

const { isAuthenticated, isLoading } = useAuth();
```

## 🔌 Спілкування з бекендом

### ⚠️ ВАЖЛИВО: Завжди використовуйте apiClient!

**apiClient автоматично:**
- Додає токен авторизації
- Формує правильний URL бекенду
- Обробляє помилки (401, тощо)
- Обробляє формат відповідей

```typescript
import { apiClient } from "@/lib/api";

// GET (токен додасться автоматично)
const data = await apiClient<Type[]>("/operations/contentzavod/endpoint");

// POST
const result = await apiClient<Type>("/operations/contentzavod/endpoint", {
  method: "POST",
  body: { field: "value" },
});

// З Telegram username header
const data = await apiClient<Type>("/operations/contentzavod/endpoint", {
  includeTelegramUsername: true,
});

// Обробка помилок
try {
  const data = await apiClient<Type[]>("/operations/contentzavod/endpoint");
} catch (error) {
  if (error instanceof Error) {
    console.error("API Error:", error.message);
  }
}
```

### ❌ НЕ використовуйте fetch напряму!

```typescript
// ❌ НЕПРАВИЛЬНО
const response = await fetch("http://localhost:3001/endpoint", {
  headers: { "Authorization": `Bearer ${token}` }
});

// ✅ ПРАВИЛЬНО
const data = await apiClient<Type[]>("/operations/contentzavod/endpoint");
```

## 🧩 Компоненти

```typescript
// Спільні компоненти
import { Button } from "@/components/shared/Button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { EmptyState } from "@/components/shared/EmptyState";
import { EditWithAIDialog } from "@/components/shared/EditWithAIDialog";
```

## 💾 LocalStorage

```typescript
// НЕ використовуйте localStorage напряму!
// Використовуйте методи з хуків:

// Для відео
const { getLocalData, updateLocalData } = useVideos();
const data = getLocalData(videoId);
updateLocalData(videoId, { transcribed_text: "..." });

// Для Telegram постів
const { getLocalData, updateLocalData } = useTelegramPosts();
const data = getLocalData(postId);
updateLocalData(postId, { unique_text: "..." });
```

## 🎨 Стилізація

```typescript
// Темна тема
className="bg-white/5 rounded-lg p-4 border border-white/10 text-white"

// Градієнти платформ
className="bg-gradient-to-r from-purple-500 to-pink-500"  // Instagram
className="bg-gradient-to-r from-blue-500 to-cyan-500"  // Telegram
className="bg-gradient-to-r from-red-500 to-orange-500"  // YouTube
```

## 📝 Шаблон компонента

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

## 📝 Шаблон хука

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

## 🚫 Заборонено

- ❌ Змінювати `lib/auth.ts`, `lib/api.ts`, `hooks/useAuth.ts`, `components/auth/AuthGuard.tsx`
- ❌ Створювати новий механізм авторизації
- ❌ Використовувати `fetch` напряму замість `apiClient`
- ❌ Змінювати ключ localStorage `contentzavod-service-token`
- ❌ Використовувати localStorage напряму (використовуйте методи з хуків)

## ✅ Дозволено

- ✅ Створювати нові компоненти
- ✅ Створювати нові хуки
- ✅ Додавати нові сторінки (включаючи нові сторінки авторизації)
- ✅ Змінювати весь дизайн та UI
- ✅ Додавати нові стилі
- ✅ Створювати нові типи
- ✅ Інтегрувати авторизацію в нові сторінки через `useAuth()` та `AuthGuard`

## 📚 Повна документація

Дивіться `AI_AGENT_GUIDE.md` для детальної інформації.
