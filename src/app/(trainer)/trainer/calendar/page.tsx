"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui";
import { apiGet } from "@/lib/fetcher";

interface ClassSession {
  _id: string;
  startAt: string;
}

export default function TrainerCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await apiGet<ClassSession[]>("/api/classes/mine");
      setClasses(data || []);
    } catch (error) {
      console.error("Failed to load classes:", error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  // Create marked dates from classes
  const markedDates = classes.map((classSession) => {
    const date = new Date(classSession.startAt);
    date.setHours(0, 0, 0, 0);
    return {
      date,
      state: "active" as const,
    };
  });

  // Add some example dates for demonstration
  const today = new Date();
  const exampleDates = [
    { date: new Date(today.getFullYear(), today.getMonth(), 2), state: "active" as const },
    { date: new Date(today.getFullYear(), today.getMonth(), 5), state: "active" as const },
    { date: new Date(today.getFullYear(), today.getMonth(), 6), state: "active" as const },
    { date: new Date(today.getFullYear(), today.getMonth(), 8), state: "active" as const },
    { date: new Date(today.getFullYear(), today.getMonth(), 11), state: "active" as const },
    { date: new Date(today.getFullYear(), today.getMonth(), 14), state: "active" as const },
    { date: new Date(today.getFullYear(), today.getMonth(), 20), state: "active" as const },
    { date: new Date(today.getFullYear(), today.getMonth(), 23), state: "active" as const },
    { date: new Date(today.getFullYear(), today.getMonth(), 24), state: "active" as const },
    { date: new Date(today.getFullYear(), today.getMonth(), 28), state: "active" as const },
    { date: new Date(today.getFullYear(), today.getMonth(), 10), state: "blocked" as const },
    { date: new Date(today.getFullYear(), today.getMonth(), 25), state: "blocked" as const },
  ];

  const allMarkedDates = [...markedDates, ...exampleDates];

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="w-full space-y-4">
      <Calendar
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        markedDates={allMarkedDates}
      />
    </div>
  );
}
