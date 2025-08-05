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
