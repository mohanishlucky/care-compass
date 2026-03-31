import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { generatePatients } from "@/lib/mock-data";
import { PatientCard } from "@/components/PatientCard";
import { AddPatientDialog } from "@/components/AddPatientDialog";
import { EditPatientDialog } from "@/components/EditPatientDialog";
import { NotificationCenter } from "@/components/NotificationCenter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Heart,
  LogOut,
  Search,
  Users,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { Patient, PatientStatus } from "@/lib/types";
import { toast } from "sonner";

const initialPatients = generatePatients();

export default function Dashboard() {
  const { doctorName, logout } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PatientStatus | "All">("All");

  // Edit / Delete state
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === "All" || p.status === filter;
      return matchSearch && matchFilter;
    });
  }, [search, filter, patients]);

  const stats = useMemo(() => ({
    total: patients.length,
    critical: patients.filter((p) => p.status === "Critical").length,
    warning: patients.filter((p) => p.status === "Warning").length,
    normal: patients.filter((p) => p.status === "Normal").length,
  }), [patients]);

  const handleAddPatient = (patient: Patient) => {
    setPatients((prev) => [...prev, patient]);
  };

  const handleEditPatient = (updated: Patient) => {
    setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeletePatient = () => {
    if (!deleteTarget) return;
    setPatients((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    toast.success(`Patient ${deleteTarget.name} removed`);
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-foreground text-lg leading-tight">RPM Dashboard</h1>
              <p className="text-xs text-muted-foreground">Dr. {doctorName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter patients={patients} onPatientClick={(id) => navigate(`/patient/${id}`)} />
            <AddPatientDialog onAdd={handleAddPatient} patientCount={patients.length} />
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Patients", value: stats.total, icon: Users, color: "text-primary" },
            { label: "Critical", value: stats.critical, icon: AlertTriangle, color: "text-status-critical" },
            { label: "Warning", value: stats.warning, icon: Activity, color: "text-status-warning" },
            { label: "Normal", value: stats.normal, icon: Heart, color: "text-status-normal" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-display font-bold text-card-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {(["All", "Critical", "Warning", "Normal"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* Patient Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <PatientCard
              key={p.id}
              patient={p}
              onClick={() => navigate(`/patient/${p.id}`)}
              onEdit={() => { setEditingPatient(p); setEditOpen(true); }}
              onDelete={() => setDeleteTarget(p)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No patients match your search.
          </div>
        )}
      </main>

      {/* Edit Dialog */}
      <EditPatientDialog
        patient={editingPatient}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={handleEditPatient}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Patient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{deleteTarget?.name}</strong> ({deleteTarget?.id}) from monitoring? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePatient} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
