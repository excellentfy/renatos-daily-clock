import React, { useRef, useState, useEffect } from 'react';
import { DaySchedule, TeacherMeta, TimeSlotConfig, TeacherAssignment } from '@/data/scheduleData';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [notesVersion, setNotesVersion] = useState(0);

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

        {/* The Official Schedule Table Matrix - Tactile Button Grid (Desktop/Tablet) */}
        <div className="hidden md:block w-full overflow-x-auto">
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
                          activeStatus === 'MORNING_BREAK' ? 'bg-amber-200 text-slate-950 font-black' : 'bg-amber-50 text-amber-900'
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
                          activeStatus === 'LUNCH_BREAK' ? 'bg-amber-200 text-slate-950 font-black' : 'bg-sky-50 text-sky-900'
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
                              <span className={`text-[10px] md:text-[11px] leading-tight tracking-tight truncate w-full flex items-center justify-center gap-1 ${colorClass}`}>
                                {asg.teacher}
                                {hasNote(asg.teacher, period.slot.id, cName) && (
                                  <FileText className="w-2.5 h-2.5 text-amber-500 animate-pulse shrink-0" />
                                )}
                              </span>

                              {/* Suffix tag (PIC, EO, PV, CL, etc.) */}
                              {!asg.isMainSubject && (
                                <span className="text-[8px] md:text-[9px] font-mono font-black text-amber-900 mt-0.5 bg-amber-100 px-1 py-0.2 rounded border border-amber-300 border-b-2 border-b-amber-400 leading-none shadow-xs">
                                  {asg.subject}
                                </span>
                              )}

                              {/* Preview do texto anotado */}
                              {hasNote(asg.teacher, period.slot.id, cName) && (
                                <span className="text-[7.5px] font-sans font-black text-amber-950 bg-amber-100/90 px-1 py-0.5 rounded border border-amber-200 mt-1 max-w-[95%] truncate text-center block leading-none select-none shadow-2xs">
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

        {/* Mobile Responsive Version - Elegant Card Grid (block md:hidden) */}
        <div className="block md:hidden p-3.5 space-y-4 bg-slate-50/50">
          {currentDaySchedule.periods.map(period => {
            const isCurrentActive = activePeriodId === period.slot.id;

            return (
              <React.Fragment key={period.slot.id}>
                {/* RECREIO (entre 2º e 3º tempo) */}
                {period.slot.id === 3 && (
                  <div
                    className={`p-3 rounded-2xl border transition-all ${
                      activeStatus === 'MORNING_BREAK'
                        ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-500 shadow-md'
                        : 'bg-amber-50/70 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-amber-200 text-amber-950 font-black text-[10px]">☕ RECREIO</span>
                        <span className="text-xs font-bold text-slate-700">09:10 às 09:30</span>
                      </div>
                      {activeStatus === 'MORNING_BREAK' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono text-[9px] font-black animate-pulse shadow-sm">
                          Restam {formattedTimeRemaining}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-bold text-amber-950 mt-1.5 uppercase tracking-wide">
                      Intervalo / Recreio (20 min)
                    </div>
                  </div>
                )}

                {/* ALMOÇO (entre 5º e 6º tempo) */}
                {period.slot.id === 6 && (
                  <div
                    className={`p-3 rounded-2xl border transition-all ${
                      activeStatus === 'LUNCH_BREAK'
                        ? 'bg-sky-100 border-sky-400 ring-2 ring-sky-500 shadow-md'
                        : 'bg-sky-50/70 border-sky-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-sky-200 text-sky-950 font-black text-[10px]">🍽️ ALMOÇO</span>
                        <span className="text-xs font-bold text-slate-700">12:00 às 12:50</span>
                      </div>
                      {activeStatus === 'LUNCH_BREAK' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono text-[9px] font-black animate-pulse shadow-sm">
                          Restam {formattedTimeRemaining}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-bold text-sky-950 mt-1.5 uppercase tracking-wide">
                      Intervalo de Almoço (50 min)
                    </div>
                  </div>
                )}

                {/* Card do tempo letivo */}
                <div
                  className={`rounded-2xl border overflow-hidden transition-all shadow-sm ${
                    isCurrentActive
                      ? 'border-amber-400 ring-2 ring-amber-500 bg-amber-50/20'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {/* Header do Card (Tempo e Horário) */}
                  <div
                    className={`px-3 py-1.5 flex items-center justify-between border-b ${
                      isCurrentActive
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'bg-slate-100 text-slate-700 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isCurrentActive && <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />}
                      <span className="text-xs font-mono uppercase tracking-wider">{period.slot.id}º Tempo</span>
                    </div>
                    <span className="text-xs font-mono font-bold">{period.slot.startTime} - {period.slot.endTime}</span>
                  </div>

                  {/* Grid de turmas (2 colunas para garantir excelente espaço lateral de leitura sem truncation) */}
                  <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50/30">
                    {currentDaySchedule.classNames.map(cName => {
                      const asg = period.classes[cName];
                      const isEmpty = !asg || asg.isVacant;

                      if (isEmpty) {
                        return (
                          <div
                            key={cName}
                            className={`p-2 rounded-xl border border-dashed border-slate-200 flex flex-col justify-center items-center text-slate-400 min-h-[56px] ${
                              selectedTeacher ? 'opacity-20' : 'opacity-40'
                            }`}
                          >
                            <span className="text-[9px] font-bold text-slate-400">Turma {cName}</span>
                            <span className="text-[10px] font-mono mt-0.5">
                              {asg?.raw === 'VAGO' ? <span className="text-rose-500 font-bold">VAGO</span> : '-'}
                            </span>
                          </div>
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
                        <div
                          key={cName}
                          onClick={() => handleCellClick(asg, period.slot)}
                          className={`p-2.5 rounded-2xl transition-all duration-150 cursor-pointer min-h-[64px] flex flex-col justify-between select-none ${
                            isDimmed ? 'opacity-15 grayscale-[80%]' : ''
                          } ${
                            isHighlighted
                              ? 'bg-gradient-to-b from-cyan-50 via-white to-cyan-50/80 border-2 border-cyan-500 border-b-[5px] border-b-cyan-600 shadow-[0_6px_12px_rgba(2,132,199,0.3),inset_0_1px_0_rgba(255,255,255,1)] -translate-y-0.5'
                              : 'bg-gradient-to-b from-white to-slate-50 border border-slate-200/90 border-b-[4px] border-b-slate-300 shadow-[0_4px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] hover:-translate-y-0.5 active:translate-y-[1px] active:border-b-[2px] active:shadow-inner'
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1 py-0.2 rounded">
                              T. {cName}
                            </span>
                            {!asg.isMainSubject && (
                              <span className="text-[8px] font-mono font-black text-amber-900 bg-amber-100 border border-amber-200 px-1 py-0.2 rounded scale-90 origin-right">
                                {asg.subject}
                              </span>
                            )}
                          </div>
                          <span className={`text-[13.5px] leading-tight font-black mt-1.5 break-words flex items-center gap-1.5 uppercase tracking-wide drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.22)] ${colorClass}`}>
                            {asg.teacher}
                            {hasNote(asg.teacher, period.slot.id, cName) && (
                              <FileText className="w-3 h-3 text-amber-500 animate-pulse shrink-0 drop-shadow-none" />
                            )}
                          </span>

                          {/* Preview do texto anotado no mobile */}
                          {hasNote(asg.teacher, period.slot.id, cName) && (
                            <span className="text-[9px] font-sans font-bold text-amber-950 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-200 mt-1 max-w-full break-words text-left block leading-tight shadow-3xs">
                              {getNoteContent(asg.teacher, period.slot.id, cName)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
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
