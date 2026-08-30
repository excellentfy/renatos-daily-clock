import React, { useEffect, useRef } from 'react';
import { TeacherMeta } from '@/data/scheduleData';
import { User, BookOpen, Layers, Sparkles, Check, Globe } from 'lucide-react';
import gsap from 'gsap';

interface TeacherSelectorProps {
  teachers: TeacherMeta[];
  selectedTeacher: TeacherMeta | null;
  onSelectTeacher: (teacher: TeacherMeta | null) => void;
  selectedSubject: string;
  onSelectSubject: (subject: string) => void;
  classesCountToday: number;
  currentDayName: string;
}

export const TeacherSelector: React.FC<TeacherSelectorProps> = ({
  teachers,
  selectedTeacher,
  onSelectTeacher,
  selectedSubject,
  onSelectSubject,
  classesCountToday,
  currentDayName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

  // GSAP animation when selected teacher changes
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.teacher-badge-anim',
        { scale: 0.94, opacity: 0.6 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
      );
      if (chipsRef.current) {
        gsap.fromTo(
          chipsRef.current.children,
          { y: 6, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.25, stagger: 0.04, ease: 'power2.out' }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [selectedTeacher?.name]);

  const subjectOptions = selectedTeacher ? ['TODAS', ...selectedTeacher.subjects] : [];

  return (
    <div
      ref={containerRef}
      className="p-3 md:p-4 rounded-2xl bg-[#090f26]/80 border border-slate-700/80 backdrop-blur-xl shadow-xl space-y-3 relative overflow-hidden transition-all"
    >
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-sans">
            <User className="w-3.5 h-3.5 text-cyan-400" /> Selecione o Professor para Focar no Quadro:
          </span>
        </div>

        {selectedTeacher && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/50 px-2.5 py-0.5 rounded-lg">
              {classesCountToday} aula(s) em {currentDayName}
            </span>
            <button
              onClick={() => {
                onSelectTeacher(null);
                onSelectSubject('TODAS');
              }}
              className="text-xs font-bold text-slate-400 hover:text-white underline transition-colors"
            >
              Ver Todos
            </button>
          </div>
        )}
      </div>

      {/* Teacher Buttons Grid - Fully Wrapped, NO horizontal drag required */}
      <div className="flex flex-wrap gap-1.5 md:gap-2">
        {/* 'Todos os Professores' Button */}
        <button
          onClick={() => {
            onSelectTeacher(null);
            onSelectSubject('TODAS');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
            selectedTeacher === null
              ? 'bg-slate-100 text-slate-950 border-white shadow-[0_0_12px_rgba(255,255,255,0.5)] font-black scale-105'
              : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700/70'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>Todos os Professores</span>
        </button>

        {teachers.map(t => {
          const isCurrent = selectedTeacher?.name === t.name;
          return (
            <button
              key={t.name}
              onClick={() => {
                onSelectTeacher(t);
                onSelectSubject('TODAS');
              }}
              className={`px-2.5 md:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                isCurrent
                  ? 'border-cyan-400 bg-cyan-500/25 text-cyan-200 shadow-[0_0_14px_rgba(0,240,255,0.45)] font-black scale-105'
                  : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Subject Filter Sub-Bar (When teacher is selected) */}
      {selectedTeacher && (
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" />
            Matéria de {selectedTeacher.name}:
          </span>

          <div ref={chipsRef} className="flex flex-wrap gap-1.5">
            {subjectOptions.map(subject => {
              const isSelected = selectedSubject.toUpperCase() === subject.toUpperCase();
              const isMain = subject === 'Principal';

              return (
                <button
                  key={subject}
                  onClick={() => onSelectSubject(subject)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.4)] font-black'
                      : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  <span>
                    {subject === 'TODAS'
                      ? '⚡ Todas as Matérias'
                      : isMain
                      ? `📖 Principal (${selectedTeacher.name})`
                      : `🏷️ ${subject}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSelector;
