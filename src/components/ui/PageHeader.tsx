import React from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, action, children }: PageHeaderProps) {
  return (
    <div className="mb-4 sm:mb-6 lg:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-title text-gray-900 dark:text-gray-100 mb-1 sm:mb-2 font-semibold">{title}</h1>
          {description && (
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{description}</p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0 w-full sm:w-auto">{action}</div>
        )}
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}
