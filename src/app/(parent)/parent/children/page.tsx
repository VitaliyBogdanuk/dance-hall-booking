"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PageHeader,
  Card,
  CardContent,
  Button,
  Modal,
  Input,
  EmptyState,
  Spinner,
  useToast,
  ToastContainer,
} from "@/components/ui";
import { apiGet, apiPost, apiPatch, apiDelete, datetimeLocalToISO, isoToDatetimeLocal, FetchError } from "@/lib/fetcher";

interface Child {
  _id: string;
  name: string;
  birthDate?: string;
  notes?: string;
  createdAt: string;
}

export default function ChildrenPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingChildId, setDeletingChildId] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({
    name: "",
    birthDate: "",
    notes: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    birthDate: "",
    notes: "",
  });

  const loadChildren = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiGet<Child[]>("/api/children");
      setChildren(data);
    } catch (err) {
      const error = err as FetchError;
      setError(error.message || "Failed to load children");
      showToast(error.message || "Failed to load children", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  const handleCreate = async () => {
    if (!createForm.name.trim()) {
      showToast("Child name is required", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Record<string, unknown> = {
        name: createForm.name.trim(),
      };

      if (createForm.birthDate) {
        payload.birthDate = datetimeLocalToISO(createForm.birthDate + "T00:00:00");
      }
      if (createForm.notes.trim()) {
        payload.notes = createForm.notes.trim();
      }

      const newChild = await apiPost<Child>("/api/children", payload);
      setChildren([newChild, ...children]);
      setIsCreateModalOpen(false);
      setCreateForm({ name: "", birthDate: "", notes: "" });
      showToast("Child added successfully", "success");
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to add child", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (child: Child) => {
    setEditingChild(child);
    setEditForm({
      name: child.name,
      birthDate: child.birthDate ? isoToDatetimeLocal(child.birthDate).split("T")[0] : "",
      notes: child.notes || "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingChild || !editForm.name.trim()) {
      showToast("Child name is required", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Record<string, unknown> = {
        name: editForm.name.trim(),
      };

      if (editForm.birthDate) {
        payload.birthDate = datetimeLocalToISO(editForm.birthDate + "T00:00:00");
      } else {
        payload.birthDate = null;
      }
      if (editForm.notes.trim()) {
        payload.notes = editForm.notes.trim();
      } else {
        payload.notes = null;
      }

      const updated = await apiPatch<Child>(`/api/children/${editingChild._id}`, payload);
      setChildren(children.map((c) => (c._id === updated._id ? updated : c)));
      setIsEditModalOpen(false);
      setEditingChild(null);
      showToast("Child updated successfully", "success");
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to update child", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (childId: string) => {
    if (!confirm("Are you sure you want to delete this child? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingChildId(childId);
      await apiDelete(`/api/children/${childId}`);
      setChildren(children.filter((c) => c._id !== childId));
      showToast("Child deleted successfully", "success");
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to delete child", "error");
    } finally {
      setDeletingChildId(null);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "Not specified";
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeader title="My Children" description="Manage your children's profiles" />
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="My Children"
        description="Manage your children's profiles"
        action={
          <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
            Add Child
          </Button>
        }
      />

      {error && !loading && (
        <Card className="mb-6">
          <CardContent>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {children.length === 0 ? (
        <Card>
          <CardContent padding="lg">
            <EmptyState
              title="No children yet"
              description="Add your first child to start booking classes"
              action={
                <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
                  Add Child
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <Card key={child._id} className="hover:shadow-soft-lg transition-shadow">
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-headline text-gray-900 dark:text-gray-100 mb-2">{child.name}</h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>Birth Date: {formatDate(child.birthDate)}</p>
                    {child.notes && <p className="mt-2">{child.notes}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(child)} className="flex-1">
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(child._id)}
                    isLoading={deletingChildId === child._id}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateForm({ name: "", birthDate: "", notes: "" });
        }}
        title="Add Child"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="Child's name"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            required
            disabled={isSubmitting}
          />
          <Input
            type="date"
            label="Birth Date (optional)"
            value={createForm.birthDate}
            onChange={(e) => setCreateForm({ ...createForm, birthDate: e.target.value })}
            disabled={isSubmitting}
          />
          <Input
            label="Notes (optional)"
            placeholder="Any additional notes..."
            value={createForm.notes}
            onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
            disabled={isSubmitting}
          />
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreateModalOpen(false);
                setCreateForm({ name: "", birthDate: "", notes: "" });
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} isLoading={isSubmitting}>
              Add
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingChild(null);
        }}
        title="Edit Child"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="Child's name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
            disabled={isSubmitting}
          />
          <Input
            type="date"
            label="Birth Date (optional)"
            value={editForm.birthDate}
            onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
            disabled={isSubmitting}
          />
          <Input
            label="Notes (optional)"
            placeholder="Any additional notes..."
            value={editForm.notes}
            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
            disabled={isSubmitting}
          />
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingChild(null);
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
