// lib/aco.ts
import { Bed, Ant } from "@/types";
import { loadPheromones, savePheromone } from "@/lib/database/pheromoneStore";

interface ACOConfig {
    iterations: number;
    alpha: number;
    beta: number;
    evaporationRate: number;
    antCount: number;
}

const defaultConfig: ACOConfig = {
    iterations: 50,
    alpha: 1,
    beta: 2,
    evaporationRate: 0.5,
    antCount: 20,
};

let pheromones: Map<string, number> = new Map();
let loaded = false;

const heuristic = (bedA: Bed, bedB: Bed): number => {
    const dx = bedA.position.x - bedB.position.x;
    const dy = bedA.position.y - bedB.position.y;
    return 1 / (Math.sqrt(dx * dx + dy * dy) + 1);
};

async function initializePheromones(beds: Bed[]) {
    if (!loaded) {
        pheromones = await loadPheromones();
        loaded = true;
    }

    // Ensure all edges exist
    for (const a of beds) {
        for (const b of beds) {
            if (a.id !== b.id && !pheromones.has(`${a.id}-${b.id}`)) {
                pheromones.set(`${a.id}-${b.id}`, 1);
                await savePheromone(a.id, b.id, 1);
            }
        }
    }
}

const selectNextBed = (
    current: Bed,
    unvisited: Bed[],
    alpha: number,
    beta: number
): Bed => {
    const probabilities = unvisited.map((bed) => {
        const pheromone = pheromones.get(`${current.id}-${bed.id}`) || 1;
        const heuristicValue = heuristic(current, bed);
        return {
            bed,
            value: Math.pow(pheromone, alpha) * Math.pow(heuristicValue, beta),
        };
    });

    const total = probabilities.reduce((acc, item) => acc + item.value, 0);
    const rand = Math.random() * total;

    let sum = 0;
    for (const { bed, value } of probabilities) {
        sum += value;
        if (sum >= rand) return bed;
    }

    return unvisited[0];
};

const evaluatePathFitness = (path: Bed[]): number => {
    let totalDistance = 0;
    for (let i = 0; i < path.length - 1; i++) {
        totalDistance += Math.hypot(
            path[i].position.x - path[i + 1].position.x,
            path[i].position.y - path[i + 1].position.y
        );
    }
    return -totalDistance;
};

async function updatePheromones(ants: Ant[], evaporationRate: number) {
    // Evaporation
    for (const key of pheromones.keys()) {
        const newVal = (pheromones.get(key) || 0) * (1 - evaporationRate);
        pheromones.set(key, newVal);
        const [from, to] = key.split("-");
        await savePheromone(from, to, newVal);
    }

    // Deposit from ants
    for (const ant of ants) {
        for (let i = 0; i < ant.path.length - 1; i++) {
            const key = `${ant.path[i].id}-${ant.path[i + 1].id}`;
            const current = pheromones.get(key) || 0;
            const newVal = current + 1 / -ant.fitness;
            pheromones.set(key, newVal);
            await savePheromone(ant.path[i].id, ant.path[i + 1].id, newVal);
        }
    }
}

export async function runAntColonyOptimization(
    beds: Bed[],
    config: ACOConfig = defaultConfig
): Promise<Bed[]> {
    await initializePheromones(beds);
    let bestPath: Bed[] = beds;
    let bestFitness = -Infinity;

    for (let iter = 0; iter < config.iterations; iter++) {
        const ants: Ant[] = [];

        for (let k = 0; k < config.antCount; k++) {
            const unvisited = [...beds];
            const path: Bed[] = [];
            let current = unvisited.splice(Math.floor(Math.random() * unvisited.length), 1)[0];
            path.push(current);

            while (unvisited.length > 0) {
                const next = selectNextBed(current, unvisited, config.alpha, config.beta);
                path.push(next);
                unvisited.splice(unvisited.indexOf(next), 1);
                current = next;
            }

            const fitness = evaluatePathFitness(path);
            ants.push({ path, fitness });

            if (fitness > bestFitness) {
                bestFitness = fitness;
                bestPath = path;
            }
        }

        await updatePheromones(ants, config.evaporationRate);
    }

    return bestPath;
}
