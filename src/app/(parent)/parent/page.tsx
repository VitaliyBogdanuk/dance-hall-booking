import { PageHeader, Card, CardContent, EmptyState } from "@/components/ui";

export default function ParentDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader title="Parent Dashboard" description="Manage your bookings and children" />
      <Card>
        <CardContent padding="lg">
          <EmptyState
            title="Welcome to your dashboard"
            description="Your bookings and children will appear here. Browse the schedule to book a class."
          />
        </CardContent>
      </Card>
    </div>
  );
}
