import { PageHeader, Card, CardContent, CardHeader, CardTitle, EmptyState } from "@/components/ui";

export default function AdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader title="Admin Dashboard" description="Manage halls, classes, trainers, and payments" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Halls</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState title="Coming soon" description="Hall management will be available here" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState title="Coming soon" description="Class management will be available here" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Trainers</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState title="Coming soon" description="Trainer management will be available here" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
