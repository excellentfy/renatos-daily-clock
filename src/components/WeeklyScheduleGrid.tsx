import React, { useState } from 'react';
import { DaySchedule, TeacherMeta, TIME_SLOTS, WEEK_DAYS } from '@/data/scheduleData';
import { Table, LayoutGrid, Calendar, Check, Search, Filter } from 'lucide-react';

interface WeeklyScheduleGridProps {
  currentDaySchedule: DaySchedule;
  selectedTeacher: TeacherMeta;
  selectedSubject: string;
  activePeriodId: number | null;
  onSelectDay: (dayName: string) => void;
}

export const WeeklyScheduleGrid: React.FC<WeeklyScheduleGridProps> = ({
  currentDaySchedule,
  selectedTeacher,
  selectedSubject,
  activePeriodId,
  onSelectDay,
}) => {
  const [viewMode, setViewMode] = useState<'DAY_MATRIX' | 'WEEK_OVERVIEW'>('DAY_MATRIX');

  return (
    <div className="rounded-2xl bg-card/60 border border-border/80 backdrop-blur-xl shadow-xl p-5 space-y-5">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Day selection tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {WEEK_DAYS.map(day => {
            const isSelected = day.dayName === currentDaySchedule.dayName;
            return (
              <button
                key={day.dayKey}
                onClick={() => onSelectDay(day.dayName)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : 'bg-secondary/40 text-muted-foreground hover:text-foreground border-border/60'
                }`}
              >
                {day.dayName}
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setViewMode('DAY_MATRIX')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
              viewMode === 'DAY_MATRIX'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-muted/30 text-muted-foreground border-border/50 hover:text-foreground'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            Matriz Completa (Turmas)
          </button>
          <button
            onClick={() => setViewMode('WEEK_OVERVIEW')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
              viewMode === 'WEEK_OVERVIEW'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-muted/30 text-muted-foreground border-border/50 hover:text-foreground'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Visão Semanal ({selectedTeacher.name})
          </button>
        </div>
      </div>

      {/* Mode 1: Complete Matrix of the Day */}
      {viewMode === 'DAY_MATRIX' && (
        <div className="overflow-x-auto rounded-xl border border-border/80 bg-background/50 shadow-inner">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-secondary/80 border-b border-border text-muted-foreground font-mono">
                <th className="p-3 text-left font-bold sticky left-0 bg-slate-900/90 backdrop-blur z-10 min-w-[110px]">
                  TEMPO / HORA
                </th>
                {currentDaySchedule.classNames.map(cName => (
                  <th key={cName} className="p-3 text-center font-black text-foreground min-w-[85px]">
                    {cName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-sans">
              {currentDaySchedule.periods.map(p => {
                const isCurrentActive = activePeriodId === p.slot.id;

                return (
                  <tr
                    key={p.slot.id}
                    className={`transition-colors ${
                      isCurrentActive ? 'bg-cyan-500/10' : 'hover:bg-muted/20'
                    }`}
                  >
                    {/* Time slot header */}
                    <td
                      className={`p-3 font-mono sticky left-0 bg-slate-900/90 backdrop-blur z-10 border-r border-border ${
                        isCurrentActive ? 'text-cyan-300 font-bold' : 'text-muted-foreground'
                      }`}
                    >
                      <div className="font-bold text-foreground">{p.slot.id}º Tempo</div>
                      <div className="text-[10px] text-muted-foreground">{p.slot.startTime}-{p.slot.endTime}</div>
                    </td>

                    {/* Class Cells */}
                    {currentDaySchedule.classNames.map(cName => {
                      const asg = p.classes[cName];
                      if (!asg || asg.isVacant) {
                        return (
                          <td key={cName} className="p-2 text-center text-muted-foreground/40 font-mono text-[11px]">
                            -
                          </td>
                        );
                      }

                      const isSelectedTeacher = asg.teacher.toUpperCase() === selectedTeacher.name.toUpperCase();
                      const matchesSubject =
                        selectedSubject === 'TODAS' || asg.subject.toUpperCase() === selectedSubject.toUpperCase();
                      const isHighlighted = isSelectedTeacher && matchesSubject;

                      return (
                        <td key={cName} className="p-1.5 text-center">
                          <div
                            className={`p-1.5 rounded-lg text-center transition-all ${
                              isHighlighted
                                ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-200 font-black shadow-[0_0_12px_rgba(0,240,255,0.4)] scale-105'
                                : isSelectedTeacher
                                ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300 font-semibold'
                                : 'bg-muted/30 text-muted-foreground hover:bg-muted/60'
                            }`}
                          >
                            <div className="text-[11px] font-bold truncate">
                              {asg.teacher}
                            </div>
                            {!asg.isMainSubject && (
                              <div className="text-[9px] font-mono font-bold text-amber-300 uppercase">
                                {asg.subject}
                              </div>
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
      )}

      {/* Mode 2: Weekly Overview for Selected Teacher */}
      {viewMode === 'WEEK_OVERVIEW' && (
        <div className="overflow-x-auto rounded-xl border border-border/80 bg-background/50 shadow-inner">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-secondary/80 border-b border-border text-muted-foreground font-mono">
                <th className="p-3 text-left font-bold sticky left-0 bg-slate-900/90 backdrop-blur z-10 min-w-[120px]">
                  TEMPO / HORA
                </th>
                {WEEK_DAYS.map(d => (
                  <th key={d.dayKey} className="p-3 text-center font-black text-foreground min-w-[120px]">
                    {d.dayName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-sans">
              {TIME_SLOTS.map(slot => {
                const isCurrentActive = activePeriodId === slot.id;

                return (
                  <tr
                    key={slot.id}
                    className={`transition-colors ${
                      isCurrentActive ? 'bg-cyan-500/10' : 'hover:bg-muted/20'
                    }`}
                  >
                    <td
                      className={`p-3 font-mono sticky left-0 bg-slate-900/90 backdrop-blur z-10 border-r border-border ${
                        isCurrentActive ? 'text-cyan-300 font-bold' : 'text-muted-foreground'
                      }`}
                    >
                      <div className="font-bold text-foreground">{slot.name}</div>
                      <div className="text-[10px] text-muted-foreground">{slot.startTime} - {slot.endTime}</div>
                    </td>

                    {WEEK_DAYS.map(day => {
                      const period = day.periods.find(p => p.slot.id === slot.id);
                      if (!period) return <td key={day.dayKey} className="p-2 text-center text-muted-foreground">-</td>;

                      // Find assignments for selected teacher
                      const teacherAssignments = Object.values(period.classes).filter(
                        asg => asg.teacher.toUpperCase() === selectedTeacher.name.toUpperCase()
                      );

                      if (teacherAssignments.length === 0) {
                        return (
                          <td key={day.dayKey} className="p-2 text-center text-muted-foreground/30 font-mono text-[11px]">
                            Janela
                          </td>
                        );
                      }

                      return (
                        <td key={day.dayKey} className="p-2">
                          <div className="space-y-1">
                            {teacherAssignments.map((asg, idx) => {
                              const matchesSubject =
                                selectedSubject === 'TODAS' ||
                                asg.subject.toUpperCase() === selectedSubject.toUpperCase();

                              return (
                                <div
                                  key={idx}
                                  className={`p-1.5 rounded-lg border text-center transition-all ${
                                    matchesSubject
                                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                                      : 'bg-muted/30 border-border/40 text-muted-foreground opacity-50'
                                  }`}
                                >
                                  <div className="text-[11px] font-black">Turma {asg.className}</div>
                                  <div className="text-[9px] font-mono text-cyan-300">
                                    {asg.isMainSubject ? 'Principal' : asg.subject}
                                  </div>
                                </div>
                              );
                            })}
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
      )}
    </div>
  );
};

export default WeeklyScheduleGrid;
