
import React from 'react';
import { SimulationParams, MaterialType } from '../types';
import { GRAVITY_PRESETS, BOB_COLORS } from '../constants';
import { Settings2, ChevronDown } from 'lucide-react';

interface ControlPanelProps {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  resetSimulation: () => void;
  isRunning: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  params,
  setParams,
  resetSimulation,
  isRunning
}) => {

  const handleChange = (key: keyof SimulationParams, value: number | string) => {
    setParams((prev) => ({ ...prev, [key]: value }));
    if (key === 'initialAngle' && !isRunning) {
        resetSimulation();
    }
  };

  const renderSliderWithInput = (
    label: string,
    paramKey: keyof SimulationParams,
    min: number,
    max: number,
    step: number,
    unit: string,
    colorClass: string,
    accentColor: string
  ) => (
    <div className="mb-6 group">
      <div className="flex justify-between items-center mb-2">
        <label className={`text-xs font-bold uppercase tracking-wider ${accentColor}`}>{label}</label>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={params[paramKey] as number}
          onChange={(e) => handleChange(paramKey, parseFloat(e.target.value))}
          className={`flex-grow h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer ${colorClass}`}
        />
        <div className="relative w-20">
            <input
                type="number"
                min={min}
                max={max}
                step={step}
                value={params[paramKey] as number}
                onChange={(e) => handleChange(paramKey, parseFloat(e.target.value))}
                className={`w-full px-2 py-1 text-sm font-semibold border border-slate-300 rounded bg-white focus:ring-2 outline-none text-right transition-all ${colorClass.replace('accent-', 'focus:ring-').replace('-500', '-200').replace('-600', '-200')}`}
            />
            <span className="absolute right-7 top-1/2 -translate-y-1/2 text-xs text-transparent pointer-events-none">{unit}</span>
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 p-6 h-full overflow-y-auto">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
        <div className="p-1.5 bg-blue-50 rounded-md">
            <Settings2 className="w-5 h-5 text-blue-600" />
        </div>
        Parameters
      </h3>

      {/* Continuous Variables */}
      {renderSliderWithInput("String Length (L)", "length", 0.1, 5.0, 0.01, "m", "accent-cyan-500", "text-cyan-600")}
      {renderSliderWithInput("Mass (m)", "mass", 0.1, 10.0, 0.1, "kg", "accent-emerald-500", "text-emerald-600")}
      {renderSliderWithInput("Initial Angle (θ₀)", "initialAngle", 5, 85, 1, "°", "accent-violet-500", "text-violet-600")}
      {renderSliderWithInput("Damping (b)", "damping", 0.0, 1.0, 0.01, "", "accent-rose-500", "text-rose-600")}

      <hr className="my-6 border-slate-100" />

      {/* Discrete Options */}
      <div className="space-y-6">
        
        {/* Gravity */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gravity (g)</label>
          <div className="relative">
            <select
              value={Object.values(GRAVITY_PRESETS).includes(params.gravity) ? params.gravity : 'custom'}
              onChange={(e) => {
                if (e.target.value === 'custom') return;
                handleChange('gravity', parseFloat(e.target.value));
              }}
              className="w-full appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-medium py-2.5 px-3 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
            >
              <option value={GRAVITY_PRESETS.EARTH}>Earth (9.81 m/s²)</option>
              <option value={GRAVITY_PRESETS.MOON}>Moon (1.62 m/s²)</option>
              <option value={GRAVITY_PRESETS.MARS}>Mars (3.71 m/s²)</option>
              <option value={GRAVITY_PRESETS.JUPITER}>Jupiter (24.79 m/s²)</option>
              <option value="custom">Custom...</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          {/* Custom Gravity Input */}
          {!Object.values(GRAVITY_PRESETS).includes(params.gravity) && (
             <div className="mt-2 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <label className="text-xs font-semibold text-slate-500">Custom g:</label>
                <input 
                    type="number"
                    step="0.01"
                    value={params.gravity}
                    onChange={(e) => handleChange('gravity', parseFloat(e.target.value))}
                    className="w-24 px-2 py-1 text-sm font-bold text-indigo-700 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <span className="text-xs font-medium text-slate-400">m/s²</span>
             </div>
          )}
        </div>

        {/* Material */}
        <div>
           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bob Material</label>
           <div className="relative">
            <select
              value={params.material}
              onChange={(e) => handleChange('material', e.target.value as MaterialType)}
              className="w-full appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-medium py-2.5 px-3 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
            >
              <option value="Steel">Steel</option>
              <option value="Brass">Brass</option>
              <option value="Wood">Wood</option>
              <option value="Rubber">Rubber</option>
              <option value="Glass">Glass</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Color Picker */}
        <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bob Color</label>
            <div className="flex flex-wrap gap-3">
                {BOB_COLORS.map((color) => (
                    <button
                        key={color}
                        onClick={() => handleChange('color', color)}
                        className={`w-7 h-7 rounded-full transition-all duration-200 shadow-sm hover:scale-110 ${params.color === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'ring-1 ring-black/5 hover:shadow-md'}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                    />
                ))}
                <div className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors bg-white flex items-center justify-center">
                    <span className="text-[10px] text-slate-400">+</span>
                    <input 
                        type="color" 
                        value={params.color}
                        onChange={(e) => handleChange('color', e.target.value)}
                        className="absolute -top-4 -left-4 w-16 h-16 p-0 border-0 cursor-pointer opacity-0"
                    />
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ControlPanel;
