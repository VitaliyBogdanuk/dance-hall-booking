"use client";

import React from "react";
import { Card, CardContent, Button } from "@/components/ui";

export interface PaymentCardProps {
  amount: number;
  bookingId: string;
  onPayClick: () => void;
  isLoading?: boolean;
}

export function PaymentCard({ amount, bookingId: _bookingId, onPayClick, isLoading = false }: PaymentCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-text-primary">Total</span>
            <span className="text-2xl font-bold text-text-primary">${amount}</span>
          </div>
          
          <div className="pt-3 border-t border-gray-100">
            <p className="text-sm text-text-secondary mb-4 text-center">
              Pay securely with LiqPay
            </p>
            <Button
              variant="primary"
              className="w-full"
              onClick={onPayClick}
              isLoading={isLoading}
            >
              Pay Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
