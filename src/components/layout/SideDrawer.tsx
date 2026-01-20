"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export interface DrawerItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export interface SideDrawerProps {
  items: DrawerItem[];
  isOpen: boolean;
  onClose: () => void;
  user?: {
    name: string;
    role?: string;
  };
}

export function SideDrawer({ items, isOpen, onClose, user }: SideDrawerProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    onClose();
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      {/* Backdrop - only on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Drawer - always visible on desktop, conditional on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface border-r border-gray-100 shadow-soft-lg flex flex-col lg:fixed lg:z-30 lg:top-0 lg:shadow-none lg:border-r lg:border-gray-100 ${
          isOpen ? "" : "hidden lg:flex"
        }`}
        role="dialog"
        aria-modal={isOpen ? "true" : undefined}
        aria-label="Navigation menu"
      >
        {/* App Title/Logo - Desktop only */}
        <div className="hidden lg:flex items-center h-14 sm:h-16 px-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-semibold text-text-primary">Dance Studio</h2>
        </div>

        {/* Header - Mobile only */}
        <div className="flex lg:hidden items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-semibold text-text-primary">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary rounded-control hover:bg-accent-soft transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-accent">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
              {user.role && (
                <p className="text-xs text-text-secondary">{user.role}</p>
              )}
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-1">
            {items.map((item) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + "/");
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-control transition-all duration-200 touch-manipulation min-h-[44px] ${
                    isActive
                      ? "bg-accent-soft text-accent font-medium"
                      : "text-text-primary hover:bg-accent-soft active:bg-[#d4f0e5]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        {user && (
          <div className="p-4 border-t border-gray-100 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-control transition-all duration-200 w-full text-left text-red-600 hover:bg-red-50 active:bg-red-100 touch-manipulation min-h-[44px]"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
