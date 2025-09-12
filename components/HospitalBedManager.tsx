"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/database/db";
import { beds, hospitals } from "@/lib/database/schema";
import { eq } from "drizzle-orm";

interface Bed {
  id: number;
  hospitalId: number;
  ward: string;
  floor: string;
  isOccupied: boolean;
  bedNumber: string;
  patientId?: number | null;
}

export default function HospitalBeds({ hospitalId }: { hospitalId: number }) {
  const [hospitalBeds, setHospitalBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBeds() {
      try {
        const res = await fetch(`/api/hospitals/${hospitalId}/beds`);
        const data = await res.json();
        setHospitalBeds(data);
      } catch (error) {
        console.error("Error fetching beds:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBeds();
  }, [hospitalId]);

  if (loading) return <p>Loading beds...</p>;

  const totalBeds = hospitalBeds.length;
  const occupiedBeds = hospitalBeds.filter((bed) => bed.isOccupied).length;
  const availableBeds = totalBeds - occupiedBeds;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Hospital Beds Management</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-lg font-semibold">Total Beds</p>
            <p className="text-xl">{totalBeds}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-lg font-semibold">Available Beds</p>
            <p className="text-xl text-green-600">{availableBeds}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-lg font-semibold">Occupied Beds</p>
            <p className="text-xl text-red-600">{occupiedBeds}</p>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Bed ID</th>
              <th className="border p-2">Bed Number</th>
              <th className="border p-2">Ward</th>
              <th className="border p-2">Floor</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Patient ID</th>
            </tr>
          </thead>
          <tbody>
            {hospitalBeds.map((bed) => (
              <tr key={bed.id}>
                <td className="border p-2">{bed.id}</td>
                <td className="border p-2">{bed.bedNumber}</td>
                <td className="border p-2">{bed.ward}</td>
                <td className="border p-2">{bed.floor}</td>
                <td
                  className={`border p-2 ${
                    bed.isOccupied ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {bed.isOccupied ? "Occupied" : "Available"}
                </td>
                <td className="border p-2">
                  {bed.patientId ? bed.patientId : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
