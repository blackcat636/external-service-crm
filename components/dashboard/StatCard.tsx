import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white/5 rounded-xl border border-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs tracking-widest text-white/40 uppercase">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {description && (
            <p className="mt-1 text-sm text-white/50">{description}</p>
          )}
          {trend && (
            <p
              className={cn(
                "mt-2 text-sm font-medium font-mono",
                trend.isPositive ? "text-green-400" : "text-red-400"
              )}
            >
              {trend.isPositive ? "+" : "-"}
              {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#2563eb]/20 text-[#2563eb] border border-[#2563eb]/30">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
