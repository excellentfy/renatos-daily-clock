import React, { useRef, useState, useEffect } from 'react';
import { DaySchedule, TeacherMeta, TimeSlotConfig, TeacherAssignment, BREAK_MORNING, BREAK_LUNCH } from '@/data/scheduleData';
import { Sparkles, User, Coffee, Utensils, FileText } from 'lucide-react';
import gsap from 'gsap';

interface ScheduleBoard3DProps {
  currentDaySchedule: DaySchedule;
  selectedTeacher: TeacherMeta | null;
  selectedSubject: string;
  activePeriodId: number | null;
  activeStatus: string;
  formattedTimeRemaining: string;
  isTodayWeekend: boolean;
  effectiveMinutes?: number;
  isTodaySelected?: boolean;
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

// Verifica se um determinado professor tem aula futura com esta turma para adiantar
function checkCanAdvanceClass(
  teacherName: string | undefined,
  currentDaySchedule: DaySchedule,
  currentSlotId: number,
  className: string
): boolean {
  if (!teacherName) return false;
  const upper = teacherName.toUpperCase();

  for (let i = 0; i < currentDaySchedule.periods.length; i++) {
    const p = currentDaySchedule.periods[i];
    if (p.slot.id > currentSlotId) {
      const asg = p.classes[className];
      if (asg && !asg.isVacant) {
        const tUpper = asg.teacher.toUpperCase();
        if (tUpper === upper || asg.raw.toUpperCase().includes(upper)) {
          return true;
        }
      }
    }
  }
  return false;
}

export const ScheduleBoard3D: React.FC<ScheduleBoard3DProps> = ({
  currentDaySchedule,
  selectedTeacher,
  selectedSubject,
  activePeriodId,
  activeStatus,
  formattedTimeRemaining,
  isTodayWeekend,
  effectiveMinutes = 0,
  isTodaySelected = true,
  onSelectTeacherByName,
  onOpenClassNotes,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [notesVersion, setNotesVersion] = useState(0);

  // Auto-scroll para centralizar a linha ou card do tempo/intervalo atual
  useEffect(() => {
    if (!isTodaySelected) return;
    const timer = setTimeout(() => {
      const activeEl = document.querySelector('.active-schedule-focus');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [currentDaySchedule.dayName, isTodaySelected, activePeriodId, activeStatus]);

  useEffect(() => {
    const handleNotesUpdate = () => {
      setNotesVersion(prev => prev + 1);
    };
    window.addEventListener('notes-updated', handleNotesUpdate);
    window.addEventListener('storage', handleNotesUpdate);
    return () => {
      window.removeEventListener('notes-updated', handleNotesUpdate);
      window.removeEventListener('storage', handleNotesUpdate);
    };
  }, []);

  const hasNote = (teacherName: string, slotId: number, className: string) => {
    const key = `get_class_notes_${teacherName}_${currentDaySchedule.dayName}_slot${slotId}_${className}`;
    const val = localStorage.getItem(key);
    if (!val) return false;
    try {
      const parsed = JSON.parse(val);
      return !!parsed.content;
    } catch {
      return !!val;
    }
  };

  const getNoteContent = (teacherName: string, slotId: number, className: string) => {
    const key = `get_class_notes_${teacherName}_${currentDaySchedule.dayName}_slot${slotId}_${className}`;
    const val = localStorage.getItem(key);
    if (!val) return null;
    try {
      const parsed = JSON.parse(val);
      return parsed.content || null;
    } catch {
      return val || null;
    }
  };

  // Highlight animation when teacher selection changes
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.highlighted-cell',
        { scale: 0.94, opacity: 0.7 },
        { scale: 1.03, opacity: 1, duration: 0.3, ease: 'back.out(2)' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [selectedTeacher, selectedSubject]);

  const handleCellClick = (asg: TeacherAssignment, slot: TimeSlotConfig) => {
    // Se a célula já tem uma anotação salva, abre o modal de anotações diretamente
    if (hasNote(asg.teacher, slot.id, asg.className)) {
      onOpenClassNotes(slot, asg);
      return;
    }

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
      {/* Console Frame - Tactile Fixed 3D Raised Panel (Neumorphic / Skeuomorphic Button Box) */}
      <div
        className="w-full rounded-3xl border-2 border-slate-300 border-b-[8px] border-b-slate-400 bg-white shadow-[0_24px_50px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,1)] overflow-hidden"
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
            <span className="text-xs md:text-sm font-black px-3.5 md:px-4 py-1 rounded-xl bg-[#00bfff] text-slate-950 shadow-sm uppercase tracking-wider border-b-2 border-[#0284c7]">
              {currentDaySchedule.dayName}
            </span>
          </div>
        </div>

        {/* The Official Schedule Table Matrix - 100% Screen-Fitted (No Horizontal Scroll) */}
        <div className="w-full overflow-hidden">
          <table className="w-full border-collapse text-center table-fixed bg-white">
            {/* Header row with TEMPOS, HORÁRIO (desktop), Classes */}
            <thead>
              <tr className="bg-[#0f172a] border-b-2 border-slate-300 text-white font-mono text-[9.5px] md:text-xs">
                <th className="py-2 px-0.5 sm:px-1 font-black bg-[#0f172a] text-cyan-300 border-r border-slate-700 tracking-tight w-[28px] sm:w-[36px] md:w-[64px] shadow-inner">
                  <span className="md:hidden">T.</span>
                  <span className="hidden md:inline">TEMPOS</span>
                </th>
                <th className="hidden md:table-cell py-2 px-1.5 font-black bg-[#1e293b] text-sky-200 border-r border-slate-700 tracking-wider md:w-[88px] shadow-inner">
                  HORÁRIO
                </th>
                {currentDaySchedule.classNames.map(cName => (
                  <th
                    key={cName}
                    className="py-1.5 sm:py-2 px-[1px] sm:px-0.5 md:px-1 font-black bg-[#0f172a] text-white border-r border-slate-700 tracking-tight last:border-r-0"
                  >
                    <span className="inline-block w-full py-0.5 rounded bg-slate-800 border border-slate-700 border-b-2 border-b-slate-950 text-[8.5px] xs:text-[9px] sm:text-[10px] md:text-[11px] font-black shadow-[0_1px_3px_rgba(0,0,0,0.3)] text-slate-100 uppercase tracking-tighter truncate">
                      {cName}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body rows with 1º to 7º + RECREIO (09:10 - 09:30) + ALMOÇO (12:00 - 12:50) */}
            <tbody className="divide-y divide-slate-200 font-sans text-xs">
              {currentDaySchedule.periods.map(period => {
                const isCurrentActive = isTodaySelected && activePeriodId === period.slot.id;
                const isPast = isTodaySelected && effectiveMinutes > 0 && period.slot.endMinutes <= effectiveMinutes;

                const isBreakActive = isTodaySelected && activeStatus === 'MORNING_BREAK';
                const isBreakPast = isTodaySelected && effectiveMinutes > 0 && BREAK_MORNING.endMinutes <= effectiveMinutes;

                const isLunchActive = isTodaySelected && activeStatus === 'LUNCH_BREAK';
                const isLunchPast = isTodaySelected && effectiveMinutes > 0 && BREAK_LUNCH.endMinutes <= effectiveMinutes;

                return (
                  <React.Fragment key={period.slot.id}>
                    {/* Linha do RECREIO / INTERVALO (entre 2º e 3º tempo) */}
                    {period.slot.id === 3 && (
                      <tr
                        key="break-morning"
                        className={`transition-all duration-200 ${
                          isBreakActive
                            ? 'active-schedule-focus bg-rose-100 ring-4 ring-rose-500 shadow-md font-bold'
                            : isBreakPast
                            ? 'opacity-40 grayscale-[35%] bg-rose-50/40 border-y border-rose-100 hover:opacity-90 hover:grayscale-0'
                            : 'bg-rose-50/80 border-y border-rose-200 hover:bg-rose-100/60'
                        }`}
                      >
                        <td className={`py-1 px-0.5 font-mono text-[9px] sm:text-[10px] font-black border-r border-slate-200 ${
                          isBreakActive ? 'bg-rose-400 text-slate-950 font-black' : 'bg-rose-100 text-rose-900'
                        }`}>
                          ☕
                        </td>
                        <td className={`hidden md:table-cell py-1.5 px-1 font-mono text-[10px] font-bold border-r border-slate-200 ${
                          isBreakActive ? 'bg-rose-200 text-slate-950 font-black' : 'bg-rose-50 text-rose-900'
                        }`}>
                          09:10 às 09:30
                        </td>
                        <td
                          colSpan={currentDaySchedule.classNames.length}
                          className="py-1 px-2 text-left font-bold text-rose-950 font-sans tracking-wide text-[10px] sm:text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-slate-800">
                              <Coffee className="w-3 h-3 text-rose-600 shrink-0" />
                              <span className="uppercase text-[9px] sm:text-[10px] md:text-[11px] font-black tracking-wider text-rose-950">
                                Recreio (09:10 às 09:30)
                              </span>
                            </span>
                            {isBreakActive && (
                              <span className="px-1.5 py-0.2 rounded-full bg-rose-400 text-slate-950 font-mono text-[8.5px] sm:text-[9.5px] font-black animate-pulse shadow-sm">
                                Restam {formattedTimeRemaining}
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
                          isLunchActive
                            ? 'active-schedule-focus bg-rose-100 ring-4 ring-rose-500 shadow-md font-bold'
                            : isLunchPast
                            ? 'opacity-40 grayscale-[35%] bg-rose-50/40 border-y border-rose-100 hover:opacity-90 hover:grayscale-0'
                            : 'bg-rose-50/80 border-y border-rose-200 hover:bg-rose-100/60'
                        }`}
                      >
                        <td className={`py-1 px-0.5 font-mono text-[9px] sm:text-[10px] font-black border-r border-slate-200 ${
                          isLunchActive ? 'bg-rose-400 text-slate-950 font-black' : 'bg-rose-100 text-rose-900'
                        }`}>
                          🍽️
                        </td>
                        <td className={`hidden md:table-cell py-1.5 px-1 font-mono text-[10px] font-bold border-r border-slate-200 ${
                          isLunchActive ? 'bg-rose-200 text-slate-950 font-black' : 'bg-rose-50 text-rose-900'
                        }`}>
                          12:00 às 12:50
                        </td>
                        <td
                          colSpan={currentDaySchedule.classNames.length}
                          className="py-1 px-2 text-left font-bold text-rose-950 font-sans tracking-wide text-[10px] sm:text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-slate-800">
                              <Utensils className="w-3 h-3 text-rose-600 shrink-0" />
                              <span className="uppercase text-[9px] sm:text-[10px] md:text-[11px] font-black tracking-wider text-rose-950">
                                Almoço (12:00 às 12:50)
                              </span>
                            </span>
                            {isLunchActive && (
                              <span className="px-1.5 py-0.2 rounded-full bg-rose-400 text-slate-950 font-mono text-[8.5px] sm:text-[9.5px] font-black animate-pulse shadow-sm">
                                Restam {formattedTimeRemaining}
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
                          ? 'active-schedule-focus bg-amber-100/90 ring-4 ring-amber-400 ring-offset-1 shadow-lg font-bold'
                          : isPast
                          ? 'opacity-40 grayscale-[35%] hover:opacity-90 hover:grayscale-0'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* TEMPOS Column - Tactile Key Style */}
                      <td
                        className={`py-1 px-0.5 font-mono font-bold border-r border-slate-200 whitespace-nowrap ${
                          isCurrentActive
                            ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center leading-none">
                          <div className="flex items-center justify-center gap-0.5">
                            {isCurrentActive && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />}
                            <span className="text-[10px] sm:text-xs md:text-sm font-black">{period.slot.id}º</span>
                          </div>
                          <span className="text-[6.5px] sm:text-[7.5px] text-slate-500 font-mono mt-0.5 md:hidden">
                            {period.slot.startTime}
                          </span>
                        </div>
                      </td>

                      {/* HORÁRIO Column (visible on md+) */}
                      <td
                        className={`hidden md:table-cell py-1.5 px-1 font-mono text-[10px] md:text-xs font-bold border-r border-slate-200 whitespace-nowrap ${
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
                              className={`py-1 px-[1px] sm:px-0.5 border-r border-slate-200 last:border-r-0 text-slate-400 font-mono text-[8.5px] sm:text-[10px] ${
                                selectedTeacher ? 'opacity-20' : 'opacity-40'
                              }`}
                            >
                              {asg?.raw === 'VAGO' ? (
                                <span className="inline-block px-1 py-0.2 rounded bg-rose-50 text-rose-600 font-black border border-rose-200 text-[7.5px] sm:text-[9px]">
                                  VAGO
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                          );
                        }

                        const isAbsentCell = asg.teacher.startsWith('FALTA') || asg.raw.startsWith('FALTA');
                        const isRelievedCell = asg.teacher.startsWith('LIBERADO') || asg.subject.startsWith('Adiantada');

                        const selUpper = selectedTeacher ? selectedTeacher.name.toUpperCase() : '';
                        const asgTeacherUpper = asg.teacher.toUpperCase();
                        const asgRawUpper = asg.raw.toUpperCase();

                        // Se a célula pertence ao professor selecionado (mesmo se for uma FALTA dele, ou aula LIBERADA dele)
                        const isTargetTeacher = selectedTeacher
                          ? asgTeacherUpper === selUpper ||
                            asgTeacherUpper.includes(`(${selUpper})`) ||
                            asgTeacherUpper.includes(`FALTA (${selUpper})`) ||
                            asgTeacherUpper.includes(`FALTA: ${selUpper}`) ||
                            asgTeacherUpper.includes(`${selUpper} (LIBERADO)`) ||
                            asgRawUpper.includes(selUpper)
                          : false;

                        const isTargetSubject =
                          selectedSubject === 'TODAS' ||
                          asg.subject.toUpperCase().includes(selectedSubject.toUpperCase());

                        // Oportunidade: se a turma está vaga por falta e o professor selecionado pode adiantá-la
                        const canAdvance = isAbsentCell && selectedTeacher && !isTargetTeacher
                          ? checkCanAdvanceClass(selectedTeacher.name, currentDaySchedule, period.slot.id, cName)
                          : false;

                        const isHighlighted = isTargetTeacher && isTargetSubject;

                        // FALTAS, AULAS LIBERADAS e OPORTUNIDADES NUNCA SÃO ESMAECIDAS!
                        const isDimmed = selectedTeacher !== null && !isHighlighted && !isAbsentCell && !isRelievedCell && !canAdvance;

                        const colorClass = isAbsentCell
                          ? 'text-rose-700 font-black'
                          : isRelievedCell
                          ? 'text-emerald-700 font-black'
                          : TEACHER_COLORS_LIGHT[asg.teacher.toUpperCase()] || 'text-slate-800 font-black';

                        return (
                          <td
                            key={cName}
                            onClick={() => handleCellClick(asg, period.slot)}
                            title={
                              selectedTeacher && isHighlighted
                                ? `Clique para abrir anotações da Turma ${asg.className}`
                                : canAdvance
                                ? `Prof. ${selectedTeacher?.name} pode adiantar a aula da Turma ${asg.className}!`
                                : `Clique para focar no professor ${asg.teacher}`
                            }
                            className={`p-[1px] sm:p-0.5 md:p-1 border-r border-slate-200 last:border-r-0 transition-all duration-150 cursor-pointer overflow-hidden ${
                              isDimmed ? 'opacity-15 grayscale-[80%]' : ''
                            }`}
                          >
                            {/* Tactile Skeuomorphic / Neumorphic 3D Push Button */}
                            <div
                              className={`py-1 sm:py-1.5 px-0.5 rounded-lg sm:rounded-xl flex flex-col items-center justify-center transition-all duration-150 select-none min-h-[42px] sm:min-h-[46px] md:min-h-[44px] ${
                                isHighlighted
                                  ? isAbsentCell
                                    ? 'highlighted-cell bg-gradient-to-b from-rose-50 via-white to-rose-100/80 border-2 border-rose-500 border-b-[3px] sm:border-b-4 border-b-rose-600 ring-2 ring-rose-400 shadow-md'
                                    : isRelievedCell
                                    ? 'highlighted-cell bg-gradient-to-b from-emerald-50 via-white to-emerald-100/80 border-2 border-emerald-500 border-b-[3px] sm:border-b-4 border-b-emerald-600 ring-2 ring-emerald-400 shadow-md'
                                    : 'highlighted-cell bg-gradient-to-b from-cyan-50 via-white to-cyan-50/80 border-2 border-cyan-500 border-b-[3px] sm:border-b-4 border-b-cyan-600 shadow-[0_2px_8px_rgba(2,132,199,0.35),inset_0_1px_0_rgba(255,255,255,1)] -translate-y-0.5 active:translate-y-0.5'
                                  : canAdvance
                                  ? 'bg-gradient-to-b from-amber-50 via-amber-100/80 to-amber-200/90 border border-amber-500 border-b-2 sm:border-b-4 border-b-amber-600 ring-1 ring-amber-400 shadow-md animate-pulse'
                                  : isAbsentCell
                                  ? 'bg-gradient-to-b from-rose-50 to-rose-100/70 border border-rose-300 border-b-2 border-b-rose-400 shadow-xs'
                                  : isRelievedCell
                                  ? 'bg-gradient-to-b from-emerald-50 to-emerald-100/70 border border-emerald-300 border-b-2 border-b-emerald-400 shadow-xs'
                                  : 'bg-gradient-to-b from-white to-slate-50 border border-slate-200/90 border-b sm:border-b-2 border-b-slate-300/80 shadow-[0_1px_3px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)] hover:-translate-y-0.5 hover:border-slate-300 active:translate-y-0.5 active:border-b'
                              }`}
                            >
                              <span className={`text-[7.5px] xs:text-[8px] sm:text-[9.5px] md:text-[11px] leading-tight tracking-tighter truncate w-full flex items-center justify-center gap-0.5 ${colorClass}`}>
                                {asg.teacher}
                                {hasNote(asg.teacher, period.slot.id, cName) && (
                                  <FileText className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-amber-500 animate-pulse shrink-0" />
                                )}
                              </span>

                              {/* Badge de Oportunidade de Adiantar para o professor selecionado */}
                              {canAdvance && (
                                <span className="text-[6.5px] sm:text-[7.5px] font-mono font-black text-amber-950 bg-amber-200 border border-amber-400 px-0.5 py-0.2 rounded mt-0.5 shadow-2xs leading-none select-none">
                                  ⚡ ADIANTAR
                                </span>
                              )}

                              {/* Suffix tag (PIC, EO, PV, CL, etc.) */}
                              {!asg.isMainSubject && !canAdvance && (
                                <span className="text-[6.5px] sm:text-[8px] font-mono font-black text-amber-900 mt-0.5 bg-amber-100 px-0.5 py-0.2 rounded border border-amber-300 leading-none shadow-xs">
                                  {asg.subject}
                                </span>
                              )}

                              {/* Preview do texto anotado */}
                              {hasNote(asg.teacher, period.slot.id, cName) && (
                                <span className="text-[6.5px] sm:text-[7.5px] font-sans font-black text-amber-950 bg-amber-100/90 px-0.5 py-0.2 rounded border border-amber-200 mt-0.5 max-w-[98%] truncate text-center block leading-none select-none shadow-2xs">
                                  {getNoteContent(asg.teacher, period.slot.id, cName)}
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
