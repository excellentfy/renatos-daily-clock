import React from 'react';
import { Sliders, RotateCcw, Sparkles } from 'lucide-react';

interface TimeSimulatorBarProps {
  isSimulating: boolean;
  onToggleSimulating: (simulating: boolean) => void;
  simulatedMinutes: number;
  onSetSimulatedMinutes: (minutes: number) => void;
  currentTimeString: string;
}

export const TimeSimulatorBar: React.FC<TimeSimulatorBarProps> = ({
  isSimulating,
  onToggleSimulating,
  simulatedMinutes,
  onSetSimulatedMinutes,
  currentTimeString,
}) => {
  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const presetTimes = [
    { label: '07:35 (1º Tempo)', minutes: 7 * 60 + 35 },
    { label: '08:30 (2º Tempo)', minutes: 8 * 60 + 30 },
    { label: '09:15 (Recreio)', minutes: 9 * 60 + 15 },
    { label: '09:45 (3º Tempo)', minutes: 9 * 60 + 45 },
    { label: '10:35 (4º Tempo)', minutes: 10 * 60 + 35 },
    { label: '11:20 (5º Tempo)', minutes: 11 * 60 + 20 },
    { label: '12:15 (Almoço)', minutes: 12 * 60 + 15 },
    { label: '13:00 (6º Tempo)', minutes: 13 * 60 + 0 },
    { label: '13:50 (7º Tempo)', minutes: 13 * 60 + 50 },
    { label: '14:40 (Encerrado)', minutes: 14 * 60 + 40 },
  ];

  return (
    <div className="p-3.5 md:p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
            isSimulating ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-cyan-100 text-cyan-800 border border-cyan-300'
          }`}>
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>{isSimulating ? 'Modo Simulador de Horário Ativo' : 'Modo Tempo Real (Relógio do Sistema)'}</span>
              {isSimulating && (
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  TESTE
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              {isSimulating ? `Horário Simulado: ${formatTime(simulatedMinutes)}` : `Horário Atual: ${currentTimeString}`}
            </div>
          </div>
        </div>

        {/* Toggle Mode Button */}
        <button
          onClick={() => onToggleSimulating(!isSimulating)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shadow-sm ${
            isSimulating
              ? 'bg-amber-400 text-slate-950 border-amber-500 hover:bg-amber-300 font-black'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
          }`}
        >
          {isSimulating ? (
            <>
              <RotateCcw className="w-3.5 h-3.5" />
              Voltar ao Tempo Real
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              Ativar Simulador de Horas
            </>
          )}
        </button>
      </div>

      {/* Simulation Controls when active */}
      {isSimulating && (
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          {/* Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono text-slate-500">
              <span>07:00</span>
              <span className="text-amber-900 font-bold text-sm bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300">
                {formatTime(simulatedMinutes)}
              </span>
              <span>15:00</span>
            </div>
            <input
              type="range"
              min={7 * 60}
              max={15 * 60}
              step={1}
              value={simulatedMinutes}
              onChange={e => onSetSimulatedMinutes(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap mr-1">
              Atalhos:
            </span>
            {presetTimes.map(preset => (
              <button
                key={preset.label}
                onClick={() => onSetSimulatedMinutes(preset.minutes)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all border ${
                  Math.abs(simulatedMinutes - preset.minutes) < 2
                    ? 'bg-amber-400 text-slate-950 border-amber-500 font-black shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSimulatorBar;
