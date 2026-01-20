"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { AppShell, type DrawerItem } from "@/components/layout";

export default function TrainerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session } = useSession();

  const navItems: DrawerItem[] = useMemo(
    () => [
      { label: "Dashboard", href: "/trainer", icon: <DashboardIcon /> },
      { label: "Schedule", href: "/trainer/schedule", icon: <ScheduleIcon /> },
      { label: "Profile", href: "/trainer/profile", icon: <ProfileIcon /> },
    ],
    []
  );

  return (
    <AppShell
      navigationType="side-drawer"
      navItems={navItems}
      user={
        session?.user
          ? { name: session.user.name || "User", role: session.user.role }
          : undefined
      }
      title="Trainer"
    >
      {children}
    </AppShell>
  );
}

function DashboardIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function ScheduleIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
