
import React, { useRef, useEffect, useCallback } from 'react';
import { SimulationParams, SimulationState, CalculatedStats, MaterialType } from '../types';
import { TIME_STEP, MAX_TRACE_LENGTH, MATERIAL_CONFIG } from '../constants';

interface SimulationCanvasProps {
  params: SimulationParams;
  isRunning: boolean;
  isSlowMotion: boolean;
  showTrace: boolean;
  onUpdateStats: (stats: CalculatedStats) => void;
  resetSignal: number;
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  params,
  isRunning,
  isSlowMotion,
  showTrace,
  onUpdateStats,
  resetSignal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  const stateRef = useRef<SimulationState>({
    angle: params.initialAngle * (Math.PI / 180),
    angularVelocity: 0,
    time: 0,
    oscillationCount: 0,
    lastAngle: params.initialAngle * (Math.PI / 180)
  });

  const traceRef = useRef<{x: number, y: number}[]>([]);

  // Reset handling
  useEffect(() => {
    const initRad = params.initialAngle * (Math.PI / 180);
    stateRef.current = {
      angle: initRad,
      angularVelocity: 0,
      time: 0,
      oscillationCount: 0,
      lastAngle: initRad
    };
    traceRef.current = [];
    draw();
    // Trigger stat update immediately to reset UI values
    const stats = calculateStats(stateRef.current);
    onUpdateStats(stats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal, params.initialAngle]);

  const calculateStats = useCallback((state: SimulationState): CalculatedStats => {
    const { angle, angularVelocity, time, oscillationCount } = state;
    const { length, mass, gravity } = params;

    const period = 2 * Math.PI * Math.sqrt(length / gravity);
    const frequency = 1 / period;
    
    // h = L - L cos(theta) relative to pivot, but usually PE is 0 at bottom.
    // Bottom is at L. Current y is L*cos(theta). Height from bottom = L - L*cos(theta).
    const h = length * (1 - Math.cos(angle));
    const potentialEnergy = mass * gravity * h;
    
    const v = length * angularVelocity;
    const kineticEnergy = 0.5 * mass * (v * v);
    
    const totalEnergy = potentialEnergy + kineticEnergy;

    return {
      period,
      frequency,
      currentAngleDeg: angle * (180 / Math.PI),
      angularVelocity,
      potentialEnergy,
      kineticEnergy,
      totalEnergy,
      timeElapsed: time,
      oscillationCount
    };
  }, [params]);

  // Drawing Helper: Material Sphere
  const drawBob = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, material: MaterialType) => {
    const config = MATERIAL_CONFIG[material];
    
    // Base fill
    const gradient = ctx.createRadialGradient(x - radius/3, y - radius/3, radius/10, x, y, radius);
    
    let highlightColor = '#ffffff';
    let shadowColor = '#000000';

    if (material === 'Glass') {
         ctx.globalAlpha = 0.6; // Transparent
         highlightColor = '#ffffff';
    } else {
         ctx.globalAlpha = 1.0;
    }

    // Adjust sheen based on material
    if (material === 'Wood' || material === 'Rubber') {
        // Matte
        gradient.addColorStop(0, color); // Light
        gradient.addColorStop(0.7, color);
        gradient.addColorStop(1, '#1a1a1a'); // Dark
    } else {
        // Metallic / Glass
        gradient.addColorStop(0, highlightColor); // Specular highlight
        gradient.addColorStop(0.2, color);
        gradient.addColorStop(0.8, '#0f172a'); // Deep shadow for metal
        gradient.addColorStop(1, shadowColor);
    }

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Reflection/Specularity for metal/glass
    if (config.metallic > 0.5 || material === 'Glass') {
        ctx.beginPath();
        ctx.ellipse(x - radius/3, y - radius/3, radius/4, radius/6, Math.PI/4, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,255, ${material === 'Glass' ? 0.4 : 0.6})`;
        ctx.fill();
    }

    // Rim
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.globalAlpha = 1.0; // Reset
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const centerX = width / 2;
    const pivotY = 50; 

    // Background - subtle gradient for depth
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#f8fafc');
    bgGradient.addColorStop(1, '#eef2ff');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Grid / Blueprint Style
    ctx.lineWidth = 1;
    
    // Vertical Center Line
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.moveTo(centerX, pivotY);
    ctx.lineTo(centerX, height - 20);
    ctx.strokeStyle = '#93c5fd'; // Light blue
    ctx.stroke();
    ctx.setLineDash([]);

    // Protractor
    ctx.beginPath();
    ctx.arc(centerX, pivotY, 80, 0, Math.PI, false);
    ctx.strokeStyle = '#bfdbfe';
    ctx.stroke();

    // Ticks
    for (let i = -90; i <= 90; i += 10) {
        const isMajor = i % 30 === 0;
        const len = isMajor ? 10 : 5;
        const rad = (i + 90) * (Math.PI / 180);
        const x1 = centerX + (80) * Math.cos(rad);
        const y1 = pivotY + (80) * Math.sin(rad);
        const x2 = centerX + (80 + len) * Math.cos(rad);
        const y2 = pivotY + (80 + len) * Math.sin(rad);
        ctx.beginPath();
        ctx.lineWidth = isMajor ? 2 : 1;
        ctx.strokeStyle = isMajor ? '#60a5fa' : '#bfdbfe'; // Blue scale
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // Simulation Elements
    const availableHeight = height - pivotY - 60; // Padding for shadow
    const pixelsPerMeter = availableHeight / 5.0; // 5.0m max length
    
    const lenPx = params.length * pixelsPerMeter;
    const bobX = centerX + Math.sin(stateRef.current.angle) * lenPx;
    const bobY = pivotY + Math.cos(stateRef.current.angle) * lenPx;

    // Trace
    if (showTrace) {
        if (isRunning) {
            traceRef.current.push({x: bobX, y: bobY});
            if (traceRef.current.length > MAX_TRACE_LENGTH) traceRef.current.shift();
        }
        
        if (traceRef.current.length > 1) {
            ctx.beginPath();
            // Vibrant cyan trace
            const traceGradient = ctx.createLinearGradient(
                traceRef.current[0].x, traceRef.current[0].y, 
                traceRef.current[traceRef.current.length-1].x, traceRef.current[traceRef.current.length-1].y
            );
            traceGradient.addColorStop(0, 'rgba(6, 182, 212, 0)');
            traceGradient.addColorStop(1, 'rgba(6, 182, 212, 0.8)');
            
            ctx.strokeStyle = traceGradient;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.moveTo(traceRef.current[0].x, traceRef.current[0].y);
            for (let i = 1; i < traceRef.current.length; i++) {
                ctx.lineTo(traceRef.current[i].x, traceRef.current[i].y);
            }
            ctx.stroke();
        }
    }

    // String
    ctx.beginPath();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.moveTo(centerX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    // Pivot
    ctx.beginPath();
    ctx.fillStyle = '#475569'; 
    ctx.arc(centerX, pivotY, 4, 0, Math.PI * 2);
    ctx.fill();
    // Pivot shine
    ctx.beginPath();
    ctx.fillStyle = '#94a3b8';
    ctx.arc(centerX - 1, pivotY - 1, 1.5, 0, Math.PI * 2);
    ctx.fill();


    // Shadow
    const shadowY = height - 30;
    // Simple perspective shadow: scale based on height (bobY)
    const heightRatio = (bobY - pivotY) / (5.0 * pixelsPerMeter); // 0 to 1 approx
    const shadowScale = 0.5 + 0.5 * heightRatio; 
    const shadowAlpha = 0.3 * heightRatio;

    ctx.beginPath();
    ctx.ellipse(bobX, shadowY, 25 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,0,0,${Math.max(0, shadowAlpha)})`;
    ctx.fill();
    // Shadow blur
    ctx.filter = 'blur(4px)';
    ctx.fill();
    ctx.filter = 'none';

    // Bob
    const baseRadius = 15;
    const bobRadius = baseRadius + (Math.sqrt(params.mass) * 3); // Scale slightly with mass
    drawBob(ctx, bobX, bobY, bobRadius, params.color, params.material);

    // Update stats in React
    if (isRunning) {
       onUpdateStats(calculateStats(stateRef.current));
    }

  }, [params, isRunning, showTrace, calculateStats]);

