"use client";

import React from "react";

export interface SegmentedControlOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className = "",
}: SegmentedControlProps) {
  return (
    <div
      className={`inline-flex bg-accent-soft rounded-control p-1 ${className}`}
      role="tablist"
      aria-label="Segmented control"
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-4 py-2 rounded-control text-sm font-medium transition-all duration-200 touch-manipulation min-h-[44px] flex-1 ${
              isSelected
                ? "bg-surface text-accent shadow-soft"
                : "text-text-secondary hover:text-text-primary"
            }`}
            role="tab"
            aria-selected={isSelected}
            aria-controls={`panel-${option.value}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
