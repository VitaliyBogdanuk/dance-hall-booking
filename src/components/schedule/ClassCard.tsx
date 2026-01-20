"use client";

import React from "react";
import { Card, CardContent, Button, Badge } from "@/components/ui";

export interface ClassCardProps {
  classSession: {
    _id: string;
    startAt: string;
    endAt: string;
    capacity: number;
    takenSeats: number;
    price?: number;
    trainerName: string;
    hallName: string;
  };
  onBookClick?: () => void;
  onWaitlistClick?: () => void;
  isPast?: boolean;
  canBook?: boolean;
  isLoggedIn?: boolean;
  loginUrl?: string;
}

export function ClassCard({
  classSession,
  onBookClick,
  onWaitlistClick,
  isPast = false,
  canBook = false,
  isLoggedIn = false,
  loginUrl,
}: ClassCardProps) {
  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const seatsLeft = classSession.capacity - classSession.takenSeats;
  const isFull = seatsLeft === 0;
  const seatsBadgeVariant = seatsLeft > 5 ? "success" : seatsLeft > 0 ? "warning" : "error";

  return (
    <Card className="hover:shadow-soft-lg">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-bold text-text-primary mb-1">
              {formatTime(classSession.startAt)}
            </p>
            <p className="text-sm text-text-secondary mb-3">
              {formatTime(classSession.endAt)}
            </p>
            <p className="text-base font-medium text-text-primary mb-1">
              {classSession.trainerName}
            </p>
            <p className="text-sm text-text-secondary">
              {classSession.hallName}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {!isPast && (
              <Badge variant={seatsBadgeVariant} size="md">
                {seatsLeft} {seatsLeft === 1 ? "seat" : "seats"} left
              </Badge>
            )}
            {classSession.price && (
              <p className="text-base font-semibold text-text-primary">
                ${classSession.price}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {canBook ? (
            <Button
              variant="primary"
              className="flex-1"
              onClick={onBookClick}
            >
              Book
            </Button>
          ) : !isLoggedIn ? (
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => loginUrl && (window.location.href = loginUrl)}
            >
              Log in to book
            </Button>
          ) : isPast ? (
            <Button variant="ghost" className="flex-1" disabled>
              Past class
            </Button>
          ) : isFull ? (
            <>
              <Button variant="ghost" className="flex-1" disabled>
                Full
              </Button>
              {onWaitlistClick && (
                <Button variant="secondary" className="flex-1" onClick={onWaitlistClick}>
                  Join waitlist
                </Button>
              )}
            </>
          ) : (
            <Button variant="ghost" className="flex-1" disabled>
              Not available
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
