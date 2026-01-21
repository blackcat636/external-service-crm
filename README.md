# Content Zavod - Multi-Platform Performance Tracker

A web application for tracking creators and their video performance across Instagram (active), Telegram (active), and YouTube (coming soon). Built with Next.js 18, TypeScript, and Tailwind CSS. Features a modern dark theme UI with 3D void effects and custom cursor. All business logic is handled via n8n workflows.

> **🇺🇦 Ukrainian version**: [README_UA.md](./README_UA.md)

## Tech Stack

- **Frontend**: Next.js 18 (App Router), TypeScript, Tailwind CSS v4
- **UI**: Dark theme, shadcn/ui components, Three.js (3D sphere), Framer Motion
- **Backend**: External NestJS service (`crm_external_service`) with SSO integration
- **Database**: n8n Data Tables (via external backend)
- **Local Storage**: Transcription, unique text, and video generation data stored in browser localStorage
- **Authentication**: SSO through main CRM server (JWT service tokens)
- **Hosting**: Self hosted

## 📖 Developer Documentation

### For AI Agents

If you are an AI agent helping a programmer work with the project, please read:

**English:**
1. **[AI_AGENT_RULES_EN.md](./AI_AGENT_RULES_EN.md)** ⚠️ - **START HERE!** Short list of rules
2. **[AI_AGENT_GUIDE_EN.md](./AI_AGENT_GUIDE_EN.md)** - Full guide with all rules and examples
3. **[AI_AGENT_QUICK_REFERENCE_EN.md](./AI_AGENT_QUICK_REFERENCE_EN.md)** - Quick reference for quick start
4. **[AI_AGENT_CODE_EXAMPLES_EN.md](./AI_AGENT_CODE_EXAMPLES_EN.md)** - Ready-to-use code examples for copying

**Ukrainian:**
1. **[AI_AGENT_RULES.md](./AI_AGENT_RULES.md)** ⚠️ - **ПОЧНІТЬ З ЦЬОГО!** Короткий список правил
2. **[AI_AGENT_GUIDE.md](./AI_AGENT_GUIDE.md)** - Повна інструкція з усіма правилами та прикладами
3. **[AI_AGENT_QUICK_REFERENCE.md](./AI_AGENT_QUICK_REFERENCE.md)** - Швидкий довідник для швидкого початку
4. **[AI_AGENT_CODE_EXAMPLES.md](./AI_AGENT_CODE_EXAMPLES.md)** - Готові приклади коду для копіювання

> **Important**: 
> - DO NOT change authentication logic (`lib/auth.ts`, `lib/api.ts`, `hooks/useAuth.ts`)
> - Use existing hooks for working with data
> - Create new components and hooks for new features
> - Follow dark theme and project styling

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- n8n instance with webhook workflows
- External backend service (`crm_external_service`) running and configured
- Main CRM server with SSO support

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your configuration

# Start development server
npm run dev
```

### Environment Variables

`.env.local`:

```env
# Main service frontend (for SSO initiate)
NEXT_PUBLIC_EXTERNAL_SERVICE_URL=http://localhost:3000

# External service backend (for SSO exchange and API requests)
NEXT_PUBLIC_EXTERNAL_SERVICE_BACKEND_URL=http://localhost:3001
```

## Project Structure

```
contentzavod/
├── app/                          # Next.js App Router
│   ├── (auth)/login/            # Login page with 3D void effect
│   ├── (dashboard)/             # Main app with dark sidebar
│   │   ├── dashboard/           # Dashboard page (multi-platform overview)
│   │   ├── authors/             # Instagram Authors page
│   │   ├── tracking/            # Instagram Tracking page
│   │   ├── generate/[videoId]/  # Video generation page + Edit with AI
│   │   ├── telegram/            # Telegram pages (active)
│   │   │   ├── authors/         # Channels page
│   │   │   ├── tracking/        # Posts page
│   │   │   └── post/[postId]/   # Post edit page + Edit with AI
│   │   └── youtube/             # YouTube placeholder pages
│   │       ├── authors/         # Coming soon
│   │       └── tracking/        # Coming soon
│   └── (auth)/sso-callback/    # SSO callback handler
├── components/                   # React components
│   ├── auth/                    # AuthGuard
│   ├── layout/                  # Sidebar (collapsible), NavLink, UserProfile
│   ├── shared/                  # Button, LoadingSpinner, PlaceholderPage, EditWithAIDialog
│   ├── dashboard/               # StatCard
│   ├── authors/                 # AddAuthorForm, AuthorCard, AuthorList
│   ├── tracking/                # VideoCard, VideoList
│   ├── telegram/                # TelegramUsernameGuard, ChannelCard, ChannelList, PostCard, PostList
│   ├── custom-cursor.tsx        # Pointer follower effect
│   └── sentient-sphere.tsx      # 3D animated sphere (login background)
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts              # SSO auth state management
│   ├── useUserProfile.ts       # User profile fetching
│   ├── useDashboard.ts         # Dashboard data fetching
│   ├── useAuthors.ts           # Authors CRUD (add, refresh via add, delete)
│   ├── useVideos.ts            # Videos fetching + transcribe/unique (localStorage)
│   ├── useTelegramChannels.ts  # Telegram channels CRUD
│   ├── useTelegramPosts.ts     # Telegram posts + unique (localStorage)
│   └── useEditWithAI.ts        # AI text editing hook
├── lib/                         # Utilities
│   ├── utils.ts                # cn(), formatNumber, etc.
│   ├── auth.ts                 # SSO token management (localStorage)
│   ├── telegram-auth.ts        # getTelegramUsername, setTelegramUsername
│   └── api.ts                  # API client for external backend
└── types/                       # TypeScript definitions
    ├── author.ts
    ├── video.ts
    ├── telegram.ts              # TelegramChannel, TelegramPost, TelegramPostLocalData
    ├── dashboard.ts
    └── api.ts
