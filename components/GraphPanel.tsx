
import React, { useRef, useEffect } from 'react';
import { HistoryPoint } from '../types';

interface GraphPanelProps {
  history: HistoryPoint[];
  showEnergyGraph: boolean;
}

const GraphPanel: React.FC<GraphPanelProps> = ({ history, showEnergyGraph }) => {
  const angleCanvasRef = useRef<HTMLCanvasElement>(null);
  const oscillationCanvasRef = useRef<HTMLCanvasElement>(null);
  const energyCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generic line chart drawer
  const drawChart = (
    canvas: HTMLCanvasElement | null,
    dataAccessor: (p: HistoryPoint) => number,
    lineColor: string | string[],
    yRange?: { min: number, max: number },
    isStep?: boolean
  ) => {
    if (!canvas || history.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Draw Grid
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Horizontal grid lines
    for (let i = 0; i < 5; i++) {
        const y = (height / 4) * i;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Determine Scaling
    const endTime = history[history.length - 1].time;
    const startTime = history[0].time;
    const timeWindow = Math.max(endTime - startTime, 0.1); // avoid div/0

    const values = history.map(dataAccessor);
    let minVal = yRange ? yRange.min : Math.min(...values);
    let maxVal = yRange ? yRange.max : Math.max(...values);
    
    // Add padding to auto-scale
    if (!yRange) {
        const padding = (maxVal - minVal) * 0.1;
        minVal -= padding;
        maxVal += padding;
        if (minVal === maxVal) { minVal -= 1; maxVal += 1; }
    }
    
    const valRange = maxVal - minVal;

    // Helper to map point
    const getX = (t: number) => ((t - startTime) / timeWindow) * width;
    const getY = (v: number) => height - ((v - minVal) / valRange) * height;

    // Draw Line
    ctx.lineWidth = 2.5;
    if (Array.isArray(lineColor)) {
        // Multi-line handled outside, this is single line logic
    } else {
        ctx.strokeStyle = lineColor;
        ctx.beginPath();
        ctx.moveTo(getX(history[0].time), getY(values[0]));
        
        for (let i = 1; i < history.length; i++) {
            const x = getX(history[i].time);
            const y = getY(values[i]);
            if (isStep) {
                ctx.lineTo(x, getY(values[i-1])); // Horizontal
                ctx.lineTo(x, y); // Vertical
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }
  };
  
  // Specialized multi-line drawer for Energy
  const drawEnergyChart = () => {
    const canvas = energyCanvasRef.current;
    if (!canvas || history.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    
    // Grid
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const y = (height / 4) * i;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }
    ctx.stroke();

    const endTime = history[history.length - 1].time;
    const startTime = history[0].time;
    const timeWindow = Math.max(endTime - startTime, 0.1);

    const allEnergies = history.flatMap(p => [p.kineticEnergy, p.potentialEnergy, p.totalEnergy]);
    const maxE = Math.max(...allEnergies) * 1.1; // 10% padding top
    const minE = 0;

    const getX = (t: number) => ((t - startTime) / timeWindow) * width;
    const getY = (v: number) => height - ((v - minE) / (maxE - minE)) * height;

    const drawLine = (accessor: (p: HistoryPoint) => number, color: string) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.moveTo(getX(history[0].time), getY(accessor(history[0])));
        for (let i = 1; i < history.length; i++) {
            ctx.lineTo(getX(history[i].time), getY(accessor(history[i])));
        }
        ctx.stroke();
    };

    drawLine(p => p.kineticEnergy, '#10b981'); // Emerald
    drawLine(p => p.potentialEnergy, '#3b82f6'); // Blue
    drawLine(p => p.totalEnergy, '#f59e0b');    // Amber (Total)
  };

  useEffect(() => {
    // Angle Chart - Bright Rose/Pink
    drawChart(angleCanvasRef.current, p => p.angle * (180/Math.PI), '#f43f5e', { min: -90, max: 90 });
    
    // Oscillation Chart - Bright Violet
    drawChart(oscillationCanvasRef.current, p => p.oscillationCount, '#8b5cf6', undefined, true);

    // Energy Chart
    if (showEnergyGraph) {
        drawEnergyChart();
    }
  }, [history, showEnergyGraph]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Angle vs Time */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
            <h4 className="text-xs font-bold text-rose-600 uppercase mb-2 pl-2">Angle vs. Time</h4>
            <div className="w-full h-40 relative">
                <canvas ref={angleCanvasRef} width={400} height={160} className="w-full h-full block" />
                <div className="absolute bottom-0 right-0 text-[10px] text-slate-400">Time (s) →</div>
                <div className="absolute top-0 left-0 text-[10px] text-slate-400">Angle (deg) ↑</div>
            </div>
        </div>

        {/* Oscillations vs Time */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-violet-500"></div>
            <h4 className="text-xs font-bold text-violet-600 uppercase mb-2 pl-2">Oscillations vs. Time</h4>
            <div className="w-full h-40 relative">
                <canvas ref={oscillationCanvasRef} width={400} height={160} className="w-full h-full block" />
                <div className="absolute bottom-0 right-0 text-[10px] text-slate-400">Time (s) →</div>
                <div className="absolute top-0 left-0 text-[10px] text-slate-400">Count (N) ↑</div>
            </div>
        </div>

        {/* Energy vs Time */}
        {showEnergyGraph && (
            <div className="col-span-1 md:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                <div className="flex justify-between mb-2 pl-2">
                    <h4 className="text-xs font-bold text-amber-600 uppercase">Energy vs. Time</h4>
                    <div className="flex gap-3 text-[10px]">
                        <span className="flex items-center gap-1 font-medium"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> KE</span>
                        <span className="flex items-center gap-1 font-medium"><div className="w-2 h-2 rounded-full bg-blue-500"></div> PE</span>
                        <span className="flex items-center gap-1 font-bold text-amber-600"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Total</span>
                    </div>
                </div>
                <div className="w-full h-48 relative">
                    <canvas ref={energyCanvasRef} width={800} height={192} className="w-full h-full block" />
                    <div className="absolute bottom-0 right-0 text-[10px] text-slate-400">Time (s) →</div>
                    <div className="absolute top-0 left-0 text-[10px] text-slate-400">Energy (J) ↑</div>
                </div>
            </div>
        )}
    </div>
  );
};

export default GraphPanel;
