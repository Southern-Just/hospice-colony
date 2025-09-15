import { Server as IOServer } from "socket.io";
import type { NextApiResponse } from "next";

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: any & {
    server: any & {
      io?: IOServer;
    };
  };
};


export interface Bed {
  id: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  ward: string;
  bedNumber: string;
  priority: 'low' | 'medium' | 'high';
  position: { x: number; y: number };
}


export interface Ant {
  path: Bed[];
  fitness: number;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  notes: string;
  address: string;
  zipCode: string;
  website: string;
  location: string;
  totalBeds: number;
  contactTitle: string;
  availableBeds: number;
  specialties: string[];
  contactPerson: string;
  partnershipDate: string;
  registrationNumber: string;
  status: "active" | "inactive" | "pending";
  
}

export interface Patient{
  id: string;
  hospitalId: string;
  name: string;
  gender: string;
  dob: string;
  contact: string;
  location: string;
  healthDetails: string;
  admittedAt: string;
}

export interface DashboardProps {
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  partneredHospitals: number;
}
export interface HospitalPartnerModalProps {
  hospital?: HospitalPartner | null;
  isAdmin: boolean;
  trigger?: React.ReactNode;
  onSave?: (hospital: HospitalPartner) => void;
}