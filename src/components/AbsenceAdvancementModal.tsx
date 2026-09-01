import React, { useState, useMemo } from 'react';
import { DaySchedule, TeacherMeta } from '@/data/scheduleData';
import {
  AdvancementOpportunity,
  ActiveAdvancement,
  getAdvancementOpportunities,
} from '@/utils/advancementEngine';
import {
  AlertTriangle,
  Zap,
  UserX,
  CheckCircle2,
  X,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Layers,
  Calendar,
} from 'lucide-react';

interface AbsenceAdvancementModalProps {
  isOpen: boolean;
  onClose: () => void;
  daySchedule: DaySchedule;
  teachers: TeacherMeta[];
  absentTeachers: string[];
  onToggleAbsentTeacher: (teacherName: string) => void;
  onClearAbsentTeachers: () => void;
  activeAdvancements: ActiveAdvancement[];
  onApplyAdvancement: (adv: ActiveAdvancement) => void;
  onRemoveAdvancement: (id: string) => void;
  onClearAdvancements: () => void;
}

export const AbsenceAdvancementModal: React.FC<AbsenceAdvancementModalProps> = ({
  isOpen,
  onClose,
  daySchedule,
  teachers,
  absentTeachers,
  onToggleAbsentTeacher,
  onClearAbsentTeachers,
  activeAdvancements,
  onApplyAdvancement,
  onRemoveAdvancement,
  onClearAdvancements,
}) => {
  const [activeTab, setActiveTab] = useState<'absences' | 'opportunities' | 'summary'>('absences');
  const [selectedSubjects, setSelectedSubjects] = useState<Record<string, string>>({});

  // Lista os professores que realmente lecionam no dia selecionado
  const teachersWithClassesToday = useMemo(() => {
    const counts: Record<string, number> = {};
    daySchedule.periods.forEach(p => {
      daySchedule.classNames.forEach(c => {
        const asg = p.classes[c];
        if (asg && !asg.isVacant) {
          const tName = asg.teacher.toUpperCase();
          counts[tName] = (counts[tName] || 0) + 1;
        }
      });
    });

    return teachers
      .filter(t => counts[t.name.toUpperCase()] > 0)
      .map(t => ({
        ...t,
        classesToday: counts[t.name.toUpperCase()] || 0,
      }))
      .sort((a, b) => b.classesToday - a.classesToday);
  }, [daySchedule, teachers]);

  // Calcula oportunidades inteligentes de adiantamento
  const opportunities = useMemo(() => {
    return getAdvancementOpportunities(daySchedule, absentTeachers, activeAdvancements);
  }, [daySchedule, absentTeachers, activeAdvancements]);

  if (!isOpen) return null;

  const handleApply = (opp: AdvancementOpportunity) => {
    const chosenSubject = selectedSubjects[opp.id] || (opp.hasConflict ? 'Educação Física (Excepcional)' : opp.candidateSubject);

    onApplyAdvancement({
      id: opp.id,
      vacantSlotId: opp.vacantSlotId,
      vacantClassName: opp.vacantClassName,
      absentTeacher: opp.absentTeacher,
      teacher: opp.candidateTeacher,
      originalFutureSlotId: opp.candidateFutureSlotId,
      chosenSubject,
      isDualClass: opp.hasConflict,
      dualWithClass: opp.conflictClassName,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl border-2 border-slate-300 border-b-[8px] border-b-slate-400 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white flex items-center justify-between border-b-2 border-slate-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg font-black tracking-wide uppercase">
                  Gestão de Faltas & Adiantamentos
                </h3>
                <span className="px-2 py-0.5 rounded-lg bg-[#00bfff] text-slate-950 font-black text-[10px] uppercase">
                  {daySchedule.dayName}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Reorganize tempos vagos e defina substituições por excepcionalidade
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-2 bg-slate-100 border-b border-slate-200 text-xs font-black overflow-x-auto">
          <button
            onClick={() => setActiveTab('absences')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'absences'
                ? 'bg-white text-rose-600 shadow-sm border border-slate-200 scale-102'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            <span>1. Professores Faltosos</span>
            {absentTeachers.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
                {absentTeachers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('opportunities')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'opportunities'
                ? 'bg-white text-[#0284c7] shadow-sm border border-slate-200 scale-102'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>2. Sugestões de Adiantamento</span>
            {opportunities.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px]">
                {opportunities.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'summary'
                ? 'bg-white text-emerald-600 shadow-sm border border-slate-200 scale-102'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. Grade Ajustada</span>
            {activeAdvancements.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px]">
                {activeAdvancements.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 font-sans text-sm">
          {/* TAB 1: ABSENCES */}
          {activeTab === 'absences' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600 font-medium">
                  Selecione os professores ausentes hoje ({daySchedule.dayName}):
                </p>
                {absentTeachers.length > 0 && (
                  <button
                    onClick={onClearAbsentTeachers}
                    className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Limpar Faltas
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {teachersWithClassesToday.map(t => {
                  const isAbsent = absentTeachers.map(x => x.toUpperCase()).includes(t.name.toUpperCase());
                  return (
                    <button
                      key={t.id}
                      onClick={() => onToggleAbsentTeacher(t.name)}
                      className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden select-none ${
                        isAbsent
                          ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-500 shadow-sm font-black'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black uppercase ${isAbsent ? 'text-rose-900' : 'text-slate-800'}`}>
                          {t.name}
                        </span>
                        {isAbsent ? (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[9px] font-black">
                            FALTOU
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500 font-bold">
                            {t.classesToday} {t.classesToday === 1 ? 'aula' : 'aulas'}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 truncate">
                        {t.disciplinaPrincipal || 'Matéria Regular'}
                      </div>
                    </button>
                  );
                })}
              </div>

              {absentTeachers.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between">
                  <div className="text-xs font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>{absentTeachers.length} professor(es) faltoso(s). Verifique as sugestões de adiantamento!</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('opportunities')}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-sm hover:brightness-105 active:translate-y-0.5"
                  >
                    Ver Sugestões →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OPPORTUNITIES */}
          {activeTab === 'opportunities' && (
            <div className="space-y-4">
              {absentTeachers.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <UserX className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto">
                    Nenhum professor marcado como faltoso ainda. Marque os professores na aba anterior para calcular oportunidades de adiantamento.
                  </p>
                  <button
                    onClick={() => setActiveTab('absences')}
                    className="px-4 py-2 rounded-xl bg-[#0284c7] text-white font-bold text-xs"
                  >
                    Marcar Faltas
                  </button>
                </div>
              ) : opportunities.length === 0 ? (
                <div className="text-center py-8 space-y-2 bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <p className="text-xs font-bold text-slate-700">
                    Não foram encontradas aulas futuras no mesmo dia para as turmas vagas.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Os tempos das turmas afetadas permanecerão como tempos vagos ou aguardarão professor substituto.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 font-medium">
                    A inteligência encontrou <strong>{opportunities.length}</strong> possibilidade(s) de adiantamento:
                  </p>

                  {opportunities.map(opp => (
                    <div
                      key={opp.id}
                      className="p-4 rounded-2xl border-2 border-slate-200 bg-white shadow-sm space-y-3 transition-all hover:border-[#00bfff]"
                    >
                      {/* Opportunity Header */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-900 font-black text-xs">
                            {opp.vacantSlotName}
                          </span>
                          <span className="text-xs font-black text-slate-900">
                            Turma {opp.vacantClassName}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            (Falta: {opp.absentTeacher})
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                          <span>Puxar da aula do {opp.candidateFutureSlotName}</span>
                        </div>
                      </div>

                      {/* Opportunity Teacher & Dual Class Warning */}
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>Professor Disponível:</span>
                          <span className="text-[#0284c7] font-black text-sm uppercase">{opp.candidateTeacher}</span>
                        </div>

                        {opp.hasConflict ? (
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1">
                            <div className="flex items-center gap-1.5 font-black text-amber-900">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Dupla Regência / Conflito de Turmas:</span>
                            </div>
                            <p className="text-[11px] leading-relaxed">
                              Prof. <strong>{opp.candidateTeacher}</strong> já leciona para a turma <strong>{opp.conflictClassName}</strong> ({opp.conflictSubject}) neste tempo.
                              Por excepcionalidade, ele atenderá <strong>2 turmas simultâneas</strong> ({opp.conflictClassName} + {opp.vacantClassName}).
                            </p>
                          </div>
                        ) : (
                          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center gap-1.5 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Horário Livre: Prof. {opp.candidateTeacher} não possui outra turma neste tempo.</span>
                          </div>
                        )}

                        {/* Subject Decision for Excepcionality */}
                        <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] font-bold text-slate-600">Matéria a Ministrar:</label>
                            <select
                              value={selectedSubjects[opp.id] || (opp.hasConflict ? 'Educação Física (Excepcional)' : opp.candidateSubject)}
                              onChange={e =>
                                setSelectedSubjects(prev => ({ ...prev, [opp.id]: e.target.value }))
                              }
                              className="text-xs font-bold p-1.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#00bfff] outline-none"
                            >
                              <option value="Educação Física (Principal)">Educação Física (Principal)</option>
                              <option value="PIC (Iniciação Científica)">PIC (Iniciação Científica)</option>
                              <option value="Projeto de Vida (PV)">Projeto de Vida (PV)</option>
                              <option value="Eletiva / Orientada (EO)">Eletiva / Orientada (EO)</option>
                              <option value="Conforme Grade Original">Conforme Grade Original</option>
                            </select>
                          </div>

                          <button
                            onClick={() => handleApply(opp)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 text-white font-black text-xs shadow-md border-b-2 border-emerald-700 hover:brightness-110 active:translate-y-0.5 flex items-center gap-1.5"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Aplicar Adiantamento</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600 font-medium">
                  Alterações confirmadas para a grade de hoje ({activeAdvancements.length}):
                </p>
                {activeAdvancements.length > 0 && (
                  <button
                    onClick={onClearAdvancements}
                    className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Desfazer Todas
                  </button>
                )}
              </div>

              {activeAdvancements.length === 0 ? (
                <div className="text-center py-8 space-y-2 bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <p className="text-xs font-bold text-slate-700">Nenhum adiantamento aplicado ainda.</p>
                  <p className="text-[11px] text-slate-500">
                    Acesse a aba <strong>2. Sugestões de Adiantamento</strong> para selecionar as aulas que deseja puxar.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeAdvancements.map(adv => (
                    <div
                      key={adv.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-950 font-black text-xs">
                            {adv.vacantSlotId}º Tempo
                          </span>
                          <span className="font-black text-xs text-slate-900">
                            Turma {adv.vacantClassName} • Prof. {adv.teacher}
                          </span>
                          {adv.isDualClass && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-950 font-black text-[9px]">
                              DUPLA c/ {adv.dualWithClass}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600 flex items-center gap-2 font-medium">
                          <span>Matéria: {adv.chosenSubject}</span>
                          <span>•</span>
                          <span className="text-slate-500">
                            (Puxada do {adv.originalFutureSlotId}º Tempo - Tempo Liberado)
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveAdvancement(adv.id)}
                        className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition-all"
                        title="Remover este adiantamento"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            {activeAdvancements.length > 0
              ? `${activeAdvancements.length} adiantamento(s) ativo(s) no quadro.`
              : 'Nenhuma alteração pendente.'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-xs shadow-sm hover:bg-slate-800 active:translate-y-0.5"
            >
              Concluir e Ver no Quadro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbsenceAdvancementModal;
