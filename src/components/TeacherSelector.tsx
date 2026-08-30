import React, { useEffect, useRef } from 'react';
import { TeacherMeta } from '@/data/scheduleData';
import { User, BookOpen, Layers, Sparkles, ChevronRight, Check } from 'lucide-react';
import gsap from 'gsap';

interface TeacherSelectorProps {
  teachers: TeacherMeta[];
  selectedTeacher: TeacherMeta;
  onSelectTeacher: (teacher: TeacherMeta) => void;
  selectedSubject: string;
  onSelectSubject: (subject: string) => void;
  classesCountToday: number;
}

export const TeacherSelector: React.FC<TeacherSelectorProps> = ({
  teachers,
  selectedTeacher,
  onSelectTeacher,
  selectedSubject,
  onSelectSubject,
  classesCountToday,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

  // GSAP animation when selected teacher changes
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.teacher-badge-anim',
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.7)' }
      );
      if (chipsRef.current) {
        gsap.fromTo(
          chipsRef.current.children,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [selectedTeacher.name]);

  const subjectOptions = ['TODAS', ...selectedTeacher.subjects];

  return (
    <div
      ref={containerRef}
      className="p-5 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-xl shadow-xl space-y-4 relative overflow-hidden transition-all"
    >
      {/* Dynamic ambient background glow */}
      <div
        className="absolute -right-20 -top-20 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: selectedTeacher.color }}
      />

      {/* Top Bar: Active Teacher Banner & Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-lg teacher-badge-anim relative"
            style={{
              background: `linear-gradient(135deg, ${selectedTeacher.color}, #1e293b)`,
              boxShadow: `0 0 15px ${selectedTeacher.color}55`,
            }}
          >
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" style={{ color: selectedTeacher.color }} /> Professor Selecionado
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              {selectedTeacher.name}
            </h2>
          </div>
        </div>

        {/* Quick Teacher Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="teacher-select" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            Trocar Professor:
          </label>
          <select
            id="teacher-select"
            value={selectedTeacher.name}
            onChange={e => {
              const found = teachers.find(t => t.name === e.target.value);
              if (found) {
                onSelectTeacher(found);
                onSelectSubject('TODAS');
              }
            }}
            className="bg-secondary/70 hover:bg-secondary border border-border text-foreground text-sm font-semibold rounded-xl px-3.5 py-2 outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer shadow-inner"
          >
            {teachers.map(t => (
              <option key={t.name} value={t.name} className="bg-slate-900 text-foreground py-1">
                {t.name} ({t.totalClassesPerWeek} aulas/sem)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Teacher Avatar Pill Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted">
        {teachers.map(t => {
          const isCurrent = t.name === selectedTeacher.name;
          return (
            <button
              key={t.name}
              onClick={() => {
                onSelectTeacher(t);
                onSelectSubject('TODAS');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                isCurrent
                  ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: t.color }}
              />
              {t.name}
            </button>
          );
        })}
      </div>

      {/* Subject Filter Section */}
      <div className="pt-2 border-t border-border/60">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            Foco por Disciplina ({selectedTeacher.subjects.length + 1} opções):
          </span>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-full">
            {classesCountToday} aula(s) hoje
          </span>
        </div>

        <div ref={chipsRef} className="flex flex-wrap gap-2">
          {subjectOptions.map(subject => {
            const isSelected = selectedSubject.toUpperCase() === subject.toUpperCase();
            const isMain = subject === 'Principal';

            return (
              <button
                key={subject}
                onClick={() => onSelectSubject(subject)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(0,240,255,0.4)] scale-105'
                    : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary border-border/70'
                }`}
              >
                {isSelected ? <Check className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5 opacity-60" />}
                <span>
                  {subject === 'TODAS'
                    ? '⚡ Todas as Matérias'
                    : isMain
                    ? `📖 Matéria Principal (${selectedTeacher.name})`
                    : `🏷️ Sigla: ${subject}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeacherSelector;
