import React from "react";

export interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
  position?: "bottom-right" | "bottom-left" | "bottom-center";
  size?: "md" | "lg";
}

export function FAB({
  icon,
  label,
  position = "bottom-right",
  size = "md",
  className = "",
  ...props
}: FABProps) {
  const sizeStyles = {
    md: "w-14 h-14",
    lg: "w-16 h-16",
  };

  const positionStyles = {
    "bottom-right": "bottom-4 right-4 sm:bottom-6 sm:right-6",
    "bottom-left": "bottom-4 left-4 sm:bottom-6 sm:left-6",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 sm:bottom-6",
  };

  return (
    <button
      className={`fixed ${positionStyles[position]} ${sizeStyles[size]} bg-accent-secondary text-white rounded-full shadow-soft-lg hover:shadow-soft-lg hover:scale-105 active:scale-95 flex items-center justify-center transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-secondary touch-manipulation z-40 ${className}`}
      aria-label={label || "Floating action button"}
      {...props}
    >
      {icon}
    </button>
  );
}
