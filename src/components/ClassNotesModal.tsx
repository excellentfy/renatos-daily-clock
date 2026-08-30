import React, { useState, useEffect } from 'react';
import { TeacherAssignment, TimeSlotConfig } from '@/data/scheduleData';
import { X, Save, Trash2, BookOpen, Clock, Users, CheckCircle2, FileText } from 'lucide-react';

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
    window.dispatchEvent(new Event('notes-updated'));
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 300);
  };

  const handleClear = () => {
    if (!storageKey) return;
    localStorage.removeItem(storageKey);
    setNoteContent('');
    window.dispatchEvent(new Event('notes-updated'));
    onClose();
  };

  const quickTags = ['Conteúdo Ministrado', 'Prova / Avaliação', 'Trabalho / Tarefa', 'Recado / Observação'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-3xl bg-white border-2 border-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm"
              style={{ backgroundColor: '#0284c7' }}
            >
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0284c7]">
                Anotações de Aula • {dayName}
              </div>
              <h3 className="text-lg md:text-xl font-black text-slate-900">
                Prof. {teacherName}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Info Chips */}
        <div className="p-4 md:p-5 space-y-4 overflow-y-auto bg-white">
          {/* Class & Time Info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col">
              <span className="text-[10px] font-mono uppercase text-slate-500 flex items-center gap-1 font-semibold">
                <Users className="w-3 h-3 text-[#0284c7]" /> Turma
              </span>
              <span className="text-base font-black text-slate-900 mt-0.5">
                Turma {assignment.className}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col">
              <span className="text-[10px] font-mono uppercase text-slate-500 flex items-center gap-1 font-semibold">
                <Clock className="w-3 h-3 text-amber-600" /> Horário
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5">
                {slot.id}º Tempo ({slot.startTime})
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 flex items-center gap-1 font-semibold">
                <BookOpen className="w-3 h-3 text-purple-600" /> Disciplina
              </span>
              <span className="text-sm font-bold text-[#0284c7] mt-0.5">
                {assignment.isMainSubject ? 'Principal' : assignment.subject}
              </span>
            </div>
          </div>

          {/* Quick Tag Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Categoria da Anotação:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${
                    selectedTag === tag
                      ? 'bg-[#0284c7] text-white border-[#0284c7] font-bold shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-950'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center justify-between">
              <span>Conteúdo / Plano de Aula / Observações:</span>
              {isSaved && (
                <span className="text-emerald-600 font-mono font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Salvo com sucesso!
                </span>
              )}
            </label>
            <textarea
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
              placeholder="Digite aqui anotações sobre a aula, conteúdos que foram passados, lista de exercícios, recados ou planejamento para esta turma..."
              rows={5}
              className="w-full rounded-2xl bg-slate-50 border border-slate-300 p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-[#0284c7] transition-all font-sans resize-none"
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleClear}
            disabled={!noteContent}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-30 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Limpar
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Fechar
            </button>

            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0284c7] hover:bg-cyan-600 text-white shadow-sm flex items-center gap-2 transition-transform active:scale-95 font-sans"
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
