import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Edit,
  Eye,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Calendar,
} from "lucide-react";
import { Hospital, HospitalPartnerModalProps } from "@/types";



const defaultHospital: Hospital= {
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
  hospital,
  isAdmin,
  trigger,
  onSave,
}: HospitalPartnerModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedHospital, setEditedHospital] =
    useState<Hospital>(hospital || defaultHospital);
  const [open, setOpen] = useState(false);

  // Sync state if hospital prop changes
  useEffect(() => {
    if (hospital) {
      setEditedHospital(hospital);
    }
  }, [hospital]);

  const handleSave = () => {
    if (!editedHospital) return;
    onSave?.(editedHospital);
    setIsEditing(false);
    setOpen(false);
  };

  const handleCancel = () => {
    setEditedHospital(hospital || defaultHospital);
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Eye className="h-4 w-4 mr-2" />
      View Details
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
            <DialogTitle className="text-xl">
                <p className="text-xl font-semibold">
                    {editedHospital.name}
                </p>
            </DialogTitle>

              <DialogDescription>
                {isEditing
                  ? "Update hospital partner information"
                  : "View hospital partner information"}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(editedHospital.status)}>
                {editedHospital.status.charAt(0).toUpperCase() +
                  editedHospital.status.slice(1)}
              </Badge>
              {isAdmin && !isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Hospital Registration</Label>
                {isEditing ? (
                  <Input
                    id="registrationNumber"
                    value={editedHospital.registrationNumber}
                    onChange={(e) =>
                      setEditedHospital((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <p className="px-3 py-2 bg-muted rounded-md">
                    {editedHospital.registrationNumber}
                  </p>
                )}
              </div>

            <div className="space-y-2 px-8">
            <Label htmlFor="status">Status</Label>
            {isEditing ? (
                <select
                id="status"
                value={editedHospital.status}
                onChange={(e) =>
                    setEditedHospital((prev) => ({
                    ...prev,
                    status: e.target.value as any,
                    }))
                }
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                </select>
            ) : (
                <div className="px-8 py-2 bg-none rounded-md flex items-center">
                <span
                    className={`w-6 h-6 rounded-full ${
                    editedHospital.status === "active"
                        ? "bg-green-500"
                        : editedHospital.status === "inactive"
                        ? "bg-red-500"
                        : editedHospital.status === "pending"
                        ? "bg-yellow-500"
                        : "bg-gray-400"
                    }`}
                />
                </div>
            )}
            </div>


              <div className="space-y-2">
                <Label htmlFor="Total beds">Total Bed Count</Label>
                {isEditing ? (
                  <Input
                    id="totalBeds"
                    type="number"
                    value={editedHospital.totalBeds}
                    onChange={(e) =>
                      setEditedHospital((prev) => ({
                        ...prev,
                        totalBeds: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                ) : (
                  <div className="flex items-center px-3 py-2 bg-muted rounded-md">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    {editedHospital.totalBeds} beds
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="Available beds">Available beds</Label>
                {isEditing ? (
                  <Input
                    id="Available beds"
                    type="number"
                    value={editedHospital.availableBeds}
                    onChange={(e) =>
                      setEditedHospital((prev) => ({
                        ...prev,
                        availableBeds: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                ) : (
                  <div className="flex items-center px-3 py-2 bg-muted rounded-md">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    {editedHospital.availableBeds} beds
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="partnershipDate">Partnership Date</Label>
                {isEditing ? (
                  <Input
                    id="partnershipDate"
                    type="date"
                    value={editedHospital.partnershipDate}
                    onChange={(e) =>
                      setEditedHospital((prev) => ({
                        ...prev,
                        partnershipDate: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <div className="flex items-center px-3 py-2 bg-muted rounded-md">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {new Date(
                      editedHospital.partnershipDate
                    ).toLocaleDateString()}
                  </div>
                )}
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
                {isEditing ? (
                  <Input
                    id="address"
                    value={editedHospital.address}
                    onChange={(e) =>
                      setEditedHospital((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <div className="flex items-center px-3 py-2 bg-muted rounded-md">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    {editedHospital.address}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                {isEditing ? (
                  <Input
                    id="city"
                    value={editedHospital.city}
                    onChange={(e) =>
                      setEditedHospital((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <p className="px-3 py-2 bg-muted rounded-md">
                    {editedHospital.city}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                {isEditing ? (
                  <Input
                    id="state"
                    value={editedHospital.state}
                    onChange={(e) =>
                      setEditedHospital((prev) => ({
                        ...prev,
                        state: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <p className="px-3 py-2 bg-muted rounded-md">
                    {editedHospital.state}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                {isEditing ? (
                  <Input
                    id="zipCode"
                    value={editedHospital.zipCode}
                    onChange={(e) =>
                      setEditedHospital((prev) => ({
                        ...prev,
                        zipCode: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <p className="px-3 py-2 bg-muted rounded-md">
                    {editedHospital.zipCode}
                  </p>
                )}
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
                {isEditing ? (
                  <Input
                    id="phone"
                    value={editedHospital.phone}
                    onChange={(e) =>
                      setEditedHospital((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <div className="flex items-center px-3 py-2 bg-muted rounded-md">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    {editedHospital.phone}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={editedHospital.email}
                    onChange={(e) =>
                      setEditedHospital((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <div className="flex items-center px-3 py-2 bg-muted rounded-md">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    {editedHospital.email}
                  </div>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="website">Website</Label>
                {isEditing ? (
                  <Input
                    id="website"
                    value={editedHospital.website}
                    onChange={(e) =>
                      setEditedHospital((prev) => ({
                        ...prev,
                        website: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <div className="flex items-center px-3 py-2 bg-muted rounded-md">
                    <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a
                      href={editedHospital.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {editedHospital.website}
                    </a>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                {isEditing ? (
                  <Input
                    id="contactPerson"
                    value={editedHospital.contactPerson}
                    onChange={(e) =>
                      setEditedHospital((prev) => ({
                        ...prev,
                        contactPerson: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <p className="px-3 py-2 bg-muted rounded-md">
                    {editedHospital.contactPerson}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactTitle">Contact Title</Label>
                {isEditing ? (
                  <Input
                    id="contactTitle"
                    value={editedHospital.contactTitle}
                    onChange={(e) =>
                      setEditedHospital((prev) => ({
                        ...prev,
                        contactTitle: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <p className="px-3 py-2 bg-muted rounded-md">
                    {editedHospital.contactTitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Specialties */}
          <div>
            <h3 className="mb-4">Specialties</h3>
            {isEditing ? (
              <div className="space-y-2">
                <Label htmlFor="specialties">Specialties (comma-separated)</Label>
                <Input
                  id="specialties"
                  value={editedHospital.specialties.join(", ")}
                  onChange={(e) =>
                    setEditedHospital((prev) => ({
                      ...prev,
                      specialties: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s),
                    }))
                  }
                  placeholder="Cardiology, Neurology, Oncology"
                />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {editedHospital.specialties.length > 0 ? (
                  editedHospital.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary">
                      {specialty}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">No specialties listed</p>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Notes */}
          <div>
            <h3 className="mb-4">Notes</h3>
            {isEditing ? (
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={editedHospital.notes}
                  onChange={(e) =>
                    setEditedHospital((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Any additional notes about this hospital partner..."
                />
              </div>
            ) : (
              <p className="px-3 py-2 bg-muted rounded-md min-h-[100px] whitespace-pre-wrap">
                {editedHospital.notes || "No additional notes"}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
