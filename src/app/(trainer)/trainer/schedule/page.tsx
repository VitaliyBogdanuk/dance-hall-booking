"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  FAB,
} from "@/components/ui";
import { apiGet, apiPost, apiPatch, datetimeLocalToISO, isoToDatetimeLocal, FetchError } from "@/lib/fetcher";

interface Hall {
  _id: string;
  name: string;
  isActive: boolean;
}

interface ClassSession {
  _id: string;
  trainerId: string | { _id: string };
  hallId: string | { _id: string; name: string };
  startAt: string;
  endAt: string;
  capacity: number;
  takenSeats: number;
  status: "SCHEDULED" | "CANCELED";
  price?: number;
}

export default function TrainerSchedulePage() {
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelingClassId, setCancelingClassId] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({
    hallId: "",
    startAt: "",
    endAt: "",
    capacity: "",
    price: "",
  });

  const [editForm, setEditForm] = useState({
    hallId: "",
    startAt: "",
    endAt: "",
    capacity: "",
    price: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [classesData, hallsData] = await Promise.all([
        apiGet<ClassSession[]>("/api/classes/mine"),
        apiGet<Hall[]>("/api/halls"),
      ]);
      setClasses(classesData);
      setHalls(hallsData.filter((h) => h.isActive));
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

  const groupedClasses = useMemo(() => {
    const grouped: Record<string, ClassSession[]> = {};
    classes.forEach((cls) => {
      const dateKey = new Date(cls.startAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(cls);
    });
    
    // Sort classes within each day by start time
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    });
    
    return grouped;
  }, [classes]);

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    if (dateOnly.getTime() === today.getTime()) {
      return "Today";
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dateOnly.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    }

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const getHallName = (hallId: string | { _id: string; name: string }): string => {
    if (typeof hallId === "object" && hallId !== null) {
      return hallId.name;
    }
    const hall = halls.find((h) => h._id === hallId);
    return hall?.name || "Unknown Hall";
  };

  const handleCreate = async () => {
    if (!createForm.hallId || !createForm.startAt || !createForm.endAt || !createForm.capacity) {
      showToast("Hall, start time, end time, and capacity are required", "error");
      return;
    }

    const capacity = parseInt(createForm.capacity);
    if (isNaN(capacity) || capacity < 1 || capacity > 60) {
      showToast("Capacity must be between 1 and 60", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Record<string, unknown> = {
        hallId: createForm.hallId,
        startAt: datetimeLocalToISO(createForm.startAt),
        endAt: datetimeLocalToISO(createForm.endAt),
        capacity,
      };

      if (createForm.price.trim()) {
        const price = parseFloat(createForm.price);
        if (!isNaN(price) && price >= 0) {
          payload.price = Math.round(price * 100) / 100;
        }
      }

      await apiPost<ClassSession>("/api/classes", payload);
      setIsCreateModalOpen(false);
      setCreateForm({ hallId: "", startAt: "", endAt: "", capacity: "", price: "" });
      showToast("Class created successfully", "success");
      loadData();
    } catch (err) {
      const error = err as FetchError;
      const isConflict = error.code === "CONFLICT" || error.message.includes("overlap") || error.message.includes("conflict");
      showToast(error.message || "Failed to create class", isConflict ? "warning" : "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (classSession: ClassSession) => {
    setEditingClass(classSession);
    const hallId = typeof classSession.hallId === "object" ? classSession.hallId._id : classSession.hallId;
    setEditForm({
      hallId: hallId.toString(),
      startAt: isoToDatetimeLocal(classSession.startAt),
      endAt: isoToDatetimeLocal(classSession.endAt),
      capacity: classSession.capacity.toString(),
      price: classSession.price?.toString() || "",
    });
  };

  const handleUpdate = async () => {
    if (!editingClass) return;

    if (!editForm.hallId || !editForm.startAt || !editForm.endAt || !editForm.capacity) {
      showToast("Hall, start time, end time, and capacity are required", "error");
      return;
    }

    const capacity = parseInt(editForm.capacity);
    if (isNaN(capacity) || capacity < 1 || capacity > 60) {
      showToast("Capacity must be between 1 and 60", "error");
      return;
    }

    if (capacity < editingClass.takenSeats) {
      showToast(`Capacity cannot be less than taken seats (${editingClass.takenSeats})`, "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Record<string, unknown> = {
        hallId: editForm.hallId,
        startAt: datetimeLocalToISO(editForm.startAt),
        endAt: datetimeLocalToISO(editForm.endAt),
        capacity,
      };

      if (editForm.price.trim()) {
        const price = parseFloat(editForm.price);
        if (!isNaN(price) && price >= 0) {
          payload.price = Math.round(price * 100) / 100;
        }
      }

      await apiPatch<ClassSession>(`/api/classes/${editingClass._id}`, payload);
      setEditingClass(null);
      showToast("Class updated successfully", "success");
      loadData();
    } catch (err) {
      const error = err as FetchError;
      const isConflict = error.code === "CONFLICT" || error.message.includes("overlap") || error.message.includes("conflict");
      showToast(error.message || "Failed to update class", isConflict ? "warning" : "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (classSession: ClassSession) => {
    if (!confirm("Are you sure you want to cancel this class? This action cannot be undone.")) {
      return;
    }

    try {
      setCancelingClassId(classSession._id);
      await apiPatch<ClassSession>(`/api/classes/${classSession._id}`, {
        status: "CANCELED",
      });
      showToast("Class canceled successfully", "success");
      loadData();
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to cancel class", "error");
    } finally {
      setCancelingClassId(null);
    }
  };

  return (
    <div className="w-full space-y-4 pb-20">
      <PageHeader title="My Schedule" description="Manage your dance classes" />

      {/* Loading State */}
      {loading && <SkeletonList items={5} />}

      {/* Empty State */}
      {!loading && classes.length === 0 && (
        <EmptyState
          title="No classes yet"
          description="Create your first class to get started"
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      )}

      {/* Day Grouped Classes */}
      {!loading && classes.length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedClasses).map(([dateKey, dateClasses]) => {
            const firstClass = dateClasses[0];
            const displayDate = formatDate(firstClass.startAt);
            
            return (
              <div key={dateKey} className="space-y-3">
                <h3 className="text-lg font-semibold text-text-primary mb-3 px-1">{displayDate}</h3>
                <div className="space-y-3">
                  {dateClasses.map((classSession) => {
                    const isCanceled = classSession.status === "CANCELED";

                    return (
                      <Card
                        key={classSession._id}
                        className={`${isCanceled ? "opacity-60" : "hover:shadow-soft-lg transition-shadow"}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-2xl font-bold text-text-primary">
                                  {formatTime(classSession.startAt)}
                                </p>
                                <Badge
                                  variant={isCanceled ? "error" : "success"}
                                  size="sm"
                                >
                                  {isCanceled ? "Canceled" : "Scheduled"}
                                </Badge>
                              </div>
                              <p className="text-sm text-text-secondary mb-3">
                                {formatTime(classSession.endAt)} • {getHallName(classSession.hallId)}
                              </p>
                              <p className="text-sm text-text-secondary">
                                <span className="font-medium text-text-primary">
                                  {classSession.takenSeats} / {classSession.capacity}
                                </span>{" "}
                                seats booked
                              </p>
                            </div>
                            {!isCanceled && (
                              <div className="flex flex-col gap-2 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => router.push(`/trainer/classes/${classSession._id}/attendees`)}
                                  className="min-w-[100px]"
                                >
                                  Attendees
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(classSession)}
                                  className="min-w-[100px]"
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleCancel(classSession)}
                                  isLoading={cancelingClassId === classSession._id}
                                  className="min-w-[100px] text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal (Bottom Sheet) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateForm({ hallId: "", startAt: "", endAt: "", capacity: "", price: "" });
        }}
        title="Create Class"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Hall"
            value={createForm.hallId}
            onChange={(e) => setCreateForm({ ...createForm, hallId: e.target.value })}
            options={[
              { value: "", label: "Select a hall" },
              ...halls.map((h) => ({ value: h._id, label: h.name })),
            ]}
            required
            disabled={isSubmitting}
          />
          <Input
            type="datetime-local"
            label="Start Time"
            value={createForm.startAt}
            onChange={(e) => setCreateForm({ ...createForm, startAt: e.target.value })}
            required
            disabled={isSubmitting}
          />
          <Input
            type="datetime-local"
            label="End Time"
            value={createForm.endAt}
            onChange={(e) => setCreateForm({ ...createForm, endAt: e.target.value })}
            required
            disabled={isSubmitting}
          />
          <Input
            type="number"
            label="Capacity"
            placeholder="20"
            min="1"
            max="60"
            value={createForm.capacity}
            onChange={(e) => setCreateForm({ ...createForm, capacity: e.target.value })}
            required
            disabled={isSubmitting}
          />
          <Input
            type="number"
            label="Price (optional)"
            placeholder="25.00"
            step="0.01"
            min="0"
            value={createForm.price}
            onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
            disabled={isSubmitting}
          />
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreateModalOpen(false);
                setCreateForm({ hallId: "", startAt: "", endAt: "", capacity: "", price: "" });
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
      {editingClass && (
        <Modal
          isOpen={!!editingClass}
          onClose={() => setEditingClass(null)}
          title="Edit Class"
          size="md"
        >
          <div className="space-y-4">
            <div className="p-4 bg-accent-soft rounded-card">
              <p className="text-sm text-text-secondary mb-1">Taken Seats</p>
              <p className="text-lg font-bold text-text-primary">
                {editingClass.takenSeats} / {editingClass.capacity}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Capacity cannot be less than {editingClass.takenSeats}
              </p>
            </div>
            <Select
              label="Hall"
              value={editForm.hallId}
              onChange={(e) => setEditForm({ ...editForm, hallId: e.target.value })}
              options={[
                { value: "", label: "Select a hall" },
                ...halls.map((h) => ({ value: h._id, label: h.name })),
              ]}
              required
              disabled={isSubmitting}
            />
            <Input
              type="datetime-local"
              label="Start Time"
              value={editForm.startAt}
              onChange={(e) => setEditForm({ ...editForm, startAt: e.target.value })}
              required
              disabled={isSubmitting}
            />
            <Input
              type="datetime-local"
              label="End Time"
              value={editForm.endAt}
              onChange={(e) => setEditForm({ ...editForm, endAt: e.target.value })}
              required
              disabled={isSubmitting}
            />
            <Input
              type="number"
              label="Capacity"
              placeholder="20"
              min={editingClass.takenSeats}
              max="60"
              value={editForm.capacity}
              onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })}
              required
              disabled={isSubmitting}
              helperText={`Minimum: ${editingClass.takenSeats} (taken seats)`}
            />
            <Input
              type="number"
              label="Price (optional)"
              placeholder="25.00"
              step="0.01"
              min="0"
              value={editForm.price}
              onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
              disabled={isSubmitting}
            />
            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setEditingClass(null)}
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
        label="Create class"
        onClick={() => setIsCreateModalOpen(true)}
        position="bottom-right"
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
