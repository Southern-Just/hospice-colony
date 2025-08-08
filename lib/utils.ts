import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface Hospital {
    id: string;
    name: string;
    location: string;
    totalBeds: number;
    availableBeds: number;
    specialties: string[];
    status: 'active' | 'inactive';
    phone: string;
}
export const mockHospitals: Hospital[] = [
    {
        id: '1',
        name: 'Central Medical Center',
        location: 'Downtown District',
        totalBeds: 150,
        availableBeds: 23,
        specialties: ['Emergency', 'ICU', 'Surgery'],
        status: 'active',
        phone: '+1 (555) 123-4567'
    },
    {
        id: '2',
        name: 'St. Mary\'s General Hospital',
        location: 'West Side',
        totalBeds: 200,
        availableBeds: 45,
        specialties: ['Cardiology', 'Neurology', 'Pediatrics'],
        status: 'active',
        phone: '+1 (555) 234-5678'
    },
    {
        id: '3',
        name: 'Regional Trauma Center',
        location: 'North Hills',
        totalBeds: 120,
        availableBeds: 8,
        specialties: ['Trauma', 'Emergency', 'Orthopedics'],
        status: 'active',
        phone: '+1 (555) 345-6789'
    },
    {
        id: '4',
        name: 'Community Health Hospital',
        location: 'South Valley',
        totalBeds: 80,
        availableBeds: 12,
        specialties: ['General Medicine', 'Maternity'],
        status: 'active',
        phone: '+1 (555) 456-7890'
    },
    {
        id: '5',
        name: 'Metro Emergency Center',
        location: 'East District',
        totalBeds: 60,
        availableBeds: 18,
        specialties: ['Emergency', 'Urgent Care'],
        status: 'active',
        phone: '+1 (555) 567-8901'
    }
];
