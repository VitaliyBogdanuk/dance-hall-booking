"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui";

export interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
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
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const handlePreviousDay = () => {
    const date = new Date(selectedDate + "T00:00:00");
    date.setDate(date.getDate() - 1);
    onDateChange(date.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate + "T00:00:00");
    date.setDate(date.getDate() + 1);
    onDateChange(date.toISOString().split("T")[0]);
  };

  return (
    <div className="sticky top-14 sm:top-16 z-30 -mx-4 px-4 py-3 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePreviousDay}
              className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-accent-soft transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Previous day"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex-1 text-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="text-base font-semibold text-text-primary bg-transparent border-none outline-none cursor-pointer text-center w-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full"
                aria-label="Select date"
              />
              <p className="text-sm text-text-secondary mt-1">{formatDisplayDate(selectedDate)}</p>
            </div>

            <button
              onClick={handleNextDay}
              className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-accent-soft transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Next day"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
