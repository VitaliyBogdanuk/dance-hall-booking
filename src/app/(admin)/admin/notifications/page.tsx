"use client";

import { useState, useMemo } from "react";
import {
  PageHeader,
  Card,
  CardContent,
  Button,
  Modal,
  Input,
  Select,
  EmptyState,
  useToast,
  ToastContainer,
  SkeletonList,
  Badge,
  CollapsibleCard,
  FAB,
} from "@/components/ui";
import { FetchError } from "@/lib/fetcher";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "SUCCESS" | "ERROR";
  targetRole?: "PARENT" | "TRAINER" | "ALL";
  sentAt?: string;
  status: "DRAFT" | "SENT" | "SCHEDULED";
  scheduledFor?: string;
  createdAt: string;
}

// Mock data - replace with actual API when available
const mockNotifications: Notification[] = [];

export default function NotificationsPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [notifications] = useState<Notification[]>(mockNotifications);
  const [loading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const [createForm, setCreateForm] = useState({
    title: "",
    message: "",
    type: "INFO" as "INFO" | "WARNING" | "SUCCESS" | "ERROR",
    targetRole: "ALL" as "PARENT" | "TRAINER" | "ALL",
  });

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (statusFilter && notification.status !== statusFilter) return false;
      if (typeFilter && notification.type !== typeFilter) return false;
      return true;
    });
  }, [notifications, statusFilter, typeFilter]);

  const handleCreate = async () => {
    if (!createForm.title.trim() || !createForm.message.trim()) {
      showToast("Title and message are required", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      // TODO: Replace with actual API call
      // const newNotification = await apiPost<Notification>("/api/admin/notifications", {
      //   title: createForm.title.trim(),
      //   message: createForm.message.trim(),
      //   type: createForm.type,
      //   targetRole: createForm.targetRole,
      // });
      // setNotifications([newNotification, ...notifications]);
      
      showToast("Notification created", "success");
      setIsCreateModalOpen(false);
      setCreateForm({
        title: "",
        message: "",
        type: "INFO",
        targetRole: "ALL",
      });
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to create notification", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getTypeBadgeVariant = (type: Notification["type"]) => {
    switch (type) {
      case "SUCCESS":
        return "success";
      case "ERROR":
        return "error";
      case "WARNING":
        return "warning";
      case "INFO":
        return "info";
      default:
        return "default";
    }
  };

  const getStatusBadgeVariant = (status: Notification["status"]) => {
    switch (status) {
      case "SENT":
        return "success";
      case "SCHEDULED":
        return "warning";
      case "DRAFT":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <div className="w-full space-y-4 pb-20">
      <PageHeader title="Notifications" description="Send and manage notifications" />

      {/* Filters (Collapsible) */}
      <CollapsibleCard title="Filters">
        <div className="space-y-4">
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "", label: "All Statuses" },
              { value: "DRAFT", label: "Draft" },
              { value: "SENT", label: "Sent" },
              { value: "SCHEDULED", label: "Scheduled" },
            ]}
          />
          <Select
            label="Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: "", label: "All Types" },
              { value: "INFO", label: "Info" },
              { value: "WARNING", label: "Warning" },
              { value: "SUCCESS", label: "Success" },
              { value: "ERROR", label: "Error" },
            ]}
          />
          {(statusFilter || typeFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter("");
                setTypeFilter("");
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </CollapsibleCard>

      {/* Loading State */}
      {loading && <SkeletonList items={3} />}

      {/* Empty State */}
      {!loading && filteredNotifications.length === 0 && (
        <EmptyState
          title="No notifications found"
          description={
            notifications.length === 0
              ? "Create your first notification to get started"
              : "No notifications match your filters"
          }
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          }
        />
      )}

      {/* Notifications List (Cards) */}
      {!loading && filteredNotifications.length > 0 && (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card key={notification._id} className="hover:shadow-soft-lg">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-text-primary">
                        {notification.title}
                      </h3>
                      <Badge variant={getTypeBadgeVariant(notification.type)} size="sm">
                        {notification.type}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(notification.status)} size="sm">
                        {notification.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary mb-3">{notification.message}</p>
                    <div className="space-y-1 text-xs text-text-secondary">
                      {notification.targetRole && (
                        <p>Target: {notification.targetRole}</p>
                      )}
                      {notification.sentAt && <p>Sent: {formatDate(notification.sentAt)}</p>}
                      {notification.scheduledFor && (
                        <p>Scheduled: {formatDate(notification.scheduledFor)}</p>
                      )}
                      <p>Created: {formatDate(notification.createdAt)}</p>
                    </div>
                  </div>
                  {notification.status === "DRAFT" && (
                    <Button variant="primary" size="sm" className="flex-shrink-0">
                      Send
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal (Bottom Sheet) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateForm({
            title: "",
            message: "",
            type: "INFO",
            targetRole: "ALL",
          });
        }}
        title="Create Notification"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="Notification title"
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            required
            disabled={isSubmitting}
          />
          <Input
            label="Message"
            placeholder="Notification message"
            value={createForm.message}
            onChange={(e) => setCreateForm({ ...createForm, message: e.target.value })}
            required
            disabled={isSubmitting}
          />
          <Select
            label="Type"
            value={createForm.type}
            onChange={(e) =>
              setCreateForm({ ...createForm, type: e.target.value as Notification["type"] })
            }
            options={[
              { value: "INFO", label: "Info" },
              { value: "WARNING", label: "Warning" },
              { value: "SUCCESS", label: "Success" },
              { value: "ERROR", label: "Error" },
            ]}
            disabled={isSubmitting}
          />
          <Select
            label="Target Audience"
            value={createForm.targetRole}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "ALL" || value === "PARENT" || value === "TRAINER") {
                setCreateForm({ ...createForm, targetRole: value });
              }
            }}
            options={[
              { value: "ALL", label: "All Users" },
              { value: "PARENT", label: "Parents Only" },
              { value: "TRAINER", label: "Trainers Only" },
            ]}
            disabled={isSubmitting}
          />
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreateModalOpen(false);
                setCreateForm({
                  title: "",
                  message: "",
                  type: "INFO",
                  targetRole: "ALL",
                });
              }}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} isLoading={isSubmitting} className="flex-1">
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* FAB */}
      <FAB
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }
        label="Create notification"
        onClick={() => setIsCreateModalOpen(true)}
        position="bottom-right"
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
