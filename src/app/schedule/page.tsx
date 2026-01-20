"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  EmptyState,
  useToast,
  ToastContainer,
  SkeletonList,
  Modal,
} from "@/components/ui";
import { DateSelector } from "@/components/schedule/DateSelector";
import { ClassCard } from "@/components/schedule/ClassCard";
import { BookingModal } from "@/components/schedule/BookingModal";
import { PaymentCard } from "@/components/payment/PaymentCard";
import { apiGet, apiPost, FetchError } from "@/lib/fetcher";

interface Hall {
  _id: string;
  name: string;
  isActive?: boolean;
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
  const [createdBooking, setCreatedBooking] = useState<{ id: string; price?: number } | null>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  // Date filter
  const [dateFilter, setDateFilter] = useState("");

  const loadHalls = useCallback(async () => {
    try {
      const data = await apiGet<Hall[]>("/api/halls");
      setHalls(data.filter((h) => h.isActive));
    } catch {
      // Silently fail - halls are optional
    }
  }, []);

  const loadChildren = useCallback(async () => {
    try {
      const data = await apiGet<Child[]>("/api/children");
      setChildren(data);
    } catch {
      // Silently fail - children will be loaded when needed
    }
  }, []);

  const loadSchedule = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (dateFilter) {
        params.set("date", dateFilter);
      }

      const data = await apiGet<ClassSession[]>(`/api/schedule?${params.toString()}`);
      const classesArray = Array.isArray(data) ? data : [];
      setClasses(classesArray);
    } catch (err) {
      const error = err as FetchError;
      setError(error.message || "Failed to load schedule");
      if (!error.message?.includes("offline")) {
        showToast(error.message || "Failed to load schedule", "error");
      }
    } finally {
      setLoading(false);
    }
  }, [dateFilter, showToast]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDateFilter(today);
    loadHalls();
    if (session?.user?.role === "PARENT") {
      loadChildren();
    }
  }, [session, loadHalls, loadChildren]);

  useEffect(() => {
    if (dateFilter) {
      loadSchedule();
    }
  }, [loadSchedule, dateFilter]);

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
      const booking = await apiPost<{ _id: string }>("/api/bookings", {
        classSessionId: selectedClass._id,
        childId: selectedChildId,
      });

      // If payment is required, show payment card
      if (selectedClass.price && selectedClass.price > 0) {
        setCreatedBooking({ id: booking._id, price: selectedClass.price });
        setIsBookingModalOpen(false);
      } else {
        showToast("Class booked successfully!", "success");
        setIsBookingModalOpen(false);
        setSelectedClass(null);
        setSelectedChildId("");
        
        // Reload schedule to update seats
        await loadSchedule();
        if (session?.user?.role === "PARENT") {
          await loadChildren();
        }
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

  const handlePayment = async () => {
    if (!createdBooking || !createdBooking.price) {
      return;
    }

    try {
      setIsPaymentLoading(true);
      const response = await apiPost<{ paymentUrl: string }>("/api/payments/initiate", {
        bookingId: createdBooking.id,
        amount: createdBooking.price,
      });

      // Redirect to LiqPay checkout
      window.location.href = response.paymentUrl;
    } catch (err) {
      const error = err as FetchError;
      showToast(error.message || "Failed to initiate payment", "error");
      setIsPaymentLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="w-full space-y-4">
      {/* Sticky Date Selector */}
      <DateSelector selectedDate={dateFilter} onDateChange={setDateFilter} />

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          <SkeletonList items={5} />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <EmptyState
          title="Something went wrong"
          description={error}
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      )}

      {/* Empty State */}
      {!loading && !error && classes.length === 0 && (
        <EmptyState
          title="No classes today"
          description={
            dateFilter
              ? `No classes scheduled for ${formatDate(dateFilter + "T00:00:00")}. Try selecting a different date.`
              : "No classes match your filters. Try selecting a different date."
          }
          icon={
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      )}

      {/* Class List */}
      {!loading && !error && classes.length > 0 && (
        <div className="space-y-3">
          {classes.map((classSession) => {
            const seats = seatsLeft(classSession);
            const past = isPast(classSession);
            const canBook = !past && seats > 0 && session?.user?.role === "PARENT";

            return (
              <ClassCard
                key={classSession._id}
                classSession={{
                  _id: classSession._id,
                  startAt: classSession.startAt,
                  endAt: classSession.endAt,
                  capacity: classSession.capacity,
                  takenSeats: classSession.takenSeats,
                  price: classSession.price,
                  trainerName: getTrainerName(classSession),
                  hallName: getHallName(classSession.hallId),
                }}
                onBookClick={() => handleBookClick(classSession)}
                isPast={past}
                canBook={canBook}
                isLoggedIn={!!session?.user}
                loginUrl={`/login?callbackUrl=${encodeURIComponent("/schedule")}`}
              />
            );
          })}
        </div>
      )}

      {/* Booking Modal */}
      {selectedClass && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedClass(null);
            setSelectedChildId("");
          }}
          classSession={{
            startAt: selectedClass.startAt,
            endAt: selectedClass.endAt,
            trainerName: getTrainerName(selectedClass),
            hallName: getHallName(selectedClass.hallId),
            price: selectedClass.price,
          }}
          childrenList={children}
          selectedChildId={selectedChildId}
          onChildChange={setSelectedChildId}
          onConfirm={handleBooking}
          isLoading={isSubmitting}
        />
      )}

      {/* Payment Modal */}
      {createdBooking && createdBooking.price && (
        <Modal
          isOpen={true}
          onClose={() => {
            setCreatedBooking(null);
            setSelectedClass(null);
            setSelectedChildId("");
            loadSchedule();
            if (session?.user?.role === "PARENT") {
              loadChildren();
            }
          }}
          title="Payment Required"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Your booking has been created. Please complete payment to confirm your spot.
            </p>
            <PaymentCard
              amount={createdBooking.price}
              bookingId={createdBooking.id}
              onPayClick={handlePayment}
              isLoading={isPaymentLoading}
            />
          </div>
        </Modal>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
