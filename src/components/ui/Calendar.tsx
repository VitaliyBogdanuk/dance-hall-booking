"use client";

import React from "react";
import { Card, CardContent } from "./Card";

export interface MarkedDate {
  date: Date;
  state: "active" | "blocked" | "selected";
}

export interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  markedDates?: MarkedDate[];
}

export function Calendar({ selectedDate, onDateSelect, markedDates = [] }: CalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  // Get first day of month and number of days
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Create array of dates for the month
  const days: (Date | null)[] = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    days.push(date);
  }

  const getMarkedState = (date: Date): MarkedDate["state"] | null => {
    const dateStr = date.toISOString().split("T")[0];
    const marked = markedDates.find((md) => {
      const mdStr = md.date.toISOString().split("T")[0];
      return mdStr === dateStr;
    });
    return marked?.state || null;
  };

  const isToday = (date: Date): boolean => {
    return date.toISOString().split("T")[0] === today.toISOString().split("T")[0];
  };

  const isSelected = (date: Date): boolean => {
    return date.toISOString().split("T")[0] === selectedDate.toISOString().split("T")[0];
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePreviousMonth = () => {
    const newDate = new Date(currentYear, currentMonth - 1, 1);
    onDateSelect(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentYear, currentMonth + 1, 1);
    onDateSelect(newDate);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousMonth}
              className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-accent-soft transition-colors"
              aria-label="Previous month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-text-primary">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-accent-soft transition-colors"
              aria-label="Next month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-text-secondary py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const markedState = getMarkedState(date);
              const dateIsToday = isToday(date);
              const dateIsSelected = isSelected(date);

              let className = "aspect-square flex items-center justify-center text-sm rounded-lg transition-colors cursor-pointer touch-manipulation";
              
              if (dateIsSelected) {
                className += " bg-accent text-white font-semibold";
              } else if (dateIsToday) {
                className += " bg-accent-soft text-accent font-semibold";
              } else if (markedState === "blocked") {
                className += " bg-gray-100 dark:bg-gray-800 text-text-secondary opacity-50 cursor-not-allowed";
              } else if (markedState === "active") {
                className += " bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30";
              } else {
                className += " text-text-primary hover:bg-accent-soft";
              }

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => onDateSelect(date)}
                  disabled={markedState === "blocked"}
                  className={className}
                  aria-label={`Select ${date.toLocaleDateString()}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
