import React, { useRef, useState, useEffect } from 'react';
import { DaySchedule, TeacherMeta, TIME_SLOTS, BREAK_MORNING, BREAK_LUNCH, parseTeacherCell } from '@/data/scheduleData';
import { Sparkles, Clock, Eye, User, Layers, Calendar, ChevronRight } from 'lucide-react';
import gsap from 'gsap';

interface ScheduleBoard3DProps {
  currentDaySchedule: DaySchedule;
  selectedTeacher: TeacherMeta | null;
  selectedSubject: string;
  activePeriodId: number | null;
  activeStatus: string;
  formattedTimeRemaining: string;
  isTodayWeekend: boolean;
  onSelectTeacherByName: (name: string) => void;
}

// Teacher text colors matching the official board aesthetic
const TEACHER_COLORS: Record<string, string> = {
  RENATO: 'text-cyan-400 font-bold',
  CLAUDIO: 'text-emerald-400 font-bold',
  MÁRCIA: 'text-blue-400 font-bold',
  SANDRA: 'text-purple-400 font-bold',
  THAYANE: 'text-pink-400 font-bold',
  JULIA: 'text-amber-400 font-bold',
  JAQUELINE: 'text-teal-400 font-bold',
  ANA: 'text-lime-400 font-bold',
  WILIAM: 'text-sky-400 font-bold',
  MAURÍCIO: 'text-yellow-400 font-bold',
  WILTON: 'text-indigo-400 font-bold',
  LEANDRO: 'text-emerald-300 font-bold',
  THAÍS: 'text-rose-400 font-bold',
  PATRÍCIA: 'text-orange-400 font-bold',
  LUANA: 'text-fuchsia-400 font-bold',
};

