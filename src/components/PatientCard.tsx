import { Patient } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { Heart, Droplets, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientCardProps {
  patient: Patient;
  onClick: () => void;
}

export function PatientCard({ patient, onClick }: PatientCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full text-left rounded-xl border bg-card p-5 transition-all duration-200",
        "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
        patient.status === "Critical" && "border-status-critical/30",
        patient.status === "Warning" && "border-status-warning/30",
        patient.status === "Normal" && "border-border"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display font-semibold text-card-foreground group-hover:text-primary transition-colors">
            {patient.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {patient.id} · {patient.age}y · {patient.gender}
          </p>
        </div>
        <StatusBadge status={patient.status} />
      </div>

      <p className="text-xs text-muted-foreground mb-4">{patient.condition}</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-status-critical-bg/50 px-3 py-2">
          <Heart className="h-4 w-4 text-chart-heart" />
          <div>
            <p className="text-xs text-muted-foreground">Heart Rate</p>
            <p className="text-sm font-semibold text-card-foreground">{patient.currentHeartRate} BPM</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--chart-spo2)/0.08)] px-3 py-2">
          <Droplets className="h-4 w-4 text-chart-spo2" />
          <div>
            <p className="text-xs text-muted-foreground">SpO2</p>
            <p className="text-sm font-semibold text-card-foreground">{patient.currentSpO2}%</p>
          </div>
        </div>
      </div>

      {patient.fallDetected && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-status-critical-bg px-3 py-2">
          <AlertTriangle className="h-4 w-4 text-status-critical" />
          <span className="text-xs font-medium text-status-critical">Fall detected</span>
        </div>
      )}
    </button>
  );
}
