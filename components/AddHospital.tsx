"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export function AddHospital() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    location: "",
    totalBeds: "",
    availableBeds: "",
    specialties: "",
    phone: ""
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const specialties = form.specialties.split(",").map((s) => s.trim());
      const res = await fetch("/api/hospital/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          location: form.location,
          totalBeds: parseInt(form.totalBeds),
          availableBeds: parseInt(form.availableBeds),
          specialties,
          phone: form.phone
        })
      });

      if (!res.ok) throw new Error("Failed to add hospital");
    },
    onSuccess: () => {
      toast.success("Hospital added successfully.");
      queryClient.invalidateQueries({ queryKey: ["hospitals"] });
      setForm({ name: "", location: "", totalBeds: "", availableBeds: "", specialties: "", phone: "" });
    },
    onError: () => {
      toast.error("Failed to add hospital. Please try again.");
    }
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Hospital Name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="totalBeds">Total Beds</Label>
          <Input
            type="number"
            id="totalBeds"
            value={form.totalBeds}
            onChange={(e) => setForm({ ...form, totalBeds: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="availableBeds">Available Beds</Label>
          <Input
            type="number"
            id="availableBeds"
            value={form.availableBeds}
            onChange={(e) => setForm({ ...form, availableBeds: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="specialties">Specialties (comma-separated)</Label>
        <Textarea
          id="specialties"
          value={form.specialties}
          onChange={(e) => setForm({ ...form, specialties: e.target.value })}
          placeholder="e.g. ICU, Pediatrics, Emergency"
          required
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Adding..." : "Add Hospital"}
      </Button>
    </form>
  );
}
