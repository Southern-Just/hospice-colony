// scripts/seed.ts

import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "@/lib/database/db";
import { beds, hospitals, users } from "@/lib/database/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // --- Clear existing data ---
  await db.delete(beds);
  await db.delete(hospitals);
  await db.delete(users);

  // --- Create a test user ---
  const [user] = await db
    .insert(users)
    .values({
      id: randomUUID(),
      email: "admin@hospital.com",
      password: "hashedpassword", // TODO: hash properly with bcrypt
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      isActive: true,
    })
    .returning();

  console.log("👤 User created:", user.email);

  // --- Create hospitals ---
  const hospitalData = [
    {
      id: randomUUID(),
      name: "City General Hospital",
      location: "Downtown",
      totalBeds: 10,
      availableBeds: 10,
      specialties: ["General", "ICU", "Pediatrics"],
      phone: "123-456-7890",
      status: "active" as const,
    },
    {
      id: randomUUID(),
      name: "Southern Medical Center",
      location: "Southside",
      totalBeds: 8,
      availableBeds: 8,
      specialties: ["General", "Surgery", "Cardiology"],
      phone: "321-654-0987",
      status: "active" as const,
    },
  ];

  const createdHospitals = await db.insert(hospitals).values(hospitalData).returning();
  console.log("🏥 Hospitals created:", createdHospitals.map(h => h.name));

  // --- Create beds for each hospital/ward ---
  for (const hospital of createdHospitals) {
    for (const ward of hospital.specialties) {
      for (let i = 1; i <= 3; i++) {
        await db.insert(beds).values({
          id: randomUUID(),
          hospitalId: hospital.id,
          status: "available",
          ward,
          bedNumber: `${ward}-${i}`,
          priority: "normal",
          position: { x: i, y: Math.floor(Math.random() * 10) },
          pheromoneLevel: 1.0,
        });
      }
    }
  }

  console.log("🛏️ Beds created successfully.");
  console.log("✅ Seeding complete!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  });
