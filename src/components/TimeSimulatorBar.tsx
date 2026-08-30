import React from 'react';
import { Sliders, Clock, Play, RotateCcw, Sparkles } from 'lucide-react';
import { TIME_SLOTS, BREAK_MORNING, BREAK_LUNCH } from '@/data/scheduleData';

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
    <div className="p-4 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-xl shadow-lg space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
            isSimulating ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
          }`}>
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>{isSimulating ? 'Modo Simulador de Horário Ativo' : 'Modo Tempo Real (Relógio do Sistema)'}</span>
              {isSimulating && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">
                  TESTE
                </span>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">
              {isSimulating ? `Horário Simulado: ${formatTime(simulatedMinutes)}` : `Horário Atual: ${currentTimeString}`}
            </div>
          </div>
        </div>

        {/* Toggle Mode Button */}
        <button
          onClick={() => onToggleSimulating(!isSimulating)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shadow-sm ${
            isSimulating
              ? 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
              : 'bg-secondary/70 text-foreground hover:bg-secondary border-border'
          }`}
        >
          {isSimulating ? (
            <>
              <RotateCcw className="w-3.5 h-3.5" />
              Voltar ao Tempo Real
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Ativar Simulador de Horas
            </>
          )}
        </button>
      </div>

      {/* Simulation Controls when active */}
      {isSimulating && (
        <div className="pt-2 border-t border-border/60 space-y-3">
          {/* Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono text-muted-foreground">
              <span>07:00</span>
              <span className="text-amber-300 font-bold text-sm bg-amber-950/60 px-2.5 py-0.5 rounded-lg border border-amber-600/40">
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
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[10px] font-bold text-muted-foreground uppercase whitespace-nowrap mr-1">
              Atalhos:
            </span>
            {presetTimes.map(preset => (
              <button
                key={preset.label}
                onClick={() => onSetSimulatedMinutes(preset.minutes)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all border ${
                  Math.abs(simulatedMinutes - preset.minutes) < 2
                    ? 'bg-amber-500/30 text-amber-200 border-amber-400 font-bold'
                    : 'bg-muted/30 text-muted-foreground border-border/40 hover:bg-muted hover:text-foreground'
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
