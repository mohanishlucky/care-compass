export type PatientStatus = "Normal" | "Warning" | "Critical";

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female";
  room: string;
  admissionDate: string;
  condition: string;
  currentHeartRate: number;
  currentSpO2: number;
  status: PatientStatus;
  fallDetected: boolean;
}

export interface SensorReading {
  timestamp: string;
  heartRate: number;
  spO2: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  activityLevel: number; // 0-100
}

export interface PatientAnalytics {
  avgHeartRate: number;
  minHeartRate: number;
  maxHeartRate: number;
  avgSpO2: number;
  minSpO2: number;
  maxSpO2: number;
  activityClassification: "Low" | "Moderate" | "High";
  fallDetected: boolean;
  alerts: Alert[];
}

export interface Alert {
  type: "tachycardia" | "bradycardia" | "low_spo2" | "critical_spo2" | "fall";
  message: string;
  severity: PatientStatus;
  timestamp: string;
}
