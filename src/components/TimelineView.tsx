import React, { useEffect, useRef } from 'react';
import { TIME_SLOTS, BREAK_MORNING, BREAK_LUNCH, TimeSlotConfig, TeacherAssignment } from '@/data/scheduleData';
import { Clock, CheckCircle2, AlertCircle, Coffee, Utensils, Sparkles, BookOpen, Layers } from 'lucide-react';
import gsap from 'gsap';

interface TimelinePeriodItem {
  slot: TimeSlotConfig;
  assignments: TeacherAssignment[];
  hasTeacher: boolean;
}

interface TimelineViewProps {
  periods: TimelinePeriodItem[];
  activeSlot: TimeSlotConfig | null;
  dayStatus: string;
  formattedTimeRemaining: string;
  progressPercentage: number;
  selectedTeacherColor: string;
  selectedSubject: string;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  periods,
  activeSlot,
  dayStatus,
  formattedTimeRemaining,
  progressPercentage,
  selectedTeacherColor,
  selectedSubject,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.timeline-card',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [periods, selectedSubject]);

  return (
    <div ref={containerRef} className="space-y-4">
      {periods.map((item, index) => {
        const isActive = activeSlot?.id === item.slot.id;
        const isPast = activeSlot ? item.slot.id < activeSlot.id : false;
        const isFuture = activeSlot ? item.slot.id > activeSlot.id : false;

        const showMorningBreak = item.slot.id === 3;
        const showLunchBreak = item.slot.id === 6;

        return (
          <React.Fragment key={item.slot.id}>
            {/* Morning Break Insert */}
            {showMorningBreak && (
              <div className="timeline-card p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      {BREAK_MORNING.name}
                    </div>
                    <div className="text-[11px] text-amber-400/80 font-mono">
                      {BREAK_MORNING.startTime} às {BREAK_MORNING.endTime} (20 min)
                    </div>
                  </div>
                </div>
                {dayStatus === 'MORNING_BREAK' && (
                  <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full animate-pulse">
                    EM ANDAMENTO • {formattedTimeRemaining}
                  </span>
                )}
              </div>
            )}

            {/* Lunch Break Insert */}
            {showLunchBreak && (
              <div className="timeline-card p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                      {BREAK_LUNCH.name}
                    </div>
                    <div className="text-[11px] text-indigo-400/80 font-mono">
                      {BREAK_LUNCH.startTime} às {BREAK_LUNCH.endTime} (50 min)
                    </div>
                  </div>
                </div>
                {dayStatus === 'LUNCH_BREAK' && (
                  <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-full animate-pulse">
                    EM ANDAMENTO • {formattedTimeRemaining}
                  </span>
                )}
              </div>
            )}

            {/* Period Card */}
            <div
              className={`timeline-card rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden ${
                isActive
                  ? 'bg-card/90 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50'
                  : item.hasTeacher
                  ? 'bg-card/60 border-border hover:border-border/90 hover:bg-card/80'
                  : 'bg-card/30 border-border/40 opacity-70 hover:opacity-90'
              }`}
            >
              {/* Active Pulse Glow Bar */}
              {isActive && (
                <div
                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 animate-pulse"
                />
              )}

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Time and Status */}
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold font-mono text-sm border ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                        : item.hasTeacher
                        ? 'bg-secondary text-foreground border-border'
                        : 'bg-muted/40 text-muted-foreground border-border/40'
                    }`}
                  >
                    <span>{item.slot.id}º</span>
                    <span className="text-[10px] font-normal opacity-70">TEMPO</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-foreground">
                        {item.slot.name}
                      </span>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/50 px-2 py-0.5 rounded-full animate-pulse">
                          <Sparkles className="w-3 h-3" /> AULA ATIVA AGORA
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {item.slot.startTime} às {item.slot.endTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Classes details or Vacant time */}
                <div className="flex-1 md:flex md:justify-end">
                  {item.hasTeacher ? (
                    <div className="flex flex-wrap gap-2.5 items-center">
                      {item.assignments.map((asg, aIdx) => (
                        <div
                          key={aIdx}
                          className="flex items-center gap-2.5 px-4 py-2 rounded-xl border bg-secondary/60 border-border/80 shadow-sm"
                        >
                          <div className="flex flex-col">
                            <span className="text-xs font-mono text-muted-foreground">Turma</span>
                            <span className="text-base font-black text-foreground tracking-wide">
                              {asg.className}
                            </span>
                          </div>

                          <div className="h-6 w-px bg-border/80 mx-1" />

                          <div className="flex flex-col">
                            <span className="text-xs font-mono text-muted-foreground">Matéria</span>
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                                asg.isMainSubject
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              }`}
                            >
                              {asg.isMainSubject ? '📖 Principal' : `🏷️ ${asg.subject}`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-muted/20 border border-border/30 text-muted-foreground text-xs italic">
                      <span>Sem aula atribuída para este filtro (Janela / Tempo Livre)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar for Active Period */}
              {isActive && (
                <div className="mt-4 pt-3 border-t border-border/60">
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="text-muted-foreground">Progresso do tempo: {progressPercentage}%</span>
                    <span className="text-cyan-300 font-bold">Tempo restante: {formattedTimeRemaining}</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default TimelineView;
