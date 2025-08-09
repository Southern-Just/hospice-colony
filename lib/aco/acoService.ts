// lib/acoService.ts
import { db } from "@/lib/database/db";
import { hospitals, pheromoneTrails } from "@/lib/database/schema";
import { eq, and } from "drizzle-orm";

type PheromoneMap = Map<string, number>;

class ACOService {
    pheromones: PheromoneMap = new Map();
    evaporationRate = 0.1;
    depositAmount = 1.0;

    async loadPheromones() {
        const trails = await db.select().from(pheromoneTrails);
        this.pheromones.clear();
        trails.forEach(t => {
            const key = `${t.fromHospitalId}-${t.toHospitalId}`;
            this.pheromones.set(key, t.pheromoneLevel);
        });
    }

    getPheromone(fromId: string, toId: string) {
        return this.pheromones.get(`${fromId}-${toId}`) || 1.0;
    }

    async updatePheromone(fromId: string, toId: string, delta: number) {
        const key = `${fromId}-${toId}`;
        const newValue = (this.pheromones.get(key) || 1.0) + delta;
        this.pheromones.set(key, newValue);

        // Save to DB
        const existing = await db
            .select()
            .from(pheromoneTrails)
            .where(and(eq(pheromoneTrails.fromHospitalId, fromId), eq(pheromoneTrails.toHospitalId, toId)));

        if (existing.length > 0) {
            await db.update(pheromoneTrails)
                .set({ pheromoneLevel: newValue, lastUpdated: new Date() })
                .where(eq(pheromoneTrails.id, existing[0].id));
        } else {
            await db.insert(pheromoneTrails)
                .values({ fromHospitalId: fromId, toHospitalId: toId, pheromoneLevel: newValue });
        }
    }

    evaporate() {
        this.pheromones.forEach((level, key) => {
            const newLevel = Math.max(0.1, level * (1 - this.evaporationRate));
            this.pheromones.set(key, newLevel);
        });
    }

    async runACO(sourceId: string, patientNeeds: string[]) {
        const allHospitals = await db.select().from(hospitals);
        // Simplified selection: pick best hospital based on pheromone level and availability
        const candidates = allHospitals.filter(h => h.id !== sourceId && h.availableBeds > 0);

        if (candidates.length === 0) return null;

        let best = candidates[0];
        let bestScore = 0;

        for (const h of candidates) {
            const pheromone = this.getPheromone(sourceId, h.id);
            const score = pheromone * (1 + h.availableBeds / h.totalBeds);
            if (score > bestScore) {
                bestScore = score;
                best = h;
            }
        }

        // Reinforce chosen path
        await this.updatePheromone(sourceId, best.id, this.depositAmount);
        this.evaporationRate && this.evaporate();

        return best;
    }
}

export const acoService = new ACOService();
