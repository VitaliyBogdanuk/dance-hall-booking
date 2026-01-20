"use client";

import React, { useState } from "react";
import { TopBar, type TopBarProps } from "./TopBar";
import { SideNav, type NavItem } from "./SideNav";

export interface AppShellProps {
  children: React.ReactNode;
  navItems: NavItem[];
  user?: TopBarProps["user"];
  title?: string;
}

export function AppShell({ children, navItems, user, title }: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopBar title={title} user={user} onMenuClick={() => setIsMobileMenuOpen(true)} />
      <SideNav 
        items={navItems} 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
        showLogout={!!user} // Show logout in mobile menu if user is logged in
      />
      {/* Mobile-first: no padding on mobile, add padding on larger screens */}
      <main className="pt-14 sm:pt-16 lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
