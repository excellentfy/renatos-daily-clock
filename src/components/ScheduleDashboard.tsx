import React, { useState, useMemo } from 'react';
import { useScheduleTracker } from '@/hooks/useScheduleTracker';
import { getAllTeachers, getTeacherClassesForDay, TeacherMeta, WEEK_DAYS, TimeSlotConfig, TeacherAssignment } from '@/data/scheduleData';
import ScheduleBoard3D from './ScheduleBoard3D';
import ThreeClockScene from './ThreeClockScene';
import TeacherSelector from './TeacherSelector';
import TimeSimulatorBar from './TimeSimulatorBar';
import GetLogo3D from './GetLogo3D';
import ClassNotesModal from './ClassNotesModal';
import { Clock, Calendar, Sparkles, User, Award, Flame, Sliders, Bell } from 'lucide-react';
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

  // Check if today is weekend
  const isWeekend = useMemo(() => {
    const d = tracker.now.getDay();
    return d === 0 || d === 6; // Sunday = 0, Saturday = 6
  }, [tracker.now]);

  const todayDayName = useMemo(() => {
    const d = tracker.now.getDay();
    const map: Record<number, string> = {
      0: 'DOMINGO',
      1: '2ª FEIRA',
      2: '3ª FEIRA',
      3: '4ª FEIRA',
      4: '5ª FEIRA',
      5: '6ª FEIRA',
      6: 'SÁBADO',
    };
    return map[d] || '2ª FEIRA';
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
      colors: selectedTeacher ? [selectedTeacher.color, '#00F0FF', '#FACC15', '#FF3366'] : ['#00F0FF', '#FACC15', '#FF3366'],
    });
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-2 sm:p-4 md:p-6 selection:bg-cyan-400 selection:text-black">
      <div className="max-w-[1440px] mx-auto space-y-4">
        
        {/* Top Header with 3D G-E-T Logo in top-left, Day Picker & Real-time Clock */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 md:p-4 rounded-2xl bg-[#090f26]/90 border border-slate-700/80 backdrop-blur-xl shadow-2xl">
          {/* Top Left: Official 3D G-E-T Logo */}
          <GetLogo3D />

          {/* Right Header Area: Day Selector & System Clock */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {/* Day Selector Pills */}
            <div className="flex items-center gap-1 bg-slate-900/95 p-1 rounded-xl border border-slate-800">
              {WEEK_DAYS.map(day => {
                const isSelected = day.dayName === tracker.selectedDayName;
                return (
                  <button
                    key={day.dayKey}
                    onClick={() => tracker.setSelectedDayName(day.dayName)}
                    className={`px-2.5 md:px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.6)] font-black'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {day.dayName}
                  </button>
                );
              })}
            </div>

            {/* Brasília Time Digital Clock */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 flex items-center gap-2 shadow-inner">
              <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[8px] uppercase font-mono text-slate-400 font-semibold leading-tight">
                  Horário Oficial (BR)
                </span>
                <span className="text-xs md:text-sm font-black font-mono text-cyan-300 leading-none">
                  {tracker.formattedCurrentTime}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Weekend Banner if today is Saturday/Sunday */}
        {isWeekend && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-amber-950/40 border border-amber-500/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <strong className="text-amber-200">Hoje é {todayDayName} (Fim de Semana)</strong> — Sem aulas letivas no momento.
                <span className="text-slate-300 block sm:inline sm:ml-1">
                  Exibindo grade de <strong>{tracker.selectedDayName}</strong>.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 1. TEACHER & SUBJECT SELECTOR (At the top, wrapped, NO horizontal drag) */}
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
            onSelectTeacherByName={handleSelectTeacherByName}
            onOpenClassNotes={handleOpenClassNotes}
          />
        </main>

        {/* 3. SIMULATOR BAR (Time Travel Testing) */}
        <TimeSimulatorBar
          isSimulating={tracker.isSimulating}
          onToggleSimulating={tracker.setIsSimulating}
          simulatedMinutes={tracker.simulatedMinutes}
          onSetSimulatedMinutes={tracker.setSimulatedMinutes}
          currentTimeString={tracker.formattedCurrentTime}
        />

        {/* 4. SECONDARY SECTION: 3D Holographic Visualizer & Active Status Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
          {/* 3D Hologram Clock */}
          <div className="lg:col-span-1">
            <ThreeClockScene
              primaryColor={selectedTeacher ? selectedTeacher.color : '#00F0FF'}
              activePeriodIndex={tracker.statusInfo.activeSlot?.id || null}
              progress={tracker.statusInfo.progress}
            />
          </div>

          {/* Real-time Status Card & Teacher Daily Classes Timeline */}
          <div className="lg:col-span-2 space-y-3">
            {/* Live Period Banner */}
            <div className="p-4 rounded-2xl bg-[#090f26]/80 border border-slate-700/80 backdrop-blur-xl shadow-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                  Tempo Letivo Atual
                </span>
                <div className="text-base md:text-lg font-black text-white flex items-center gap-2 mt-0.5">
                  <span>{tracker.statusInfo.label}</span>
                  {tracker.statusInfo.secondsRemaining > 0 && (
                    <span className="text-xs font-mono font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-lg shadow-sm">
                      Faltam {tracker.formattedTimeRemaining}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  {tracker.statusInfo.sublabel}
                </div>
              </div>

              <button
                onClick={triggerCelebration}
                title="Comemorar"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white transition-all hover:scale-105 active:scale-95 shadow"
              >
                <Award className="w-5 h-5 text-amber-400" />
              </button>
            </div>

            {/* Quick List of Teacher Classes for Today */}
            {selectedTeacher && (
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
                <div className="text-xs font-bold uppercase text-slate-400 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    Aulas de {selectedTeacher.name} em {tracker.selectedDayName}:
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400">
                    {classesCountToday} aula(s)
                  </span>
                </div>

                {teacherDayPeriods.filter(p => p.hasTeacher).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all hover:border-cyan-400 ${
                            tracker.statusInfo.activeSlot?.id === p.slot.id
                              ? 'bg-amber-400/20 border-amber-400 shadow-[0_0_12px_rgba(250,204,21,0.3)]'
                              : 'bg-slate-900/80 border-slate-800'
                          }`}
                        >
                          <div className="font-mono">
                            <strong className="text-white">{p.slot.id}º Tempo</strong> ({p.slot.startTime})
                          </div>
                          <div className="flex items-center gap-1.5">
                            {p.assignments.map((asg, aIdx) => (
                              <span
                                key={aIdx}
                                className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 font-bold text-cyan-300 text-[11px]"
                              >
                                Turma {asg.className} {!asg.isMainSubject && `(${asg.subject})`}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic py-1">
                    Nenhuma aula para {selectedTeacher.name} em {tracker.selectedDayName} com o filtro selecionado.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal de Anotações de Aula */}
        <ClassNotesModal
          isOpen={notesModalOpen}
          onClose={() => setNotesModalOpen(false)}
          teacherName={selectedTeacher ? selectedTeacher.name : ''}
          teacherColor={selectedTeacher ? selectedTeacher.color : '#00F0FF'}
          dayName={tracker.selectedDayName}
          slot={activeNoteSlot}
          assignment={activeNoteAssignment}
        />

        {/* Footer */}
        <footer className="pt-4 pb-2 text-center text-[11px] text-slate-500 font-mono border-t border-slate-800/60">
          GINÁSIO EDUCACIONAL TECNOLÓGICO VENEZUELA • Sistema Oficial de Horários 2026
        </footer>
      </div>
    </div>
  );
};

export default ScheduleDashboard;