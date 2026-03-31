import { SensorReading } from "@/lib/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface VitalChartProps {
  data: SensorReading[];
  type: "heartRate" | "spO2" | "activity";
}

const chartConfig = {
  heartRate: {
    label: "Heart Rate (BPM)",
    color: "hsl(0, 72%, 55%)",
    dataKey: "heartRate",
    domain: [40, 150] as [number, number],
    refLines: [
      { y: 60, label: "Low", color: "#f59e0b" },
      { y: 100, label: "High", color: "#f59e0b" },
    ],
  },
  spO2: {
    label: "Blood Oxygen - SpO2 (%)",
    color: "hsl(215, 80%, 55%)",
    dataKey: "spO2",
    domain: [80, 100] as [number, number],
    refLines: [
      { y: 94, label: "Warning", color: "#f59e0b" },
      { y: 90, label: "Critical", color: "#ef4444" },
    ],
  },
  activity: {
    label: "Activity Level",
    color: "hsl(142, 70%, 45%)",
    dataKey: "activityLevel",
    domain: [0, 100] as [number, number],
    refLines: [],
  },
};

export function VitalChart({ data, type }: VitalChartProps) {
  const config = chartConfig[type];
  const chartData = data.map((d) => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }));

  // Sample data to avoid performance issues
  const sampled = chartData.length > 100
    ? chartData.filter((_, i) => i % Math.ceil(chartData.length / 100) === 0)
    : chartData;

  if (type === "activity") {
    return (
      <div className="rounded-xl border bg-card p-4">
        <h4 className="font-display font-semibold text-sm text-card-foreground mb-3">{config.label}</h4>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={sampled}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis domain={config.domain} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey={config.dataKey}
              stroke={config.color}
              fill={config.color}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <h4 className="font-display font-semibold text-sm text-card-foreground mb-3">{config.label}</h4>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={sampled}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis domain={config.domain} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey={config.dataKey}
            stroke={config.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
