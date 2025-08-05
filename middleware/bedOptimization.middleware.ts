import { Bed } from "@/types/Bed";

export const validateBeds = (beds: Bed[]): boolean => {
  if (!Array.isArray(beds)) return false;
  return beds.every(bed =>
    bed.id &&
    bed.status &&
    bed.ward &&
    bed.bedNumber &&
    typeof bed.position.x === 'number' &&
    typeof bed.position.y === 'number'
  );
};
