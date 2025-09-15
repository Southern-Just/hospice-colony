import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Hospital, HospitalPartnerModalProps } from "@/types";

const defaultHospital: Hospital = {
  id: "",
  name: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  phone: "",
  email: "",
  website: "",
  contactPerson: "",
  contactTitle: "",
  specialties: [],
  totalBeds: 0,
  availableBeds: 0,
  partnershipDate: new Date().toISOString().split("T")[0],
  status: "inactive",
  notes: "",
  location: "",
  registrationNumber: "",
};

export function HospitalPartnerModal({
  hospital = defaultHospital,
  isAdmin,
  open,
  onClose,
  onSave,
}: HospitalPartnerModalProps) {
  const [formData, setFormData] = useState<Hospital>({
    ...defaultHospital,
    ...hospital,
  });

  const safeStatus = (s?: string) => s || defaultHospital.status;

  const getStatusColor = (status?: string) => {
    switch (safeStatus(status)) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSave = async () => {
    try {
      // Build payload that API expects
      const payload = {
        name: formData.name,
        location: formData.location || `${formData.city}, ${formData.state}`,
        totalBeds: formData.totalBeds,
        availableBeds: formData.availableBeds,
        specialties: formData.specialties,
        phone: formData.phone,
        status: safeStatus(formData.status) as "active" | "inactive",
      };

      const res = await fetch("/api/hospitals/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorMsg = "Unknown error";
        try {
          const error = await res.json();
          if (Array.isArray(error.error)) {
            errorMsg = error.error.join(", ");
          } else if (typeof error.error === "string") {
            errorMsg = error.error;
          }
          console.error("Failed to add hospital:", error);
        } catch (e) {
          console.error("Failed to parse error response:", e);
        }
        alert("Failed to add hospital: " + errorMsg);
        return;
      }

      const newHospital = await res.json();
      onSave?.(newHospital);
      setFormData(defaultHospital);
      onClose?.();
    } catch (err) {
      console.error("Error saving hospital:", err);
      alert("Unexpected error while saving hospital.");
    }
  };

  const handleCancel = () => {
    setFormData(defaultHospital);
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Add New Hospital Partner</DialogTitle>
              <DialogDescription>
                Enter details for new hospital partner
              </DialogDescription>
            </div>
            <Badge className={getStatusColor(formData.status)}>
              {safeStatus(formData.status).charAt(0).toUpperCase() +
                safeStatus(formData.status).slice(1)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Hospital Registration</Label>
                <Input
                  id="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registrationNumber: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={safeStatus(formData.status)}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalBeds">Total Bed Count</Label>
                <Input
                  id="totalBeds"
                  type="number"
                  value={formData.totalBeds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalBeds: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availableBeds">Available Beds</Label>
                <Input
                  id="availableBeds"
                  type="number"
                  value={formData.availableBeds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      availableBeds: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partnershipDate">Partnership Date</Label>
                <Input
                  id="partnershipDate"
                  type="date"
                  value={formData.partnershipDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      partnershipDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Address Information */}
          <div>
            <h3 className="mb-4">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) =>
                    setFormData({ ...formData, zipCode: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h3 className="mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPerson: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactTitle">Contact Title</Label>
                <Input
                  id="contactTitle"
                  value={formData.contactTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, contactTitle: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Specialties */}
          <div>
            <h3 className="mb-4">Specialties</h3>
            <div className="space-y-2">
              <Label htmlFor="specialties">Specialties (comma-separated)</Label>
              <Input
                id="specialties"
                value={formData.specialties.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    specialties: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter((s) => s),
                  })
                }
                placeholder="Cardiology, Neurology, Oncology"
              />
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div>
            <h3 className="mb-4">Notes</h3>
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={4}
                placeholder="Any additional notes about this hospital partner..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Add Hospital</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
