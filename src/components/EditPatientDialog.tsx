import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Patient, PatientStatus } from "@/lib/types";
import { toast } from "sonner";

interface EditPatientDialogProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patient: Patient) => void;
}

export function EditPatientDialog({ patient, open, onOpenChange, onSave }: EditPatientDialogProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [room, setRoom] = useState("");
  const [condition, setCondition] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [spO2, setSpO2] = useState("");

  useEffect(() => {
    if (patient) {
      setName(patient.name);
      setAge(String(patient.age));
      setGender(patient.gender);
      setRoom(patient.room);
      setCondition(patient.condition);
      setHeartRate(String(patient.currentHeartRate));
      setSpO2(String(patient.currentSpO2));
    }
  }, [patient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    if (!name.trim() || !age || !room.trim() || !condition.trim() || !heartRate || !spO2) {
      toast.error("Please fill in all fields");
      return;
    }

    const hr = parseInt(heartRate);
    const spo2Val = parseInt(spO2);
    const ageVal = parseInt(age);

    if (isNaN(hr) || isNaN(spo2Val) || isNaN(ageVal)) {
      toast.error("Please enter valid numbers");
      return;
    }

    let status: PatientStatus = "Normal";
    if (spo2Val < 90 || hr > 120 || hr < 50) status = "Critical";
    else if (spo2Val < 94 || hr > 100 || hr < 60) status = "Warning";

    onSave({
      ...patient,
      name: name.trim(),
      age: ageVal,
      gender,
      room: room.trim(),
      condition: condition.trim(),
      currentHeartRate: hr,
      currentSpO2: spo2Val,
      status,
    });
    toast.success("Patient updated successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Patient</DialogTitle>
          <DialogDescription>Update the patient's details and vitals.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
            </div>
            <div>
              <Label htmlFor="edit-age">Age</Label>
              <Input id="edit-age" type="number" value={age} onChange={(e) => setAge(e.target.value)} min={0} max={150} />
            </div>
            <div>
              <Label htmlFor="edit-gender">Gender</Label>
              <Select value={gender} onValueChange={(v) => setGender(v as "Male" | "Female")}>
                <SelectTrigger id="edit-gender"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-room">Room</Label>
              <Input id="edit-room" value={room} onChange={(e) => setRoom(e.target.value)} maxLength={20} />
            </div>
            <div>
              <Label htmlFor="edit-condition">Condition</Label>
              <Input id="edit-condition" value={condition} onChange={(e) => setCondition(e.target.value)} maxLength={100} />
            </div>
            <div>
              <Label htmlFor="edit-hr">Heart Rate (BPM)</Label>
              <Input id="edit-hr" type="number" value={heartRate} onChange={(e) => setHeartRate(e.target.value)} min={20} max={250} />
            </div>
            <div>
              <Label htmlFor="edit-spo2">SpO2 (%)</Label>
              <Input id="edit-spo2" type="number" value={spO2} onChange={(e) => setSpO2(e.target.value)} min={50} max={100} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