```

## Pages

### Login (`/login`)

- Dark theme with animated 3D sphere background (SentientSphere)
- Automatic redirect to SSO authentication
- After successful SSO, redirects to dashboard
- Service token stored in localStorage

### Dashboard (`/dashboard`)

- Dark theme with glass-morphism cards
- Multi-platform overview with three platform cards:
  - **Instagram**: Active, shows tracked accounts count with purple/pink gradient
  - **YouTube**: Coming soon placeholder with red gradient
  - **Telegram**: Coming soon placeholder with blue/cyan gradient
- Stats grid: total followers, total videos, total views

### Authors (`/authors`)

- Add Instagram profile URLs
- View tracked authors with profile picture and viral percentage score
- **Sorted by viral percentage** (most viral at top)
- Visual effects based on viral_percentage (0-25% gray, 26-50% blue, 51-75% green, 76-100% gold with animations)
- Refresh individual authors (uses add author endpoint internally)
- Delete authors
- New authors appear immediately after adding (auto-refetch)

### Tracking (`/tracking`)

- View all tracked videos with video player (supports vertical 9:16 videos)
- **Sorted by engagement percentage** (most engaging at top)
- Visual effects based on engagement (same tiers as authors)
- Metrics: views (with N/A fallback for null), likes, comments
- Transcribe button: converts video audio to text, then becomes "View Transcription" button
- **No speech handling**: If transcription returns "no text in this video", shows "No speech detected" message and hides action buttons
- Make Unique button: rewrites transcription to unique version (only available after transcription), then becomes "View Unique" button
- View Transcription/Unique buttons open dialog modals to view the text
- Generate Video button: opens new page for video generation (only available after unique text)
- Transcription, unique text, and video generation data stored in localStorage (not database)

### Telegram Channels (`/telegram/authors`)

- **Telegram Username Guard**: Prompts for Telegram username on first visit (stored in localStorage)
- Instruction banner: "Invite @alexand_content_bot to a channel to start tracking"
- View tracked channels with title only (chat_id and username hidden)
- Delete button to stop tracking a channel
- Channels are added automatically when bot is invited to a channel

### Telegram Posts (`/telegram/tracking`)

- **Telegram Username Guard**: Same as channels page
- View posts from tracked channels with:
  - Image grid (supports multiple images per post)
  - Caption with "Read more" for long text
  - Channel name badge
- Make Unique button: rewrites caption to unique version
- "Edit Post" button: opens dedicated edit page (only after unique text generated)
- Unique text stored in localStorage

### Telegram Post Edit (`/telegram/post/[postId]`)

- Back button to posts page
- View original caption (collapsible)
- Editable textarea for unique text
- **Edit with AI button**: Opens dialog to provide AI instructions
- Copy and Save buttons
- Changes saved to localStorage

### YouTube Placeholder Pages

- `/youtube/authors`, `/youtube/tracking`
- Animated "To Be Continued..." message
- Gradient effects matching platform colors
- Coming soon badges

### Generate (`/generate/[videoId]`)

- Shows the unique text in an editable textarea
- **Edit with AI button**: Opens dialog to provide AI instructions for text editing
- **Orientation selector**: Choose between vertical (9:16) or horizontal (16:9) video format
- Three generation options: VEO3, SORA, Avatar
- **Async polling pattern**: Generation takes ~5 minutes, so uses job-based polling
  - Start button triggers job creation, returns immediately with job ID
  - Client polls for status every 10 seconds
  - Shows elapsed time during generation (e.g., "2:30")
  - Progress persists in localStorage - can leave and return
  - Times out after 15 minutes
- Shows "View" links for already generated videos
- Generated video URLs and pending jobs stored in localStorage

## Authentication Flow (SSO)

### How it works

1. **User opens app** → checks for service token
2. **If token missing/invalid:**
   - Frontend redirects to `{EXTERNAL_SERVICE_URL}/auth/sso/initiate` (main service frontend)
   - External backend redirects to `{MAIN_FRONTEND_URL}/sso/initiate?redirect_uri=...&service=contentzavod`
   - Main CRM frontend handles SSO login
3. **After successful login:**
   - Main CRM frontend redirects to `{CALLBACK_URL}?code={sso_code}` (to `/sso-callback`)
   - Frontend calls `POST {EXTERNAL_SERVICE_BACKEND_URL}/auth/sso/exchange` (external service backend)
   - External backend exchanges code for service token (JWT RS256) via main server
   - Service token stored in browser localStorage
4. **Subsequent requests:**
   - Service token automatically added in `Authorization: Bearer <token>` header
   - External backend validates token and processes requests

### Token Management

- **Storage**: localStorage (key: `contentzavod-service-token`)
- **Type**: JWT RS256, type `service`
- **Expiration**: 90 days
- **Auto-refresh**: On 401 error - automatic redirect to SSO

## API Endpoints (External Backend)

All endpoints are on external backend (`EXTERNAL_SERVICE_URL`). All requests require `Authorization: Bearer <service-token>` header.

### Authentication Endpoints

| Method | Endpoint                      | Description                                    |
| ------ | ----------------------------- | ---------------------------------------------- |
| GET    | `/auth/sso/initiate`          | Initiate SSO login (redirects to main frontend) |
| POST   | `/auth/sso/exchange`          | Exchange SSO code for service token            |
| GET    | `/auth/check`                 | Check authentication status                     |

### Instagram Endpoints

| Method | Endpoint                                      | Description                                    |
| ------ | --------------------------------------------- | ---------------------------------------------- |
| GET    | `/operations/contentzavod/authors`             | Get all authors for user                       |
| POST   | `/operations/contentzavod/authors/add`        | Add new author (body: `{ url }`)              |
| POST   | `/operations/contentzavod/authors/delete`      | Delete author (body: `{ id }`)                |
| GET    | `/operations/contentzavod/videos`              | Get all videos for user                        |
| POST   | `/operations/contentzavod/videos/transcribe`   | Transcribe video (body: `{ videoUrl }`)       |
| POST   | `/operations/contentzavod/videos/unique`       | Make text unique (body: `{ text }`)           |
| POST   | `/operations/contentzavod/videos/generate/start` | Start async video generation (body: `{ type, videoId, text, orientation }`) |
| GET    | `/operations/contentzavod/videos/generate/status` | Check generation status (query: `?jobId=xxx`) |
| GET    | `/operations/contentzavod/dashboard`           | Get dashboard statistics                       |

### Telegram Endpoints

| Method | Endpoint                                        | Description                                              |
| ------ | ----------------------------------------------- | -------------------------------------------------------- |
| GET    | `/operations/contentzavod/telegram/channels`    | Get all channels for user (requires X-Telegram-Username) |
| POST   | `/operations/contentzavod/telegram/channels/delete` | Delete channel (body: `{ id }`)                          |
| GET    | `/operations/contentzavod/telegram/posts`       | Get all posts for user (requires X-Telegram-Username)    |
| POST   | `/operations/contentzavod/telegram/posts/unique` | Make text unique (body: `{ text }`)                      |

### Shared Endpoints

| Method | Endpoint                              | Description                                  |
| ------ | ------------------------------------- | -------------------------------------------- |
| POST   | `/operations/contentzavod/edit-with-ai` | Edit text with AI (body: `{ text, prompt }`) |
| GET    | `/operations/profile`                 | Get user profile                             |

## n8n Webhook Contracts

### Add Author

- **Input**: `{ userLogin: string, instagramUrl: string }`
- **Output**: `Author` object
- **Note**: Also used for refreshing authors - will update existing author if URL matches

### Get Authors

- **Input**: `{ userLogin: string }`
- **Output**: `Author[]`

### Delete Author

- **Input**: `{ userLogin: string, id: number }`
- **Output**: `{ success: boolean }`

### Get Videos

- **Input**: `{ userLogin: string }`
- **Output**: `Video[]`

### Transcribe Video

- **Input**: `{ userLogin: string, videoUrl: string }`
- **Output**: `{ transcription: string }`

### Unique Text

- **Input**: `{ userLogin: string, text: string }`
- **Output**: `{ unique_text: string }`

### Generate Video (DEPRECATED - Synchronous)

- **Input**: `{ userLogin: string, type: "veo3" | "sora" | "avatar", videoId: string, text: string, orientation: "vertical" | "horizontal" }`
- **Output**: `{ link: string }`
- **Note**: Times out on Vercel. Use async endpoints below instead.

### Generate Video Start (Async)

- **Webhook**: `POST /webhook/generate-video-start-zavod`
- **Input**: `{ userLogin: string, type: "veo3" | "sora" | "avatar", videoId: string, text: string, orientation: "9:16" | "16:9" }`
- **Output**: `{ job_id: string, status: "pending" }`
- **Behavior**:
  1. Creates job in n8n Data Table with status "pending"
  2. Returns immediately with job_id
  3. Continues processing video asynchronously
  4. Updates job status to "completed" or "failed" when done

### Generate Video Status (Async)

- **Webhook**: `GET /webhook/generate-video-status-zavod?userLogin=xxx&jobId=xxx`
- **Output**: Full job record from n8n Data Table:

```json
{
  "id": 5,
  "status": "pending" | "processing" | "completed" | "failed",
  "link": null | "https://...",
  "error": null | "Error message",
  "createdAt": "2025-12-23T23:22:08.714Z",
  "updatedAt": "2025-12-23T23:25:38.823Z"
}
```

### Get Dashboard

- **Input**: `{ userLogin: string }`
- **Output**: `DashboardStats` object

### Get Telegram Channels

- **Webhook**: `GET /webhook/get-groups-telegram?username=xxx`
- **Output**: `TelegramChannel[]`

```json
[
  {
    "chat_id": "-4920897788",
    "username": "kamidummy",
    "title": "Channel Name",
    "id": 1,
    "createdAt": "2025-12-27T00:16:03.611Z",
    "updatedAt": "2025-12-27T00:16:03.611Z"
  }
]
```

### Delete Telegram Channel

- **Webhook**: `POST /webhook/delete-group-telegram`
- **Input**: `{ id: number }`
- **Output**: Deleted channel record

### Get Telegram Posts

- **Webhook**: `GET /webhook/get-the-posts?username=xxx`
- **Output**: `TelegramPost[]`

```json
[
  {
    "chat_id": "-4920897788",
    "caption": "Post text...",
    "media_id": "14134363925757842",
    "media": "[\"https://i.ibb.co/...\",\"https://i.ibb.co/...\"]",
    "channel_name": "Channel Name",
    "id": 1,
    "createdAt": "2025-12-27T00:26:23.137Z",
    "updatedAt": "2025-12-27T00:26:33.379Z"
  }
]
```

### Unique Text (Telegram)

- **Webhook**: `POST /webhook/unique-zavod-telegram`
- **Input**: `{ userLogin: string, username: string, text: string }`
- **Output**: `{ unique_text: string }`

### Edit with AI

- **Webhook**: `POST /webhook/edit-with-ai`
- **Input**: `{ userLogin: string, text: string, prompt: string }`
- **Output**: `{ text: string }`

## Data Types

### Author

```typescript
interface Author {
  id: number;
  username: string;
  full_name: string;
  profile_picture: string;
  instagram_url: string;
  followers: number;
  viral_percentage: number;
  client_id: string;
  createdAt: string;
  updatedAt: string;
}
```

### Video

```typescript
interface Video {
  id: number;
  url_instagram: string;
  video_url: string;
  profile_url: string;
  username: string;
  views: number;
  likes: number;
  comments: number;
  engagement: string; // percentage as string
  createdAt: string;
  updatedAt: string;
}

