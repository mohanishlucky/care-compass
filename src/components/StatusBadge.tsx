import { PatientStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: PatientStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        status === "Normal" && "status-normal",
        status === "Warning" && "status-warning",
        status === "Critical" && "status-critical",
        className
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          status === "Normal" && "bg-status-normal animate-pulse-dot",
          status === "Warning" && "bg-status-warning animate-pulse-dot",
          status === "Critical" && "bg-status-critical animate-pulse-dot"
        )}
      />
      {status}
    </span>
  );
}
