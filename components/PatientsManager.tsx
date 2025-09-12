"use client";

import { useEffect, useState } from "react";

interface Patient {
  id: number;
  hospitalId: number;
  name: string;
  gender: string;
  dateOfBirth: string;
  location: string;
  contact: string;
  healthCondition: string;
  admissionDate: string;
  dischargeDate?: string | null;
}

export default function HospitalPatients({ hospitalId }: { hospitalId: number }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPatients() {
      try {
        const res = await fetch(`/api/hospitals/${hospitalId}/patients`);
        const data = await res.json();
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPatients();
  }, [hospitalId]);

  if (loading) return <p>Loading patients...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Hospital Patients</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Patient ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Gender</th>
              <th className="border p-2">Date of Birth</th>
              <th className="border p-2">Location</th>
              <th className="border p-2">Contact</th>
              <th className="border p-2">Health Condition</th>
              <th className="border p-2">Admission Date</th>
              <th className="border p-2">Discharge Date</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td className="border p-2">{patient.id}</td>
                <td className="border p-2">{patient.name}</td>
                <td className="border p-2">{patient.gender}</td>
                <td className="border p-2">{patient.dateOfBirth}</td>
                <td className="border p-2">{patient.location}</td>
                <td className="border p-2">{patient.contact}</td>
                <td className="border p-2">{patient.healthCondition}</td>
                <td className="border p-2">{patient.admissionDate}</td>
                <td className="border p-2">
                  {patient.dischargeDate ? patient.dischargeDate : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
