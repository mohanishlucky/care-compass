import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Plus, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";

interface Note {
  id: string;
  text: string;
  timestamp: string;
  doctor: string;
}

interface DoctorNotesProps {
  patientId: string;
  doctorName: string;
}

const notesStore: Record<string, Note[]> = {};

export function DoctorNotes({ patientId, doctorName }: DoctorNotesProps) {
  const [notes, setNotes] = useState<Note[]>(notesStore[patientId] || []);
  const [newNote, setNewNote] = useState("");
  const [adding, setAdding] = useState(false);

  const saveNotes = (updated: Note[]) => {
    notesStore[patientId] = updated;
    setNotes(updated);
  };

  const handleAdd = () => {
    if (!newNote.trim()) {
      toast.error("Note cannot be empty");
      return;
    }
    if (newNote.trim().length > 1000) {
      toast.error("Note must be less than 1000 characters");
      return;
    }
    const note: Note = {
      id: crypto.randomUUID(),
      text: newNote.trim(),
      timestamp: new Date().toISOString(),
      doctor: doctorName,
    };
    saveNotes([note, ...notes]);
    setNewNote("");
    setAdding(false);
    toast.success("Note added");
  };

  const handleDelete = (id: string) => {
    saveNotes(notes.filter((n) => n.id !== id));
    toast.success("Note removed");
  };

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-card-foreground flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-primary" /> Doctor Notes
        </h3>
        {!adding && (
          <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Note
          </Button>
        )}
      </div>

      {adding && (
        <div className="mb-4 space-y-2">
          <Textarea
            placeholder="Write clinical note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            maxLength={1000}
            rows={3}
          />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => { setAdding(false); setNewNote(""); }}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAdd}>Save Note</Button>
          </div>
        </div>
      )}

      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No notes yet. Click "Add Note" to start.</p>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {notes.map((note) => (
            <div key={note.id} className="rounded-lg border px-4 py-3 group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-primary">Dr. {note.doctor}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(note.timestamp).toLocaleString()}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(note.id)}
                  >
                    <Trash2 className="h-3 w-3 text-status-critical" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-card-foreground whitespace-pre-wrap">{note.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
