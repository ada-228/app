
import { MaterialType } from "./types";

export const GRAVITY_PRESETS = {
  EARTH: 9.81,
  MOON: 1.62,
  MARS: 3.71,
  JUPITER: 24.79,
};

export const TIME_STEP = 0.016; // ~60 FPS fixed step for physics
export const MAX_TRACE_LENGTH = 150;
export const MAX_GRAPH_POINTS = 300; // Limit history for graphs

export const MATERIAL_CONFIG: Record<MaterialType, { roughness: number; metallic: number; density: number }> = {
  Steel: { roughness: 0.2, metallic: 0.9, density: 7.8 },
  Brass: { roughness: 0.3, metallic: 0.8, density: 8.5 },
  Wood: { roughness: 0.9, metallic: 0.0, density: 0.7 },
  Rubber: { roughness: 0.95, metallic: 0.0, density: 1.1 },
  Glass: { roughness: 0.1, metallic: 0.5, density: 2.5 }, // Special handling for transparency
};

export const BOB_COLORS = [
  '#94a3b8', // Slate (Default Steel)
  '#eab308', // Yellow (Brass/Gold)
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#78350f', // Brown (Wood)
  '#1e293b', // Dark (Rubber)
];
