"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { Hospital } from "@/types";

const SPECIALTIES = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Oncology",
  "Dermatology",
  "Gynecology",
  "General Surgery",
  "Psychiatry",
  "Radiology",
];

export function HospitalViewModal({
  hospital,
  open,
  onClose,
  isAdmin,
  onSaved,
}: {
  hospital: Hospital;
  open: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onSaved: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    phone: "",
    totalBeds: "",
    availableBeds: "",
    specialties: [] as string[],
    status: "active",
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (hospital) {
      setFormData({
        name: hospital.name,
        location: hospital.location,
        phone: hospital.phone,
        totalBeds: hospital.totalBeds.toString(),
        availableBeds: hospital.availableBeds.toString(),
        specialties: hospital.specialties || [],
        status: hospital.status || "active",
      });
      setEditMode(false); // always reset back to view mode
    }
  }, [hospital]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpecialtyChange = (specialty: string) => {
    setFormData((prev) => {
      const already = prev.specialties.includes(specialty);
      return {
        ...prev,
        specialties: already
          ? prev.specialties.filter((s) => s !== specialty)
          : [...prev.specialties, specialty],
      };
    });
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/hospitals/${hospital.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          totalBeds: parseInt(formData.totalBeds),
          availableBeds: parseInt(formData.availableBeds),
        }),
      });
      if (!res.ok) throw new Error("Failed to update hospital");
      toast.success("Partner hospital updated!");
      onSaved();
      onClose();
    } catch {
      toast.error("Error updating hospital");
    }
  };

  if (!hospital) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl space-y-6 p-6 rounded-2xl  shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {editMode ? `Edit ${hospital.name}` : hospital.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-5">
          {/* Name & Location in one row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              {editMode ? (
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              ) : (
                <p className="text-gray-700">{hospital.name}</p>
              )}
            </div>
            <div>
              <Label>Location</Label>
              {editMode ? (
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
              ) : (
                <p className="text-gray-700">{hospital.location}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div>
            <Label>Phone</Label>
            {editMode ? (
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            ) : (
              <p className="text-gray-700">{hospital.phone}</p>
            )}
          </div>

          {/* Beds */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Total Beds</Label>
              {editMode ? (
                <Input
                  type="number"
                  name="totalBeds"
                  value={formData.totalBeds}
                  onChange={handleChange}
                />
              ) : (
                <p className="text-gray-700">{hospital.totalBeds}</p>
              )}
            </div>
            <div>
              <Label>Available Beds</Label>
              {editMode ? (
                <Input
                  type="number"
                  name="availableBeds"
                  value={formData.availableBeds}
                  onChange={handleChange}
                />
              ) : (
                <p className="text-gray-700">{hospital.availableBeds}</p>
              )}
            </div>
          </div>

          {/* Specialties */}
          <div>
            <Label>Specialties</Label>
            {editMode ? (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {SPECIALTIES.map((spec) => (
                  <label key={spec} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.specialties.includes(spec)}
                      onChange={() => handleSpecialtyChange(spec)}
                      className="rounded border-gray-300"
                    />
                    <span>{spec}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-2">
                {hospital.specialties?.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-1 text-sm rounded bg-gray-100"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {isAdmin && !editMode && (
            <Button variant="outline" onClick={() => setEditMode(true)}>
              Edit
            </Button>
          )}
          {isAdmin && editMode && (
            <Button onClick={handleSave}>Save</Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            {editMode ? "Cancel" : "Close"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
