'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Hospital } from '@/types';

export function HospitalViewModal({
  hospital,
  open,
  onClose,
  isAdmin,
  onEdit,
}: {
  hospital: Hospital;
  open: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onEdit: () => void;
}) {
  if (!hospital) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg space-y-4 p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {hospital.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div>
            <Label>Location</Label>
            <p className="text-muted-foreground">{hospital.location}</p>
          </div>
          <div>
            <Label>Phone</Label>
            <p className="text-muted-foreground">{hospital.phone}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Total Beds</Label>
              <p className="text-muted-foreground">{hospital.totalBeds}</p>
            </div>
            <div>
              <Label>Available Beds</Label>
              <p className="text-muted-foreground">{hospital.availableBeds}</p>
            </div>
          </div>
          <div>
            <Label>Specialties</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {hospital.specialties?.map((s) => (
                <span
                  key={s}
                  className="px-2 py-1 rounded bg-muted text-xs font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          {isAdmin && (
            <Button onClick={onEdit} variant="default">
              Edit
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
