export const SPECIALTIES = [
  'Emergency',
  'ICU',
  'Surgery',
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Trauma',
  'Orthopedics',
  'General Medicine',
  'Maternity',
  'Urgent Care',
] as const;

export type Specialty = (typeof SPECIALTIES)[number];
