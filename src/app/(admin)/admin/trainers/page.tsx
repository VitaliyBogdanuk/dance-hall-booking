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
import { apiGet, apiPost, FetchError } from "@/lib/fetcher";

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
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    bio: "",
    specialties: "",
  });

  const loadTrainers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiGet<Trainer[]>("/api/admin/trainers");
      setTrainers(data);
    } catch (err) {
      const error = err as FetchError;
      setError(error.message || "Failed to load trainers");
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Trainers" description="Manage trainer accounts and profiles" />
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Trainers"
        description="Manage trainer accounts and profiles"
        action={
          <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
            Add Trainer
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

      {trainers.length === 0 ? (
        <Card>
          <CardContent padding="lg">
            <EmptyState
              title="No trainers yet"
              description="Create your first trainer account to get started"
              action={
                <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
                  Add Trainer
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((trainer) => (
            <Card key={trainer._id} className="hover:shadow-soft-lg transition-shadow">
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-headline text-gray-900 dark:text-gray-100 mb-1">
                    {trainer.userId.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{trainer.userId.email}</p>
                  {trainer.userId.phone && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{trainer.userId.phone}</p>
                  )}
                </div>
                {trainer.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{trainer.bio}</p>
                )}
                {trainer.specialties && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Specialties: </span>
                    <span className="text-xs text-gray-700 dark:text-gray-300">{trainer.specialties}</span>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      trainer.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {trainer.isActive ? "Active" : "Inactive"}
                  </span>
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
          <div className="flex gap-3 justify-end pt-4">
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
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} isLoading={isSubmitting}>
              Create
            </Button>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
