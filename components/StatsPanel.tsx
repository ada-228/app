
import React from 'react';
import { CalculatedStats } from '../types';
import { Activity, Play, Pause, RotateCcw, Timer, Zap, RotateCw, Spline, ArrowRight } from 'lucide-react';

interface StatsPanelProps {
  stats: CalculatedStats;
  isRunning: boolean;
  setIsRunning: (val: boolean) => void;
  resetSimulation: () => void;
  isSlowMotion: boolean;
  setIsSlowMotion: (val: boolean) => void;
  showTrace: boolean;
  setShowTrace: (val: boolean) => void;
  showEnergyGraph: boolean;
  setShowEnergyGraph: (val: boolean) => void;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ 
    stats,
    isRunning,
    setIsRunning,
    resetSimulation,
    isSlowMotion,
    setIsSlowMotion,
    showTrace,
    setShowTrace,
    showEnergyGraph,
    setShowEnergyGraph
}) => {
  const formatNumber = (num: number, decimals: number = 2) => num.toFixed(decimals);

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 p-6 h-full flex flex-col">
      
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
         {!isRunning ? (
            <button
              onClick={() => setIsRunning(true)}
              className="col-span-1 flex items-center justify-center gap-2 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:transform active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" /> START
            </button>
         ) : (
            <button
              onClick={() => setIsRunning(false)}
              className="col-span-1 flex items-center justify-center gap-2 bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white px-4 py-3.5 rounded-xl font-bold shadow-lg shadow-amber-200 transition-all active:transform active:scale-95"
            >
              <Pause className="w-5 h-5 fill-current" /> PAUSE
            </button>
         )}
         
         <button
            onClick={resetSimulation}
            className="col-span-1 flex items-center justify-center gap-2 bg-white text-rose-500 border-2 border-rose-100 hover:border-rose-200 hover:bg-rose-50 px-4 py-3.5 rounded-xl font-bold shadow-sm transition-all active:transform active:scale-95"
         >
            <RotateCcw className="w-5 h-5" /> RESET
         </button>
      </div>

      {/* Display Options */}
      <div className="mb-6 bg-slate-50/80 p-4 rounded-xl border border-slate-100 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer select-none group">
             <div className="relative flex items-center">
                 <input 
                    type="checkbox" 
                    checked={isSlowMotion} 
                    onChange={(e) => setIsSlowMotion(e.target.checked)}
                    className="peer sr-only" 
                 />
                 <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
             </div>
             <span className="text-sm text-slate-600 font-semibold group-hover:text-indigo-600 transition-colors">Slow Motion</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer select-none group">
             <div className="relative flex items-center">
                 <input 
                    type="checkbox" 
                    checked={showTrace} 
                    onChange={(e) => setShowTrace(e.target.checked)}
                    className="peer sr-only" 
                 />
                 <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
             </div>
             <span className="text-sm text-slate-600 font-semibold group-hover:text-cyan-600 transition-colors">Show Path Trace</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer select-none group">
             <div className="relative flex items-center">
                 <input 
                    type="checkbox" 
                    checked={showEnergyGraph} 
                    onChange={(e) => setShowEnergyGraph(e.target.checked)}
                    className="peer sr-only" 
                 />
                 <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
             </div>
             <span className="text-sm text-slate-600 font-semibold group-hover:text-amber-600 transition-colors">Show Energy Graph</span>
          </label>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
        <Activity className="w-5 h-5 text-indigo-600" />
        Live Data
      </h3>

      <div className="space-y-3 flex-grow overflow-y-auto pr-1">
        {/* Time */}
        <div className="flex justify-between items-center p-3 bg-blue-50/50 rounded-xl border border-blue-100 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400"></div>
            <div className="flex items-center gap-2 pl-2">
                <Timer className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">Elapsed Time</span>
            </div>
            <span className="font-mono text-xl font-bold text-blue-900">{formatNumber(stats.timeElapsed)}<span className="text-sm ml-1 text-blue-600/70">s</span></span>
        </div>

        {/* Period & Freq */}
        <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-violet-50/50 rounded-xl border border-violet-100 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-400"></div>
                <div className="text-xs font-bold text-violet-800 uppercase mb-1 pl-2">Period (T)</div>
                <div className="font-mono font-bold text-violet-900 text-lg pl-2">{formatNumber(stats.period)} <span className="text-xs opacity-70">s</span></div>
            </div>
            <div className="p-3 bg-fuchsia-50/50 rounded-xl border border-fuchsia-100 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-fuchsia-400"></div>
                <div className="text-xs font-bold text-fuchsia-800 uppercase mb-1 pl-2">Freq (f)</div>
                <div className="font-mono font-bold text-fuchsia-900 text-lg pl-2">{formatNumber(stats.frequency)} <span className="text-xs opacity-70">Hz</span></div>
            </div>
        </div>

        {/* Motion Stats */}
        <div className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-100 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400"></div>
            <div className="flex justify-between mb-2 pl-2">
                <span className="text-xs font-bold text-cyan-800 uppercase flex items-center gap-1"><RotateCw className="w-3 h-3"/> Angle (θ)</span>
                <span className="font-mono font-bold text-cyan-900">{formatNumber(stats.currentAngleDeg, 1)}°</span>
            </div>
            <div className="flex justify-between pl-2">
                <span className="text-xs font-bold text-cyan-800 uppercase flex items-center gap-1"><Spline className="w-3 h-3"/> Ang. Vel (ω)</span>
                <span className="font-mono font-bold text-cyan-900">{formatNumber(stats.angularVelocity)} rad/s</span>
            </div>
        </div>

        {/* Energy */}
        <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 space-y-2 relative overflow-hidden">
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></div>
             <div className="flex items-center gap-2 mb-2 pl-2">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Energy System</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs pl-2">
                <span className="text-amber-700 font-medium">Potential (PE):</span>
                <span className="font-mono text-right text-amber-950 font-semibold">{formatNumber(stats.potentialEnergy)} J</span>
                
                <span className="text-amber-700 font-medium">Kinetic (KE):</span>
                <span className="font-mono text-right text-amber-950 font-semibold">{formatNumber(stats.kineticEnergy)} J</span>

                <span className="text-amber-800 font-bold pt-1 border-t border-amber-200 mt-1 flex items-center gap-1"><ArrowRight className="w-3 h-3"/> Total (E):</span>
                <span className="font-mono text-right text-amber-900 font-bold pt-1 border-t border-amber-200 mt-1">{formatNumber(stats.totalEnergy)} J</span>
            </div>
        </div>
      </div>

    </div>
  );
};

export default StatsPanel;
