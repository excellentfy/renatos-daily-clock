import React, { useRef, useState, useEffect } from 'react';
import { DaySchedule, TeacherMeta, TimeSlotConfig, TeacherAssignment } from '@/data/scheduleData';
import { Sparkles, User, Coffee, Utensils } from 'lucide-react';
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
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

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
        { scale: 0.94, opacity: 0.7 },
        { scale: 1.03, opacity: 1, duration: 0.3, ease: 'back.out(2)' }
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
      {/* 3D Board Frame - Clean Light Theme with Tactile Neumorphic / Skeuomorphic Details */}
      <div
        ref={boardRef}
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
        }}
        className="w-full rounded-2xl border-2 border-slate-300 bg-white shadow-[0_16px_40px_rgba(0,0,0,0.09),0_2px_6px_rgba(0,0,0,0.04)] overflow-hidden backdrop-blur-xl"
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
              className={`text-[10px] md:text-xs font-mono font-semibold px-2.5 py-1 rounded-xl border border-b-2 border-slate-700 transition-all active:translate-y-0.5 ${
                is3DEnabled
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-sm'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {is3DEnabled ? '🎮 3D Tilt' : '2D Fixo'}
            </button>

            <span className="text-xs md:text-sm font-black px-3.5 md:px-4 py-1 rounded-xl bg-[#00bfff] text-slate-950 shadow-sm uppercase tracking-wider border-b-2 border-[#0284c7]">
              {currentDaySchedule.dayName}
            </span>
          </div>
        </div>

        {/* The Official Schedule Table Matrix - Tactile Button Grid */}
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
                    <span className="inline-block w-full py-0.5 rounded-lg bg-slate-800 border border-slate-600 border-b-2 border-b-slate-950 text-[10px] md:text-[11px] font-bold shadow-[0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] text-slate-100">
                      {cName}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body rows with 1º to 7º + RECREIO (09:10 - 09:30) + ALMOÇO (12:00 - 12:50) */}
            <tbody className="divide-y divide-slate-200 font-sans text-xs">
              {currentDaySchedule.periods.map(period => {
                const isCurrentActive = activePeriodId === period.slot.id;

                return (
                  <React.Fragment key={period.slot.id}>
                    {/* Linha do RECREIO / INTERVALO (entre 2º e 3º tempo) */}
                    {period.slot.id === 3 && (
                      <tr
                        key="break-morning"
                        className={`transition-all duration-200 ${
                          activeStatus === 'MORNING_BREAK'
                            ? 'bg-amber-100 ring-2 ring-amber-500 shadow-md font-bold'
                            : 'bg-amber-50/80 border-y border-amber-200 hover:bg-amber-100/60'
                        }`}
                      >
                        <td className={`py-1.5 px-1 font-mono text-[9px] md:text-[10px] font-black border-r border-slate-200 ${
                          activeStatus === 'MORNING_BREAK' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-amber-100 text-amber-900'
                        }`}>
                          ☕ RECREIO
                        </td>
                        <td className={`py-1.5 px-1 font-mono text-[9px] md:text-[10px] font-bold border-r border-slate-200 ${
                          activeStatus === 'MORNING_BREAK' ? 'bg-amber-200 text-slate-950 font-black' : 'bg-amber-50 text-amber-950'
                        }`}>
                          09:10 às 09:30
                        </td>
                        <td
                          colSpan={currentDaySchedule.classNames.length}
                          className="py-1.5 px-3 text-left font-bold text-amber-950 font-sans tracking-wide text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-slate-800">
                              <Coffee className="w-3.5 h-3.5 text-amber-600" />
                              <span className="uppercase text-[10px] md:text-[11px] font-black tracking-wider text-amber-950">
                                Intervalo / Recreio (20 min)
                              </span>
                            </span>
                            {activeStatus === 'MORNING_BREAK' && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono text-[9px] md:text-[10px] font-black animate-pulse shadow-sm">
                                EM ANDAMENTO • Restam {formattedTimeRemaining}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Linha do ALMOÇO (entre 5º e 6º tempo) */}
                    {period.slot.id === 6 && (
                      <tr
                        key="break-lunch"
                        className={`transition-all duration-200 ${
                          activeStatus === 'LUNCH_BREAK'
                            ? 'bg-amber-100 ring-2 ring-amber-500 shadow-md font-bold'
                            : 'bg-sky-50/80 border-y border-sky-200 hover:bg-sky-100/60'
                        }`}
                      >
                        <td className={`py-1.5 px-1 font-mono text-[9px] md:text-[10px] font-black border-r border-slate-200 ${
                          activeStatus === 'LUNCH_BREAK' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-sky-100 text-sky-900'
                        }`}>
                          🍽️ ALMOÇO
                        </td>
                        <td className={`py-1.5 px-1 font-mono text-[9px] md:text-[10px] font-bold border-r border-slate-200 ${
                          activeStatus === 'LUNCH_BREAK' ? 'bg-amber-200 text-slate-950 font-black' : 'bg-sky-50 text-sky-950'
                        }`}>
                          12:00 às 12:50
                        </td>
                        <td
                          colSpan={currentDaySchedule.classNames.length}
                          className="py-1.5 px-3 text-left font-bold text-sky-950 font-sans tracking-wide text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-slate-800">
                              <Utensils className="w-3.5 h-3.5 text-sky-600" />
                              <span className="uppercase text-[10px] md:text-[11px] font-black tracking-wider text-sky-950">
                                Intervalo de Almoço (50 min)
                              </span>
                            </span>
                            {activeStatus === 'LUNCH_BREAK' && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono text-[9px] md:text-[10px] font-black animate-pulse shadow-sm">
                                EM ANDAMENTO • Restam {formattedTimeRemaining}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Linha do Tempo Letivo (1º ao 7º) */}
                    <tr
                      key={period.slot.id}
                      className={`transition-all duration-200 ${
                        isCurrentActive
                          ? 'bg-amber-100/90 ring-2 ring-amber-500 shadow-md'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* TEMPOS Column - Tactile Key Style */}
                      <td
                        className={`py-2 px-1 font-mono font-bold border-r border-slate-200 whitespace-nowrap ${
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
                        className={`py-2 px-1 font-mono text-[10px] md:text-xs font-bold border-r border-slate-200 whitespace-nowrap ${
                          isCurrentActive
                            ? 'bg-amber-200 text-slate-950 font-black'
                            : 'bg-slate-50 text-slate-600'
                        }`}
                      >
                        {period.slot.startTime}-{period.slot.endTime}
                      </td>

                      {/* Class Cells - Tactile 3D Push-Button / Neumorphic Relief */}
                      {currentDaySchedule.classNames.map(cName => {
                        const asg = period.classes[cName];
                        const isEmpty = !asg || asg.isVacant;

                        if (isEmpty) {
                          return (
                            <td
                              key={cName}
                              className={`py-1.5 px-0.5 border-r border-slate-200 last:border-r-0 text-slate-400 font-mono text-[9px] md:text-[10px] ${
                                selectedTeacher ? 'opacity-20' : 'opacity-40'
                              }`}
                            >
                              {asg?.raw === 'VAGO' ? (
                                <span className="inline-block px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 font-bold border border-rose-200 border-b-2 border-b-rose-300 text-[9px]">
                                  VAGO
                                </span>
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
                            className={`p-1 border-r border-slate-200 last:border-r-0 transition-all duration-150 cursor-pointer overflow-hidden ${
                              isDimmed ? 'opacity-15 grayscale-[80%]' : ''
                            }`}
                          >
                            {/* Tactile Skeuomorphic / Neumorphic 3D Push Button */}
                            <div
                              className={`py-1 px-0.5 rounded-xl flex flex-col items-center justify-center transition-all duration-150 select-none ${
                                isHighlighted
                                  ? 'highlighted-cell bg-gradient-to-b from-cyan-50 via-white to-cyan-50/80 border-2 border-cyan-500 border-b-4 border-b-cyan-600 shadow-[0_4px_12px_rgba(2,132,199,0.35),inset_0_1px_0_rgba(255,255,255,1)] -translate-y-0.5 active:translate-y-0.5 active:border-b-2'
                                  : 'bg-gradient-to-b from-white to-slate-50 border border-slate-200/90 border-b-2 border-b-slate-300/80 shadow-[0_2px_4px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)] hover:border-slate-300 active:translate-y-0.5 active:border-b active:shadow-inner'
                              }`}
                            >
                              <span className={`text-[10px] md:text-[11px] leading-tight tracking-tight truncate w-full ${colorClass}`}>
                                {asg.teacher}
                              </span>

                              {/* Suffix tag (PIC, EO, PV, CL, etc.) */}
                              {!asg.isMainSubject && (
                                <span className="text-[8px] md:text-[9px] font-mono font-black text-amber-900 mt-0.5 bg-amber-100 px-1 py-0.2 rounded border border-amber-300 border-b-2 border-b-amber-400 leading-none shadow-xs">
                                  {asg.subject}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Instructions Bar */}
        <div className="bg-slate-50 px-4 md:px-6 py-2.5 border-t border-slate-200 flex items-center justify-start text-[11px]">
          <div className="text-cyan-800 font-sans font-bold flex items-center gap-1.5">
            <span className="text-sm">💡</span>
            <span>
              {selectedTeacher
                ? `Clique em qualquer aula destacada de ${selectedTeacher.name} para abrir as anotações da turma.`
                : 'Clique em qualquer professor no quadro para focar na grade de horários dele.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleBoard3D;
