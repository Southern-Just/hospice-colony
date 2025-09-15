"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Loader2, BedIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Bed = {
  id: string;
  hospitalId: string;
  ward: string;
  status: string;
};

export function ManageBedsModal({
  hospitalId,
  open,
  onClose,
}: {
  hospitalId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(false);
  const [ward, setWard] = useState("");
  const [status, setStatus] = useState("available");
  const [bedCount, setBedCount] = useState(1);

  const fetchBeds = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/hospitals/${hospitalId}/beds`);
      if (!res.ok) throw new Error("Failed to fetch beds");
      const data = await res.json();
      setBeds(data);
    } catch (err) {
      console.error(err);
      toast.error("Could not fetch beds");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchBeds();
  }, [open]);

  const handleAddBeds = async () => {
    try {
      const res = await fetch(`/api/hospitals/${hospitalId}/beds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ward, status, count: bedCount }),
      });
      const result = await res.json();

      if (!res.ok) {
        console.error("Add beds failed:", result);
        throw new Error("Failed to add beds");
      }

      toast.success(result.message || `${bedCount} bed(s) added successfully`);
      setWard("");
      setStatus("available");
      setBedCount(1);
      fetchBeds();
    } catch (err) {
      console.error("handleAddBeds error:", err);
      toast.error("Error adding beds");
    }
  };

  const handleUpdateStatus = async (bedId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/hospitals/${hospitalId}/beds/${bedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update bed");
      toast.success("Bed updated");
      fetchBeds();
    } catch {
      toast.error("Error updating bed");
    }
  };

  const handleDelete = async (bedId: string) => {
    try {
      const res = await fetch(`/api/hospitals/${hospitalId}/beds/${bedId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete bed");
      toast.success("Bed deleted");
      fetchBeds();
    } catch {
      toast.error("Error deleting bed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Beds</DialogTitle>
        </DialogHeader>

        {/* Add beds form */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Ward (e.g. General, ICU)"
            value={ward}
            onChange={(e) => setWard(e.target.value)}
          />
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            min={1}
            className="w-[80px]"
            value={bedCount}
            onChange={(e) => setBedCount(Number(e.target.value))}
          />
          <Button onClick={handleAddBeds}>Add</Button>
        </div>

        {/* Beds list */}
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : beds.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            No beds found.
          </p>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {beds.map((bed) => (
              <div
                key={bed.id}
                className="flex items-center justify-between border p-3 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <BedIcon className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">{bed.ward}</p>
                    <p className="text-sm text-muted-foreground">
                      Status: {bed.status}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={bed.status}
                    onValueChange={(val) => handleUpdateStatus(bed.id, val)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(bed.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
