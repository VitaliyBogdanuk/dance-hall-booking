import React from "react";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="mb-6 text-text-secondary opacity-60">{icon}</div>}
      <h3 className="text-headline text-text-primary mb-2">{title}</h3>
      {description && <p className="text-body text-text-secondary max-w-md mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
