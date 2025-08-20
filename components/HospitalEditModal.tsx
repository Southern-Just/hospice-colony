'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Hospital } from '@/types';

const SPECIALTIES = [
  'Cardiology','Neurology','Orthopedics','Pediatrics','Oncology',
  'Dermatology','Gynecology','General Surgery','Psychiatry','Radiology',
];

export function HospitalEditModal({
  hospital,
  open,
  onClose,
}: {
  hospital: Hospital;
  open: boolean;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone: '',
    totalBeds: '',
    availableBeds: '',
    specialties: [] as string[],
    status: 'active',
  });

  useEffect(() => {
    if (hospital) {
      setFormData({
        name: hospital.name,
        location: hospital.location,
        phone: hospital.phone,
        totalBeds: hospital.totalBeds.toString(),
        availableBeds: hospital.availableBeds.toString(),
        specialties: hospital.specialties || [],
        status: hospital.status || 'active',
      });
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
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalBeds: parseInt(formData.totalBeds),
          availableBeds: parseInt(formData.availableBeds),
        }),
      });
      if (!res.ok) throw new Error('Failed to update hospital');
      toast.success('Partner hospital updated!');
      onClose();
    } catch {
      toast.error('Error updating hospital');
    }
  };

  if (!hospital) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl space-y-4 p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit {hospital.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div>
            <Label>Name</Label>
            <Input name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div>
            <Label>Location</Label>
            <Input name="location" value={formData.location} onChange={handleChange} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input name="phone" value={formData.phone} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Total Beds</Label>
              <Input
                type="number"
                name="totalBeds"
                value={formData.totalBeds}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Available Beds</Label>
              <Input
                type="number"
                name="availableBeds"
                value={formData.availableBeds}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Label>Specialties</Label>
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
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={handleSave}>Save</Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
