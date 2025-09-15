"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Trash2, Pencil } from "lucide-react";
import { Patient } from "@/types";

interface HospitalPatientsModalProps {
  hospitalId: string;
  open: boolean;
  onClose: () => void;
}

export function HospitalPatientsModal({
  hospitalId,
  open,
  onClose,
}: HospitalPatientsModalProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [form, setForm] = useState({
    name: "",
    gender: "",
    dob: "",
    contact: "",
    location: "",
    healthDetails: "",
  });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/hospitals/${hospitalId}/patients`);
      if (!res.ok) throw new Error("Failed to fetch patients");
      const data: Patient[] = await res.json();

      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.admittedAt).getTime() -
          new Date(a.admittedAt).getTime()
      );
      setPatients(sorted.slice(0, 2));
    } catch (err) {
      console.error(err);
      toast.error("Could not load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchPatients();
  }, [open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: form.name,
        gender: form.gender,
        dateOfBirth: form.dob,
        location: form.location,
        contact: form.contact,
        healthCondition: form.healthDetails,
      };

      let res;
      if (editing) {
        res = await fetch(
          `/api/hospitals/${hospitalId}/patients/${editing.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      } else {
        res = await fetch(`/api/hospitals/${hospitalId}/patients`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error("Failed to save patient");

      toast.success(editing ? "Patient updated" : "Patient admitted");
      setForm({
        name: "",
        gender: "",
        dob: "",
        contact: "",
        location: "",
        healthDetails: "",
      });
      setEditing(null);
      fetchPatients();
    } catch (err) {
      console.error(err);
      toast.error("Error saving patient");
    }
  };

  const handleDelete = async (patientId: string) => {
    try {
      const res = await fetch(
        `/api/hospitals/${hospitalId}/patients/${patientId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to discharge patient");
      toast.success("Patient discharged");
      fetchPatients();
    } catch (err) {
      console.error(err);
      toast.error("Error discharging patient");
    }
  };

  const handleEdit = (p: Patient) => {
    setEditing(p);
    setForm({
      name: p.name || "",
      gender: p.gender || "",
      dob: p.dob || "",
      contact: p.contact || "",
      location: p.location || "",
      healthDetails: p.healthDetails || "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Hospital Patients (Latest 2)</DialogTitle>
        </DialogHeader>

        {/* Patient Form */}
        <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg mb-4">
          <div>
            <Label>Name</Label>
            <Input name="name" value={form.name} onChange={handleChange} />
          </div>
          <div>
            <Label>Gender</Label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full border rounded px-2 py-2"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <Label>Date of Birth</Label>
            <Input
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Contact</Label>
            <Input
              name="contact"
              value={form.contact}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Location</Label>
            <Input
              name="location"
              value={form.location}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Health Details</Label>
            <Input
              name="healthDetails"
              value={form.healthDetails}
              onChange={handleChange}
            />
          </div>
          <div className="col-span-2 flex justify-end">
            <Button onClick={handleSubmit}>
              {editing ? "Update Patient" : "Admit Patient"}
            </Button>
          </div>
        </div>

        {/* Patient List */}
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin" />
          </div>
        ) : patients.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No patients admitted yet.
          </p>
        ) : (
          <div className="space-y-2">
            {patients.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center border rounded-lg p-3 bg-muted/30"
              >
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {p.gender} • DOB: {p.dob} • {p.contact}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.location} | {p.healthDetails}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Admitted: {new Date(p.admittedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(p)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
