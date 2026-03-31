import { useState, useMemo } from "react";
import { Patient } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NotificationCenterProps {
  patients: Patient[];
  onPatientClick: (id: string) => void;
}

export function NotificationCenter({ patients, onPatientClick }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);

  const alerts = useMemo(() => {
    const items: { patientId: string; patientName: string; message: string; severity: "Critical" | "Warning" }[] = [];

    patients.forEach((p) => {
      if (p.status === "Critical") {
        if (p.currentSpO2 < 90) items.push({ patientId: p.id, patientName: p.name, message: `Critical SpO2: ${p.currentSpO2}%`, severity: "Critical" });
        if (p.currentHeartRate > 120 || p.currentHeartRate < 50) items.push({ patientId: p.id, patientName: p.name, message: `Abnormal HR: ${p.currentHeartRate} BPM`, severity: "Critical" });
        if (p.fallDetected) items.push({ patientId: p.id, patientName: p.name, message: "Fall detected!", severity: "Critical" });
      }
      if (p.status === "Warning") {
        if (p.currentSpO2 < 94) items.push({ patientId: p.id, patientName: p.name, message: `Low SpO2: ${p.currentSpO2}%`, severity: "Warning" });
        if (p.currentHeartRate > 100 || p.currentHeartRate < 60) items.push({ patientId: p.id, patientName: p.name, message: `HR concern: ${p.currentHeartRate} BPM`, severity: "Warning" });
      }
    });

    return items.sort((a, b) => (a.severity === "Critical" ? -1 : 1));
  }, [patients]);

  const criticalCount = alerts.filter((a) => a.severity === "Critical").length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {alerts.length > 0 && (
            <span className={`absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white ${criticalCount > 0 ? "bg-status-critical" : "bg-status-warning"}`}>
              {alerts.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-4 py-3 border-b">
          <h4 className="font-display font-semibold text-card-foreground text-sm">Alerts</h4>
          <p className="text-xs text-muted-foreground">{alerts.length} active alert{alerts.length !== 1 ? "s" : ""}</p>
        </div>
        <ScrollArea className="max-h-72">
          {alerts.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">All clear — no alerts</div>
          ) : (
            <div className="divide-y">
              {alerts.map((alert, i) => (
                <button
                  key={i}
                  className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    onPatientClick(alert.patientId);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-card-foreground">{alert.patientName}</span>
                    <StatusBadge status={alert.severity} />
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
