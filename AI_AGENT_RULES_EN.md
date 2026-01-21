# Rules for AI Agent - Content Zavod

> Short list of rules that MUST be followed

## 🎯 Main Rule

**This project can be cloned and transformed into a different site with new design, pages, and functionality. BUT the authentication mechanism and API communication must remain unchanged.**

## ✅ WHAT CAN BE CHANGED

- ✅ **Design** - all styles, UI components, themes
- ✅ **Pages** - create new, delete old, change structure
- ✅ **Functionality** - add new features, change business logic
- ✅ **Components** - create new, modify existing (except authentication)
- ✅ **Hooks** - create new hooks for new features
- ✅ **Project structure** - reorganize folders (except authentication)

## 🚫 WHAT CANNOT BE CHANGED

### ❌ Authentication mechanism (MUST BE PRESERVED):

1. **`lib/auth.ts`** - SSO authentication logic
   - `getServiceToken()` - get token
   - `setServiceToken()` - save token
   - `clearServiceToken()` - clear token
   - `isAuthenticated()` - check authentication
   - `initiateSSO()` - initiate SSO
   - `handleSSOCallback()` - handle SSO callback

2. **`lib/api.ts`** - API client
   - `apiClient()` - main method for API requests
   - Automatic token addition to requests
   - 401 error handling

3. **`hooks/useAuth.ts`** - Authentication hook
   - All hook methods must remain

4. **`components/auth/AuthGuard.tsx`** - Route protection
   - Authentication check logic

5. **`app/(auth)/sso-callback/page.tsx`** - SSO callback page
   - Callback handling logic must remain

### ❌ DO NOT change:

- **localStorage structure for authentication:**
  - Key `contentzavod-service-token` - must remain
- **Authentication API endpoints:**
  - `/auth/sso/initiate`
  - `/auth/sso/exchange`
  - `/auth/check`
- **Token handling mechanism** - automatic addition to requests

## ✅ ALLOWED

### ✅ Create:

- New components in `components/`
- New hooks in `hooks/`
- New pages in `app/` (including new authentication pages)
- New types in `types/`
- New styles with Tailwind CSS
- Completely new design and site structure

### ✅ Use:

- Existing hooks (`useAuthors`, `useVideos`, `useEditWithAI`, etc.)
- Shared components (`Button`, `LoadingSpinner`, `ErrorMessage`, etc.)
- **API client (`apiClient` from `lib/api.ts`)** - REQUIRED for all backend requests
- Methods from hooks for working with localStorage

### ⚠️ Backend communication:

- **ALWAYS use `apiClient`** for all backend requests
- **DO NOT use `fetch` directly** - apiClient automatically adds token and handles errors
- **apiClient automatically:**
  - Adds authentication token
  - Forms correct backend URL
  - Handles 401 errors
  - Handles response format
- **Authentication mechanism** - must be integrated into new pages

## 🔧 AUTHENTICATION INTEGRATION IN NEW PAGES

### If creating a new authentication page:

**MUST use existing authentication functions:**

```typescript
// ✅ CORRECT - use existing functions
import { useAuth } from "@/hooks/useAuth";
import { initiateSSO } from "@/lib/auth";

function MyNewLoginPage() {
  const { isAuthenticated, initiateSSO } = useAuth();
  
  const handleLogin = () => {
    initiateSSO(); // Use existing function
  };
  
  // Your new design
  return <div>...</div>;
}
```

```typescript
// ❌ INCORRECT - creating new mechanism
function MyNewLoginPage() {
  const handleLogin = () => {
    // DO NOT create new authentication mechanism!
    // Use initiateSSO() from lib/auth.ts
  };
}
```

### If creating a new protected route:

**MUST use AuthGuard:**

```typescript
// ✅ CORRECT - use AuthGuard
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function MyNewPage() {
  return (
    <AuthGuard>
      {/* Your content */}
    </AuthGuard>
  );
}
```

### If creating a new API request:

**MUST use apiClient:**

```typescript
// ✅ CORRECT - use apiClient
import { apiClient } from "@/lib/api";

const data = await apiClient<Type[]>("/operations/contentzavod/endpoint");
// Token will be added automatically
```

## 📋 Mandatory Rules

1. **Always integrate authentication** into new pages through `useAuth()` and `AuthGuard`
2. **Always use `apiClient`** for all backend requests (NOT fetch directly!)
3. **Always use `"use client"`** for client components
4. **Always handle errors** and set error state
5. **Always set loading states** for async operations
6. **Use `useCallback`** for functions in hooks
7. **Type all props** and variables
8. **DO NOT create new authentication mechanism** - use existing one

## 🎯 Quick Checklist

Before adding a new feature:

- [ ] **Authentication integrated** through `useAuth()` or `AuthGuard`
- [ ] **All API requests** use `apiClient` (NOT fetch directly!)
- [ ] **Errors handled** from API (try/catch)
- [ ] Checked if existing hooks can be used
- [ ] Created new types (if needed)
- [ ] Components styled
- [ ] All errors handled
- [ ] Loading states added
- [ ] Shared components used
- [ ] **NO new authentication mechanism created**
- [ ] **Authentication files NOT changed** (`lib/auth.ts`, `lib/api.ts`, `hooks/useAuth.ts`)

## 📚 Detailed Documentation

- **[AI_AGENT_GUIDE_EN.md](./AI_AGENT_GUIDE_EN.md)** - Full guide (English)
- **[AI_AGENT_QUICK_REFERENCE_EN.md](./AI_AGENT_QUICK_REFERENCE_EN.md)** - Quick reference (English)
- **[AI_AGENT_CODE_EXAMPLES_EN.md](./AI_AGENT_CODE_EXAMPLES_EN.md)** - Code examples (English)
- **[AI_AGENT_GUIDE.md](./AI_AGENT_GUIDE.md)** - Full guide (Ukrainian)
- **[AI_AGENT_QUICK_REFERENCE.md](./AI_AGENT_QUICK_REFERENCE.md)** - Quick reference (Ukrainian)
- **[AI_AGENT_CODE_EXAMPLES.md](./AI_AGENT_CODE_EXAMPLES.md)** - Code examples (Ukrainian)

---

**Always refer to full documentation before starting work!**
