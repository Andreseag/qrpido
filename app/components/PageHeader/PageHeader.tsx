"use client";

import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  showAction?: boolean;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
  showAction = true,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6 mb-6 md:mb-8">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20 shrink-0">
          <Icon className="text-primary w-7 h-7 md:w-8 md:h-8" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            {description}
          </p>
        </div>
      </div>

      {showAction && actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-black px-5 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider shadow-lg shadow-primary/10 w-full sm:w-auto shrink-0">
          {actionLabel}
        </button>
      )}
    </header>
  );
}
