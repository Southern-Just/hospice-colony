'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface PatientAdmissionModalProps {
  open: boolean;
  onClose: () => void;
  hospitalId: number;
  bedId?: number; 
}

export function PatientAdmissionModal({
  open,
  onClose,
  hospitalId,
  bedId,
}: PatientAdmissionModalProps) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    gender: '',
    dateOfBirth: '',
    location: '',
    contact: '',
    idNumber: '',
    healthCondition: '',
    nextOfKin: '',
    insuranceProvider: '',
    insuranceNumber: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Patient name is required.');
      return;
    }
    if (!form.gender) {
      toast.error('Gender is required.');
      return;
    }
    if (!form.dateOfBirth) {
      toast.error('Date of Birth is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/hospitals/${hospitalId}/patients/admissions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hospitalId,
            bedId: bedId ?? null,
            ...form,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to admit patient');
        return;
      }

      toast.success('Patient admitted successfully!');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Error admitting patient.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-lg max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide"
      >
        <DialogHeader>
          <DialogTitle>Admit Patient</DialogTitle>
          <DialogDescription>
            Fill in the patient details for admission.
          </DialogDescription>
        </DialogHeader>

        {/* Form fields */}
        <div className="grid gap-3 py-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
            />
          </div>

          <div>
            <Label htmlFor="gender">Gender *</Label>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
            >
              <option value="">Select gender...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={form.dateOfBirth}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="contact">Contact</Label>
            <Input
              id="contact"
              name="contact"
              value={form.contact}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="idNumber">ID Number</Label>
            <Input
              id="idNumber"
              name="idNumber"
              value={form.idNumber}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="healthCondition">Health Condition</Label>
            <Input
              id="healthCondition"
              name="healthCondition"
              value={form.healthCondition}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="nextOfKin">Next of Kin</Label>
            <Input
              id="nextOfKin"
              name="nextOfKin"
              value={form.nextOfKin}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="insuranceProvider">Insurance Provider</Label>
            <Input
              id="insuranceProvider"
              name="insuranceProvider"
              value={form.insuranceProvider}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="insuranceNumber">Insurance Number</Label>
            <Input
              id="insuranceNumber"
              name="insuranceNumber"
              value={form.insuranceNumber}
              onChange={handleChange}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Admitting...' : 'Admit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
