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
} from "@/components/ui";
import { FetchError } from "@/lib/fetcher";

interface Refund {
  _id: string;
  bookingId: string;
  parentId: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PROCESSED";
  createdAt: string;
  processedAt?: string;
}

// Mock data - replace with actual API when available
const mockRefunds: Refund[] = [];

export default function RefundsPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [refunds] = useState<Refund[]>(mockRefunds);
  const [loading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [emailFilter, setEmailFilter] = useState<string>("");

  const [createForm, setCreateForm] = useState({
    bookingId: "",
    amount: "",
    reason: "",
  });

  const filteredRefunds = useMemo(() => {
    return refunds.filter((refund) => {
      if (statusFilter && refund.status !== statusFilter) return false;
      if (emailFilter && !refund.parentId.email.toLowerCase().includes(emailFilter.toLowerCase())) return false;
      return true;
    });
  }, [refunds, statusFilter, emailFilter]);

  const handleCreate = async () => {
    if (!createForm.bookingId || !createForm.amount || !createForm.reason.trim()) {
      showToast("All fields are required", "error");
      return;
    }

    const amount = parseFloat(createForm.amount);
    if (isNaN(amount) || amount < 0) {
      showToast("Amount must be a valid positive number", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      // TODO: Replace with actual API call
      // const newRefund = await apiPost<Refund>("/api/admin/refunds", {
      //   bookingId: createForm.bookingId,
      //   amount: Math.round(amount * 100) / 100,
      //   reason: createForm.reason.trim(),
      // });
      // setRefunds([newRefund, ...refunds]);
      
      showToast("Refund created successfully", "success");
      setIsCreateModalOpen(false);
      setCreateForm({ bookingId: "", amount: "", reason: "" });
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to create refund", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadgeVariant = (status: Refund["status"]) => {
    switch (status) {
      case "APPROVED":
      case "PROCESSED":
        return "success";
      case "REJECTED":
        return "error";
      case "PENDING":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <div className="w-full space-y-4">
      <PageHeader title="Refunds" description="Manage refund requests and processing" />

      {/* Filters (Collapsible) */}
      <CollapsibleCard title="Filters">
        <div className="space-y-4">
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "", label: "All Statuses" },
              { value: "PENDING", label: "Pending" },
              { value: "APPROVED", label: "Approved" },
              { value: "REJECTED", label: "Rejected" },
              { value: "PROCESSED", label: "Processed" },
            ]}
          />
          <Input
            label="Parent Email"
            placeholder="Filter by email..."
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
          />
          {(statusFilter || emailFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter("");
                setEmailFilter("");
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
      {!loading && filteredRefunds.length === 0 && (
        <EmptyState
          title="No refunds found"
          description={
            refunds.length === 0
              ? "No refund requests have been submitted yet"
              : "No refunds match your filters"
          }
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        />
      )}

      {/* Refunds List (Cards) */}
      {!loading && filteredRefunds.length > 0 && (
        <div className="space-y-3">
          {filteredRefunds.map((refund) => (
            <Card key={refund._id} className="hover:shadow-soft-lg">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-text-primary">
                        {refund.parentId.name}
                      </h3>
                      <Badge variant={getStatusBadgeVariant(refund.status)} size="sm">
                        {refund.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-text-secondary mb-3">
                      <p>{refund.parentId.email}</p>
                      <p>Requested: {formatDate(refund.createdAt)}</p>
                      {refund.processedAt && <p>Processed: {formatDate(refund.processedAt)}</p>}
                    </div>
                    <div className="flex items-center gap-4 mb-2">
                      <p className="text-xl font-bold text-text-primary">
                        {formatCurrency(refund.amount)}
                      </p>
                    </div>
                    <p className="text-sm text-text-secondary">{refund.reason}</p>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {refund.status === "PENDING" && (
                      <>
                        <Button variant="primary" size="sm" className="min-w-[100px]">
                          Approve
                        </Button>
                        <Button variant="secondary" size="sm" className="min-w-[100px] text-red-600 hover:text-red-700 hover:bg-red-50">
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
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
          setCreateForm({ bookingId: "", amount: "", reason: "" });
        }}
        title="Create Refund"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Booking ID"
            placeholder="Booking ID"
            value={createForm.bookingId}
            onChange={(e) => setCreateForm({ ...createForm, bookingId: e.target.value })}
            required
            disabled={isSubmitting}
          />
          <Input
            type="number"
            label="Amount"
            placeholder="0.00"
            step="0.01"
            min="0"
            value={createForm.amount}
            onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
            required
            disabled={isSubmitting}
          />
          <Input
            label="Reason"
            placeholder="Refund reason..."
            value={createForm.reason}
            onChange={(e) => setCreateForm({ ...createForm, reason: e.target.value })}
            required
            disabled={isSubmitting}
          />
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreateModalOpen(false);
                setCreateForm({ bookingId: "", amount: "", reason: "" });
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

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
