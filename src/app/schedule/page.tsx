"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  PageHeader,
  Card,
  CardContent,
  Button,
  Modal,
  Select,
  Input,
  EmptyState,
  Spinner,
  useToast,
  ToastContainer,
} from "@/components/ui";
import { apiGet, apiPost, FetchError } from "@/lib/fetcher";
import Link from "next/link";

interface Hall {
  _id: string;
  name: string;
}

interface Trainer {
  _id: string;
  name: string;
}

interface ClassSession {
  _id: string;
  hallId: string | { _id: string; name: string };
  trainerId: string | { userId?: { name?: string } };
  trainerName?: string;
  startAt: string;
  endAt: string;
  capacity: number;
  takenSeats: number;
  price?: number;
}

interface Child {
  _id: string;
  name: string;
}

export default function SchedulePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();

  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [hasCachedData, setHasCachedData] = useState(false);

  // Filters
  const [dateFilter, setDateFilter] = useState("");
  const [trainerFilter, setTrainerFilter] = useState("");
  const [hallFilter, setHallFilter] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDateFilter(today);
    loadHalls();
    if (session?.user?.role === "PARENT") {
      loadChildren();
    }

    // Monitor online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [session]);

  useEffect(() => {
    loadSchedule();
  }, [dateFilter, trainerFilter, hallFilter]);

  const loadHalls = async () => {
    try {
      const data = await apiGet<Hall[]>("/api/halls");
      setHalls(data.filter((h) => h.isActive));
    } catch (err) {
      // Silently fail - halls are optional
    }
  };

  const loadChildren = async () => {
    try {
      const data = await apiGet<Child[]>("/api/children");
      setChildren(data);
    } catch (err) {
      // Silently fail - children will be loaded when needed
    }
  };

  const loadSchedule = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (dateFilter) {
        params.set("date", dateFilter);
      }
      if (trainerFilter) {
        params.set("trainerId", trainerFilter);
      }
      if (hallFilter) {
        params.set("hallId", hallFilter);
      }

      const data = await apiGet<ClassSession[]>(`/api/schedule?${params.toString()}`);
      // Ensure data is always an array
      const classesArray = Array.isArray(data) ? data : [];
      
      // Debug: log if data is not an array
      if (!Array.isArray(data)) {
        console.warn("Schedule API returned non-array data:", typeof data, data);
      }
      
      setClasses(classesArray);
      setHasCachedData(classesArray.length > 0);
    } catch (err) {
      const error = err as FetchError;
      // If offline and we have cached classes, don't show error
      if (isOffline && classes.length > 0) {
        setHasCachedData(true);
        return;
      }
      setError(error.message || "Failed to load schedule");
      if (!isOffline) {
        showToast(error.message || "Failed to load schedule", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = async (classSession: ClassSession) => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=${encodeURIComponent("/schedule")}`);
      return;
    }

    if (session.user.role !== "PARENT") {
      showToast("Only parents can book classes", "error");
      return;
    }

    // Reload children if empty
    if (children.length === 0) {
      await loadChildren();
    }

    if (children.length === 0) {
      showToast("Please add a child first", "error");
      router.push("/parent/children");
      return;
    }

    setSelectedClass(classSession);
    setSelectedChildId(children[0]._id);
    setIsBookingModalOpen(true);
  };

  const handleBooking = async () => {
    if (!selectedClass || !selectedChildId) {
      showToast("Please select a child", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      await apiPost("/api/bookings", {
        classSessionId: selectedClass._id,
        childId: selectedChildId,
      });

      showToast("Class booked successfully!", "success");
      setIsBookingModalOpen(false);
      setSelectedClass(null);
      setSelectedChildId("");

      // Reload schedule to update seats
      await loadSchedule();
      if (session?.user?.role === "PARENT") {
        await loadChildren();
      }
    } catch (err) {
      const error = err as FetchError;
      const message = error.message || "Failed to book class";
      
      if (error.code === "CONFLICT" || message.includes("already booked") || message.includes("places left") || message.includes("past")) {
        showToast(message, "warning");
      } else {
        showToast(message, "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
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

  const getTrainerName = (classSession: ClassSession): string => {
    if (classSession.trainerName) {
      return classSession.trainerName;
    }
    if (typeof classSession.trainerId === "object" && classSession.trainerId !== null) {
      return (classSession.trainerId as { userId?: { name?: string } }).userId?.name || "Unknown Trainer";
    }
    return "Unknown Trainer";
  };

  const seatsLeft = (classSession: ClassSession) => {
    return classSession.capacity - classSession.takenSeats;
  };

  const isPast = (classSession: ClassSession) => {
    return new Date(classSession.startAt) < new Date();
  };

  // Get unique trainers from classes for filter
  const trainers = useMemo(() => {
    const trainerMap = new Map<string, string>();
    // Ensure classes is an array
    if (!Array.isArray(classes)) {
      return [];
    }
    classes.forEach((cls) => {
      const trainerName = getTrainerName(cls);
      if (typeof cls.trainerId === "object" && cls.trainerId !== null) {
        const trainerId = (cls.trainerId as { _id?: string })._id;
        if (trainerId) {
          trainerMap.set(trainerId, trainerName);
        }
      }
    });
    return Array.from(trainerMap.entries()).map(([id, name]) => ({ _id: id, name }));
  }, [classes]);

  return (
    <div className="w-full">

      {/* Offline Banner */}
      {isOffline && hasCachedData && (
        <Card className="mb-6 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <CardContent>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                You are offline. Showing cached schedule.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Input
              type="date"
              label="Date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <Select
              label="Trainer"
              value={trainerFilter}
              onChange={(e) => setTrainerFilter(e.target.value)}
              options={[
                { value: "", label: "All Trainers" },
                ...trainers.map((t) => ({ value: t._id, label: t.name })),
              ]}
            />
            <Select
              label="Hall"
              value={hallFilter}
              onChange={(e) => setHallFilter(e.target.value)}
              options={[
                { value: "", label: "All Halls" },
                ...halls.map((h) => ({ value: h._id, label: h.name })),
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {error && !loading && (
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm sm:text-base text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : classes.length === 0 ? (
        <Card>
          <CardContent padding="lg">
            <EmptyState
              title={isOffline ? "No cached schedule available" : "No classes available"}
              description={
                isOffline
                  ? "You are offline and no cached schedule is available. Please connect to the internet to view classes."
                  : dateFilter
                  ? `No classes scheduled for ${formatDate(dateFilter + "T00:00:00")}. Try a different date.`
                  : "No classes match your filters. Try adjusting your search."
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {classes.map((classSession) => {
            const seats = seatsLeft(classSession);
            const past = isPast(classSession);
            const canBook = !past && seats > 0 && session?.user?.role === "PARENT";

            return (
              <Card key={classSession._id} className="hover:shadow-soft-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {formatDate(classSession.startAt)}
                    </p>
                    <p className="text-headline text-gray-900 dark:text-gray-100 mb-2">
                      {formatTime(classSession.startAt)} - {formatTime(classSession.endAt)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getTrainerName(classSession)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getHallName(classSession.hallId)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {seats} {seats === 1 ? "seat" : "seats"} left
                    </span>
                    {classSession.price && (
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        ${classSession.price}
                      </span>
                    )}
                  </div>
                  {canBook ? (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => handleBookClick(classSession)}
                    >
                      Book
                    </Button>
                  ) : !session?.user ? (
                    <Link href={`/login?callbackUrl=${encodeURIComponent("/schedule")}`}>
                      <Button variant="secondary" className="w-full">
                        Log in to book
                      </Button>
                    </Link>
                  ) : past ? (
                    <Button variant="ghost" className="w-full" disabled>
                      Past class
                    </Button>
                  ) : seats === 0 ? (
                    <Button variant="ghost" className="w-full" disabled>
                      Full
                    </Button>
                  ) : (
                    <Button variant="ghost" className="w-full" disabled>
                      Not available
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Booking Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedClass(null);
          setSelectedChildId("");
        }}
        title="Book Class"
        size="md"
      >
        <div className="space-y-4">
          {selectedClass && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                {formatDate(selectedClass.startAt)} at {formatTime(selectedClass.startAt)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getTrainerName(selectedClass)} • {getHallName(selectedClass.hallId)}
              </p>
            </div>
          )}
          <Select
            label="Select Child"
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            options={[
              { value: "", label: "Select a child" },
              ...children.map((c) => ({ value: c._id, label: c.name })),
            ]}
            required
            disabled={isSubmitting}
          />
          {children.length === 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <Link href="/parent/children" className="text-blue-600 hover:text-blue-700">
                Add a child
              </Link>{" "}
              to book classes
            </p>
          )}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsBookingModalOpen(false);
                setSelectedClass(null);
                setSelectedChildId("");
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleBooking}
              isLoading={isSubmitting}
              disabled={!selectedChildId || children.length === 0}
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
