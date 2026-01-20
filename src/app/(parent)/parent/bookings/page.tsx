"use client";

import { useState, useEffect, useMemo } from "react";
import {
  PageHeader,
  Card,
  CardContent,
  Button,
  EmptyState,
  Spinner,
  useToast,
  ToastContainer,
} from "@/components/ui";
import { apiGet, apiDelete, FetchError } from "@/lib/fetcher";

interface Booking {
  _id: string;
  classSessionId: {
    _id: string;
    startAt: string;
    endAt: string;
    hallId: { _id: string; name: string };
    trainerId: {
      _id: string;
      userId: { name: string };
    };
    capacity: number;
    takenSeats: number;
  };
  childId: {
    _id: string;
    name: string;
  };
  status: "BOOKED" | "CANCELED";
  createdAt: string;
}

export default function BookingsPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelingBookingId, setCancelingBookingId] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiGet<Booking[]>("/api/bookings/mine");
      setBookings(data);
    } catch (err) {
      const error = err as FetchError;
      setError(error.message || "Failed to load bookings");
      showToast(error.message || "Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (booking: Booking) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setCancelingBookingId(booking._id);
      await apiDelete(`/api/bookings/${booking._id}`);
      setBookings(bookings.map((b) => (b._id === booking._id ? { ...b, status: "CANCELED" as const } : b)));
      showToast("Booking canceled successfully", "success");
      await loadBookings(); // Reload to get updated data
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to cancel booking", "error");
    } finally {
      setCancelingBookingId(null);
    }
  };

  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const upcomingBookings: Booking[] = [];
    const pastBookings: Booking[] = [];

    bookings.forEach((booking) => {
      const classStart = new Date(booking.classSessionId.startAt);
      if (classStart >= now && booking.status === "BOOKED") {
        upcomingBookings.push(booking);
      } else {
        pastBookings.push(booking);
      }
    });

    return {
      upcoming: upcomingBookings.sort((a, b) => new Date(a.classSessionId.startAt).getTime() - new Date(b.classSessionId.startAt).getTime()),
      past: pastBookings.sort((a, b) => new Date(b.classSessionId.startAt).getTime() - new Date(a.classSessionId.startAt).getTime()),
    };
  }, [bookings]);

  const formatDateTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
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

  const getTrainerName = (booking: Booking): string => {
    return booking.classSessionId.trainerId?.userId?.name || "Unknown Trainer";
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <PageHeader title="My Bookings" description="View and manage your class bookings" />
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader title="My Bookings" description="View and manage your class bookings" />

      {error && !loading && (
        <Card className="mb-6">
          <CardContent>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {bookings.length === 0 ? (
        <Card>
          <CardContent padding="lg">
            <EmptyState
              title="No bookings yet"
              description="Browse the schedule to book your first class"
              action={
                <Button variant="primary" onClick={() => (window.location.href = "/schedule")}>
                  Browse Schedule
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Upcoming Bookings */}
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-headline text-gray-900 dark:text-gray-100 mb-4">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map((booking) => (
                  <Card key={booking._id} className="hover:shadow-soft-lg transition-shadow">
                    <CardContent>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                            {formatDateTime(booking.classSessionId.startAt)}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <p>
                              Time: {formatTime(booking.classSessionId.startAt)} -{" "}
                              {formatTime(booking.classSessionId.endAt)}
                            </p>
                            <p>Trainer: {getTrainerName(booking)}</p>
                            <p>Hall: {booking.classSessionId.hallId.name}</p>
                            <p>Child: {booking.childId.name}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancel(booking)}
                          isLoading={cancelingBookingId === booking._id}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Past Bookings */}
          {past.length > 0 && (
            <div>
              <h2 className="text-headline text-gray-900 dark:text-gray-100 mb-4">Past</h2>
              <div className="space-y-3">
                {past.map((booking) => (
                  <Card
                    key={booking._id}
                    className="hover:shadow-soft-lg transition-shadow opacity-75"
                  >
                    <CardContent>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                              {formatDateTime(booking.classSessionId.startAt)}
                            </h3>
                            {booking.status === "CANCELED" && (
                              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                Canceled
                              </span>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <p>
                              Time: {formatTime(booking.classSessionId.startAt)} -{" "}
                              {formatTime(booking.classSessionId.endAt)}
                            </p>
                            <p>Trainer: {getTrainerName(booking)}</p>
                            <p>Hall: {booking.classSessionId.hallId.name}</p>
                            <p>Child: {booking.childId.name}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