export const ScheduleBoard3D: React.FC<ScheduleBoard3DProps> = ({
  currentDaySchedule,
  selectedTeacher,
  selectedSubject,
  activePeriodId,
  activeStatus,
  formattedTimeRemaining,
  isTodayWeekend,
  onSelectTeacherByName,
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [is3DEnabled, setIs3DEnabled] = useState(true);

  // 3D Parallax Tilt Effect with GSAP
  useEffect(() => {
    const container = containerRef.current;
    const board = boardRef.current;
    if (!container || !board || !is3DEnabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Subtle 3D tilt angles
      const rotateX = ((y - centerY) / centerY) * -6; // max 6 deg
      const rotateY = ((x - centerX) / centerX) * 6;  // max 6 deg

      gsap.to(board, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.5,
        ease: 'power2.out',
        transformPerspective: 1200,
        transformOrigin: 'center center',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(board, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.4)',
      });
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [is3DEnabled]);

  // Highlight animation when teacher selection changes
  useEffect(() => {
    if (!boardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.highlighted-cell',
        { scale: 0.92, opacity: 0.6 },
        { scale: 1.04, opacity: 1, duration: 0.35, ease: 'back.out(2)' }
      );
    }, boardRef);

    return () => ctx.revert();
  }, [selectedTeacher, selectedSubject]);

  return (
    <div ref={containerRef} className="w-full relative py-2 select-none">
      {/* 3D Toggle & Status Indicator Bar */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
          <span className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
            Quadro Oficial 3D • {currentDaySchedule.dayName}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIs3DEnabled(!is3DEnabled)}
            className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg border transition-all ${
              is3DEnabled
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                : 'bg-muted/40 text-muted-foreground border-border/60'
            }`}
          >
            {is3DEnabled ? '🎮 3D Tilt: Ativado' : '2D Fixo'}
          </button>

          {selectedTeacher && (
            <div className="text-xs font-mono bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.3)]">
              <User className="w-3.5 h-3.5" />
              <span>Foco: <strong>{selectedTeacher.name}</strong> ({selectedSubject})</span>
            </div>
          )}
        </div>
      </div>

      {/* 3D Board Frame */}
      <div
        ref={boardRef}
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
        }}
        className="w-full rounded-2xl border-2 border-cyan-500/40 bg-slate-950/95 shadow-[0_15px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.15)] overflow-hidden backdrop-blur-2xl"
      >
        {/* Main Table Header: HORÁRIO 2026 Banner */}
        <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-indigo-950 border-b-2 border-cyan-500/50 px-6 py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="h-4 w-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#00f0ff]" />
            <h2 className="text-xl md:text-2xl font-black tracking-widest text-white uppercase font-sans drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              HORÁRIO 2026
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm md:text-base font-black px-4 py-1 rounded-xl bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.6)] uppercase tracking-wider">
              {currentDaySchedule.dayName}
            </span>
          </div>
        </div>

        {/* The Official Schedule Table Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center">
            {/* Header row with TEMPOS, HORÁRIO, Classes */}
            <thead>
              <tr className="bg-slate-900/95 border-b-2 border-slate-800 text-white font-mono text-xs">
                <th className="py-2.5 px-3 font-black bg-cyan-950/90 text-cyan-300 border-r border-slate-800 tracking-wider min-w-[75px] shadow-inner">
                  TEMPOS
                </th>
                <th className="py-2.5 px-3 font-black bg-sky-950/90 text-sky-200 border-r border-slate-800 tracking-wider min-w-[110px] shadow-inner">
                  HORÁRIO
                </th>
                {currentDaySchedule.classNames.map(cName => (
                  <th
                    key={cName}
                    className="py-2.5 px-2 font-black bg-slate-900 text-slate-100 border-r border-slate-800 tracking-wider min-w-[76px] last:border-r-0"
                  >
                    <span className="inline-block px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-[11px] shadow-sm">
                      {cName}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body rows 1º to 7º */}
            <tbody className="divide-y divide-slate-800/90 font-sans text-xs">
              {currentDaySchedule.periods.map(period => {
                const isCurrentActive = activePeriodId === period.slot.id;

                return (
                  <tr
                    key={period.slot.id}
                    className={`transition-all duration-300 ${
                      isCurrentActive
                        ? 'bg-cyan-500/15 shadow-[inset_0_0_20px_rgba(0,240,255,0.2)]'
                        : 'hover:bg-slate-900/50'
                    }`}
                  >
                    {/* TEMPOS Column */}
                    <td
                      className={`py-3 px-2 font-mono font-bold border-r border-slate-800 whitespace-nowrap ${
                        isCurrentActive
                          ? 'bg-cyan-500/25 text-cyan-200 font-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                          : 'bg-slate-900/60 text-cyan-400'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {isCurrentActive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
                        <span>{period.slot.id}º</span>
                      </div>
                    </td>

                    {/* HORÁRIO Column */}
                    <td
                      className={`py-3 px-2 font-mono text-[11px] font-bold border-r border-slate-800 whitespace-nowrap ${
                        isCurrentActive
                          ? 'bg-sky-500/25 text-sky-200 font-black'
                          : 'bg-slate-900/40 text-slate-300'
                      }`}
                    >
                      {period.slot.startTime} às {period.slot.endTime}
                    </td>

                    {/* Class Cells */}
                    {currentDaySchedule.classNames.map(cName => {
                      const asg = period.classes[cName];
                      const isEmpty = !asg || asg.isVacant;

                      if (isEmpty) {
                        return (
                          <td
                            key={cName}
                            className={`py-2 px-1 border-r border-slate-800 last:border-r-0 text-slate-600 font-mono text-[10px] ${
                              selectedTeacher ? 'opacity-20' : 'opacity-40'
                            }`}
                          >
                            {asg?.raw === 'VAGO' ? (
                              <span className="text-rose-400/60 font-semibold">VAGO</span>
                            ) : (
                              '-'
                            )}
                          </td>
                        );
                      }

                      // Teacher matching
                      const isTargetTeacher = selectedTeacher
                        ? asg.teacher.toUpperCase() === selectedTeacher.name.toUpperCase()
                        : false;

                      const isTargetSubject =
                        selectedSubject === 'TODAS' ||
                        asg.subject.toUpperCase() === selectedSubject.toUpperCase();

                      const isHighlighted = isTargetTeacher && isTargetSubject;
                      const isDimmed = selectedTeacher !== null && !isHighlighted;

                      // Base teacher color class
                      const colorClass = TEACHER_COLORS[asg.teacher.toUpperCase()] || 'text-slate-200 font-bold';

                      return (
                        <td
                          key={cName}
                          onClick={() => onSelectTeacherByName(asg.teacher)}
                          className={`py-2 px-1 border-r border-slate-800 last:border-r-0 transition-all duration-300 cursor-pointer ${
                            isHighlighted
                              ? 'highlighted-cell bg-cyan-500/25 shadow-[0_0_20px_rgba(0,240,255,0.6)] z-20 relative'
                              : isDimmed
                              ? 'opacity-15 grayscale-[60%] blur-[0.3px]'
                              : 'hover:bg-slate-800/80 hover:scale-105'
                          }`}
                        >
                          <div
                            className={`p-1.5 rounded-lg flex flex-col items-center justify-center transition-all ${
                              isHighlighted
                                ? 'border-2 border-cyan-400 bg-slate-900/90 shadow-[0_0_15px_rgba(0,240,255,0.5)] scale-105'
                                : 'border border-transparent'
                            }`}
                          >
                            <span className={`text-[11px] leading-tight font-black tracking-tight ${colorClass}`}>
                              {asg.teacher}
                            </span>

                            {/* Suffix tag (PIC, EO, PV, CL, etc.) */}
                            {!asg.isMainSubject && (
                              <span className="text-[9px] font-mono font-bold text-amber-300 mt-0.5 bg-amber-950/80 px-1 py-0.2 rounded border border-amber-500/40">
                                {asg.subject}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Legend matching the image aesthetic */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-muted-foreground text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
              <strong>Nome simples</strong> = Disciplina Principal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-400 text-black font-bold text-[8px] flex items-center justify-center">
                EO
              </span>
              <strong>Sigla final (PIC, EO, PV, CL)</strong> = Disciplina Específica
            </span>
          </div>

          <div className="text-[11px] font-mono text-muted-foreground">
            Clique em qualquer célula para focar naquele professor
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleBoard3D;
