import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Patient, PatientAnalytics, SensorReading } from "./types";

export function generatePatientReport(
  patient: Patient,
  analytics: PatientAnalytics,
  readings: SensorReading[]
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 120);
  doc.text("Remote Patient Monitoring Report", pageWidth / 2, y, { align: "center" });
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, y, { align: "center" });
  y += 4;
  doc.setDrawColor(30, 64, 120);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);
  y += 10;

  // Patient Information
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 120);
  doc.text("Patient Information", 14, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [],
    body: [
      ["Name", patient.name],
      ["Patient ID", patient.id],
      ["Age / Gender", `${patient.age} / ${patient.gender}`],
      ["Room", patient.room],
      ["Condition", patient.condition],
      ["Admission Date", patient.admissionDate],
      ["Current Status", patient.status],
    ],
    theme: "grid",
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 45, fillColor: [240, 245, 255] },
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // Heart Rate Summary
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 120);
  doc.text("Heart Rate Summary", 14, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value", "Reference Range"]],
    body: [
      ["Average HR", `${analytics.avgHeartRate} BPM`, "60-100 BPM"],
      ["Minimum HR", `${analytics.minHeartRate} BPM`, ">60 BPM"],
      ["Maximum HR", `${analytics.maxHeartRate} BPM`, "<100 BPM"],
    ],
    theme: "striped",
    headStyles: { fillColor: [30, 64, 120] },
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // SpO2 Summary
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 120);
  doc.text("Blood Oxygen (SpO2) Summary", 14, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value", "Reference Range"]],
    body: [
      ["Average SpO2", `${analytics.avgSpO2}%`, "95-100%"],
      ["Minimum SpO2", `${analytics.minSpO2}%`, ">94%"],
      ["Maximum SpO2", `${analytics.maxSpO2}%`, "95-100%"],
    ],
    theme: "striped",
    headStyles: { fillColor: [30, 64, 120] },
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // Activity & Falls
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 120);
  doc.text("Activity & Fall Detection", 14, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [],
    body: [
      ["Activity Classification", analytics.activityClassification],
      ["Fall Detected", analytics.fallDetected ? "YES — Immediate attention required" : "No falls detected"],
    ],
    theme: "grid",
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 55, fillColor: [240, 245, 255] },
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // Alerts
  if (analytics.alerts.length > 0) {
    if (y > 230) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(200, 50, 50);
    doc.text("Alerts & Anomalies", 14, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      head: [["Time", "Type", "Severity", "Details"]],
      body: analytics.alerts.slice(0, 15).map((a) => [
        new Date(a.timestamp).toLocaleString(),
        a.type.replace("_", " ").toUpperCase(),
        a.severity,
        a.message,
      ]),
      theme: "striped",
      headStyles: { fillColor: [200, 50, 50] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });

    y = (doc as any).lastAutoTable.finalY + 12;
  }

  // Doctor Notes
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 120);
  doc.text("Doctor Notes", 14, y);
  y += 8;
  doc.setDrawColor(200);
  for (let i = 0; i < 6; i++) {
    doc.line(14, y + i * 10, pageWidth - 14, y + i * 10);
  }

  // Footer
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Remote Patient Monitoring System — Confidential Medical Record", 14, doc.internal.pageSize.getHeight() - 10);
    doc.text(`Page ${i} of ${pages}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 10, { align: "right" });
  }

  doc.save(`RPM_Report_${patient.id}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
