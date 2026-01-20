"use client";

import React, { useState } from "react";
import { TopBar, type TopBarProps } from "./TopBar";
import { SideDrawer, type DrawerItem } from "./SideDrawer";
import { BottomTabs, type TabItem } from "./BottomTabs";

export type NavigationType = "bottom-tabs" | "side-drawer";

export interface AppShellProps {
  children: React.ReactNode;
  navigationType?: NavigationType;
  navItems: DrawerItem[] | TabItem[];
  user?: TopBarProps["user"];
  title?: string;
  showSearch?: boolean;
  onSearchClick?: () => void;
  showNotifications?: boolean;
  onNotificationsClick?: () => void;
  fab?: React.ReactNode;
}

export function AppShell({
  children,
  navigationType = "side-drawer",
  navItems,
  user,
  title,
  showSearch,
  onSearchClick,
  showNotifications,
  onNotificationsClick,
  fab,
}: AppShellProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const hasBottomTabs = navigationType === "bottom-tabs";
  const hasSideDrawer = navigationType === "side-drawer";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {hasSideDrawer && (
        <SideDrawer
          items={navItems as DrawerItem[]}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          user={user}
        />
      )}
      
      <TopBar
        title={title}
        user={user}
        onMenuClick={hasSideDrawer ? () => setIsDrawerOpen(true) : undefined}
        showSearch={showSearch}
        onSearchClick={onSearchClick}
        showNotifications={showNotifications}
        onNotificationsClick={onNotificationsClick}
        hasSideDrawer={hasSideDrawer}
      />

      {/* Main Content */}
      <main
        className={`flex-1 ${
          hasBottomTabs ? "pb-20" : ""
        } ${hasSideDrawer ? "lg:pl-72" : ""} pt-14 sm:pt-16`}
      >
        <div className="px-4 max-w-[440px] mx-auto lg:max-w-none lg:px-6 lg:py-8">
          {children}
        </div>
      </main>

      {/* Bottom Tabs */}
      {hasBottomTabs && <BottomTabs items={navItems as TabItem[]} />}

      {/* FAB */}
      {fab}
    </div>
  );
}
