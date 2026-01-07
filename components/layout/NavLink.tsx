"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  index?: number;
  compact?: boolean;
}

export function NavLink({ href, icon, label, index, compact = false }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-300",
        compact ? "px-3 py-2" : "px-3 py-2.5",
        isActive
          ? "bg-white/10 text-white"
          : "text-white/50 hover:bg-white/5 hover:text-white/80"
      )}
    >
      {index !== undefined && index > 0 && (
        <span className={cn(
          "font-mono text-[10px]",
          isActive ? "text-[#2563eb]" : "text-white/30 group-hover:text-white/50"
        )}>
          0{index}
        </span>
      )}
      <span className={cn(
        "transition-colors",
        compact ? "h-4 w-4" : "",
        isActive ? "text-[#2563eb]" : "text-white/40 group-hover:text-white/60"
      )}>
        {icon}
      </span>
      <span className={cn("tracking-wide", compact && "text-sm")}>{label}</span>
      {isActive && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#2563eb]" />
      )}
    </Link>
  );
}
