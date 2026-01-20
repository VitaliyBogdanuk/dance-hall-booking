"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface TabItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export interface BottomTabsProps {
  items: TabItem[];
}

export function BottomTabs({ items }: BottomTabsProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-gray-100 pb-safe"
      aria-label="Bottom navigation"
    >
      <div className="max-w-[440px] mx-auto">
        <div className="flex items-center justify-around h-16 px-2">
          {items.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-1 flex-1 min-h-[44px] rounded-control transition-colors touch-manipulation ${
                  isActive
                    ? "text-accent"
                    : "text-text-secondary hover:text-text-primary"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <div
                  className={`w-6 h-6 flex items-center justify-center transition-colors ${
                    isActive ? "text-accent" : "text-text-secondary"
                  }`}
                >
                  {item.icon}
                </div>
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive ? "text-accent" : "text-text-secondary"
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-t-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
