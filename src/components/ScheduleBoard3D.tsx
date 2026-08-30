import React, { useRef, useState, useEffect } from 'react';
import { DaySchedule, TeacherMeta, TimeSlotConfig, TeacherAssignment } from '@/data/scheduleData';
import { Sparkles, User, FileText, CheckCircle2 } from 'lucide-react';
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

// Teacher text colors matching the official board aesthetic with high vibrancy
const TEACHER_COLORS: Record<string, string> = {
  RENATO: 'text-cyan-300 font-black',
  CLAUDIO: 'text-emerald-300 font-black',
  MÁRCIA: 'text-sky-300 font-black',
  SANDRA: 'text-purple-300 font-black',
  THAYANE: 'text-pink-300 font-black',
  JULIA: 'text-amber-300 font-black',
  JAQUELINE: 'text-teal-300 font-black',
  ANA: 'text-lime-300 font-black',
  WILIAM: 'text-cyan-200 font-black',
  MAURÍCIO: 'text-yellow-300 font-black',
  WILTON: 'text-indigo-300 font-black',
  LEANDRO: 'text-emerald-200 font-black',
  THAÍS: 'text-rose-300 font-black',
  PATRÍCIA: 'text-orange-300 font-black',
  LUANA: 'text-fuchsia-300 font-black',
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
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

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
        { scale: 0.9, opacity: 0.5 },
        { scale: 1.05, opacity: 1, duration: 0.35, ease: 'back.out(2)' }
      );
    }, boardRef);

    return () => ctx.revert();
  }, [selectedTeacher, selectedSubject]);

  const handleCellClick = (asg: TeacherAssignment, slot: TimeSlotConfig) => {
    if (selectedTeacher) {
      // If the clicked cell belongs to the selected teacher, open the notes modal!
      if (asg.teacher.toUpperCase() === selectedTeacher.name.toUpperCase()) {
        onOpenClassNotes(slot, asg);
      } else {
        // Switch to the clicked teacher
        onSelectTeacherByName(asg.teacher);
      }
    } else {
      // In "Todos os Professores" mode, clicking selects that teacher (no notes modal opens)
      onSelectTeacherByName(asg.teacher);
    }
  };

  return (
    <div ref={containerRef} className="w-full relative select-none">
      {/* 3D Board Frame */}
      <div
        ref={boardRef}
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
        }}
        className="w-full rounded-2xl border-2 border-cyan-500/50 bg-[#060b1e] shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(0,191,255,0.15)] overflow-hidden backdrop-blur-2xl"
      >
        {/* Main Table Header: Official HORÁRIO 2026 Banner */}
        <div className="bg-gradient-to-r from-[#0c163b] via-[#102052] to-[#0c163b] border-b-2 border-cyan-500/60 px-4 md:px-6 py-2.5 md:py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5 md:gap-3">
            <div className="h-4 w-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#00f0ff]" />
            <h2 className="text-lg md:text-2xl font-black tracking-widest text-white uppercase font-sans drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              HORÁRIO 2026
            </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setIs3DEnabled(!is3DEnabled)}
              className={`text-[10px] md:text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                is3DEnabled
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700'
              }`}
            >
              {is3DEnabled ? '🎮 3D Tilt' : '2D Fixo'}
            </button>

            <span className="text-xs md:text-sm font-black px-3 md:px-4 py-1 rounded-xl bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.6)] uppercase tracking-wider">
              {currentDaySchedule.dayName}
            </span>
          </div>
        </div>

        {/* The Official Schedule Table Matrix - Full Screen Optimized */}
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-center table-fixed">
            {/* Header row with TEMPOS, HORÁRIO, Classes */}
            <thead>
              <tr className="bg-[#0b122c] border-b-2 border-slate-700/80 text-white font-mono text-[10px] md:text-xs">
                <th className="py-2 px-1 md:px-2 font-black bg-[#0d1b40] text-cyan-300 border-r border-slate-800 tracking-wider w-[52px] md:w-[68px] shadow-inner">
                  TEMPOS
                </th>
                <th className="py-2 px-1 md:px-2 font-black bg-[#0f2452] text-sky-200 border-r border-slate-800 tracking-wider w-[80px] md:w-[98px] shadow-inner">
                  HORÁRIO
                </th>
                {currentDaySchedule.classNames.map(cName => (
                  <th
                    key={cName}
                    className="py-2 px-0.5 md:px-1 font-black bg-[#0b122c] text-slate-100 border-r border-slate-800/80 tracking-tight last:border-r-0"
                  >
                    <span className="inline-block w-full py-0.5 rounded bg-slate-800/90 border border-slate-700/60 text-[10px] md:text-[11px] font-bold shadow-sm">
                      {cName}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body rows 1º to 7º */}
            <tbody className="divide-y divide-slate-800/80 font-sans text-xs">
              {currentDaySchedule.periods.map(period => {
                const isCurrentActive = activePeriodId === period.slot.id;

                return (
                  <tr
                    key={period.slot.id}
                    className={`transition-all duration-300 relative ${
                      isCurrentActive
                        ? 'bg-amber-400/20 shadow-[inset_0_0_25px_rgba(250,204,21,0.35)] ring-2 ring-amber-400'
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    {/* TEMPOS Column */}
                    <td
                      className={`py-2 md:py-2.5 px-1 font-mono font-bold border-r border-slate-800 whitespace-nowrap ${
                        isCurrentActive
                          ? 'bg-amber-400 text-slate-950 font-black shadow-[0_0_15px_rgba(250,204,21,0.7)]'
                          : 'bg-[#0d1633] text-cyan-400'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-0.5 md:gap-1">
                        {isCurrentActive && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />}
                        <span className="text-xs md:text-sm">{period.slot.id}º</span>
                      </div>
                    </td>

                    {/* HORÁRIO Column */}
                    <td
                      className={`py-2 md:py-2.5 px-1 font-mono text-[10px] md:text-xs font-bold border-r border-slate-800 whitespace-nowrap ${
                        isCurrentActive
                          ? 'bg-amber-400/90 text-slate-950 font-black'
                          : 'bg-[#0d1633]/60 text-slate-300'
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
                            className={`py-1 px-0.5 border-r border-slate-800/80 last:border-r-0 text-slate-600 font-mono text-[9px] md:text-[10px] ${
                              selectedTeacher ? 'opacity-15' : 'opacity-35'
                            }`}
                          >
                            {asg?.raw === 'VAGO' ? (
                              <span className="text-rose-400/80 font-bold">VAGO</span>
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
                      const colorClass = TEACHER_COLORS[asg.teacher.toUpperCase()] || 'text-slate-200 font-black';

                      return (
                        <td
                          key={cName}
                          onClick={() => handleCellClick(asg, period.slot)}
                          title={
                            selectedTeacher && isHighlighted
                              ? `Clique para abrir Anotações da Turma ${asg.className}`
                              : `Clique para focar no professor ${asg.teacher}`
                          }
                          className={`py-1 px-0.5 md:px-1 border-r border-slate-800/80 last:border-r-0 transition-all duration-200 cursor-pointer overflow-hidden ${
                            isHighlighted
                              ? 'highlighted-cell bg-cyan-500/30 shadow-[0_0_20px_rgba(0,240,255,0.7)] z-20 relative'
                              : isDimmed
                              ? 'opacity-15 grayscale-[60%] blur-[0.2px]'
                              : 'hover:bg-slate-800/90'
                          }`}
                        >
                          <div
                            className={`py-1 px-0.5 rounded-md flex flex-col items-center justify-center transition-all ${
                              isHighlighted
                                ? 'border-2 border-cyan-400 bg-slate-950/95 shadow-[0_0_12px_rgba(0,240,255,0.6)] scale-105'
                                : 'border border-transparent'
                            }`}
                          >
                            <span className={`text-[10px] md:text-[11px] leading-none tracking-tight truncate w-full ${colorClass}`}>
                              {asg.teacher}
                            </span>

                            {/* Suffix tag (PIC, EO, PV, CL, etc.) */}
                            {!asg.isMainSubject && (
                              <span className="text-[8px] md:text-[9px] font-mono font-black text-amber-300 mt-0.5 bg-amber-950/90 px-1 py-0.2 rounded border border-amber-500/50 leading-none">
                                {asg.subject}
                              </span>
                            )}

                            {/* Notes icon if selected */}
                            {isHighlighted && (
                              <span className="text-[7px] text-cyan-400 font-mono flex items-center gap-0.5 mt-0.5">
                                <FileText className="w-2.5 h-2.5" /> Notas
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

        {/* Bottom Legend & Instructions matching user needs */}
        <div className="bg-[#070d24] px-4 md:px-6 py-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
              <strong className="text-white">Nome simples</strong> = Disciplina Principal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-400 text-black font-bold text-[8px] flex items-center justify-center">
                EO
              </span>
              <strong className="text-white">Sigla final</strong> = Disciplina Específica (PIC, EO, PV, CL)
            </span>
          </div>

          <div className="text-cyan-300 font-mono font-medium text-[11px]">
            {selectedTeacher
              ? `💡 Clique em qualquer aula destacada de ${selectedTeacher.name} para abrir Anotações`
              : '💡 Clique em qualquer professor para focar suas aulas'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleBoard3D;
