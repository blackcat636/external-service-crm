// Telegram Channel (equivalent to Instagram Author)
export interface TelegramChannel {
  id: number;
  chat_id: string; // Hidden from UI
  username: string; // Hidden from UI
  title: string; // Displayed
  createdAt: string;
  updatedAt: string;
}

// Telegram Post (equivalent to Instagram Video)
export interface TelegramPost {
  id: number;
  chat_id: string;
  caption: string;
  media_id: string;
  media: string; // JSON string of image URLs - needs parsing
  channel_name: string;
  createdAt: string;
  updatedAt: string;
}

// LocalStorage data for Telegram posts
export interface TelegramPostLocalData {
  unique_text?: string;
  original_caption?: string;
}
