"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  PageHeader,
  Card,
  CardContent,
  Button,
  EmptyState,
  useToast,
  ToastContainer,
  SkeletonList,
  Badge,
  SegmentedControl,
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
  const [segment, setSegment] = useState<"upcoming" | "past">("upcoming");
  const [cancelingBookingId, setCancelingBookingId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<Booking[]>("/api/bookings/mine");
      setBookings(data);
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleCancel = async (booking: Booking) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setCancelingBookingId(booking._id);
      await apiDelete(`/api/bookings/${booking._id}`);
      setBookings(bookings.map((b) => (b._id === booking._id ? { ...b, status: "CANCELED" as const } : b)));
      showToast("Booking canceled successfully", "success");
      await loadBookings();
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

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
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

  const displayedBookings = segment === "upcoming" ? upcoming : past;

  return (
    <div className="w-full space-y-4">
      <PageHeader title="My Bookings" description="View and manage your class bookings" />

      {/* Loading State */}
      {loading && <SkeletonList items={3} />}

      {/* Bookings List */}
      {!loading && bookings.length > 0 && (
        <>
          <SegmentedControl
            options={[
              { value: "upcoming", label: `Upcoming (${upcoming.length})` },
              { value: "past", label: `Past (${past.length})` },
            ]}
            value={segment}
            onChange={(value) => setSegment(value as "upcoming" | "past")}
            className="w-full"
          />

          {displayedBookings.length === 0 ? (
            <EmptyState
              title={`No ${segment} bookings`}
              description={
                segment === "upcoming"
                  ? "You don't have any upcoming classes. Browse the schedule to book one."
                  : "You don't have any past bookings yet."
              }
              icon={
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
              action={
                segment === "upcoming" ? (
                  <Button variant="primary" onClick={() => (window.location.href = "/schedule")}>
                    Browse Schedule
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-3">
              {displayedBookings.map((booking) => {
                const isPast = segment === "past";
                const isCanceled = booking.status === "CANCELED";

                return (
                  <Card
                    key={booking._id}
                    className={`hover:shadow-soft-lg ${isPast ? "opacity-75" : ""}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-2xl font-bold text-text-primary">
                              {formatTime(booking.classSessionId.startAt)}
                            </p>
                            {isCanceled && (
                              <Badge variant="error" size="sm">
                                Canceled
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-text-secondary mb-3">
                            {formatDate(booking.classSessionId.startAt)} • {formatTime(booking.classSessionId.endAt)}
                          </p>
                          <div className="space-y-1 text-sm text-text-secondary">
                            <p>
                              <span className="font-medium text-text-primary">Trainer:</span> {getTrainerName(booking)}
                            </p>
                            <p>
                              <span className="font-medium text-text-primary">Hall:</span> {booking.classSessionId.hallId.name}
                            </p>
                            <p>
                              <span className="font-medium text-text-primary">Child:</span> {booking.childId.name}
                            </p>
                          </div>
                        </div>
                        {!isPast && !isCanceled && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCancel(booking)}
                            isLoading={cancelingBookingId === booking._id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && bookings.length === 0 && (
        <EmptyState
          title="No bookings yet"
          description="Browse the schedule to book your first class"
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          action={
            <Button variant="primary" onClick={() => (window.location.href = "/schedule")}>
              Browse Schedule
            </Button>
          }
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
