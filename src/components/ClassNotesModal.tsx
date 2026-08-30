import React, { useState, useEffect } from 'react';
import { TeacherAssignment, TimeSlotConfig } from '@/data/scheduleData';
import { X, Save, Trash2, BookOpen, Clock, Users, Calendar, CheckCircle2, FileText, Sparkles } from 'lucide-react';

interface ClassNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherName: string;
  teacherColor: string;
  dayName: string;
  slot: TimeSlotConfig | null;
  assignment: TeacherAssignment | null;
}

export const ClassNotesModal: React.FC<ClassNotesModalProps> = ({
  isOpen,
  onClose,
  teacherName,
  teacherColor,
  dayName,
  slot,
  assignment,
}) => {
  const [noteContent, setNoteContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('Conteúdo');
  const [isSaved, setIsSaved] = useState(false);

  const storageKey = slot && assignment
    ? `get_class_notes_${teacherName}_${dayName}_slot${slot.id}_${assignment.className}`
    : '';

  // Load note from localStorage when opened
  useEffect(() => {
    if (isOpen && storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setNoteContent(parsed.content || '');
          setSelectedTag(parsed.tag || 'Conteúdo');
        } catch {
          setNoteContent(saved);
        }
      } else {
        setNoteContent('');
        setSelectedTag('Conteúdo');
      }
      setIsSaved(false);
    }
  }, [isOpen, storageKey]);

  if (!isOpen || !slot || !assignment) return null;

  const handleSave = () => {
    if (!storageKey) return;
    const payload = {
      content: noteContent,
      tag: selectedTag,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(payload));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleClear = () => {
    if (!storageKey) return;
    localStorage.removeItem(storageKey);
    setNoteContent('');
  };

  const quickTags = ['Conteúdo Ministrado', 'Prova / Avaliação', 'Trabalho / Tarefa', 'Recado / Observação'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-3xl bg-slate-950 border-2 border-slate-700 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(0,191,255,0.2)] overflow-hidden flex flex-col max-h-[90vh]"
        style={{ borderColor: `${teacherColor}66` }}
      >
        {/* Modal Header */}
        <div
          className="p-5 border-b border-slate-800 flex items-center justify-between"
          style={{ background: `linear-gradient(135deg, ${teacherColor}22, #020617)` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg"
              style={{
                backgroundColor: teacherColor,
                boxShadow: `0 0 15px ${teacherColor}66`,
              }}
            >
              <FileText className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300">
                Anotações de Aula • {dayName}
              </div>
              <h3 className="text-xl font-black text-white">
                Prof. {teacherName}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Info Chips */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Class & Time Info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col">
              <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                <Users className="w-3 h-3 text-cyan-400" /> Turma
              </span>
              <span className="text-base font-black text-white mt-0.5">
                Turma {assignment.className}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col">
              <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" /> Horário
              </span>
              <span className="text-sm font-bold text-white mt-0.5">
                {slot.id}º Tempo ({slot.startTime})
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-purple-400" /> Disciplina
              </span>
              <span className="text-sm font-bold text-cyan-300 mt-0.5">
                {assignment.isMainSubject ? 'Principal' : assignment.subject}
              </span>
            </div>
          </div>

          {/* Quick Tag Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Categoria da Anotação:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
                    selectedTag === tag
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Conteúdo / Plano de Aula / Observações:</span>
              {isSaved && (
                <span className="text-emerald-400 font-mono flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Salvo com sucesso!
                </span>
              )}
            </label>
            <textarea
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
              placeholder="Digite aqui anotações sobre a aula, conteúdos que foram passados, lista de exercícios, recados ou planejamento para esta turma..."
              rows={5}
              className="w-full rounded-2xl bg-slate-900/90 border border-slate-700/80 p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all font-sans resize-none"
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={handleClear}
            disabled={!noteContent}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Limpar
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Fechar
            </button>

            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center gap-2 transition-transform active:scale-95 font-sans"
            >
              <Save className="w-4 h-4" /> Salvar Anotação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassNotesModal;
