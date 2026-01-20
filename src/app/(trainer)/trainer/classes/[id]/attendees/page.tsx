"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
} from "@/components/ui";
import { apiGet, FetchError } from "@/lib/fetcher";

interface Booking {
  _id: string;
  childId: {
    _id: string;
    name: string;
  };
  parentId: {
    _id: string;
    name: string;
    email: string;
  };
  status: "BOOKED" | "CANCELED";
  createdAt: string;
}

interface ClassSession {
  _id: string;
  hallId: string | { _id: string; name: string };
  startAt: string;
  endAt: string;
  capacity: number;
  takenSeats: number;
}

export default function ClassAttendeesPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  const { toasts, showToast, removeToast } = useToast();

  const [classSession, setClassSession] = useState<ClassSession | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const classData = await apiGet<ClassSession>(`/api/classes/${classId}`);
      setClassSession(classData);

      try {
        const bookingsData = await apiGet<Booking[]>(`/api/classes/${classId}/bookings`);
        setBookings(bookingsData);
      } catch (bookingsErr) {
        const bookingsError = bookingsErr as FetchError;
        if (bookingsError.code !== "FORBIDDEN") {
          setError(bookingsError.message || "Failed to load bookings");
          showToast(bookingsError.message || "Failed to load bookings", "error");
        } else {
          setError(bookingsError.message || "You can only view bookings for your own classes");
        }
        setBookings([]);
      }
    } catch (err) {
      const error = err as FetchError;
      setError(error.message || "Failed to load data");
      if (error.code !== "FORBIDDEN") {
        showToast(error.message || "Failed to load data", "error");
      }
    } finally {
      setLoading(false);
    }
  }, [classId, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    return "Unknown Hall";
  };

  return (
    <div className="w-full space-y-4">
      <PageHeader
        title="Attendees"
        description="View attendees for this class"
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/trainer/schedule")}
          >
            ← Back
          </Button>
        }
      />

      {/* Error State */}
      {error && !loading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 mb-1">Access Denied</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Class Summary */}
      {classSession && !error && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-lg font-semibold text-text-primary">
                {formatDate(classSession.startAt)}
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {formatTime(classSession.startAt)} - {formatTime(classSession.endAt)}
              </p>
              <p className="text-sm text-text-secondary">
                {getHallName(classSession.hallId)} • {classSession.takenSeats} / {classSession.capacity} booked
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && <SkeletonList items={3} />}

      {/* Empty State */}
      {!loading && !error && bookings.length === 0 && classSession && (
        <EmptyState
          title="No attendees yet"
          description="No bookings have been made for this class"
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
      )}

      {/* Attendees List */}
      {!loading && !error && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card key={booking._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-text-primary">
                        {booking.childId.name}
                      </h4>
                      {booking.status === "CANCELED" && (
                        <Badge variant="error" size="sm">
                          Canceled
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-text-secondary">
                      <p>
                        <span className="font-medium text-text-primary">Parent:</span> {booking.parentId.name}
                      </p>
                      {booking.parentId.email && (
                        <p>
                          <span className="font-medium text-text-primary">Contact:</span>{" "}
                          <a
                            href={`mailto:${booking.parentId.email}`}
                            className="text-accent hover:underline"
                          >
                            {booking.parentId.email}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
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
