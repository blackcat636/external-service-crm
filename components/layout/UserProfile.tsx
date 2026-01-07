"use client";

import { LogOut, User } from "lucide-react";
import { clearServiceToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/hooks/useAuth";

export function UserProfile() {
  const router = useRouter();
  const { profile, loading } = useUserProfile();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const displayName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : profile?.username || profile?.email || "User";

  return (
    <div className="border-t border-white/10 p-4">
      <div className="flex items-center gap-3">
        {profile?.photo ? (
          <img
            src={profile.photo}
            alt={displayName}
            className="h-9 w-9 rounded-full object-cover border border-white/10"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 border border-white/10">
            <User className="h-4 w-4 text-white/60" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {loading ? (
            <>
              <div className="h-4 w-24 bg-white/10 rounded animate-pulse mb-1" />
              <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-white/80 truncate">{displayName}</p>
              <p className="font-mono text-[10px] text-white/30 uppercase tracking-wider">
                {profile?.email || "Session Active"}
              </p>
            </>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-white/30 hover:text-white/60 hover:bg-white/5 rounded-lg transition-all duration-300"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