// Stored in localStorage per video ID
interface VideoLocalData {
  transcribed_text?: string;
  unique_text?: string;
  sora_video?: string;
  veo3_video?: string;
  avatar_video?: string;
}
```

### TelegramChannel

```typescript
interface TelegramChannel {
  id: number;
  chat_id: string; // Hidden from UI
  username: string; // Hidden from UI
  title: string; // Displayed
  createdAt: string;
  updatedAt: string;
}
```

### TelegramPost

```typescript
interface TelegramPost {
  id: number;
  chat_id: string;
  caption: string;
  media_id: string;
  media: string; // JSON string of image URLs - needs JSON.parse()
  channel_name: string;
  createdAt: string;
  updatedAt: string;
}

// Stored in localStorage per post ID
interface TelegramPostLocalData {
  unique_text?: string;
  original_caption?: string;
}
```

### DashboardStats

```typescript
interface DashboardStats {
  authors: string;
  followers: number;
  number_of_videos: number;
  total_views: number;
}
```

## Visual Effects

### UI Theme

- Dark background (#050505 to #0f0f0f)
- Glass-morphism cards (white/5 to white/10 backgrounds)
- Blue accent color (#2563eb)
- Monospace fonts for labels and data
- Animated 3D sphere on login page
- **Custom cursor**: Pointer follower effect with mix-blend-difference, expands on hover over interactive elements

### Sidebar Navigation

- **Collapsible platform sections**: Instagram, Telegram, YouTube
- Instagram: Authors, Tracking (active)
- Telegram: Channels, Posts (active)
- YouTube: Authors, Tracking (coming soon)
- Expand/collapse state persisted in localStorage
- Platform icons with gradient backgrounds
- "Soon" badges for upcoming platforms (YouTube only)

### Engagement/Viral Percentage Tiers

| Range   | Badge Style     | Card Style  | Effects                   |
| ------- | --------------- | ----------- | ------------------------- |
| 0-25%   | Gray            | Basic       | None                      |
| 26-50%  | Blue            | Blue border | None                      |
| 51-75%  | Green with glow | Green ring  | Glow on hover             |
| 76-100% | Gold gradient   | Orange ring | Pulse animation, sparkles |

## Development Notes

### Authentication

- SSO through main CRM server
- Service token (JWT RS256) stored in localStorage
- Automatic redirect to SSO on 401 errors
- Token automatically added to all API requests

### Refresh Author Logic

- Refresh now reuses the add author endpoint with the same Instagram URL
- n8n handles updating existing authors when the URL already exists
- No separate refresh webhook needed

### Data Flow

1. User opens app → checks for service token
2. If token missing → SSO flow
3. After SSO → service token stored in localStorage
4. Frontend makes requests to external backend with token
5. External backend validates token and calls n8n webhooks
6. n8n returns data for user
7. Frontend displays data

### Local Storage Keys

| Key                         | Purpose                                                      |
| --------------------------- | ------------------------------------------------------------ |
| `contentzavod-service-token` | Service token (JWT) for authentication                       |
| `telegram-username`         | Telegram username for API requests                           |
| `video_local_data`          | Instagram video transcription, unique text, generated videos |
| `telegram_post_local_data`  | Telegram post unique text                                    |
| `sidebar_expanded_sections` | Sidebar expansion state                                      |

### Local Storage for Video Data

- Transcription, unique text, and generated video URLs are stored in localStorage
- Key: `video_local_data`
- Structure: `{ [videoId]: VideoLocalData }`
- Data persists in browser, not synced to database

### Local Storage for Telegram Posts

- Unique text and original caption stored in localStorage
- Key: `telegram_post_local_data`
- Structure: `{ [postId]: TelegramPostLocalData }`
- Data persists in browser, not synced to database

### Styling

- Tailwind CSS v4 with custom dark theme variables
- Responsive design (mobile-first)
- Glass-morphism and blur effects
- Consistent component patterns with dark backgrounds

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Future Improvements

- [ ] Replace n8n Data Tables with Supabase
- [ ] Implement Supabase Auth
- [x] Add video transcription display
- [x] Add rewritten text management (unique text)
- [x] Delete authors
- [x] Add AI video generation trigger (VEO3, SORA, Avatar webhook integration)
- [x] Video orientation selector (vertical/horizontal)
- [x] Modern dark theme UI redesign
- [x] Custom cursor / pointer follower effect
- [x] Multi-platform sidebar (Instagram, YouTube, Telegram)
- [x] YouTube and Telegram placeholder pages
- [x] Authors sorted by viral percentage
- [x] Videos sorted by engagement
- [x] "No speech detected" handling for videos without audio
- [x] Auto-refetch after adding new author
- [ ] YouTube integration (API + tracking)
- [x] Telegram integration (API + tracking)
- [x] Telegram channels management (view, delete)
- [x] Telegram posts tracking with image grids
- [x] Edit with AI feature (Instagram + Telegram)
- [x] Webhook security headers (X-N8N-Secret)
- [ ] Implement filtering and search
- [ ] Add pagination
- [ ] Create analytics charts
- [ ] Team accounts support
