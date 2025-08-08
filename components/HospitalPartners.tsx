'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { HospitalIcon, MapPinIcon, BedIcon, PhoneIcon, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { Hospital } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import {HospitalDetailsModal} from "@/components/HospitalDetailsModal";

export function HospitalPartners() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchHospitals = useCallback(async () => {
    try {
      const res = await fetch('/api/hospitals');
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Unexpected response format');

      setHospitals(data);
    } catch (err) {
      console.error('Fetch hospitals error:', err);
      toast.error('Failed to fetch hospitals.');
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

  const openModal = (id: string) => {
    setSelectedHospitalId(id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedHospitalId(null);
    fetchHospitals();
  };

  const requireAdmin = (action: () => void) => {
    if (!isAdmin) {
      toast.error('Login as admin to edit.');
      return;
    }
    action();
  };

  const handleEnroll = async (hospitalId: string) => {
    if (!isAdmin) {
      toast.error('Login as admin to enrol');
      return;
    }
    try {
      const res = await fetch(`/api/hospitals/${hospitalId}/enroll`, { method: 'POST' });
      if (!res.ok) throw new Error('Enroll failed');

      toast.success('Successfully enrolled in hospital.');
      fetchHospitals();
    } catch {
      toast.error('Error enrolling in hospital.');
    }
  };

  return (
      <div className="space-y-6">
        {modalOpen && selectedHospitalId && (
            <HospitalDetailsModal
                hospitalId={selectedHospitalId}
                open={modalOpen}
                isAdmin={isAdmin}
                onEnroll={handleEnroll}
                onClose={closeModal}
            />
        )}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Partner Hospitals</h2>
            <p className="text-muted-foreground">Hospitals collaborating with Hospice Colony</p>
          </div>
          {isAdmin && <Button>Add New Partner</Button>}
        </div>

        {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader className="animate-spin text-gray-500 h-6 w-6" />
            </div>
        ) : hospitals.length === 0 ? (
            <p className="text-center text-muted-foreground">No hospitals available.</p>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {hospitals.map((hospital) => (
                  <Card key={hospital.id} className="relative">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <HospitalIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{hospital.name}</CardTitle>
                            <CardDescription className="flex items-center space-x-1">
                              <MapPinIcon className="h-3 w-3" />
                              <span>{hospital.location}</span>
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={hospital.status === 'active' ? 'default' : 'secondary'}>
                          {hospital.status}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Total Beds</p>
                          <div className="flex items-center space-x-2">
                            <BedIcon className="h-4 w-4" />
                            <span className="font-semibold">{hospital.totalBeds}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Available</p>
                          <div className="flex items-center space-x-2">
                            <BedIcon className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-600">{hospital.availableBeds}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Specialties</p>
                        <div className="flex flex-wrap gap-1">
                          {hospital.specialties?.map((specialty) => (
                              <Badge key={specialty} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <PhoneIcon className="h-3 w-3" />
                          <span>{hospital.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openModal(hospital.id)} // Changed: No admin check
                          >
                            View
                          </Button>
                          <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEnroll(hospital.id)}
                          >
                            Enrol
                          </Button>
                          <Button
                              variant="outline"
                              size="sm"
                              onClick={() => requireAdmin(() => openModal(hospital.id))}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>
        )}
      </div>
  );
}