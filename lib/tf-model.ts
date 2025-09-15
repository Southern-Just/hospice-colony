// lib/tf-model.ts
import * as tf from "@tensorflow/tfjs-node";
import type { Bed } from "@/types";
import fs from "fs";
import path from "path";

const MODEL_DIR = process.env.TF_MODEL_DIR ?? path.resolve(process.cwd(), "models");
const MODEL_PATH = `file://${path.join(MODEL_DIR, "bed_policy_model")}`;

// Model hyperparams
const MAX_BEDS = 30; // same as frontend padding concept
const INPUT_SIZE = MAX_BEDS * 2 + MAX_BEDS + MAX_BEDS; // positions, currentOneHot, visited mask (example)
const OUTPUT_SIZE = MAX_BEDS;

let model: tf.LayersModel | null = null;

export function createModel() {
  const m = tf.sequential();
  m.add(tf.layers.dense({ units: 128, activation: "relu", inputShape: [INPUT_SIZE] }));
  m.add(tf.layers.dense({ units: 64, activation: "relu" }));
  m.add(tf.layers.dense({ units: OUTPUT_SIZE, activation: "softmax" }));
  m.compile({ optimizer: tf.train.adam(0.001), loss: "categoricalCrossentropy", metrics: ["accuracy"] });
  return m;
}

export async function loadModelIfExists() {
  if (model) return model;
  try {
    if (fs.existsSync(path.join(MODEL_DIR, "bed_policy_model", "model.json"))) {
      model = await tf.loadLayersModel(MODEL_PATH + "/model.json");
      console.log("TF model loaded from disk");
      return model;
    }
  } catch (err) {
    console.warn("No TF model on disk or failed to load:", err);
  }
  model = createModel();
  return model;
}

export async function saveModelToDisk() {
  if (!model) throw new Error("No model to save");
  await model.save(MODEL_PATH);
  console.log("TF model saved to", MODEL_PATH);
}

export function buildInputVector(beds: Bed[], currentIndex: number, visitedMask: number[]) {
  // normalize positions to [0,1] relative bounding box
  const bbox = beds.reduce(
    (acc, b) => {
      acc.minX = Math.min(acc.minX, b.position.x);
      acc.minY = Math.min(acc.minY, b.position.y);
      acc.maxX = Math.max(acc.maxX, b.position.x);
      acc.maxY = Math.max(acc.maxY, b.position.y);
      return acc;
    },
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );
  const dx = Math.max(1e-6, bbox.maxX - bbox.minX);
  const dy = Math.max(1e-6, bbox.maxY - bbox.minY);

  const posArr = new Array(MAX_BEDS * 2).fill(0);
  const curOneHot = new Array(MAX_BEDS).fill(0);
  const visited = new Array(MAX_BEDS).fill(1); // missing = visited

  for (let i = 0; i < Math.min(beds.length, MAX_BEDS); i++) {
    const b = beds[i];
    posArr[2 * i] = (b.position.x - bbox.minX) / dx;
    posArr[2 * i + 1] = (b.position.y - bbox.minY) / dy;
    visited[i] = visitedMask[i] ? 1 : 0;
  }
  if (currentIndex >= 0 && currentIndex < MAX_BEDS) curOneHot[currentIndex] = 1;
  // concat
  return Float32Array.from([...posArr, ...curOneHot, ...visited]);
}

export async function trainModel(samples: { input: Float32Array; output: Float32Array }[], epochs = 40) {
  model = await loadModelIfExists();
  const xs = tf.tensor2d(samples.map(s => Array.from(s.input)));
  const ys = tf.tensor2d(samples.map(s => Array.from(s.output)));
  await model.fit(xs, ys, { epochs, batchSize: 32, validationSplit: 0.15 });
  xs.dispose(); ys.dispose();
  await saveModelToDisk();
  return model;
}

export async function predictNextIndex(beds: Bed[], currentIndex: number, visitedMask: number[]) {
  model = await loadModelIfExists();
  const input = buildInputVector(beds, currentIndex, visitedMask);
  const out = model.predict(tf.tensor2d([Array.from(input)])) as tf.Tensor;
  const data = await out.array() as number[][];
  out.dispose();
  // mask visited and missing
  const scores = data[0];
  let bestIdx = -1; let bestVal = -Infinity;
  for (let i = 0; i < Math.min(beds.length, MAX_BEDS); i++) {
    if (visitedMask[i]) continue;
    const v = scores[i] ?? 0;
    if (v > bestVal) { bestVal = v; bestIdx = i; }
  }
  // fallback to first unvisited
  if (bestIdx === -1) {
    for (let i = 0; i < beds.length; i++) if (!visitedMask[i]) return i;
  }
  return bestIdx;
}
