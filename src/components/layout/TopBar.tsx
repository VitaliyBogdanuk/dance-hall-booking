"use client";

import React from "react";
import Link from "next/link";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

export interface TopBarProps {
  title?: string;
  user?: {
    name: string;
    role?: string;
  };
  onMenuClick?: () => void;
  showSearch?: boolean;
  onSearchClick?: () => void;
  showNotifications?: boolean;
  onNotificationsClick?: () => void;
  hasSideDrawer?: boolean;
}

export function TopBar({
  title = "Dance Studio",
  user,
  onMenuClick,
  showSearch = false,
  onSearchClick,
  showNotifications = false,
  onNotificationsClick,
  hasSideDrawer = false,
}: TopBarProps) {
  const getProfileUrl = () => {
    if (!user?.role) return "/login";
    if (user.role === "ADMIN") return "/admin/profile";
    if (user.role === "TRAINER") return "/trainer/profile";
    if (user.role === "PARENT") return "/parent/profile";
    return "/login";
  };

  return (
    <header className={`fixed top-0 ${hasSideDrawer ? "lg:left-72" : "left-0"} right-0 z-40 w-full border-b border-gray-100 bg-surface/95 backdrop-blur-md supports-[backdrop-filter]:bg-surface/80`}>
      <div className="flex h-14 sm:h-16 items-center justify-between px-4 max-w-[440px] mx-auto lg:max-w-none lg:px-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-accent-soft transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          {!hasSideDrawer && (
            <h1 className="text-base sm:text-lg font-semibold text-text-primary truncate">{title}</h1>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {showSearch && onSearchClick && (
            <button
              onClick={onSearchClick}
              className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-accent-soft transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}
          {showNotifications && onNotificationsClick && (
            <button
              onClick={onNotificationsClick}
              className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-accent-soft transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center relative"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          )}
          <InstallPrompt />
          {user && (
            <Link
              href={getProfileUrl()}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent-soft flex items-center justify-center flex-shrink-0 hover:ring-2 hover:ring-accent/30 transition-all touch-manipulation"
              aria-label={`Go to profile for ${user.name}`}
            >
              <span className="text-xs sm:text-sm font-medium text-accent">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
