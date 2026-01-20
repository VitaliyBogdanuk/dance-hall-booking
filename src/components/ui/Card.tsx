import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({ children, padding = "md", className = "", ...props }: CardProps) {
  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={`bg-surface rounded-card shadow-soft transition-shadow duration-150 ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-headline text-text-primary ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-body text-text-secondary mt-1 ${className}`}>{children}</p>;
}

export function CardContent({ 
  children, 
  className = "", 
  padding 
}: { 
  children: React.ReactNode; 
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}) {
  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };
  
  const paddingClass = padding ? paddingStyles[padding] : "";
  
  return <div className={`${paddingClass} ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mt-6 flex items-center gap-3 ${className}`}>{children}</div>;
}
