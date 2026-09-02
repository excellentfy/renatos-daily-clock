import React, { useEffect, useRef } from 'react';
import { TeacherMeta } from '@/data/scheduleData';
import { User, Layers, Check, Globe } from 'lucide-react';
import gsap from 'gsap';

interface TeacherSelectorProps {
  teachers: TeacherMeta[];
  selectedTeacher: TeacherMeta | null;
  onSelectTeacher: (teacher: TeacherMeta | null) => void;
  selectedSubject: string;
  onSelectSubject: (subject: string) => void;
  classesCountToday: number;
  currentDayName: string;
  absentTeachers?: string[];
}

export const TeacherSelector: React.FC<TeacherSelectorProps> = ({
  teachers,
  selectedTeacher,
  onSelectTeacher,
  selectedSubject,
  onSelectSubject,
  classesCountToday,
  currentDayName,
  absentTeachers = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

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
      className="p-3 md:p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 relative overflow-hidden transition-all"
    >
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-sans">
            <User className="w-3.5 h-3.5 text-[#0284c7]" /> Selecione o Professor para Focar no Quadro:
          </span>
        </div>

        {selectedTeacher && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 rounded-lg">
              {classesCountToday} aula(s) em {currentDayName}
            </span>
            <button
              onClick={() => {
                onSelectTeacher(null);
                onSelectSubject('TODAS');
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 underline transition-colors"
            >
              Ver Todos
            </button>
          </div>
        )}
      </div>

      {/* Teacher Buttons Grid - Wrapped in 1-2 neat rows */}
      <div className="flex flex-wrap gap-1.5 md:gap-2">
        {/* 'Todos os Professores' Button */}
        <button
          onClick={() => {
            onSelectTeacher(null);
            onSelectSubject('TODAS');
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
            selectedTeacher === null
              ? 'bg-slate-900 text-white border-slate-900 shadow-md font-black scale-105'
              : 'bg-slate-50 text-slate-700 hover:text-slate-950 hover:bg-slate-100 border-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>Todos os Professores</span>
        </button>

        {teachers.map(t => {
          const isCurrent = selectedTeacher?.name === t.name;
          const isAbsent = absentTeachers.map(x => x.toUpperCase()).includes(t.name.toUpperCase());

          return (
            <button
              key={t.name}
              onClick={() => {
                onSelectTeacher(t);
                onSelectSubject('TODAS');
              }}
              className={`px-2.5 md:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                isCurrent
                  ? isAbsent
                    ? 'border-rose-500 bg-rose-50 text-rose-900 shadow-md font-black scale-105 ring-2 ring-rose-400'
                    : 'border-cyan-500 bg-cyan-50 text-cyan-900 shadow-md font-black scale-105 ring-1 ring-cyan-400'
                  : isAbsent
                  ? 'border-rose-200 bg-rose-50/60 text-rose-800 hover:bg-rose-100'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: isAbsent ? '#f43f5e' : t.color }} />
              <span>{t.name}</span>
              {isAbsent && (
                <span className="px-1 py-0.2 rounded bg-rose-500 text-white text-[8.5px] font-black uppercase tracking-tight">
                  Falta
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Subject Filter Sub-Bar */}
      {selectedTeacher && (
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-600 uppercase flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#0284c7]" />
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
                      ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-sm font-black'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200'
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
