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
  useToast,
  ToastContainer,
  SkeletonList,
  Badge,
  FAB,
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState({ name: "" });
  const [editForm, setEditForm] = useState({ name: "", isActive: true });

  const loadHalls = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<Hall[]>("/api/halls");
      setHalls(data);
    } catch (err) {
      const error = err as FetchError;
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
      setEditingHall(null);
      showToast("Hall updated successfully", "success");
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to update hall", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-4 pb-20">
      <PageHeader title="Halls" description="Manage dance halls and studios" />

      {/* Loading State */}
      {loading && <SkeletonList items={3} />}

      {/* Empty State */}
      {!loading && halls.length === 0 && (
        <EmptyState
          title="No halls yet"
          description="Create your first hall to get started"
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
      )}

      {/* Halls List */}
      {!loading && halls.length > 0 && (
        <div className="space-y-3">
          {halls.map((hall) => (
            <Card key={hall._id} className="hover:shadow-soft-lg">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-text-primary">{hall.name}</h3>
                      <Badge variant={hall.isActive ? "success" : "default"} size="sm">
                        {hall.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/halls/${hall._id}/blocks`)}
                      className="min-w-[120px]"
                    >
                      View Blocks
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(hall)}
                      className="min-w-[120px]"
                    >
                      Edit
                    </Button>
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
          setCreateForm({ name: "" });
        }}
        title="Add Hall"
        size="md"
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
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreateModalOpen(false);
                setCreateForm({ name: "" });
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
      {editingHall && (
        <Modal
          isOpen={!!editingHall}
          onClose={() => setEditingHall(null)}
          title="Edit Hall"
          size="md"
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
            <div className="flex items-center gap-3 p-4 bg-accent-soft rounded-card">
              <input
                type="checkbox"
                id="isActive"
                checked={editForm.isActive}
                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                className="w-5 h-5 rounded-control border-gray-300 text-accent focus:ring-accent"
                disabled={isSubmitting}
              />
              <label htmlFor="isActive" className="text-sm font-medium text-text-primary">
                Active
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setEditingHall(null)}
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
        label="Add hall"
        onClick={() => setIsCreateModalOpen(true)}
        position="bottom-right"
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
