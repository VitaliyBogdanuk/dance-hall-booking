import { PageHeader, Card, CardContent, EmptyState } from "@/components/ui";

export default function TrainerDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader title="Trainer Dashboard" description="Manage your classes and view your schedule" />
      <Card>
        <CardContent padding="lg">
          <EmptyState
            title="Welcome to your dashboard"
            description="Your classes and schedule will appear here. Create your first class to get started."
          />
        </CardContent>
      </Card>
    </div>
  );
}
