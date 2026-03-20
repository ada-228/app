
import React, { useState, useCallback, useRef } from 'react';
import ControlPanel from './components/ControlPanel';
import StatsPanel from './components/StatsPanel';
import SimulationCanvas from './components/SimulationCanvas';
import GraphPanel from './components/GraphPanel';
import { SimulationParams, CalculatedStats, HistoryPoint } from './types';
import { GRAVITY_PRESETS, MAX_GRAPH_POINTS, BOB_COLORS } from './constants';
import { Atom } from 'lucide-react';

const App: React.FC = () => {
  // -- State --
  const [params, setParams] = useState<SimulationParams>({
    length: 1.5,
    mass: 1.0,
    initialAngle: 30,
    gravity: GRAVITY_PRESETS.EARTH,
    damping: 0.1,
    material: 'Steel',
    color: BOB_COLORS[0]
  });

  const [isRunning, setIsRunning] = useState(false);
  const [isSlowMotion, setIsSlowMotion] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const [showEnergyGraph, setShowEnergyGraph] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);

  const [currentStats, setCurrentStats] = useState<CalculatedStats>({
    period: 0,
    frequency: 0,
    currentAngleDeg: 0,
    angularVelocity: 0,
    potentialEnergy: 0,
    kineticEnergy: 0,
    totalEnergy: 0,
    timeElapsed: 0,
    oscillationCount: 0
  });

  // History for graphing. Stored in state to trigger re-renders for GraphPanel
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setResetSignal(prev => prev + 1);
    setHistory([]);
  }, []);

  // This callback runs frequently (up to 60fps)
  // To optimize, we could debounce graph updates, but React 18 batching handles this reasonably well for simple arrays
  const handleStatsUpdate = useCallback((stats: CalculatedStats) => {
    setCurrentStats(stats);
    
    if (isRunning) {
      setHistory(prev => {
        const newPoint: HistoryPoint = {
          time: stats.timeElapsed,
          angle: stats.currentAngleDeg * (Math.PI / 180),
          oscillationCount: stats.oscillationCount,
          kineticEnergy: stats.kineticEnergy,
          potentialEnergy: stats.potentialEnergy,
          totalEnergy: stats.totalEnergy
        };
        const newHistory = [...prev, newPoint];
        if (newHistory.length > MAX_GRAPH_POINTS) {
          return newHistory.slice(newHistory.length - MAX_GRAPH_POINTS);
        }
        return newHistory;
      });
    }
  }, [isRunning]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 font-sans text-slate-800 pb-12">
      
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm border border-white/10 shadow-inner">
              <Atom className="w-6 h-6 text-white" />
            </div>
            <div>
                <h1 className="text-xl font-bold tracking-tight text-white leading-none drop-shadow-sm">
                PendulumLab <span className="font-light opacity-90">Pro</span>
                </h1>
                <span className="text-[10px] text-indigo-100 font-bold tracking-widest uppercase opacity-90">Interactive Physics Simulation</span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
             <div className="text-xs px-3 py-1 bg-white/10 border border-white/20 rounded-full font-medium text-white/90 backdrop-blur-md">
                v2.1.0
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Sidebar: Controls (3 cols) */}
            <div className="lg:col-span-3 lg:sticky lg:top-24 order-2 lg:order-1">
                <ControlPanel 
                    params={params}
                    setParams={setParams}
                    resetSimulation={handleReset}
                    isRunning={isRunning}
                />
            </div>

            {/* Center: Visualization (6 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-6 order-1 lg:order-2">
                <div className="w-full relative shadow-xl shadow-slate-200/50 rounded-2xl">
                    <SimulationCanvas 
                        params={params}
                        isRunning={isRunning}
                        isSlowMotion={isSlowMotion}
                        showTrace={showTrace}
                        onUpdateStats={handleStatsUpdate}
                        resetSignal={resetSignal}
                    />
                </div>
                {/* Graph Panel moved below simulation */}
                <div className="w-full">
                    <GraphPanel history={history} showEnergyGraph={showEnergyGraph} />
                </div>
            </div>

            {/* Right Sidebar: Stats & Actions (3 cols) */}
            <div className="lg:col-span-3 lg:sticky lg:top-24 order-3">
                <StatsPanel 
                    stats={currentStats}
                    isRunning={isRunning}
                    setIsRunning={setIsRunning}
                    resetSimulation={handleReset}
                    isSlowMotion={isSlowMotion}
                    setIsSlowMotion={setIsSlowMotion}
                    showTrace={showTrace}
                    setShowTrace={setShowTrace}
                    showEnergyGraph={showEnergyGraph}
                    setShowEnergyGraph={setShowEnergyGraph}
                />
            </div>

        </div>

      </main>
    </div>
  );
};

export default App;
