

import { db } from "@/lib/database/db";
import { beds } from "@/lib/database/schema";
import "dotenv/config";

async function main() {
    await db.insert(beds).values([
        {
            id: "1",
            status: "available",
            ward: "A",
            bedNumber: "A1",
            priority: "high",
            position: { x: 0, y: 0 }
        },
        {
            id: "2",
            status: "occupied",
            ward: "A",
            bedNumber: "A2",
            priority: "medium",
            position: { x: 1, y: 0 }
        }
    ]);
    console.log("✅ Beds seeded successfully!");
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    });
