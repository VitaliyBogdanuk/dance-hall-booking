import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-control transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation";

  const variantStyles = {
    primary:
      "bg-accent text-white hover:bg-[#16a06a] active:bg-[#138d5c] shadow-soft hover:shadow-soft-lg",
    secondary:
      "bg-accent-soft text-accent hover:bg-[#d4f0e5] active:bg-[#c2ead8]",
    ghost: "bg-transparent text-text-primary hover:bg-accent-soft active:bg-[#d4f0e5]",
    danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-soft hover:shadow-soft-lg",
  };

  const sizeStyles = {
    sm: "px-3 py-2 text-sm min-h-[44px]", // Mobile-first: 44px minimum touch target
    md: "px-4 py-3 text-base h-12", // 48px height as per design DNA
    lg: "px-6 py-4 text-lg h-14",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
