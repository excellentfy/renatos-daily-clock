import React, { useState, useMemo } from 'react';
import { useScheduleTracker } from '@/hooks/useScheduleTracker';
import { getAllTeachers, getTeacherClassesForDay, TeacherMeta, WEEK_DAYS, TimeSlotConfig, TeacherAssignment } from '@/data/scheduleData';
import ScheduleBoard3D from './ScheduleBoard3D';
import TeacherSelector from './TeacherSelector';
import TimeSimulatorBar from './TimeSimulatorBar';
import GetLogo3D from './GetLogo3D';
import WeatherWidget3D from './WeatherWidget3D';
import ClassNotesModal from './ClassNotesModal';
import { Clock, Calendar, Sparkles, Award, Flame, BookOpen, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ScheduleDashboard: React.FC = () => {
  const tracker = useScheduleTracker();
  const teachers = useMemo(() => getAllTeachers(), []);
  
  // Selected teacher state: null means "Todos os Professores", or a specific TeacherMeta
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherMeta | null>(() => {
    return teachers.find(t => t.name === 'RENATO') || teachers[0];
  });
  
  const [selectedSubject, setSelectedSubject] = useState<string>('TODAS');

  // Class Notes Modal State
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [activeNoteSlot, setActiveNoteSlot] = useState<TimeSlotConfig | null>(null);
  const [activeNoteAssignment, setActiveNoteAssignment] = useState<TeacherAssignment | null>(null);

  const isWeekend = useMemo(() => {
    const d = tracker.now.getDay();
    return d === 0 || d === 6; // Sunday = 0, Saturday = 6
  }, [tracker.now]);

  // Teacher classes for current selected day
  const teacherDayPeriods = useMemo(() => {
    if (!selectedTeacher) return [];
    return getTeacherClassesForDay(selectedTeacher.name, tracker.selectedDayName, selectedSubject);
  }, [selectedTeacher, tracker.selectedDayName, selectedSubject]);

  const classesCountToday = useMemo(() => {
    return teacherDayPeriods.reduce((acc, p) => acc + p.assignments.length, 0);
  }, [teacherDayPeriods]);

  const handleSelectTeacherByName = (name: string) => {
    const found = teachers.find(t => t.name.toUpperCase() === name.toUpperCase());
    if (found) {
      setSelectedTeacher(found);
      setSelectedSubject('TODAS');
    }
  };

  const handleOpenClassNotes = (slot: TimeSlotConfig, assignment: TeacherAssignment) => {
    setActiveNoteSlot(slot);
    setActiveNoteAssignment(assignment);
    setNotesModalOpen(true);
  };

  // Handle celebratory confetti
  const triggerCelebration = () => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#00BFFF', '#FACC15', '#FF3366', '#0f172a'],
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-2 sm:p-4 md:p-6 selection:bg-[#00bfff] selection:text-black">
      <div className="max-w-[1440px] mx-auto space-y-4">
        
        {/* Top Header with 3D G-E-T Logo in top-left, Days of Week, Clock & 3D Weather Widget */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 md:p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          {/* Top Left: Official 3D G-E-T Logo */}
          <GetLogo3D />

          {/* Center/Right: Clickable Days of the Week Navigation */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-2 hidden sm:inline">
                Dia:
              </span>
              {WEEK_DAYS.map(day => {
                const isSelected = day.dayName === tracker.selectedDayName;
                return (
                  <button
                    key={day.dayKey}
                    onClick={() => tracker.setSelectedDayName(day.dayName)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#00bfff] text-slate-950 shadow-md font-black scale-105'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-white'
                    }`}
                  >
                    {day.dayName}
                  </button>
                );
              })}
            </div>

            {/* Direct Link to Rioeduca Diário */}
            <a
              href="https://diario.rioeduca.rio.gov.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-b from-[#0284c7] via-[#0369a1] to-[#075985] text-white border border-cyan-400 border-b-[3px] border-b-cyan-900 flex items-center gap-1.5 text-xs font-black shadow-md hover:brightness-110 active:translate-y-0.5 active:border-b transition-all select-none"
              title="Abrir Diário Rioeduca em nova aba"
            >
              <BookOpen className="w-4 h-4 text-white" />
              <span>Diário</span>
              <ExternalLink className="w-3 h-3 text-cyan-200" />
            </a>

            {/* Brasília Time Digital Clock */}
            <div className="px-3 py-1.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2 shadow-sm">
              <Clock className="w-4 h-4 text-[#0284c7] animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[8px] uppercase font-mono text-slate-500 font-semibold leading-tight">
                  Horário Oficial (BR)
                </span>
                <span className="text-xs md:text-sm font-black font-mono text-slate-900 leading-none">
                  {tracker.formattedCurrentTime}
                </span>
              </div>
            </div>

            {/* Top Right: 3D HG Weather Widget */}
            <WeatherWidget3D />
          </div>
        </header>

        {/* 1. TEACHER & SUBJECT SELECTOR (Directly at top, wrapped, NO horizontal drag) */}
        <TeacherSelector
          teachers={teachers}
          selectedTeacher={selectedTeacher}
          onSelectTeacher={setSelectedTeacher}
          selectedSubject={selectedSubject}
          onSelectSubject={setSelectedSubject}
          classesCountToday={classesCountToday}
          currentDayName={tracker.selectedDayName}
        />

        {/* 2. MAIN HERO CENTERPIECE: 3D SCHEDULE BOARD (Directly below teacher selector) */}
        <main className="w-full">
          <ScheduleBoard3D
            currentDaySchedule={tracker.currentDaySchedule}
            selectedTeacher={selectedTeacher}
            selectedSubject={selectedSubject}
            activePeriodId={tracker.statusInfo.activeSlot?.id || null}
            activeStatus={tracker.statusInfo.status}
            formattedTimeRemaining={tracker.formattedTimeRemaining}
            isTodayWeekend={isWeekend}
            effectiveMinutes={tracker.effectiveMinutes}
            isTodaySelected={tracker.isTodaySelected}
            onSelectTeacherByName={handleSelectTeacherByName}
            onOpenClassNotes={handleOpenClassNotes}
          />
        </main>

        {/* 3. SIMULATOR BAR (Time Travel Testing below the board) */}
        <TimeSimulatorBar
          isSimulating={tracker.isSimulating}
          onToggleSimulating={tracker.setIsSimulating}
          simulatedMinutes={tracker.simulatedMinutes}
          onSetSimulatedMinutes={tracker.setSimulatedMinutes}
          currentTimeString={tracker.formattedCurrentTime}
        />

        {/* 4. REAL-TIME PERIOD STATUS CARD & TEACHER DAILY TIMELINE SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Live Period Banner */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                Tempo Letivo Atual
              </span>
              <div className="text-base md:text-lg font-black text-slate-900 flex items-center gap-2 mt-0.5">
                <span>{tracker.statusInfo.label}</span>
                {tracker.statusInfo.secondsRemaining > 0 && (
                  <span className="text-xs font-mono font-black bg-amber-300 text-slate-950 px-2 py-0.5 rounded-lg shadow-sm">
                    Faltam {tracker.formattedTimeRemaining}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                {tracker.statusInfo.sublabel}
              </div>
            </div>

            <button
              onClick={triggerCelebration}
              title="Comemorar"
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <Award className="w-5 h-5 text-amber-500" />
            </button>
          </div>

          {/* Quick List of Teacher Classes for Today */}
          {selectedTeacher ? (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="text-xs font-bold uppercase text-slate-600 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Aulas de {selectedTeacher.name} em {tracker.selectedDayName}:
                </span>
                <span className="text-[11px] font-mono text-[#0284c7] font-bold">
                  {classesCountToday} aula(s)
                </span>
              </div>

              {teacherDayPeriods.filter(p => p.hasTeacher).length > 0 ? (
                <div className="flex flex-col gap-2">
                  {teacherDayPeriods
                    .filter(p => p.hasTeacher)
                    .map(p => (
                      <div
                        key={p.slot.id}
                        onClick={() => {
                          if (p.assignments[0]) {
                            handleOpenClassNotes(p.slot, p.assignments[0]);
                          }
                        }}
                        className={`p-2 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all hover:border-cyan-500 ${
                          tracker.statusInfo.activeSlot?.id === p.slot.id
                            ? 'bg-amber-100 border-amber-400 font-bold shadow-sm'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="font-mono">
                          <strong className="text-slate-900">{p.slot.id}º Tempo</strong> ({p.slot.startTime})
                        </div>
                        <div className="flex items-center gap-1.5">
                          {p.assignments.map((asg, aIdx) => (
                            <span
                              key={aIdx}
                              className="px-2 py-0.5 rounded bg-white border border-slate-300 font-black text-[#0284c7] text-[11px]"
                            >
                              Turma {asg.className} {!asg.isMainSubject && `(${asg.subject})`}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic py-1">
                  Nenhuma aula para {selectedTeacher.name} em {tracker.selectedDayName} com o filtro selecionado.
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-xs text-slate-500">
              Modo Geral: Visualizando todos os professores no quadro acima.
            </div>
          )}
        </div>

        {/* Modal de Anotações de Aula */}
        <ClassNotesModal
          isOpen={notesModalOpen}
          onClose={() => setNotesModalOpen(false)}
          teacherName={selectedTeacher ? selectedTeacher.name : ''}
          teacherColor={selectedTeacher ? selectedTeacher.color : '#0284c7'}
          dayName={tracker.selectedDayName}
          slot={activeNoteSlot}
          assignment={activeNoteAssignment}
        />

        {/* Footer */}
        <footer className="pt-4 pb-2 text-center text-[11px] text-slate-400 font-mono border-t border-slate-200">
          GINÁSIO EDUCACIONAL TECNOLÓGICO VENEZUELA • Sistema Oficial de Horários 2026
        </footer>
      </div>
    </div>
  );
};

export default ScheduleDashboard;