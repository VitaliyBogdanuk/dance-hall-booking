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
  Spinner,
  useToast,
  ToastContainer,
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
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSession | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setError("");

      const [classesData, hallsData] = await Promise.all([
        apiGet<ClassSession[]>("/api/classes/mine"),
        apiGet<Hall[]>("/api/halls"),
      ]);

      setClasses(classesData);
      setHalls(hallsData.filter((h) => h.isActive));
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

  const groupedClasses = useMemo(() => {
    const grouped: Record<string, ClassSession[]> = {};
    classes.forEach((cls) => {
      const date = new Date(cls.startAt).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(cls);
    });
    return grouped;
  }, [classes]);

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
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

      const newClass = await apiPost<ClassSession>("/api/classes", payload);
      setClasses([...classes, newClass].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()));
      setIsCreateModalOpen(false);
      setCreateForm({ hallId: "", startAt: "", endAt: "", capacity: "", price: "" });
      showToast("Class created successfully", "success");
      loadData(); // Reload to get updated list
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
    setIsEditModalOpen(true);
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

      const updated = await apiPatch<ClassSession>(`/api/classes/${editingClass._id}`, payload);
      setClasses(classes.map((c) => (c._id === updated._id ? updated : c)));
      setIsEditModalOpen(false);
      setEditingClass(null);
      showToast("Class updated successfully", "success");
      loadData(); // Reload to get updated list
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
      setIsSubmitting(true);
      const updated = await apiPatch<ClassSession>(`/api/classes/${classSession._id}`, {
        status: "CANCELED",
      });
      setClasses(classes.map((c) => (c._id === updated._id ? updated : c)));
      showToast("Class canceled successfully", "success");
      loadData(); // Reload to get updated list
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to cancel class", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeader title="My Schedule" description="Manage your dance classes" />
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PageHeader
        title="My Schedule"
        description="Manage your dance classes"
        action={
          <Button 
            onClick={() => setIsCreateModalOpen(true)} 
            variant="primary"
            className="w-full sm:w-auto"
          >
            + Create Class
          </Button>
        }
      />

      {error && !loading && (
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm sm:text-base text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {classes.length === 0 ? (
        <Card>
          <CardContent padding="lg">
            <EmptyState
              title="No classes yet"
              description="Create your first class to get started"
              action={
                <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
                  + Create Class
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedClasses).map(([date, dateClasses]) => (
            <Card key={date}>
              <CardContent>
                <h3 className="text-headline text-gray-900 dark:text-gray-100 mb-4">{date}</h3>
                <div className="space-y-3">
                  {dateClasses.map((classSession) => {
                    const isCanceled = classSession.status === "CANCELED";
                    const seatsLeft = classSession.capacity - classSession.takenSeats;
                    return (
                      <div
                        key={classSession._id}
                        className={`p-4 sm:p-5 rounded-xl border ${
                          isCanceled
                            ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                              <p className="font-medium text-base sm:text-lg text-gray-900 dark:text-gray-100">
                                {formatTime(classSession.startAt)} - {formatTime(classSession.endAt)}
                              </p>
                              <span
                                className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                                  isCanceled
                                    ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                                }`}
                              >
                                {isCanceled ? "Canceled" : "Scheduled"}
                              </span>
                            </div>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                              {getHallName(classSession.hallId)}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span>
                                {classSession.takenSeats} / {classSession.capacity} booked
                              </span>
                              <span className={`font-medium ${seatsLeft === 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                                {seatsLeft} {seatsLeft === 1 ? "seat" : "seats"} available
                              </span>
                              {classSession.price && (
                                <span className="font-semibold text-gray-900 dark:text-gray-100">${classSession.price}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                            {!isCanceled && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => router.push(`/trainer/classes/${classSession._id}/attendees`)}
                                  className="flex-1 sm:flex-none"
                                >
                                  Attendees
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleEdit(classSession)}
                                  className="flex-1 sm:flex-none"
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleCancel(classSession)}
                                  className="flex-1 sm:flex-none text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreateModalOpen(false);
                setCreateForm({ hallId: "", startAt: "", endAt: "", capacity: "", price: "" });
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
          setEditingClass(null);
        }}
        title="Edit Class"
        size="md"
      >
        <div className="space-y-4">
          {editingClass && (
            <>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Taken Seats</p>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {editingClass.takenSeats} / {editingClass.capacity}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
            </>
          )}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingClass(null);
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
