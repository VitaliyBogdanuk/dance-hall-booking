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
  FAB,
} from "@/components/ui";
import { apiGet, apiPost, apiPatch, FetchError } from "@/lib/fetcher";

interface Trainer {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  bio?: string;
  specialties?: string;
  isActive: boolean;
  createdAt: string;
}

export default function TrainersPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    bio: "",
    specialties: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    bio: "",
    specialties: "",
    isActive: true,
  });

  const loadTrainers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<Trainer[]>("/api/admin/trainers");
      setTrainers(data);
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to load trainers", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadTrainers();
  }, [loadTrainers]);

  const handleCreate = async () => {
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      showToast("Name, email, and password are required", "error");
      return;
    }

    if (createForm.password.length < 8) {
      showToast("Password must be at least 8 characters", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Record<string, string> = {
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
      };

      if (createForm.phone.trim()) {
        payload.phone = createForm.phone.trim();
      }
      if (createForm.bio.trim()) {
        payload.bio = createForm.bio.trim();
      }
      if (createForm.specialties.trim()) {
        payload.specialties = createForm.specialties.trim();
      }

      const newTrainer = await apiPost<Trainer>("/api/admin/trainers", payload);
      setTrainers([newTrainer, ...trainers]);
      setIsCreateModalOpen(false);
      setCreateForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        bio: "",
        specialties: "",
      });
      showToast("Trainer created successfully", "success");
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to create trainer", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (trainer: Trainer) => {
    setEditingTrainer(trainer);
    setEditForm({
      name: trainer.userId.name,
      email: trainer.userId.email,
      password: "",
      phone: trainer.userId.phone || "",
      bio: trainer.bio || "",
      specialties: trainer.specialties || "",
      isActive: trainer.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingTrainer) return;

    if (!editForm.name.trim() || !editForm.email.trim()) {
      showToast("Name and email are required", "error");
      return;
    }

    if (editForm.password && editForm.password.length < 8) {
      showToast("Password must be at least 8 characters", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Record<string, string | boolean> = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        isActive: editForm.isActive,
      };

      if (editForm.password.trim()) {
        payload.password = editForm.password;
      }
      if (editForm.phone.trim()) {
        payload.phone = editForm.phone.trim();
      } else {
        payload.phone = "";
      }
      if (editForm.bio.trim()) {
        payload.bio = editForm.bio.trim();
      } else {
        payload.bio = "";
      }
      if (editForm.specialties.trim()) {
        payload.specialties = editForm.specialties.trim();
      } else {
        payload.specialties = "";
      }

      await apiPatch<Trainer>(`/api/admin/trainers/${editingTrainer._id}`, payload);
      // Reload trainers to ensure consistency
      await loadTrainers();
      setIsEditModalOpen(false);
      setEditingTrainer(null);
      setEditForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        bio: "",
        specialties: "",
        isActive: true,
      });
      showToast("Trainer updated successfully", "success");
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to update trainer", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-4 pb-20">
      <PageHeader title="Trainers" description="Manage trainer accounts and profiles" />

      {/* Loading State */}
      {loading && <SkeletonList items={3} />}

      {/* Empty State */}
      {!loading && trainers.length === 0 && (
        <EmptyState
          title="No trainers yet"
          description="Create your first trainer account to get started"
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
      )}

      {/* Trainers List */}
      {!loading && trainers.length > 0 && (
        <div className="space-y-3">
          {trainers.map((trainer) => (
            <Card key={trainer._id} className="hover:shadow-soft-lg">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-text-primary">
                        {trainer.userId.name}
                      </h3>
                      <Badge variant={trainer.isActive ? "success" : "default"} size="sm">
                        {trainer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-text-secondary mb-3">
                      <p>{trainer.userId.email}</p>
                      {trainer.userId.phone && <p>{trainer.userId.phone}</p>}
                    </div>
                    {trainer.bio && (
                      <p className="text-sm text-text-secondary mb-2 line-clamp-2">{trainer.bio}</p>
                    )}
                    {trainer.specialties && (
                      <div className="flex flex-wrap gap-2">
                        {trainer.specialties.split(",").map((spec, idx) => (
                          <Badge key={idx} variant="info" size="sm">
                            {spec.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(trainer)}
                    className="flex-shrink-0"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
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
            name: "",
            email: "",
            password: "",
            phone: "",
            bio: "",
            specialties: "",
          });
        }}
        title="Add Trainer"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="Jane Trainer"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            required
            disabled={isSubmitting}
          />
          <Input
            type="email"
            label="Email"
            placeholder="trainer@example.com"
            value={createForm.email}
            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            required
            disabled={isSubmitting}
          />
          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            value={createForm.password}
            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            required
            disabled={isSubmitting}
            helperText="Minimum 8 characters"
          />
          <Input
            label="Phone (optional)"
            placeholder="+1234567890"
            value={createForm.phone}
            onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
            disabled={isSubmitting}
          />
          <Input
            label="Bio (optional)"
            placeholder="Experienced dance instructor..."
            value={createForm.bio}
            onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })}
            disabled={isSubmitting}
          />
          <Input
            label="Specialties (optional)"
            placeholder="Ballet, Contemporary, Jazz"
            value={createForm.specialties}
            onChange={(e) => setCreateForm({ ...createForm, specialties: e.target.value })}
            disabled={isSubmitting}
          />
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreateModalOpen(false);
                setCreateForm({
                  name: "",
                  email: "",
                  password: "",
                  phone: "",
                  bio: "",
                  specialties: "",
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

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTrainer(null);
          setEditForm({
            name: "",
            email: "",
            password: "",
            phone: "",
            bio: "",
            specialties: "",
            isActive: true,
          });
        }}
        title="Edit Trainer"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="Jane Trainer"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
            disabled={isSubmitting}
          />
          <Input
            type="email"
            label="Email"
            placeholder="trainer@example.com"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            required
            disabled={isSubmitting}
          />
          <Input
            type="password"
            label="New Password (leave empty to keep current)"
            placeholder="••••••••"
            value={editForm.password}
            onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
            disabled={isSubmitting}
            helperText="Leave empty to keep current password. Minimum 8 characters if changing."
          />
          <Input
            label="Phone (optional)"
            placeholder="+1234567890"
            value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            disabled={isSubmitting}
          />
          <Input
            label="Bio (optional)"
            placeholder="Experienced dance instructor..."
            value={editForm.bio}
            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
            disabled={isSubmitting}
          />
          <Input
            label="Specialties (optional)"
            placeholder="Ballet, Contemporary, Jazz"
            value={editForm.specialties}
            onChange={(e) => setEditForm({ ...editForm, specialties: e.target.value })}
            disabled={isSubmitting}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={editForm.isActive}
              onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
              disabled={isSubmitting}
              className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
            />
            <label htmlFor="isActive" className="text-sm text-text-primary">
              Active
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingTrainer(null);
                setEditForm({
                  name: "",
                  email: "",
                  password: "",
                  phone: "",
                  bio: "",
                  specialties: "",
                  isActive: true,
                });
              }}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdate} isLoading={isSubmitting} className="flex-1">
              Save Changes
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
        label="Add trainer"
        onClick={() => setIsCreateModalOpen(true)}
        position="bottom-right"
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
