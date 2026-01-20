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
  Spinner,
  useToast,
  ToastContainer,
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
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
      setError("");

      // Load payments and parents in parallel
      const [paymentsData, parentsData] = await Promise.all([
        apiGet<Payment[]>("/api/admin/payments").catch(() => [] as Payment[]),
        apiGet<Parent[]>("/api/admin/parents").catch(() => [] as Parent[]),
      ]);

      setPayments(paymentsData);

      // Combine parents from API and from payments (in case API fails)
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
      setError(error.message || "Failed to load data");
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
        amount: Math.round(amount * 100) / 100, // Round to 2 decimals
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
      loadData(); // Reload to get updated parent list
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
    setIsEditModalOpen(true);
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
      setIsEditModalOpen(false);
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

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
    PAID: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
    OVERDUE: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Payments" description="Manage payment records" />
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Payments"
        description="Manage payment records"
        action={
          <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
            Add Payment
          </Button>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        </CardContent>
      </Card>

      {error && !loading && (
        <Card className="mb-6">
          <CardContent>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {filteredPayments.length === 0 ? (
        <Card>
          <CardContent padding="lg">
            <EmptyState
              title="No payments found"
              description={
                payments.length === 0
                  ? "Create your first payment record to get started"
                  : "No payments match your filters"
              }
              action={
                payments.length === 0 ? (
                  <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
                    Add Payment
                  </Button>
                ) : undefined
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Parent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {payment.parentId.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{payment.parentId.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {formatMonth(payment.month)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColors[payment.status]}`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {payment.notes || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(payment)}>
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Modal */}
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
          <div className="flex gap-3 justify-end pt-4">
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
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} isLoading={isSubmitting}>
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPayment(null);
        }}
        title="Edit Payment"
        size="md"
      >
        <div className="space-y-4">
          {editingPayment && (
            <>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400">Parent</p>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {editingPayment.parentId.name} ({editingPayment.parentId.email})
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Month</p>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100">
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
            </>
          )}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingPayment(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdate} isLoading={isSubmitting}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
