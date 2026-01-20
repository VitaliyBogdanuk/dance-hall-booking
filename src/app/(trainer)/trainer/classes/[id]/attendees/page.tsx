"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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

  useEffect(() => {
    loadData();
  }, [classId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // Load class data first
      const classData = await apiGet<ClassSession>(`/api/classes/${classId}`);
      setClassSession(classData);

      // Then load bookings (this might fail if trainer doesn't own the class)
      try {
        const bookingsData = await apiGet<Booking[]>(`/api/classes/${classId}/bookings`);
        setBookings(bookingsData);
      } catch (bookingsErr) {
        const bookingsError = bookingsErr as FetchError;
        // Only show error if it's not a permission error (we'll show it in the UI)
        if (bookingsError.code !== "FORBIDDEN") {
          setError(bookingsError.message || "Failed to load bookings");
          showToast(bookingsError.message || "Failed to load bookings", "error");
        } else {
          setError(bookingsError.message || "You can only view bookings for your own classes");
          // Don't show toast for permission errors - they're shown in the UI
        }
        setBookings([]);
      }
    } catch (err) {
      const error = err as FetchError;
      setError(error.message || "Failed to load data");
      // Only show toast for non-permission errors
      if (error.code !== "FORBIDDEN") {
        showToast(error.message || "Failed to load data", "error");
      }
    } finally {
      setLoading(false);
    }
  };

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

  const getHallName = (hallId: string | { _id: string; name: string }): string => {
    if (typeof hallId === "object" && hallId !== null) {
      return hallId.name;
    }
    return "Unknown Hall";
  };

  if (loading) {
    return (
      <div className="w-full">
        <PageHeader title="Class Attendees" description="View attendees for this class" />
        <div className="flex items-center justify-center py-12 sm:py-16">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PageHeader
        title="Class Attendees"
        description="View attendees for this class"
        action={
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push("/trainer/schedule")}
            className="w-full sm:w-auto text-sm"
          >
            ← Back
          </Button>
        }
      />

      {error && !loading && (
        <Card className="mb-4 sm:mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm sm:text-base font-medium text-red-800 dark:text-red-300 mb-1">
                  Access Denied
                </p>
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {classSession && (
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {new Date(classSession.startAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h3>
                <p className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                  {formatTime(classSession.startAt)} - {formatTime(classSession.endAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 sm:gap-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{getHallName(classSession.hallId)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>
                    {classSession.takenSeats} / {classSession.capacity} booked
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {bookings.length === 0 && !error ? (
        <Card>
          <CardContent className="p-8 sm:p-12">
            <EmptyState
              title="No attendees yet"
              description="No bookings have been made for this class"
            />
          </CardContent>
        </Card>
      ) : bookings.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {bookings.map((booking) => (
                <div key={booking._id} className="p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors active:bg-gray-100 dark:active:bg-gray-800">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <span className="text-base sm:text-lg font-semibold text-blue-700 dark:text-blue-300">
                        {booking.childId.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {booking.childId.name}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                            booking.status === "BOOKED"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="truncate">{booking.parentId.name}</span>
                        </p>
                        {booking.parentId.email && (
                          <p className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="truncate break-all">{booking.parentId.email}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
