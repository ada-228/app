
export type MaterialType = 'Steel' | 'Brass' | 'Wood' | 'Rubber' | 'Glass';

export interface SimulationParams {
  length: number;      // meters
  mass: number;        // kg
  initialAngle: number;// degrees
  gravity: number;     // m/s^2
  damping: number;     // arbitrary damping coefficient 0-1
  material: MaterialType;
  color: string;
}

export interface SimulationState {
  angle: number;           // radians
  angularVelocity: number; // rad/s
  time: number;            // seconds
  oscillationCount: number;
  lastAngle: number;       // for zero-crossing detection
}

export interface CalculatedStats {
  period: number;          // seconds
  frequency: number;       // Hz
  currentAngleDeg: number; // degrees
  angularVelocity: number; // rad/s
  potentialEnergy: number; // Joules
  kineticEnergy: number;   // Joules
  totalEnergy: number;     // Joules
  timeElapsed: number;     // seconds
  oscillationCount: number;
}

export interface HistoryPoint {
  time: number;
  angle: number;
  oscillationCount: number;
  kineticEnergy: number;
  potentialEnergy: number;
  totalEnergy: number;
}
