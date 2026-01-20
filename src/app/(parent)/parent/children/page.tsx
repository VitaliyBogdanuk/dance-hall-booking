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
  useToast,
  ToastContainer,
  SkeletonList,
  Badge,
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
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
      const data = await apiGet<Child[]>("/api/children");
      setChildren(data);
    } catch (err) {
      const error = err as FetchError;
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
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateAge = (iso?: string) => {
    if (!iso) return null;
    const birthDate = new Date(iso);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="w-full space-y-4">
      <PageHeader
        title="My Children"
        description="Manage your children's profiles"
        action={
          <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
            Add Child
          </Button>
        }
      />

      {/* Loading State */}
      {loading && <SkeletonList items={3} />}

      {/* Empty State */}
      {!loading && children.length === 0 && (
        <EmptyState
          title="No children yet"
          description="Add your first child to start booking classes"
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          action={
            <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
              Add Child
            </Button>
          }
        />
      )}

      {/* Children List */}
      {!loading && children.length > 0 && (
        <div className="space-y-3">
          {children.map((child) => {
            const age = calculateAge(child.birthDate);
            return (
              <Card key={child._id} className="hover:shadow-soft-lg">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-text-primary">{child.name}</h3>
                        {age !== null && (
                          <Badge variant="info" size="sm">
                            {age} {age === 1 ? "year" : "years"}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-text-secondary">
                        {child.birthDate && (
                          <p>Born: {formatDate(child.birthDate)}</p>
                        )}
                        {child.notes && (
                          <p className="mt-2">{child.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(child)}
                        className="min-w-[80px]"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(child._id)}
                        isLoading={deletingChildId === child._id}
                        className="min-w-[80px] text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Modal (Bottom Sheet) */}
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
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreateModalOpen(false);
                setCreateForm({ name: "", birthDate: "", notes: "" });
              }}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} isLoading={isSubmitting} className="flex-1">
              Add
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal (Bottom Sheet) */}
      {editingChild && (
        <Modal
          isOpen={!!editingChild}
          onClose={() => setEditingChild(null)}
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
            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setEditingChild(null)}
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

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
