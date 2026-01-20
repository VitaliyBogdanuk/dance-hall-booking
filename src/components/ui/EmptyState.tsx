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
      {icon && <div className="mb-6 text-gray-400 dark:text-gray-600">{icon}</div>}
      <h3 className="text-headline text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      {description && <p className="text-body text-gray-600 dark:text-gray-400 max-w-md mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
