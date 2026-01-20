"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import { apiGet, apiPost, apiPatch, FetchError } from "@/lib/fetcher";

interface Hall {
  _id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function HallsPage() {
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState({ name: "" });
  const [editForm, setEditForm] = useState({ name: "", isActive: true });

  const loadHalls = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiGet<Hall[]>("/api/halls");
      setHalls(data);
    } catch (err) {
      const error = err as FetchError;
      setError(error.message || "Failed to load halls");
      showToast(error.message || "Failed to load halls", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadHalls();
  }, [loadHalls]);

  const handleCreate = async () => {
    if (!createForm.name.trim()) {
      showToast("Hall name is required", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const newHall = await apiPost<Hall>("/api/halls", { name: createForm.name.trim() });
      setHalls([...halls, newHall]);
      setIsCreateModalOpen(false);
      setCreateForm({ name: "" });
      showToast("Hall created successfully", "success");
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to create hall", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (hall: Hall) => {
    setEditingHall(hall);
    setEditForm({ name: hall.name, isActive: hall.isActive });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingHall || !editForm.name.trim()) {
      showToast("Hall name is required", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const updated = await apiPatch<Hall>(`/api/halls/${editingHall._id}`, {
        name: editForm.name.trim(),
        isActive: editForm.isActive,
      });
      setHalls(halls.map((h) => (h._id === updated._id ? updated : h)));
      setIsEditModalOpen(false);
      setEditingHall(null);
      showToast("Hall updated successfully", "success");
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to update hall", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Halls" description="Manage dance halls and studios" />
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Halls"
        description="Manage dance halls and studios"
        action={
          <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
            Add Hall
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

      {halls.length === 0 ? (
        <Card>
          <CardContent padding="lg">
            <EmptyState
              title="No halls yet"
              description="Create your first hall to get started"
              action={
                <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
                  Add Hall
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {halls.map((hall) => (
            <Card key={hall._id} className="hover:shadow-soft-lg transition-shadow">
              <CardContent>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-headline text-gray-900 dark:text-gray-100 mb-1">{hall.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          hall.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {hall.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push(`/admin/halls/${hall._id}/blocks`)}
                    className="flex-1"
                  >
                    View Blocks
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(hall)}>
                    Edit
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
          setCreateForm({ name: "" });
        }}
        title="Add Hall"
      >
        <div className="space-y-4">
          <Input
            label="Hall Name"
            placeholder="Main Studio"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            required
            disabled={isSubmitting}
          />
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreateModalOpen(false);
                setCreateForm({ name: "" });
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
          setEditingHall(null);
        }}
        title="Edit Hall"
      >
        <div className="space-y-4">
          <Input
            label="Hall Name"
            placeholder="Main Studio"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
            disabled={isSubmitting}
          />
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={editForm.isActive}
              onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active
            </label>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingHall(null);
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
