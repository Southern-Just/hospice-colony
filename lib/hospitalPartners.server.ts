"use server";

import { db } from "@/lib/database/db";
import { hospitals, NewHospital } from "@/lib/database/schema";

export async function addHospital(hospital: NewHospital) {
  return await db.insert(hospitals).values(hospital);
}

export async function getAllHospitals() {
  return await db.select().from(hospitals);
}
