"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";

interface UserData {
  name: string | null;
  credits: number;
  isAdmin: boolean;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.data);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#080b14]">
      <Sidebar
        credits={user?.credits}
        userName={user?.name ?? undefined}
        isAdmin={user?.isAdmin ?? false}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 overflow-auto min-w-0">
        {/* Mobile top bar — visible only on small screens */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#080b14]/95 backdrop-blur-sm border-b border-white/[0.06] sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-400 hover:bg-white/5 transition-colors"
            aria-label="Open navigation menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-xs font-bold text-white">SH</span>
            </div>
            <span className="font-semibold text-white text-sm">ShiftHire</span>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
