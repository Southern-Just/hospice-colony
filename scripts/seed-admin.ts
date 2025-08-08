import { db } from "@/lib/database/db";
import { users } from "@/lib/database/schema";
import bcrypt from "bcryptjs";

async function seedAdmin() {
  const hashedPassword = await bcrypt.hash("admin1234", 10); // use a strong password

  await db.insert(users).values({
    email: "admin@hospicecolony.com",
    password: hashedPassword,
    firstName: "Admin",
    lastName: "User",
    role: "admin",           
    isActive: true,
  });

  console.log("✅ Admin user created!");
}

seedAdmin().catch(console.error);
