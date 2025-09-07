// lib/vectorStore.js
import fs from "fs";
import path from "path";

const STORE_PATH = path.join(process.cwd(), "data", "vectors.json");

function ensureStore() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(STORE_PATH)) fs.writeFileSync(STORE_PATH, "[]", "utf8");
}

export function loadVectors() {
  ensureStore();
  const raw = fs.readFileSync(STORE_PATH, "utf8");
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveVectors(vecs) {
  ensureStore();
  fs.writeFileSync(STORE_PATH, JSON.stringify(vecs, null, 2), "utf8");
}

export function addVectors(newItems) {
  const existing = loadVectors();
  const merged = existing.concat(newItems);
  saveVectors(merged);
}

// cosine similarity helpers
function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}
function norm(a) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * a[i];
  return Math.sqrt(s);
}
export function cosineSimilarity(a, b) {
  const denom = norm(a) * norm(b);
  if (denom === 0) return 0;
  return dot(a, b) / denom;
}

export function search(queryEmbedding, topK = 3) {
  const vecs = loadVectors();
  const scored = vecs.map(v => ({
    ...v,
    score: cosineSimilarity(queryEmbedding, v.embedding)
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
