"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

export interface TopBarProps {
  title?: string;
  user?: {
    name: string;
    role?: string;
  };
  onMenuClick?: () => void;
}

export function TopBar({ title = "Dance Studio", user, onMenuClick }: TopBarProps) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:dark:bg-gray-900/80">
      <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-manipulation"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <h1 className="text-base sm:text-headline font-semibold text-gray-900 dark:text-gray-100 truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <InstallPrompt />
          {user && (
            <>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                {user.role && <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>}
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden xs:inline-flex">
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
