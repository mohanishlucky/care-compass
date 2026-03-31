import { Patient, SensorReading, PatientAnalytics, Alert, PatientStatus } from "./types";

const names = [
  { name: "James Mitchell", age: 72, gender: "Male" as const, room: "ICU-201", condition: "Post-cardiac surgery" },
  { name: "Sarah Chen", age: 65, gender: "Female" as const, room: "CCU-105", condition: "Congestive heart failure" },
  { name: "Robert Williams", age: 58, gender: "Male" as const, room: "ICU-203", condition: "Pneumonia" },
  { name: "Maria Garcia", age: 81, gender: "Female" as const, room: "Ward-312", condition: "Hip replacement recovery" },
  { name: "David Thompson", age: 45, gender: "Male" as const, room: "ICU-207", condition: "Acute respiratory distress" },
  { name: "Linda Johnson", age: 69, gender: "Female" as const, room: "CCU-108", condition: "Atrial fibrillation" },
  { name: "Michael Brown", age: 77, gender: "Male" as const, room: "Ward-315", condition: "Diabetes management" },
  { name: "Patricia Davis", age: 62, gender: "Female" as const, room: "ICU-210", condition: "Sepsis recovery" },
];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getStatus(hr: number, spo2: number): PatientStatus {
  if (spo2 < 90 || hr > 120 || hr < 50) return "Critical";
  if (spo2 < 94 || hr > 100 || hr < 60) return "Warning";
  return "Normal";
}

export function generatePatients(): Patient[] {
  return names.map((n, i) => {
    const hr = i === 4 ? rand(105, 125) : i === 2 ? rand(55, 65) : rand(65, 95);
    const spo2 = i === 4 ? rand(86, 91) : i === 2 ? rand(91, 94) : rand(95, 99);
    const fall = i === 3;
    return {
      id: `P-${1001 + i}`,
      ...n,
      admissionDate: new Date(Date.now() - rand(1, 30) * 86400000).toISOString().split("T")[0],
      currentHeartRate: hr,
      currentSpO2: spo2,
      status: getStatus(hr, spo2),
      fallDetected: fall,
    };
  });
}

export function generateSensorData(patient: Patient, hours: number = 24): SensorReading[] {
  const readings: SensorReading[] = [];
  const now = Date.now();
  const baseHR = patient.currentHeartRate;
  const baseSpo2 = patient.currentSpO2;

  for (let i = hours * 60; i >= 0; i -= 5) {
    const t = new Date(now - i * 60000);
    const variation = Math.sin(i / 60) * 8;
    const hr = Math.max(45, Math.min(140, baseHR + variation + rand(-5, 5)));
    const spo2Var = Math.sin(i / 120) * 2;
    const spo2 = Math.max(82, Math.min(100, baseSpo2 + spo2Var + rand(-1, 1)));
    const activity = Math.max(0, Math.min(100, 30 + Math.sin(i / 30) * 25 + rand(-10, 10)));

    readings.push({
      timestamp: t.toISOString(),
      heartRate: Math.round(hr),
      spO2: Math.round(spo2 * 10) / 10,
      accelX: +(Math.random() * 2 - 1).toFixed(2),
      accelY: +(Math.random() * 2 - 1).toFixed(2),
      accelZ: +(9.8 + Math.random() * 0.5 - 0.25).toFixed(2),
      activityLevel: Math.round(activity),
    });
  }

  // Inject a fall event for fall-detected patients
  if (patient.fallDetected && readings.length > 50) {
    const idx = readings.length - 30;
    readings[idx].accelX = 8.5;
    readings[idx].accelY = -6.2;
    readings[idx].accelZ = 15.3;
    readings[idx].activityLevel = 100;
  }

  return readings;
}

export function analyzeData(readings: SensorReading[], patient: Patient): PatientAnalytics {
  const hrs = readings.map((r) => r.heartRate);
  const spo2s = readings.map((r) => r.spO2);
  const activities = readings.map((r) => r.activityLevel);
  const avgActivity = activities.reduce((a, b) => a + b, 0) / activities.length;

  const alerts: Alert[] = [];

  // Check for anomalies
  readings.forEach((r) => {
    if (r.heartRate > 100) {
      alerts.push({ type: "tachycardia", message: `Tachycardia detected: ${r.heartRate} BPM`, severity: r.heartRate > 120 ? "Critical" : "Warning", timestamp: r.timestamp });
    }
    if (r.heartRate < 60) {
      alerts.push({ type: "bradycardia", message: `Bradycardia detected: ${r.heartRate} BPM`, severity: r.heartRate < 50 ? "Critical" : "Warning", timestamp: r.timestamp });
    }
    if (r.spO2 < 90) {
      alerts.push({ type: "critical_spo2", message: `Critical SpO2: ${r.spO2}%`, severity: "Critical", timestamp: r.timestamp });
    } else if (r.spO2 < 94) {
      alerts.push({ type: "low_spo2", message: `Low SpO2: ${r.spO2}%`, severity: "Warning", timestamp: r.timestamp });
    }
    const accelMag = Math.sqrt(r.accelX ** 2 + r.accelY ** 2 + r.accelZ ** 2);
    if (accelMag > 15) {
      alerts.push({ type: "fall", message: "Potential fall detected", severity: "Critical", timestamp: r.timestamp });
    }
  });

  // Deduplicate alerts - keep only unique by type per hour
  const uniqueAlerts: Alert[] = [];
  const seen = new Set<string>();
  for (const a of alerts) {
    const hour = a.timestamp.slice(0, 13);
    const key = `${a.type}-${hour}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueAlerts.push(a);
    }
  }

  return {
    avgHeartRate: Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length),
    minHeartRate: Math.min(...hrs),
    maxHeartRate: Math.max(...hrs),
    avgSpO2: Math.round((spo2s.reduce((a, b) => a + b, 0) / spo2s.length) * 10) / 10,
    minSpO2: Math.min(...spo2s),
    maxSpO2: Math.max(...spo2s),
    activityClassification: avgActivity > 60 ? "High" : avgActivity > 30 ? "Moderate" : "Low",
    fallDetected: patient.fallDetected,
    alerts: uniqueAlerts.slice(0, 20),
  };
}
