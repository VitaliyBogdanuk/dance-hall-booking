"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { apiGet, apiPost, apiPatch, FetchError } from "@/lib/fetcher";

interface Payment {
  _id: string;
  parentId: {
    _id: string;
    name: string;
    email: string;
  };
  month: string;
  amount: number;
  status: "PENDING" | "PAID" | "OVERDUE";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Parent {
  _id: string;
  name: string;
  email: string;
}

export default function PaymentsPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [monthFilter, setMonthFilter] = useState<string>("");
  const [emailFilter, setEmailFilter] = useState<string>("");

  const [createForm, setCreateForm] = useState({
    parentId: "",
    month: "",
    amount: "",
    status: "PENDING" as "PENDING" | "PAID" | "OVERDUE",
    notes: "",
  });

  const [editForm, setEditForm] = useState({
    amount: "",
    status: "PENDING" as "PENDING" | "PAID" | "OVERDUE",
    notes: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [paymentsData, parentsData] = await Promise.all([
        apiGet<Payment[]>("/api/admin/payments").catch(() => [] as Payment[]),
        apiGet<Parent[]>("/api/admin/parents").catch(() => [] as Parent[]),
      ]);

      setPayments(paymentsData);

      const uniqueParents = new Map<string, Parent>();
      parentsData.forEach((p) => {
        uniqueParents.set(p._id, p);
      });
      paymentsData.forEach((p) => {
        if (!uniqueParents.has(p.parentId._id)) {
          uniqueParents.set(p.parentId._id, {
            _id: p.parentId._id,
            name: p.parentId.name,
            email: p.parentId.email,
          });
        }
      });
      setParents(Array.from(uniqueParents.values()));
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      if (statusFilter && payment.status !== statusFilter) return false;
      if (monthFilter && payment.month !== monthFilter) return false;
      if (emailFilter && !payment.parentId.email.toLowerCase().includes(emailFilter.toLowerCase())) return false;
      return true;
    });
  }, [payments, statusFilter, monthFilter, emailFilter]);

  const handleCreate = async () => {
    if (!createForm.parentId || !createForm.month || !createForm.amount) {
      showToast("Parent, month, and amount are required", "error");
      return;
    }

    const amount = parseFloat(createForm.amount);
    if (isNaN(amount) || amount < 0) {
      showToast("Amount must be a valid positive number", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const newPayment = await apiPost<Payment>("/api/admin/payments", {
        parentId: createForm.parentId,
        month: createForm.month,
        amount: Math.round(amount * 100) / 100,
        status: createForm.status,
        notes: createForm.notes.trim() || undefined,
      });
      setPayments([newPayment, ...payments]);
      setIsCreateModalOpen(false);
      setCreateForm({
        parentId: "",
        month: "",
        amount: "",
        status: "PENDING",
        notes: "",
      });
      showToast("Payment record created successfully", "success");
      loadData();
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to create payment", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setEditForm({
      amount: payment.amount.toString(),
      status: payment.status,
      notes: payment.notes || "",
    });
  };

  const handleUpdate = async () => {
    if (!editingPayment) return;

    const amount = parseFloat(editForm.amount);
    if (isNaN(amount) || amount < 0) {
      showToast("Amount must be a valid positive number", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const updated = await apiPatch<Payment>(`/api/admin/payments/${editingPayment._id}`, {
        amount: Math.round(amount * 100) / 100,
        status: editForm.status,
        notes: editForm.notes.trim() || undefined,
      });
      setPayments(payments.map((p) => (p._id === updated._id ? updated : p)));
      setEditingPayment(null);
      showToast("Payment updated successfully", "success");
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to update payment", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split("-");
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadgeVariant = (status: Payment["status"]) => {
    switch (status) {
      case "PAID":
        return "success";
      case "OVERDUE":
        return "error";
      case "PENDING":
        return "warning";
      default:
        return "default";
    }
  };

  // Generate month options (last 12 months)
  const monthOptions = useMemo(() => {
    const options: string[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      options.push(month);
    }
    return options;
  }, []);

  return (
    <div className="w-full space-y-4 pb-20">
      <PageHeader title="Payments" description="Manage payment records" />

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
              { value: "PAID", label: "Paid" },
              { value: "OVERDUE", label: "Overdue" },
            ]}
          />
          <Select
            label="Month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            options={[
              { value: "", label: "All Months" },
              ...monthOptions.map((m) => ({
                value: m,
                label: formatMonth(m),
              })),
            ]}
          />
          <Input
            label="Parent Email"
            placeholder="Filter by email..."
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
          />
          {(statusFilter || monthFilter || emailFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter("");
                setMonthFilter("");
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
      {!loading && filteredPayments.length === 0 && (
        <EmptyState
          title="No payments found"
          description={
            payments.length === 0
              ? "Create your first payment record to get started"
              : "No payments match your filters"
          }
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
      )}

      {/* Payments List (Cards) */}
      {!loading && filteredPayments.length > 0 && (
        <div className="space-y-3">
          {filteredPayments.map((payment) => (
            <Card key={payment._id} className="hover:shadow-soft-lg">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-text-primary">
                        {payment.parentId.name}
                      </h3>
                      <Badge variant={getStatusBadgeVariant(payment.status)} size="sm">
                        {payment.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-text-secondary mb-3">
                      <p>{payment.parentId.email}</p>
                      <p>{formatMonth(payment.month)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xl font-bold text-text-primary">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                    {payment.notes && (
                      <p className="text-sm text-text-secondary mt-2">{payment.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(payment)}
                    className="flex-shrink-0"
                  >
                    Edit
                  </Button>
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
            parentId: "",
            month: "",
            amount: "",
            status: "PENDING",
            notes: "",
          });
        }}
        title="Add Payment"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Parent"
            value={createForm.parentId}
            onChange={(e) => setCreateForm({ ...createForm, parentId: e.target.value })}
            options={[
              { value: "", label: "Select a parent" },
              ...parents.map((p) => ({
                value: p._id,
                label: `${p.name} (${p.email})`,
              })),
            ]}
            required
            disabled={isSubmitting}
          />
          <Select
            label="Month"
            value={createForm.month}
            onChange={(e) => setCreateForm({ ...createForm, month: e.target.value })}
            options={[
              { value: "", label: "Select a month" },
              ...monthOptions.map((m) => ({
                value: m,
                label: formatMonth(m),
              })),
            ]}
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
          <Select
            label="Status"
            value={createForm.status}
            onChange={(e) =>
              setCreateForm({ ...createForm, status: e.target.value as "PENDING" | "PAID" | "OVERDUE" })
            }
            options={[
              { value: "PENDING", label: "Pending" },
              { value: "PAID", label: "Paid" },
              { value: "OVERDUE", label: "Overdue" },
            ]}
            disabled={isSubmitting}
          />
          <Input
            label="Notes (optional)"
            placeholder="Payment notes..."
            value={createForm.notes}
            onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
            disabled={isSubmitting}
          />
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreateModalOpen(false);
                setCreateForm({
                  parentId: "",
                  month: "",
                  amount: "",
                  status: "PENDING",
                  notes: "",
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

      {/* Edit Modal (Bottom Sheet) */}
      {editingPayment && (
        <Modal
          isOpen={!!editingPayment}
          onClose={() => setEditingPayment(null)}
          title="Edit Payment"
          size="md"
        >
          <div className="space-y-4">
            <div className="p-4 bg-accent-soft rounded-card">
              <p className="text-sm text-text-secondary mb-1">Parent</p>
              <p className="text-base font-semibold text-text-primary">
                {editingPayment.parentId.name}
              </p>
              <p className="text-sm text-text-secondary">{editingPayment.parentId.email}</p>
              <p className="text-sm text-text-secondary mt-2 mb-1">Month</p>
              <p className="text-base font-semibold text-text-primary">
                {formatMonth(editingPayment.month)}
              </p>
            </div>
            <Input
              type="number"
              label="Amount"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={editForm.amount}
              onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
              required
              disabled={isSubmitting}
            />
            <Select
              label="Status"
              value={editForm.status}
              onChange={(e) =>
                setEditForm({ ...editForm, status: e.target.value as "PENDING" | "PAID" | "OVERDUE" })
              }
              options={[
                { value: "PENDING", label: "Pending" },
                { value: "PAID", label: "Paid" },
                { value: "OVERDUE", label: "Overdue" },
              ]}
              disabled={isSubmitting}
            />
            <Input
              label="Notes (optional)"
              placeholder="Payment notes..."
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              disabled={isSubmitting}
            />
            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setEditingPayment(null)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleUpdate} isLoading={isSubmitting} className="flex-1">
                Save
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* FAB */}
      <FAB
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }
        label="Add payment"
        onClick={() => setIsCreateModalOpen(true)}
        position="bottom-right"
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
