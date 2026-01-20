"use client";

import React, { useState } from "react";
import { Card, CardContent } from "./Card";

export interface CollapsibleCardProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function CollapsibleCard({
  title,
  children,
  defaultOpen = false,
  className = "",
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className={className}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-accent-soft/50 transition-colors rounded-t-card touch-manipulation"
        aria-expanded={isOpen}
        aria-controls={`collapsible-content-${title}`}
      >
        <span className="text-base font-semibold text-text-primary">{title}</span>
        <svg
          className={`w-5 h-5 text-text-secondary transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div id={`collapsible-content-${title}`}>
          <CardContent className="pt-0">
            {children}
          </CardContent>
        </div>
      )}
    </Card>
  );
}