  const updatePhysics = useCallback(() => {
    if (!isRunning) return;

    const dt = isSlowMotion ? TIME_STEP * 0.1 : TIME_STEP;
    const { length, gravity, mass, damping } = params;
    const state = stateRef.current;

    // Physics
    const alpha = (-gravity / length) * Math.sin(state.angle) - (damping * state.angularVelocity) / mass;
    
    state.angularVelocity += alpha * dt;
    
    const prevAngle = state.angle;
    state.angle += state.angularVelocity * dt;
    state.time += dt;

    // Oscillation detection (Zero crossing from - to +)
    // We assume standard position 0 is bottom. 
    // A full period is passing 0 in same direction twice.
    // Or counting half-cycles. Let's count full cycles.
    // If velocity is positive and we crossed 0?
    
    // Better: If we crossed 0 from negative to positive.
    if (state.lastAngle < 0 && state.angle >= 0) {
        state.oscillationCount += 1;
    }
    state.lastAngle = state.angle;

  }, [isRunning, params, isSlowMotion]);

  const animate = useCallback(() => {
    updatePhysics();
    draw();
    requestRef.current = requestAnimationFrame(animate);
  }, [updatePhysics, draw]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  return (
    <div className="relative w-full h-[550px] bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.02)]">
        <canvas
            ref={canvasRef}
            width={900}
            height={550}
            className="w-full h-full block"
        />
    </div>
  );
};

export default SimulationCanvas;
