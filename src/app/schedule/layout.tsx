"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { AppShell, type DrawerItem, type TabItem } from "@/components/layout";

function getNavigationType(role?: string): "bottom-tabs" | "side-drawer" {
  return role === "PARENT" ? "bottom-tabs" : "side-drawer";
}

export default function ScheduleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const navigationType = getNavigationType(role);

  const navItems = useMemo((): DrawerItem[] | TabItem[] => {
    if (role === "ADMIN") {
      return [
        { label: "Dashboard", href: "/admin", icon: <DashboardIcon /> },
        { label: "Halls", href: "/admin/halls", icon: <HallsIcon /> },
        { label: "Schedule", href: "/schedule", icon: <ScheduleIcon /> },
        { label: "Trainers", href: "/admin/trainers", icon: <TrainersIcon /> },
        { label: "Payments", href: "/admin/payments", icon: <PaymentsIcon /> },
      ] as DrawerItem[];
    } else if (role === "TRAINER") {
      return [
        { label: "Dashboard", href: "/trainer", icon: <DashboardIcon /> },
        { label: "Schedule", href: "/schedule", icon: <ScheduleIcon /> },
        { label: "My Classes", href: "/trainer/schedule", icon: <ClassesIcon /> },
      ] as DrawerItem[];
    } else if (role === "PARENT") {
      return [
        { label: "Home", href: "/parent", icon: <DashboardIcon /> },
        { label: "Bookings", href: "/parent/bookings", icon: <BookingsIcon /> },
        { label: "Children", href: "/parent/children", icon: <ChildrenIcon /> },
        { label: "Schedule", href: "/schedule", icon: <ScheduleIcon /> },
      ] as TabItem[];
    }
    
    // Default nav for authenticated users without specific role
    return [
      { label: "Schedule", href: "/schedule", icon: <ScheduleIcon /> },
    ] as DrawerItem[];
  }, [role]);

  return (
    <AppShell
      navigationType={navigationType}
      navItems={navItems}
      user={
        session?.user
          ? { name: session.user.name || "User", role: session.user.role }
          : undefined
      }
      title="Schedule"
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

function BookingsIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function ChildrenIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function HallsIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function TrainersIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function PaymentsIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function ClassesIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}
