import React, { useState, useMemo } from 'react';
import { useScheduleTracker } from '@/hooks/useScheduleTracker';
import { getAllTeachers, getTeacherClassesForDay, TeacherMeta, WEEK_DAYS } from '@/data/scheduleData';
import ScheduleBoard3D from './ScheduleBoard3D';
import ThreeClockScene from './ThreeClockScene';
import TeacherSelector from './TeacherSelector';
import TimeSimulatorBar from './TimeSimulatorBar';
import { Clock, Calendar, Sparkles, User, Award, Flame, Filter, Eye, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ScheduleDashboard: React.FC = () => {
  const tracker = useScheduleTracker();
  const teachers = useMemo(() => getAllTeachers(), []);
  
  // Selected teacher state: null means "Todos os Professores", or a specific TeacherMeta
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherMeta | null>(() => {
    return teachers.find(t => t.name === 'RENATO') || teachers[0];
  });
  
  const [selectedSubject, setSelectedSubject] = useState<string>('TODAS');

  // Check if today is weekend
  const isWeekend = useMemo(() => {
    const d = new Date().getDay();
    return d === 0 || d === 6; // Sunday = 0, Saturday = 6
  }, []);

  const todayDayName = useMemo(() => {
    const d = new Date().getDay();
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
  }, []);

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

  // Handle celebratory confetti
  const triggerCelebration = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.75 },
      colors: selectedTeacher ? [selectedTeacher.color, '#00F0FF', '#A855F7', '#10B981'] : ['#00F0FF', '#3B82F6', '#A855F7'],
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-3 md:p-6 selection:bg-cyan-500 selection:text-black">
      <div className="max-w-[1400px] mx-auto space-y-5">
        
        {/* Top Header Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-xl shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3 text-cyan-400" /> Grade Oficial 2026
              </span>
              {isWeekend && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Hoje é {todayDayName} (Fim de semana)
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300">
              Controle de Horários Escolares 2026
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Quadro de horários 3D interativo com foco seletivo por professor e disciplinas
            </p>
          </div>

          {/* Clock & Day quick selector */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Day Selector Pills */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
              {WEEK_DAYS.map(day => {
                const isSelected = day.dayName === tracker.selectedDayName;
                return (
                  <button
                    key={day.dayKey}
                    onClick={() => tracker.setSelectedDayName(day.dayName)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.5)] font-black'
                        : 'text-muted-foreground hover:text-foreground hover:bg-slate-800'
                    }`}
                  >
                    {day.dayName}
                  </button>
                );
              })}
            </div>

            {/* System Digital Clock */}
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-border flex items-center gap-2.5 shadow-inner">
              <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-mono text-muted-foreground font-semibold">
                  Relógio
                </span>
                <span className="text-sm font-black font-mono text-cyan-300">
                  {tracker.formattedCurrentTime}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Weekend Banner if applicable */}
        {isWeekend && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-amber-950/40 border border-amber-500/40 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-amber-200">
                  Hoje é {todayDayName} • Sem aulas letivas no momento
                </div>
                <div className="text-xs text-amber-400/80">
                  Você está visualizando a grade de <strong>{tracker.selectedDayName}</strong>. Use os botões acima para navegar entre os dias da semana.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Teacher Selection & Filter Bar */}
        <div className="p-4 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Quick Teacher Buttons Carousel */}
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  Selecione o Professor para Foco no Quadro:
                </span>
                
                {selectedTeacher && (
                  <button
                    onClick={() => {
                      setSelectedTeacher(null);
                      setSelectedSubject('TODAS');
                    }}
                    className="text-[11px] font-mono text-cyan-400 hover:underline font-semibold"
                  >
                    Mostrar Todos os Professores (Limpar Foco)
                  </button>
                )}
              </div>

              {/* Teacher Avatar Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                <button
                  onClick={() => {
                    setSelectedTeacher(null);
                    setSelectedSubject('TODAS');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    selectedTeacher === null
                      ? 'bg-slate-100 text-slate-950 border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                      : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground border-border/60'
                  }`}
                >
                  🌐 Todos os Professores
                </button>

                {teachers.map(t => {
                  const isCurrent = selectedTeacher?.name === t.name;
                  return (
                    <button
                      key={t.name}
                      onClick={() => {
                        setSelectedTeacher(t);
                        setSelectedSubject('TODAS');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                        isCurrent
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.4)] font-black scale-105'
                          : 'border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Active Status Badge & Summary */}
            {selectedTeacher && (
              <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl min-w-[220px]">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow"
                  style={{
                    background: `linear-gradient(135deg, ${selectedTeacher.color}, #0f172a)`,
                    boxShadow: `0 0 10px ${selectedTeacher.color}55`,
                  }}
                >
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">
                    Aulas em {tracker.selectedDayName}
                  </div>
                  <div className="text-base font-black text-foreground" style={{ color: selectedTeacher.color }}>
                    {classesCountToday} aula(s) hoje
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Subject Filter Sub-Bar (When a teacher is selected) */}
          {selectedTeacher && (
            <div className="pt-2 border-t border-border/60 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1 mr-1">
                <Layers className="w-3 h-3 text-cyan-400" />
                Matéria do Professor {selectedTeacher.name}:
              </span>

              {['TODAS', ...selectedTeacher.subjects].map(subject => {
                const isSelected = selectedSubject.toUpperCase() === subject.toUpperCase();
                const isMain = subject === 'Principal';

                return (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                        : 'bg-secondary/40 text-muted-foreground hover:text-foreground border-border/60'
                    }`}
                  >
                    {subject === 'TODAS'
                      ? '⚡ Todas as Matérias'
                      : isMain
                      ? `📖 Principal (${selectedTeacher.name})`
                      : `🏷️ ${subject}`}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Time Simulator Bar (Test mode / scrubber) */}
        <TimeSimulatorBar
          isSimulating={tracker.isSimulating}
          onToggleSimulating={tracker.setIsSimulating}
          simulatedMinutes={tracker.simulatedMinutes}
          onSetSimulatedMinutes={tracker.setSimulatedMinutes}
          currentTimeString={tracker.formattedCurrentTime}
        />

        {/* MAIN HERO CENTERPIECE: 3D SCHEDULE BOARD */}
        <section className="space-y-2">
          <ScheduleBoard3D
            currentDaySchedule={tracker.currentDaySchedule}
            selectedTeacher={selectedTeacher}
            selectedSubject={selectedSubject}
            activePeriodId={tracker.statusInfo.activeSlot?.id || null}
            activeStatus={tracker.statusInfo.status}
            formattedTimeRemaining={tracker.formattedTimeRemaining}
            isTodayWeekend={isWeekend}
            onSelectTeacherByName={handleSelectTeacherByName}
          />
        </section>

        {/* Secondary Info Grid: 3D Hologram Scene + Active Timeline Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
          {/* 3D Orbit Time Scene */}
          <div className="lg:col-span-1">
            <ThreeClockScene
              primaryColor={selectedTeacher ? selectedTeacher.color : '#00F0FF'}
              activePeriodIndex={tracker.statusInfo.activeSlot?.id || null}
              progress={tracker.statusInfo.progress}
            />
          </div>

          {/* Real-time Status and Teacher Schedule Timeline */}
          <div className="lg:col-span-2 space-y-3">
            <div className="p-4 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-xl shadow-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground">
                  Tempo Letivo Atual
                </span>
                <div className="text-lg font-black text-foreground flex items-center gap-2">
                  <span>{tracker.statusInfo.label}</span>
                  {tracker.statusInfo.secondsRemaining > 0 && (
                    <span className="text-xs font-mono font-bold bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                      Faltam {tracker.formattedTimeRemaining}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">
                  {tracker.statusInfo.sublabel}
                </div>
              </div>

              <button
                onClick={triggerCelebration}
                title="Comemorar"
                className="p-3 rounded-2xl bg-secondary hover:bg-secondary/80 border border-border text-foreground transition-all hover:scale-105 active:scale-95 shadow"
              >
                <Award className="w-5 h-5 text-amber-400" />
              </button>
            </div>

            {/* Quick Summary of Teacher's Day */}
            {selectedTeacher && (
              <div className="p-4 rounded-2xl bg-card/40 border border-border/60 backdrop-blur-md">
                <div className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Resumo das Aulas de {selectedTeacher.name} em {tracker.selectedDayName}:
                </div>

                {teacherDayPeriods.filter(p => p.hasTeacher).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {teacherDayPeriods
                      .filter(p => p.hasTeacher)
                      .map(p => (
                        <div
                          key={p.slot.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                            tracker.statusInfo.activeSlot?.id === p.slot.id
                              ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                              : 'bg-secondary/40 border-border/60'
                          }`}
                        >
                          <div className="font-mono">
                            <strong className="text-foreground">{p.slot.id}º Tempo</strong> ({p.slot.startTime})
                          </div>
                          <div className="flex items-center gap-1.5">
                            {p.assignments.map((asg, aIdx) => (
                              <span
                                key={aIdx}
                                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-bold text-cyan-300"
                              >
                                Turma {asg.className} {!asg.isMainSubject && `(${asg.subject})`}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground italic py-2">
                    Nenhuma aula para {selectedTeacher.name} em {tracker.selectedDayName} com o filtro selecionado.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-6 pb-4 text-center text-xs text-muted-foreground/60 border-t border-border/40 font-mono">
          Sistema de Horários 2026 • Quadro Oficial 3D • Desenvolvido com Three.js, GSAP & Motion Design
        </footer>
      </div>
    </div>
  );
};

export default ScheduleDashboard;