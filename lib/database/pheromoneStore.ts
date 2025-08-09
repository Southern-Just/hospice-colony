
import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { pheromones } from "./schema";

export async function loadPheromones(): Promise<Map<string, number>> {
    const rows = await db.select().from(pheromones);
    const map = new Map<string, number>();
    rows.forEach((row) => {
        map.set(`${row.fromBedId}-${row.toBedId}`, row.value);
    });

    return map;
}

export async function savePheromone(from: string, to: string, value: number) {
    await db
        .insert(pheromones)
        .values({ fromBedId: from, toBedId: to, value })
        .onConflictDoUpdate({
            target: [pheromones.fromBedId, pheromones.toBedId],
            set: { value },
        });
}
