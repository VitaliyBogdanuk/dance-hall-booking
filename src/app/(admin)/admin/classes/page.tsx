"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  PageHeader,
  Card,
  CardContent,
  Button,
  EmptyState,
  Spinner,
  useToast,
  ToastContainer,
  Select,
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
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "" as "" | "SCHEDULED" | "CANCELED",
    hallId: "",
    trainerId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadClasses();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // Load halls and trainers for filters
      const [hallsData, trainersData] = await Promise.all([
        apiGet<Hall[]>("/api/halls").catch(() => []),
        apiGet<Trainer[]>("/api/admin/trainers").catch(() => []),
      ]);

      setHalls(hallsData);
      setTrainers(trainersData);
    } catch (err) {
      const error = err as FetchError;
      setError(error.message || "Failed to load data");
      showToast(error.message || "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      setLoading(true);
      setError("");

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
      setError(error.message || "Failed to load classes");
      showToast(error.message || "Failed to load classes", "error");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

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

  if (loading && classes.length === 0) {
    return (
      <div className="w-full">
        <PageHeader title="Classes" description="Manage all class sessions" />
        <div className="flex items-center justify-center py-12 sm:py-16">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PageHeader
        title="Classes"
        description="View and manage all class sessions"
      />

      {/* Filters */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as typeof filters.status })}
            >
              <option value="">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="CANCELED">Canceled</option>
            </Select>

            <Select
              label="Hall"
              value={filters.hallId}
              onChange={(e) => setFilters({ ...filters, hallId: e.target.value })}
            >
              <option value="">All Halls</option>
              {halls.map((hall) => (
                <option key={hall._id} value={hall._id}>
                  {hall.name}
                </option>
              ))}
            </Select>

            <Select
              label="Trainer"
              value={filters.trainerId}
              onChange={(e) => setFilters({ ...filters, trainerId: e.target.value })}
            >
              <option value="">All Trainers</option>
              {trainers.map((trainer) => (
                <option key={trainer._id} value={trainer._id}>
                  {trainer.userId.name}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {error && !loading && (
        <Card className="mb-4 sm:mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm sm:text-base text-red-800 dark:text-red-300">{error}</p>
          </CardContent>
        </Card>
      )}

      {classes.length === 0 ? (
        <Card>
          <CardContent className="p-8 sm:p-12">
            <EmptyState
              title="No classes found"
              description="No classes match your current filters"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {Object.entries(groupedClasses).map(([date, dateClasses]) => (
            <Card key={date}>
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-headline text-gray-900 dark:text-gray-100 mb-4">
                  {date}
                </h3>
                <div className="space-y-3">
                  {dateClasses.map((classSession) => {
                    const isCanceled = classSession.status === "CANCELED";
                    const seatsAvailable = classSession.capacity - classSession.takenSeats;
                    return (
                      <div
                        key={classSession._id}
                        className={`p-4 rounded-xl border ${
                          isCanceled
                            ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-2">
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
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                              <p>Hall: {getHallName(classSession.hallId)}</p>
                              <p>Trainer: {getTrainerName(classSession)}</p>
                              <div className="flex flex-wrap gap-3 sm:gap-4">
                                <span>
                                  {classSession.takenSeats} / {classSession.capacity} booked
                                </span>
                                <span className={seatsAvailable === 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}>
                                  {seatsAvailable} {seatsAvailable === 1 ? "seat" : "seats"} available
                                </span>
                                {classSession.price && (
                                  <span className="font-medium text-gray-900 dark:text-gray-100">
                                    ${classSession.price}
                                  </span>
                                )}
                              </div>
                            </div>
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

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
