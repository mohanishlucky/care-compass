import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import { UserPlus } from "lucide-react";
import { Patient, PatientStatus } from "@/lib/types";
import { toast } from "sonner";

interface AddPatientDialogProps {
  onAdd: (patient: Patient) => void;
  patientCount: number;
}

export function AddPatientDialog({ onAdd, patientCount }: AddPatientDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [room, setRoom] = useState("");
  const [condition, setCondition] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [spO2, setSpO2] = useState("");

  const resetForm = () => {
    setName("");
    setAge("");
    setGender("Male");
    setRoom("");
    setCondition("");
    setHeartRate("");
    setSpO2("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !age || !room.trim() || !condition.trim() || !heartRate || !spO2) {
      toast.error("Please fill in all fields");
      return;
    }

    const hr = parseInt(heartRate);
    const spo2Val = parseInt(spO2);
    const ageVal = parseInt(age);

    if (isNaN(hr) || isNaN(spo2Val) || isNaN(ageVal)) {
      toast.error("Please enter valid numbers for age, heart rate, and SpO2");
      return;
    }

    if (ageVal < 0 || ageVal > 150) {
      toast.error("Please enter a valid age (0-150)");
      return;
    }

    if (hr < 20 || hr > 250) {
      toast.error("Please enter a valid heart rate (20-250 BPM)");
      return;
    }

    if (spo2Val < 50 || spo2Val > 100) {
      toast.error("Please enter a valid SpO2 (50-100%)");
      return;
    }

    let status: PatientStatus = "Normal";
    if (spo2Val < 90 || hr > 120 || hr < 50) status = "Critical";
    else if (spo2Val < 94 || hr > 100 || hr < 60) status = "Warning";

    const newPatient: Patient = {
      id: `P-${1001 + patientCount}`,
      name: name.trim(),
      age: ageVal,
      gender,
      room: room.trim(),
      admissionDate: new Date().toISOString().split("T")[0],
      condition: condition.trim(),
      currentHeartRate: hr,
      currentSpO2: spo2Val,
      status,
      fallDetected: false,
    };

    onAdd(newPatient);
    toast.success(`Patient ${newPatient.name} added successfully`);
    resetForm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>
            Enter the patient's details and current vitals below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="e.g. John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="e.g. 65"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min={0}
                max={150}
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={(v) => setGender(v as "Male" | "Female")}>
                <SelectTrigger id="gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="room">Room</Label>
              <Input
                id="room"
                placeholder="e.g. ICU-201"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                maxLength={20}
              />
            </div>
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Input
                id="condition"
                placeholder="e.g. Pneumonia"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="heartRate">Heart Rate (BPM)</Label>
              <Input
                id="heartRate"
                type="number"
                placeholder="e.g. 75"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                min={20}
                max={250}
              />
            </div>
            <div>
              <Label htmlFor="spO2">SpO2 (%)</Label>
              <Input
                id="spO2"
                type="number"
                placeholder="e.g. 97"
                value={spO2}
                onChange={(e) => setSpO2(e.target.value)}
                min={50}
                max={100}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Patient</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
