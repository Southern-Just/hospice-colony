'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { BedIcon, HospitalIcon, ActivityIcon, Loader } from "lucide-react";
import { toast } from "sonner";
import { Hospital } from "@/types";

export function Dashboard() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHospitals = useCallback(async () => {
    try {
      const res = await fetch('/api/hospitals');
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Unexpected response format');

      setHospitals(data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      toast.error('Failed to fetch hospital stats.');
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHospitals();
    const interval = setInterval(fetchHospitals, 5000);
    return () => clearInterval(interval);
  }, [fetchHospitals]);

  const totalBeds = hospitals.reduce((sum, h) => sum + (h.totalBeds || 0), 0);
  const availableBeds = hospitals.reduce((sum, h) => sum + (h.availableBeds || 0), 0);
  const occupiedBeds = totalBeds - availableBeds;
  const partneredHospitals = hospitals.length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hospice Colony</h1>
            <p className="text-muted-foreground">Smart Hospital Bed Allocation System</p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <ActivityIcon className="w-4 h-4 mr-1" />
            Swarm Algorithm Active
          </Badge>
        </div>

        {/* Stats Cards */}
        {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader className="animate-spin text-gray-500 h-6 w-6" />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Beds</CardTitle>
                  <BedIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBeds}</div>
                  <p className="text-xs text-muted-foreground">Across all facilities</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Beds</CardTitle>
                  <BedIcon className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{availableBeds}</div>
                  <p className="text-xs text-muted-foreground">Ready for allocation</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Occupied Beds</CardTitle>
                  <BedIcon className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{occupiedBeds}</div>
                  <p className="text-xs text-muted-foreground">{occupancyRate}% occupancy rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Partner Hospitals</CardTitle>
                  <HospitalIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{partneredHospitals}</div>
                  <p className="text-xs text-muted-foreground">Active collaborations</p>
                </CardContent>
              </Card>
            </div>
        )}
      </div>
  );
}
