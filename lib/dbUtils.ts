import { db } from "@/lib/database/db";
import { patients } from "@/lib/database/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const dbUtils = {
  getPatientsByHospital: async (hospitalId: string) => {
    return await db
      .select()
      .from(patients)
      .where(eq(patients.hospitalId, hospitalId))
      .orderBy(desc(patients.admittedAt))
      .limit(2);
  },

  getPatientById: async (patientId: string) => {
    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.id, patientId))
      .limit(1);
    return patient || null;
  },

  admitPatient: async (data: {
    hospitalId: string;
    name: string;
    gender: string;
    dob: string;
    contact: string;
    location: string;
    healthDetails: string;
  }) => {
    const newPatient = {
      id: uuidv4(),
      ...data,
      admittedAt: new Date(),
    };
    await db.insert(patients).values(newPatient);
    return newPatient;
  },

  updatePatient: async (
    patientId: string,
    updates: Partial<typeof patients.$inferInsert>
  ) => {
    await db.update(patients).set(updates).where(eq(patients.id, patientId));
    const [updated] = await db
      .select()
      .from(patients)
      .where(eq(patients.id, patientId))
      .limit(1);
    return updated;
  },

  dischargePatient: async (patientId: string) => {
    await db.delete(patients).where(eq(patients.id, patientId));
  },
};
