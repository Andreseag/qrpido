import React, { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  trendIcon: ReactNode;
  trendColorClass?: string;
  valueColorClass?: string;
  iconContainerClass?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trendIcon,
  trendColorClass = "text-emerald-400",
  valueColorClass = "text-white",
  iconContainerClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
}: MetricCardProps) {
  return (
    <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
          {title}
        </p>
        <p className={`text-3xl font-black ${valueColorClass}`}>{value}</p>
        <div
          className={`flex items-center gap-1.5 ${trendColorClass} text-xs font-bold mt-2`}>
          {trendIcon}
          <span>{subtitle}</span>
        </div>
      </div>
      <div className={`p-4 border rounded-2xl ${iconContainerClass}`}>
        {icon}
      </div>
    </div>
  );
}
