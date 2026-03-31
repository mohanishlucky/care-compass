import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { generatePatients, generateSensorData, analyzeData } from "@/lib/mock-data";
import { generatePatientReport } from "@/lib/generate-report";
import { useAuth } from "@/lib/auth-context";
import { StatusBadge } from "@/components/StatusBadge";
import { VitalChart } from "@/components/VitalChart";
import { DoctorNotes } from "@/components/DoctorNotes";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  Heart,
  Droplets,
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const patients = generatePatients();

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { doctorName } = useAuth();
  const patient = patients.find((p) => p.id === id);

  const { readings, analytics } = useMemo(() => {
    if (!patient) return { readings: [], analytics: null };
    const readings = generateSensorData(patient, 24);
    const analytics = analyzeData(readings, patient);
    return { readings, analytics };
  }, [patient]);

  if (!patient || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Patient not found</p>
          <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const handleGenerateReport = () => {
    generatePatientReport(patient, analytics, readings);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display font-bold text-foreground text-lg leading-tight">
                {patient.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                {patient.id} · {patient.room}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={patient.status} />
            <Button onClick={handleGenerateReport} size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Patient Info Bar */}
        <div className="rounded-xl border bg-card p-5 grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Age", value: `${patient.age} years` },
            { label: "Gender", value: patient.gender },
            { label: "Condition", value: patient.condition },
            { label: "Admitted", value: patient.admissionDate },
            { label: "Room", value: patient.room },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-medium text-card-foreground">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Current Vitals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <VitalCard
            icon={Heart}
            label="Heart Rate"
            value={`${patient.currentHeartRate} BPM`}
            sub={`Avg: ${analytics.avgHeartRate}`}
            color="text-chart-heart"
            bgColor="bg-status-critical-bg/50"
          />
          <VitalCard
            icon={Droplets}
            label="SpO2"
            value={`${patient.currentSpO2}%`}
            sub={`Avg: ${analytics.avgSpO2}%`}
            color="text-chart-spo2"
            bgColor="bg-[hsl(var(--chart-spo2)/0.08)]"
          />
          <VitalCard
            icon={Activity}
            label="Activity"
            value={analytics.activityClassification}
            sub="Classification"
            color="text-chart-activity"
            bgColor="bg-status-normal-bg/50"
          />
          <VitalCard
            icon={AlertTriangle}
            label="Fall Detection"
            value={analytics.fallDetected ? "DETECTED" : "None"}
            sub={analytics.fallDetected ? "Immediate attention" : "All clear"}
            color={analytics.fallDetected ? "text-status-critical" : "text-status-normal"}
            bgColor={analytics.fallDetected ? "bg-status-critical-bg" : "bg-status-normal-bg/50"}
          />
        </div>

        {/* Analytics Summary */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-display font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <Heart className="h-4 w-4 text-chart-heart" /> Heart Rate Analytics
            </h3>
            <div className="space-y-3">
              <AnalyticRow icon={TrendingUp} label="Maximum" value={`${analytics.maxHeartRate} BPM`} warn={analytics.maxHeartRate > 100} />
              <AnalyticRow icon={Activity} label="Average" value={`${analytics.avgHeartRate} BPM`} />
              <AnalyticRow icon={TrendingDown} label="Minimum" value={`${analytics.minHeartRate} BPM`} warn={analytics.minHeartRate < 60} />
            </div>
          </div>
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-display font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <Droplets className="h-4 w-4 text-chart-spo2" /> SpO2 Analytics
            </h3>
            <div className="space-y-3">
              <AnalyticRow icon={TrendingUp} label="Maximum" value={`${analytics.maxSpO2}%`} />
              <AnalyticRow icon={Activity} label="Average" value={`${analytics.avgSpO2}%`} />
              <AnalyticRow icon={TrendingDown} label="Minimum" value={`${analytics.minSpO2}%`} warn={analytics.minSpO2 < 94} />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-4">
          <h3 className="font-display font-semibold text-foreground">24-Hour Trends</h3>
          <VitalChart data={readings} type="heartRate" />
          <VitalChart data={readings} type="spO2" />
          <VitalChart data={readings} type="activity" />
        </div>

        {/* Alerts */}
        {analytics.alerts.length > 0 && (
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-display font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-status-critical" /> Recent Alerts
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {analytics.alerts.map((alert, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm border"
                >
                  <div className="flex items-center gap-3">
                    <StatusBadge status={alert.severity} />
                    <span className="text-card-foreground">{alert.message}</span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Doctor Notes */}
        <DoctorNotes patientId={patient.id} doctorName={doctorName} />
      </main>
    </div>
  );
}

function VitalCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bgColor,
}: {
  icon: any;
  label: string;
  value: string;
  sub: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={`rounded-xl p-4 ${bgColor}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-display font-bold text-card-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}

function AnalyticRow({
  icon: Icon,
  label,
  value,
  warn = false,
}: {
  icon: any;
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className={`text-sm font-medium ${warn ? "text-status-warning" : "text-card-foreground"}`}>
        {value}
      </span>
    </div>
  );
}
