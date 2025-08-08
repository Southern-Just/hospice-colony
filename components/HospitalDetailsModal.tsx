'use client';

import { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { BedIcon, PhoneIcon, MapPinIcon, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { Hospital } from '@/types';

interface HospitalDetailsModalProps {
  hospitalId: string;
  open: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onEnroll: (hospitalId: string) => void;
}

export function HospitalDetailsModal({
  hospitalId,
  open,
  onClose,
  isAdmin,
  onEnroll,
}: HospitalDetailsModalProps) {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Hospital>>({});

  const fetchHospital = useCallback(async () => {
    try {
      const res = await fetch(`/api/hospitals/${hospitalId}`);
      const data = await res.json();
      if (data?.id) {
        setHospital(data);
        setFormData(data);
      } else {
        toast.error('Failed to load hospital details.');
      }
    } catch (err) {
      toast.error('Error fetching hospital details.');
    } finally {
      setLoading(false);
    }
  }, [hospitalId]);

  // Initial load + polling for availableBeds
  useEffect(() => {
    if (open) {
      fetchHospital();
      const interval = setInterval(fetchHospital, 5000);
      return () => clearInterval(interval);
    }
  }, [fetchHospital, open]);

  const handleEditClick = () => {
    if (!isAdmin) {
      toast.error('You must be an admin to edit hospital details.');
      return;
    }
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/hospitals/${hospitalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success('Hospital updated successfully.');
        setEditing(false);
        fetchHospital();
      } else {
        toast.error('Failed to update hospital.');
      }
    } catch {
      toast.error('Error updating hospital.');
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Hospital Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader className="animate-spin text-gray-500 h-6 w-6" />
          </div>
        ) : hospital ? (
          <div className="space-y-4">
            {editing ? (
              <>
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Total Beds</Label>
                  <Input
                    type="number"
                    value={formData.totalBeds || 0}
                    onChange={(e) => setFormData({ ...formData, totalBeds: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Available Beds</Label>
                  <Input
                    type="number"
                    value={formData.availableBeds || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, availableBeds: Number(e.target.value) })
                    }
                  />
                </div>
                <Button onClick={handleSave}>Save</Button>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">{hospital.name}</h2>
                  <Badge variant={hospital.status === 'active' ? 'default' : 'secondary'}>
                    {hospital.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{hospital.location}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Beds</p>
                    <div className="flex items-center space-x-2">
                      <BedIcon className="h-4 w-4" />
                      <span className="font-semibold">{hospital.totalBeds}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available Beds</p>
                    <div className="flex items-center space-x-2">
                      <BedIcon className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-600">{hospital.availableBeds}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Specialties</p>
                  <div className="flex flex-wrap gap-1">
                    {hospital.specialties?.map((spec) => (
                      <Badge key={spec} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <PhoneIcon className="h-4 w-4" />
                  <span>{hospital.phone}</span>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => onEnroll(hospital.id)}>
                    Enrol
                  </Button>
                  <Button variant="outline" onClick={handleEditClick}>
                    Edit
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Hospital not found.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
