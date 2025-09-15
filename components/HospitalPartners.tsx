"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  HospitalIcon,
  MapPinIcon,
  BedIcon,
  PhoneIcon,
  Loader,
} from "lucide-react";
import { toast } from "sonner";
import { Hospital } from "@/types";
import { useAuth } from "@/components/contexts/AuthContext";
import { HospitalPartnerModal } from "@/components/HospitalPartnerModal";
import { HospitalViewModal } from "@/components/HospitalViewModal";
import { PatientAdmissionModal } from "./PatientAdmissionModal";
import { HospitalPatientsModal } from "./HospitalPatientsModal";
import { ManageBedsModal } from "./ManageBedsModal";

export function HospitalPartners() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  // Beds
  const [beds, setBeds] = useState<Record<string, any[]>>({});
  const [selectedWard, setSelectedWard] = useState<Record<string, string>>({});

  // Modals
  const [viewHospital, setViewHospital] = useState<Hospital | null>(null);
  const [editHospital, setEditHospital] = useState<Hospital | null>(null);
  const [showAdmission, setShowAdmission] = useState<string | null>(null);
  const [showBedsModal, setShowBedsModal] = useState<string | null>(null);
  const [showPatientsModal, setShowPatientsModal] = useState<string | null>(
    null
  );

  // ---- Fetch Hospitals ----
  const fetchHospitals = useCallback(async () => {
    try {
      const res = await fetch("/api/hospitals");
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Unexpected response format");
      setHospitals(data);
    } catch (err) {
      console.error("Fetch hospitals error:", err);
      toast.error("Could not load hospitals.");
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBeds = async (hospitalId: string) => {
    try {
      const res = await fetch(`/api/hospitals/${hospitalId}/beds`);
      if (!res.ok) throw new Error("Error fetching beds");
      const data = await res.json();
      setBeds((prev) => ({ ...prev, [hospitalId]: data }));
    } catch (err) {
      console.error("Fetch beds error:", err);
      toast.error("Could not load beds for hospital.");
    }
  };

  useEffect(() => {
    fetchHospitals();
    const interval = setInterval(fetchHospitals, 5000);
    return () => clearInterval(interval);
  }, [fetchHospitals]);

  const handleSaveHospital = () => {
    fetchHospitals();
    setEditHospital(null);
  };

  const handleEnroll = async (hospitalId: string) => {
    if (!isAdmin) {
      toast.error("Login as admin to enrol.");
      return;
    }
    try {
      const res = await fetch(`/api/hospitals/${hospitalId}/enroll`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Enroll failed");
      toast.success("Successfully enrolled.");
      fetchHospitals();
    } catch {
      toast.error("Error enrolling hospital.");
    }
  };

  return (
    <div className="space-y-6 bg-partner-hospitals p-4 rounded-sm">
      {/* ---- HEADER ---- */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Partner Hospitals</h2>
          <p className="text-muted-foreground">
            Hospitals collaborating with Hospice Colony
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setEditHospital({} as Hospital)}>
            Add New Partner
          </Button>
        )}
      </div>

      {/* ---- CONTENT ---- */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader className="animate-spin text-gray-500 h-6 w-6" />
        </div>
      ) : hospitals.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No hospitals available.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hospitals.map((hospital) => {
            const allBeds = beds[hospital.id] ?? [];
            const ward = selectedWard[hospital.id] ?? "General";
            const availableBedsCount =
              ward === "General"
                ? allBeds.length > 0
                  ? allBeds.filter((b) => b.status === "available").length
                  : hospital.availableBeds
                : allBeds.filter(
                    (b) => b.status === "available" && b.wardType === ward
                  ).length;

            return (
              <Card key={hospital.id} className="shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between ">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <HospitalIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {hospital.name}
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-1">
                          <MapPinIcon className="h-3 w-3" />
                          <span>{hospital.location}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={
                        hospital.status?.toLowerCase() === "active"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {hospital.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Beds summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Beds</p>
                      <div className="flex items-center space-x-2">
                        <BedIcon className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold">
                          {hospital.totalBeds}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Available</p>
                      <div className="flex items-center space-x-2">
                        <BedIcon className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-600">
                          {availableBedsCount}
                        </span>
                      </div>
                    </div>

                    {/* Admin vs User button */}
                    <div className="flex justify-center items-center">
                      {isAdmin ? (
                        <Button
                          className="bg-blue-500 rounded-full text-white px-4 py-2 hover:bg-blue-400"
                          onClick={() => setShowBedsModal(hospital.id)}
                        >
                          Manage Beds
                        </Button>
                      ) : (
                        <>
                          <Button
                            className="bg-green-700 rounded-full text-white px-4 py-2 hover:bg-green-600"
                            onClick={() => setShowAdmission(hospital.id)}
                          >
                            Get Admitted
                          </Button>
                          <PatientAdmissionModal
                            open={showAdmission === hospital.id}
                            onClose={() => setShowAdmission(null)}
                            hospitalId={hospital.id}
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Specialties + Patients button (admins only) */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm mb-1.5 text-muted-foreground">
                        Specialties
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {["General", ...(hospital.specialties ?? [])]
                          .filter((v, i, arr) => arr.indexOf(v) === i)
                          .map((specialty) => (
                            <Badge
                              key={`${hospital.id}-${specialty}`}
                              variant={
                                selectedWard[hospital.id] === specialty ||
                                (!selectedWard[hospital.id] &&
                                  specialty === "General")
                                  ? "default"
                                  : "outline"
                              }
                              className="text-xs cursor-pointer"
                              onClick={() => {
                                setSelectedWard((prev) => ({
                                  ...prev,
                                  [hospital.id]: specialty,
                                }));
                                fetchBeds(hospital.id);
                              }}
                            >
                              {specialty.replace(/_/g, " ")}
                            </Badge>
                          ))}
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="mr-6">
                        <Button
                          className="bg-green-700 rounded-full text-white px-4 py-2 hover:bg-green-600"
                          onClick={() => setShowPatientsModal(hospital.id)}
                        >
                          Hosp-Patients
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <PhoneIcon className="h-3 w-3" />
                      <span>{hospital.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewHospital(hospital)}
                      >
                        {isAdmin ? "View / Edit" : "View Details"}
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEnroll(hospital.id)}
                        >
                          Enrol
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ---- Modals ---- */}
      {viewHospital && (
        <HospitalViewModal
          hospital={viewHospital}
          open={!!viewHospital}
          onClose={() => setViewHospital(null)}
          isAdmin={isAdmin}
          onEdit={() => {
            setEditHospital(viewHospital);
            setViewHospital(null);
          }}
        />
      )}

      {isAdmin && editHospital && (
        <HospitalPartnerModal
          hospital={editHospital}
          isAdmin={isAdmin}
          open={!!editHospital}
          onClose={() => setEditHospital(null)}
          onSave={handleSaveHospital}
        />
      )}

      {isAdmin && showBedsModal && (
        <ManageBedsModal
          hospitalId={showBedsModal}
          open={!!showBedsModal}
          onClose={() => setShowBedsModal(null)}
        />
      )}

      {isAdmin && showPatientsModal && (
        <HospitalPatientsModal
          hospitalId={showPatientsModal}
          open={!!showPatientsModal}
          onClose={() => setShowPatientsModal(null)}
        />
      )}
    </div>
  );
}
