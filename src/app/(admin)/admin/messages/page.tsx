import { PageHeader, EmptyState } from "@/components/ui";

export default function AdminMessagesPage() {
  return (
    <div className="w-full space-y-4">
      <PageHeader title="Messages" description="Your conversations" />
      <EmptyState
        title="No messages yet"
        description="Your messages will appear here when you receive them."
        icon={
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
      />
    </div>
  );
}
