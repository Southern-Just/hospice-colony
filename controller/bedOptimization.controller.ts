import { runAntColonyOptimization } from "@/model/AntColonyOptimization.model";
import { Bed } from "@/types/Bed";

export const optimizeBedArrangement = (beds: Bed[]): Bed[] => {
  return runAntColonyOptimization(beds);
};
