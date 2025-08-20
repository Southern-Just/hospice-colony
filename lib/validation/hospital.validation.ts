import { z } from "zod";
import { HOSPITAL_STATUS, HOSPITAL_SPECIALTIES } from "../constants";


export const HospitalSchema = z.object({
    name: z.string().min(1, "Hospital name is required"),
    location: z.string().min(1, "Location is required"),
    phone: z.string().min(1, "Phone number is required"),
    totalBeds: z.number().int().min(0),
    availableBeds: z.number().int().min(0),
    specialties: z.array(z.enum(HOSPITAL_SPECIALTIES)),
    status: z.enum(HOSPITAL_STATUS),
});