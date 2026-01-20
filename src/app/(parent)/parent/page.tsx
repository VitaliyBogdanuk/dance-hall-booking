"use client";

import { PageHeader, EmptyState, Button } from "@/components/ui";

export default function ParentDashboardPage() {
  return (
    <div className="w-full space-y-4">
      <PageHeader title="Home" description="Welcome back! Manage your bookings and children" />
      <EmptyState
        title="Welcome to your dashboard"
        description="Your bookings and children will appear here. Browse the schedule to book a class."
        icon={
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        }
        action={
          <Button variant="primary" onClick={() => (window.location.href = "/schedule")}>
            Browse Schedule
          </Button>
        }
      />
    </div>
  );
}
