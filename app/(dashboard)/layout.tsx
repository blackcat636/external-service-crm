"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { CustomCursor } from "@/components/custom-cursor";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <AuthGuard>
      <CustomCursor />
      <div className="flex h-screen bg-[#050505]">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-[#0f0f0f]">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
