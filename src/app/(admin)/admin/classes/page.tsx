"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  PageHeader,
  Card,
  CardContent,
  EmptyState,
  useToast,
  ToastContainer,
  SkeletonList,
  Badge,
  CollapsibleCard,
  Select,
  Button,
} from "@/components/ui";
import { apiGet, FetchError } from "@/lib/fetcher";

interface ClassSession {
  _id: string;
  trainerId: string | {
    _id: string;
    userId: {
      _id: string;
      name: string;
      email: string;
    };
  };
  trainerName?: string;
  hallId: string | {
    _id: string;
    name: string;
  };
  startAt: string;
  endAt: string;
  capacity: number;
  takenSeats: number;
  price?: number;
  status: "SCHEDULED" | "CANCELED";
  createdAt: string;
}

interface Hall {
  _id: string;
  name: string;
}

interface Trainer {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
}

export default function AdminClassesPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "" as "" | "SCHEDULED" | "CANCELED",
    hallId: "",
    trainerId: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [hallsData, trainersData] = await Promise.all([
        apiGet<Hall[]>("/api/halls").catch(() => []),
        apiGet<Trainer[]>("/api/admin/trainers").catch(() => []),
      ]);
      setHalls(hallsData);
      setTrainers(trainersData);
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) {
        params.append("status", filters.status);
      }
      if (filters.hallId) {
        params.append("hallId", filters.hallId);
      }
      if (filters.trainerId) {
        params.append("trainerId", filters.trainerId);
      }

      const data = await apiGet<ClassSession[]>(`/api/admin/classes?${params.toString()}`);
      setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to load classes", "error");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

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
    return "Unknown Hall";
  };

  const getTrainerName = (classSession: ClassSession): string => {
    if (classSession.trainerName) {
      return classSession.trainerName;
    }
    if (typeof classSession.trainerId === "object" && classSession.trainerId !== null) {
      return classSession.trainerId.userId?.name || "Unknown Trainer";
    }
    return "Unknown Trainer";
  };

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
    
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    });
    
    return grouped;
  }, [classes]);

  return (
    <div className="w-full space-y-4">
      <PageHeader title="Classes" description="View and manage all class sessions" />

      {/* Filters (Collapsible) */}
      <CollapsibleCard title="Filters">
        <div className="space-y-4">
          <Select
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as typeof filters.status })}
            options={[
              { value: "", label: "All Statuses" },
              { value: "SCHEDULED", label: "Scheduled" },
              { value: "CANCELED", label: "Canceled" },
            ]}
          />
          <Select
            label="Hall"
            value={filters.hallId}
            onChange={(e) => setFilters({ ...filters, hallId: e.target.value })}
            options={[
              { value: "", label: "All Halls" },
              ...halls.map((hall) => ({ value: hall._id, label: hall.name })),
            ]}
          />
          <Select
            label="Trainer"
            value={filters.trainerId}
            onChange={(e) => setFilters({ ...filters, trainerId: e.target.value })}
            options={[
              { value: "", label: "All Trainers" },
              ...trainers.map((trainer) => ({ value: trainer._id, label: trainer.userId.name })),
            ]}
          />
          {(filters.status || filters.hallId || filters.trainerId) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({ status: "", hallId: "", trainerId: "" })}
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
      {!loading && classes.length === 0 && (
        <EmptyState
          title="No classes found"
          description="No classes match your current filters"
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
                      <Card key={classSession._id} className={isCanceled ? "opacity-60" : "hover:shadow-soft-lg transition-shadow"}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-2xl font-bold text-text-primary">
                                  {formatTime(classSession.startAt)}
                                </p>
                                <Badge variant={isCanceled ? "error" : "success"} size="sm">
                                  {isCanceled ? "Canceled" : "Scheduled"}
                                </Badge>
                              </div>
                              <p className="text-sm text-text-secondary mb-3">
                                {formatTime(classSession.endAt)} • {getHallName(classSession.hallId)}
                              </p>
                              <div className="space-y-1 text-sm text-text-secondary">
                                <p>
                                  <span className="font-medium text-text-primary">Trainer:</span> {getTrainerName(classSession)}
                                </p>
                                <p>
                                  <span className="font-medium text-text-primary">
                                    {classSession.takenSeats} / {classSession.capacity}
                                  </span>{" "}
                                  seats booked
                                </p>
                                {classSession.price && (
                                  <p>
                                    <span className="font-medium text-text-primary">Price:</span> ${classSession.price}
                                  </p>
                                )}
                              </div>
                            </div>
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

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
