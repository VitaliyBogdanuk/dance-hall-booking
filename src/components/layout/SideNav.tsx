"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface SideNavProps {
  items: NavItem[];
  isOpen?: boolean;
  onClose?: () => void;
  showLogout?: boolean;
}

export function SideNav({ items, isOpen = true, onClose, showLogout = false }: SideNavProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    if (onClose) onClose();
    await signOut({ callbackUrl: "/login" });
  };

  const navContent = (
    <nav className="flex flex-col gap-1 p-4">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
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
          >
            {item.icon && <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
          </Link>
        );
      })}
      
      {/* Logout button - only show on mobile */}
      {showLogout && (
        <div className="mt-auto pt-4 border-t border-gray-100">
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
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16">
        <div className="flex-1 flex flex-col border-r border-gray-100 bg-surface overflow-y-auto">
          {navContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-gray-100 shadow-soft-lg flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
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
            <div className="flex-1 overflow-y-auto">{navContent}</div>
          </aside>
        </>
      )}
    </>
  );
}
