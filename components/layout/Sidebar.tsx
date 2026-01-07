"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, Users, Video, ChevronDown, Instagram } from "lucide-react";
import { NavLink } from "./NavLink";
import { UserProfile } from "./UserProfile";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {}

// Custom YouTube Icon
function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

// Custom Telegram Icon
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

const STORAGE_KEY = "sidebar_expanded_sections";

interface PlatformSection {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  items: { href: string; label: string; icon: React.ReactNode }[];
  isActive: boolean;
}

const platformSections: PlatformSection[] = [
  {
    id: "instagram",
    name: "Instagram",
    icon: <Instagram className="h-5 w-5" />,
    color: "from-purple-600 to-pink-600",
    items: [
      { href: "/authors", label: "Authors", icon: <Users className="h-4 w-4" /> },
      { href: "/tracking", label: "Tracking", icon: <Video className="h-4 w-4" /> },
    ],
    isActive: true,
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: <TelegramIcon className="h-5 w-5" />,
    color: "from-blue-500 to-cyan-500",
    items: [
      { href: "/telegram/authors", label: "Channels", icon: <Users className="h-4 w-4" /> },
      { href: "/telegram/tracking", label: "Posts", icon: <Video className="h-4 w-4" /> },
    ],
    isActive: true,
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: <YouTubeIcon className="h-5 w-5" />,
    color: "from-red-600 to-red-500",
    items: [
      { href: "/youtube/authors", label: "Authors", icon: <Users className="h-4 w-4" /> },
      { href: "/youtube/tracking", label: "Tracking", icon: <Video className="h-4 w-4" /> },
    ],
    isActive: false,
  },
];

export function Sidebar({}: SidebarProps = {}) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    instagram: true,
    telegram: false,
    youtube: false,
  });
  const [mounted, setMounted] = useState(false);

  // Load expanded sections from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setExpandedSections(JSON.parse(stored));
    }
    setMounted(true);
  }, []);

  // Save expanded sections to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedSections));
    }
  }, [expandedSections, mounted]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-white/10 bg-[#0a0a0a]">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2563eb] animate-pulse" />
          <h1 className="font-mono text-sm tracking-widest text-white/80 uppercase">
            Content Zavod
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Dashboard - Always visible */}
        <div>
          <NavLink
            href="/dashboard"
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="Dashboard"
            index={0}
          />
        </div>

        {/* Platform label */}
        <p className="px-3 pt-2 font-mono text-[10px] tracking-widest text-white/30 uppercase">
          Platforms
        </p>

        {/* Platform Sections */}
        {platformSections.map((section) => (
          <div key={section.id} className="space-y-1">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                section.isActive
                  ? "hover:bg-white/10"
                  : "hover:bg-white/5 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-r ${section.color} ${
                    section.isActive ? "" : "opacity-50"
                  }`}
                >
                  {section.icon}
                </div>
                <span
                  className={`text-sm font-medium ${
                    section.isActive ? "text-white" : "text-white/50"
                  }`}
                >
                  {section.name}
                </span>
                {!section.isActive && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono bg-white/10 rounded text-white/40">
                    Soon
                  </span>
                )}
              </div>
              <ChevronDown
                className={`h-4 w-4 text-white/40 transition-transform duration-200 ${
                  expandedSections[section.id] ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Section Items */}
            <AnimatePresence initial={false}>
              {expandedSections[section.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pl-6 space-y-1">
                    {section.items.map((item) => (
                      <NavLink
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                        index={-1}
                        compact
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <UserProfile />
    </aside>
  );
}
