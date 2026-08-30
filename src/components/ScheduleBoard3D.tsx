import React, { useRef, useState, useEffect } from 'react';
import { DaySchedule, TeacherMeta, TimeSlotConfig, TeacherAssignment } from '@/data/scheduleData';
import { Sparkles, User } from 'lucide-react';
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
  onOpenClassNotes: (slot: TimeSlotConfig, assignment: TeacherAssignment) => void;
}

// Teacher text colors optimized for high contrast on WHITE background
const TEACHER_COLORS_LIGHT: Record<string, string> = {
  RENATO: 'text-[#0284c7] font-black',
  CLAUDIO: 'text-[#16a34a] font-black',
  MÁRCIA: 'text-[#2563eb] font-black',
  SANDRA: 'text-[#7c3aed] font-black',
  THAYANE: 'text-[#db2777] font-black',
  JULIA: 'text-[#d97706] font-black',
  JAQUELINE: 'text-[#0d9488] font-black',
  ANA: 'text-[#65a30d] font-black',
  WILIAM: 'text-[#0369a1] font-black',
  MAURÍCIO: 'text-[#b45309] font-black',
  WILTON: 'text-[#4f46e5] font-black',
  LEANDRO: 'text-[#059669] font-black',
  THAÍS: 'text-[#e11d48] font-black',
  PATRÍCIA: 'text-[#ea580c] font-black',
  LUANA: 'text-[#c026d3] font-black',
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
  onOpenClassNotes,
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
      const rotateX = ((y - centerY) / centerY) * -4.5;
      const rotateY = ((x - centerX) / centerX) * 4.5;

      gsap.to(board, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.45,
        ease: 'power2.out',
        transformPerspective: 1200,
        transformOrigin: 'center center',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(board, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.7,
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
        { scale: 1.04, opacity: 1, duration: 0.3, ease: 'back.out(2)' }
      );
    }, boardRef);

    return () => ctx.revert();
  }, [selectedTeacher, selectedSubject]);

  const handleCellClick = (asg: TeacherAssignment, slot: TimeSlotConfig) => {
    if (selectedTeacher) {
      if (asg.teacher.toUpperCase() === selectedTeacher.name.toUpperCase()) {
        onOpenClassNotes(slot, asg);
      } else {
        onSelectTeacherByName(asg.teacher);
      }
    } else {
      onSelectTeacherByName(asg.teacher);
    }
  };

  return (
    <div ref={containerRef} className="w-full relative select-none">
      {/* 3D Board Frame - Clean Light Theme */}
      <div
        ref={boardRef}
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
        }}
        className="w-full rounded-2xl border-2 border-slate-300 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)] overflow-hidden backdrop-blur-xl"
      >
        {/* Main Table Header: Official HORÁRIO 2026 Banner */}
        <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border-b-2 border-slate-300 px-4 md:px-6 py-2.5 md:py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5 md:gap-3">
            <div className="h-4 w-1.5 bg-[#00bfff] rounded-full shadow-[0_0_8px_#00bfff]" />
            <h2 className="text-lg md:text-2xl font-black tracking-widest text-white uppercase font-sans drop-shadow-sm">
              HORÁRIO 2026
            </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setIs3DEnabled(!is3DEnabled)}
              className={`text-[10px] md:text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                is3DEnabled
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {is3DEnabled ? '🎮 3D Tilt' : '2D Fixo'}
            </button>

            <span className="text-xs md:text-sm font-black px-3.5 md:px-4 py-1 rounded-xl bg-[#00bfff] text-slate-950 shadow-sm uppercase tracking-wider">
              {currentDaySchedule.dayName}
            </span>
          </div>
        </div>

        {/* The Official Schedule Table Matrix - Full Width Light Theme */}
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-center table-fixed bg-white">
            {/* Header row with TEMPOS, HORÁRIO, Classes */}
            <thead>
              <tr className="bg-[#0f172a] border-b-2 border-slate-300 text-white font-mono text-[10px] md:text-xs">
                <th className="py-2 px-1 md:px-2 font-black bg-[#0f172a] text-cyan-300 border-r border-slate-700 tracking-wider w-[52px] md:w-[68px] shadow-inner">
                  TEMPOS
                </th>
                <th className="py-2 px-1 md:px-2 font-black bg-[#1e293b] text-sky-200 border-r border-slate-700 tracking-wider w-[80px] md:w-[98px] shadow-inner">
                  HORÁRIO
                </th>
                {currentDaySchedule.classNames.map(cName => (
                  <th
                    key={cName}
                    className="py-2 px-0.5 md:px-1 font-black bg-[#0f172a] text-white border-r border-slate-700 tracking-tight last:border-r-0"
                  >
                    <span className="inline-block w-full py-0.5 rounded bg-slate-800 border border-slate-600 text-[10px] md:text-[11px] font-bold shadow-sm text-slate-100">
                      {cName}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body rows 1º to 7º */}
            <tbody className="divide-y divide-slate-200 font-sans text-xs">
              {currentDaySchedule.periods.map(period => {
                const isCurrentActive = activePeriodId === period.slot.id;

                return (
                  <tr
                    key={period.slot.id}
                    className={`transition-all duration-200 ${
                      isCurrentActive
                        ? 'bg-amber-100/90 ring-2 ring-amber-500 shadow-md'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* TEMPOS Column */}
                    <td
                      className={`py-2 md:py-2.5 px-1 font-mono font-bold border-r border-slate-200 whitespace-nowrap ${
                        isCurrentActive
                          ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-0.5 md:gap-1">
                        {isCurrentActive && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />}
                        <span className="text-xs md:text-sm font-black">{period.slot.id}º</span>
                      </div>
                    </td>

                    {/* HORÁRIO Column */}
                    <td
                      className={`py-2 md:py-2.5 px-1 font-mono text-[10px] md:text-xs font-bold border-r border-slate-200 whitespace-nowrap ${
                        isCurrentActive
                          ? 'bg-amber-200 text-slate-950 font-black'
                          : 'bg-slate-50 text-slate-600'
                      }`}
                    >
                      {period.slot.startTime}-{period.slot.endTime}
                    </td>

                    {/* Class Cells */}
                    {currentDaySchedule.classNames.map(cName => {
                      const asg = period.classes[cName];
                      const isEmpty = !asg || asg.isVacant;

                      if (isEmpty) {
                        return (
                          <td
                            key={cName}
                            className={`py-1 px-0.5 border-r border-slate-200 last:border-r-0 text-slate-400 font-mono text-[9px] md:text-[10px] ${
                              selectedTeacher ? 'opacity-20' : 'opacity-40'
                            }`}
                          >
                            {asg?.raw === 'VAGO' ? (
                              <span className="text-rose-500 font-bold">VAGO</span>
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

                      const colorClass = TEACHER_COLORS_LIGHT[asg.teacher.toUpperCase()] || 'text-slate-800 font-black';

                      return (
                        <td
                          key={cName}
                          onClick={() => handleCellClick(asg, period.slot)}
                          title={
                            selectedTeacher && isHighlighted
                              ? `Clique para abrir anotações da Turma ${asg.className}`
                              : `Clique para focar no professor ${asg.teacher}`
                          }
                          className={`py-1 px-0.5 md:px-1 border-r border-slate-200 last:border-r-0 transition-all duration-150 cursor-pointer overflow-hidden ${
                            isHighlighted
                              ? 'highlighted-cell bg-cyan-100/90 shadow-[0_0_15px_rgba(2,132,199,0.35)] z-20 relative'
                              : isDimmed
                              ? 'opacity-15 grayscale-[80%]'
                              : 'hover:bg-slate-100'
                          }`}
                        >
                          <div
                            className={`py-1 px-0.5 rounded-lg flex flex-col items-center justify-center transition-all ${
                              isHighlighted
                                ? 'border-2 border-cyan-500 bg-white shadow-md scale-105'
                                : 'border border-transparent'
                            }`}
                          >
                            <span className={`text-[10px] md:text-[11px] leading-none tracking-tight truncate w-full ${colorClass}`}>
                              {asg.teacher}
                            </span>

                            {/* Suffix tag (PIC, EO, PV, CL, etc.) */}
                            {!asg.isMainSubject && (
                              <span className="text-[8px] md:text-[9px] font-mono font-black text-amber-700 mt-0.5 bg-amber-100 px-1 py-0.2 rounded border border-amber-300 leading-none">
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

        {/* Bottom Legend & Instructions */}
        <div className="bg-slate-50 px-4 md:px-6 py-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-3 text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] shadow-sm" />
              <strong className="text-slate-900">Nome simples</strong> = Disciplina Principal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-400 text-slate-900 font-bold text-[8px] flex items-center justify-center">
                EO
              </span>
              <strong className="text-slate-900">Sigla final</strong> = Disciplina Específica (PIC, EO, PV, CL)
            </span>
          </div>

          <div className="text-cyan-700 font-mono font-bold text-[11px]">
            {selectedTeacher
              ? `💡 Clique em qualquer aula destacada de ${selectedTeacher.name} para abrir anotações`
              : '💡 Clique em qualquer professor para focar suas aulas'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleBoard3D;
