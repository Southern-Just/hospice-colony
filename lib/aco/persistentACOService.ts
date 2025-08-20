import { pheromones, beds } from "@/lib/database/schema";
import { eq, and } from "drizzle-orm";
import { db } from "../database/db";

type SelectBedParams = {
    hospitalId: string;
    wardType: string;
    priority: number; // patient priority (1-10)
};

type ReinforceParams = {
    hospitalId: string;
    bedId: string;
    success: boolean;
};

class PersistentACOService {
    private alpha = 1.0; // pheromone influence
    private beta = 2.0;  // heuristic influence
    private evaporationRate = 0.1; // pheromone decay

    async selectBed({ hospitalId, wardType }: SelectBedParams): Promise<string | null> {
        // Get available beds for this ward
        const availableBeds = await db.query.beds.findMany({
            where: and(eq(beds.hospitalId, hospitalId), eq(beds.ward, wardType), eq(beds.status, "available")),
        });

        if (availableBeds.length === 0) return null;

        // Get pheromone levels from DB
        const pheromoneRows = await db.query.pheromones.findMany({
            where: eq(pheromones.hospitalId, hospitalId),
        });

        // Build a lookup for pheromone levels
        const pheromoneMap: Record<string, number> = {};
        pheromoneRows.forEach(p => {
            pheromoneMap[p.bedId] = Number(p.pheromoneLevel);
        });

        // Calculate probabilities
        const probabilities: number[] = [];
        let total = 0;

        for (const bed of availableBeds) {
            const tau = pheromoneMap[bed.id] ?? 1.0; // default pheromone
            const eta = 1.0; // heuristic (could be distance, comfort score, etc.)
            const value = Math.pow(tau, this.alpha) * Math.pow(eta, this.beta);
            probabilities.push(value);
            total += value;
        }

        // Normalize and select
        let r = Math.random() * total;
        for (let i = 0; i < availableBeds.length; i++) {
            r -= probabilities[i];
            if (r <= 0) {
                return availableBeds[i].id;
            }
        }

        return availableBeds[availableBeds.length - 1].id; // fallback
    }

    async reinforce({ hospitalId, bedId, success }: ReinforceParams) {
        const delta = success ? 1.0 : -0.5; // reward or penalize
        const existing = await db.query.pheromones.findFirst({
            where: eq(pheromones.id, `${hospitalId}-${bedId}`),
        });

        if (!existing) {
            await db.insert(pheromones).values({
                id: `${hospitalId}-${bedId}`,
                hospitalId,
                bedId,
                pheromoneLevel: (success ? 1.5 : 0.5).toString(),
            });
        } else {
            const newLevel = Math.max(
                0.1,
                (Number(existing.pheromoneLevel) * (1 - this.evaporationRate)) + delta
            );
            await db
                .update(pheromones)
                .set({ pheromoneLevel: newLevel.toString(), lastUpdated: new Date() })
                .where(eq(pheromones.id, `${hospitalId}-${bedId}`));
        }
    }
}

export const persistentACOService = new PersistentACOService();
