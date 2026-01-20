"use client";

import React from "react";
import { Modal, Select, Button, Card, CardContent } from "@/components/ui";

export interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  classSession: {
    startAt: string;
    endAt: string;
    trainerName: string;
    hallName: string;
    price?: number;
  } | null;
  childrenList: Array<{ _id: string; name: string }>;
  selectedChildId: string;
  onChildChange: (childId: string) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function BookingModal({
  isOpen,
  onClose,
  classSession,
  childrenList,
  selectedChildId,
  onChildChange,
  onConfirm,
  isLoading = false,
}: BookingModalProps) {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book Class" size="md">
      <div className="space-y-6">
        {/* Summary Card */}
        {classSession && (
          <Card>
            <CardContent className="p-4">
              <p className="text-base font-semibold text-text-primary mb-1">
                {formatDate(classSession.startAt)}
              </p>
              <p className="text-2xl font-bold text-text-primary mb-2">
                {formatTime(classSession.startAt)} - {formatTime(classSession.endAt)}
              </p>
              <p className="text-sm text-text-secondary mb-3">
                {classSession.trainerName} • {classSession.hallName}
              </p>
              {classSession.price && (
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Price</span>
                    <span className="text-lg font-bold text-text-primary">${classSession.price}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Select
          label="Select Child"
          value={selectedChildId}
          onChange={(e) => onChildChange(e.target.value)}
          options={[
            { value: "", label: "Select a child" },
            ...childrenList.map((c) => ({ value: c._id, label: c.name })),
          ]}
          disabled={isLoading}
        />

        {childrenList.length === 0 && (
          <p className="text-sm text-text-secondary text-center">
            <a href="/parent/children" className="text-accent hover:underline">
              Add a child
            </a>{" "}
            to book classes
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={!selectedChildId || childrenList.length === 0}
            className="flex-1"
          >
            Confirm Booking
          </Button>
        </div>
      </div>
    </Modal>
  );
}
