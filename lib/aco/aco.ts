import type { Bed, Ant } from "@/types";

// ---------- ACO Configuration ----------
export interface ACOConfig {
  iterations: number;
  alpha: number;           // Influence of pheromone
  beta: number;            // Influence of heuristic (distance)
  evaporationRate: number; // Pheromone evaporation
  antCount: number;        // Number of ants per iteration
}

export const defaultConfig: ACOConfig = {
  iterations: 50,
  alpha: 1,
  beta: 2,
  evaporationRate: 0.5,
  antCount: 20,
};

// Persistent pheromones
let pheromones: Map<string, number> = new Map();
let initialized = false;

// ---------- Utilities ----------
const heuristic = (a: Bed, b: Bed) => {
  const dx = a.position.x - b.position.x;
  const dy = a.position.y - b.position.y;
  return 1 / (Math.sqrt(dx * dx + dy * dy) + 1);
};

const initializePheromones = (beds: Bed[]) => {
  if (initialized) return;
  pheromones.clear();
  for (const a of beds) {
    for (const b of beds) {
      if (a.id !== b.id) pheromones.set(`${a.id}-${b.id}`, 1);
    }
  }
  initialized = true;
};

const selectNextBed = (current: Bed, unvisited: Bed[], alpha: number, beta: number): Bed => {
  const probabilities = unvisited.map(bed => {
    const pheromone = pheromones.get(`${current.id}-${bed.id}`) || 1;
    const h = heuristic(current, bed);
    return { bed, value: Math.pow(pheromone, alpha) * Math.pow(h, beta) };
  });

  const total = probabilities.reduce((acc, item) => acc + item.value, 0);
  let rand = Math.random() * total;
  let sum = 0;
  for (const { bed, value } of probabilities) {
    sum += value;
    if (sum >= rand) return bed;
  }
  return unvisited[0];
};

const evaluatePathFitness = (path: Bed[]) => {
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += Math.hypot(
      path[i].position.x - path[i + 1].position.x,
      path[i].position.y - path[i + 1].position.y
    );
  }
  return -totalDistance; // shorter distance = better
};

const updatePheromones = (ants: Ant[], evaporationRate: number) => {
  for (const key of pheromones.keys()) {
    pheromones.set(key, (pheromones.get(key) || 0) * (1 - evaporationRate));
  }
  for (const ant of ants) {
    const deposit = 1 / Math.abs(ant.fitness || 1);
    for (let i = 0; i < ant.path.length - 1; i++) {
      const key = `${ant.path[i].id}-${ant.path[i+1].id}`;
      const current = pheromones.get(key) || 0;
      pheromones.set(key, current + deposit);
    }
  }
};

// ---------- Grid-safe random position ----------
const generateRandomPosition = (width: number, height: number, gridSize: number, occupied: Set<string>) => {
  let x, y, key;
  do {
    x = Math.floor(Math.random() * (width / gridSize)) * gridSize;
    y = Math.floor(Math.random() * (height / gridSize)) * gridSize;
    key = `${x}-${y}`;
  } while (occupied.has(key));
  occupied.add(key);
  return { x, y };
};

// ---------- Main ACO ----------
export const runAntColonyOptimization = (beds: Bed[], config: ACOConfig = defaultConfig, width = 500, height = 500) => {
  // Initialize pheromones
  initializePheromones(beds);

  // Assign initial randomized positions on a grid
  const gridSize = 50;
  const occupied = new Set<string>();
  beds.forEach((bed, i) => {
    bed.position = generateRandomPosition(width, height, gridSize, occupied);
  });

  let bestPath: Bed[] = [...beds];
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

    updatePheromones(ants, config.evaporationRate);
  }

  // Return beds with new positions preserving other properties
  return bestPath.map((b, idx) => ({ ...beds[idx], position: bestPath[idx].position }));
};

// Reinforce a given allocation (e.g., after admit)
export const reinforceAllocation = (path: Bed[]) => {
  const fitness = evaluatePathFitness(path);
  updatePheromones([{ path, fitness }], 0.1);
};
