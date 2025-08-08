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
  location: string;
  totalBeds: number;
  availableBeds: number;
  specialties: string[];
  status: 'active' | 'inactive';
  phone: string;
}