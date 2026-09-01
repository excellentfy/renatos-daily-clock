import { DaySchedule, TeacherAssignment, TimeSlotConfig } from '@/data/scheduleData';

export interface AdvancementOpportunity {
  id: string;
  vacantSlotId: number;
  vacantSlotName: string;
  vacantClassName: string;
  absentTeacher: string;
  originalSubject: string;
  candidateTeacher: string;
  candidateFutureSlotId: number;
  candidateFutureSlotName: string;
  candidateSubject: string;
  hasConflict: boolean;
  conflictClassName?: string;
  conflictSubject?: string;
}

export interface ActiveAdvancement {
  id: string;
  vacantSlotId: number;
  vacantClassName: string;
  absentTeacher: string;
  teacher: string;
  originalFutureSlotId: number;
  chosenSubject: string;
  isDualClass: boolean;
  dualWithClass?: string;
}

/**
 * Identifica oportunidades inteligentes de adiantar aulas para preencher tempos vagos causados por faltas.
 */
export function getAdvancementOpportunities(
  daySchedule: DaySchedule,
  absentTeachers: string[],
  activeAdvancements: ActiveAdvancement[] = []
): AdvancementOpportunity[] {
  if (!absentTeachers.length) return [];

  const upperAbsent = absentTeachers.map(t => t.toUpperCase());
  const opportunities: AdvancementOpportunity[] = [];

  // Mapeia todas as aulas do dia
  daySchedule.periods.forEach(period => {
    const slotId = period.slot.id;

    daySchedule.classNames.forEach(className => {
      const asg = period.classes[className];
      if (!asg || asg.isVacant) return;

      const teacherName = asg.teacher.toUpperCase();

      // Verifica se o professor desta turma faltou
      if (upperAbsent.includes(teacherName)) {
        // Verifica se já não foi aplicado um adiantamento para este tempo/turma
        const alreadyAdv = activeAdvancements.some(
          a => a.vacantSlotId === slotId && a.vacantClassName === className
        );
        if (alreadyAdv) return;

        // Procura nos tempos futuros se outro professor presente tem aula com esta MESMA turma
        for (let fIndex = 0; fIndex < daySchedule.periods.length; fIndex++) {
          const futurePeriod = daySchedule.periods[fIndex];
          const futureSlotId = futurePeriod.slot.id;

          // Apenas tempos futuros
          if (futureSlotId > slotId) {
            const futureAsg = futurePeriod.classes[className];
            if (!futureAsg || futureAsg.isVacant) continue;

            const candName = futureAsg.teacher.toUpperCase();

            // O professor candidato não pode ser um professor faltoso
            if (!upperAbsent.includes(candName)) {
              // Verifica se o tempo futuro já foi adiantado para outro lugar
              const futureAlreadyUsed = activeAdvancements.some(
                a => a.teacher.toUpperCase() === candName && a.originalFutureSlotId === futureSlotId && a.vacantClassName === className
              );
              if (futureAlreadyUsed) continue;

              // Verifica se o professor candidato já tem outra turma no tempo vago (CONFLITO / DUPLA REGÊNCIA)
              let conflictClass: string | undefined;
              let conflictSub: string | undefined;

              daySchedule.classNames.forEach(c2 => {
                const currentSlotAsg = period.classes[c2];
                if (currentSlotAsg && !currentSlotAsg.isVacant && currentSlotAsg.teacher.toUpperCase() === candName) {
                  conflictClass = c2;
                  conflictSub = currentSlotAsg.subject;
                }
              });

              opportunities.push({
                id: `opp_${slotId}_${className}_${candName}_from_${futureSlotId}`,
                vacantSlotId: slotId,
                vacantSlotName: period.slot.name,
                vacantClassName: className,
                absentTeacher: asg.teacher,
                originalSubject: asg.subject,
                candidateTeacher: futureAsg.teacher,
                candidateFutureSlotId: futureSlotId,
                candidateFutureSlotName: futurePeriod.slot.name,
                candidateSubject: futureAsg.subject,
                hasConflict: !!conflictClass,
                conflictClassName: conflictClass,
                conflictSubject: conflictSub,
              });
            }
          }
        }
      }
    });
  });

  return opportunities;
}

/**
 * Cria uma cópia da grade do dia com as faltas e adiantamentos aplicados
 */
export function buildAdjustedSchedule(
  daySchedule: DaySchedule,
  absentTeachers: string[],
  activeAdvancements: ActiveAdvancement[]
): DaySchedule {
  if (!absentTeachers.length && !activeAdvancements.length) {
    return daySchedule;
  }

  const upperAbsent = absentTeachers.map(t => t.toUpperCase());

  const adjustedPeriods = daySchedule.periods.map(period => {
    const slotId = period.slot.id;
    const newClasses: Record<string, TeacherAssignment> = {};

    daySchedule.classNames.forEach(className => {
      const originalAsg = period.classes[className];

      // 1. Verifica se esta célula é um adiantamento aplicado
      const appliedAdv = activeAdvancements.find(
        a => a.vacantSlotId === slotId && a.vacantClassName === className
      );

      if (appliedAdv) {
        newClasses[className] = {
          raw: `${appliedAdv.teacher} (${appliedAdv.chosenSubject})`,
          teacher: appliedAdv.teacher,
          subject: appliedAdv.isDualClass ? `${appliedAdv.chosenSubject} [DUPLA c/ ${appliedAdv.dualWithClass}]` : appliedAdv.chosenSubject,
          isMainSubject: true,
          isVacant: false,
          className,
        };
        return;
      }

      // 2. Verifica se esta aula futura foi puxada/adiantada (Tempo Liberado)
      const relievedAdv = activeAdvancements.find(
        a => a.originalFutureSlotId === slotId && a.vacantClassName === className
      );

      if (relievedAdv) {
        newClasses[className] = {
          raw: `LIBERADO (Adiantada no ${relievedAdv.vacantSlotId}º T)`,
          teacher: `LIBERADO (${relievedAdv.vacantSlotId}ºT)`,
          subject: 'Adiantada',
          isMainSubject: false,
          isVacant: false,
          className,
        };
        return;
      }

      // 3. Verifica se o professor original faltou e não foi substituído
      if (originalAsg && !originalAsg.isVacant && upperAbsent.includes(originalAsg.teacher.toUpperCase())) {
        newClasses[className] = {
          raw: `FALTA: ${originalAsg.teacher}`,
          teacher: `FALTA (${originalAsg.teacher})`,
          subject: 'Tempo Vago',
          isMainSubject: false,
          isVacant: false,
          className,
        };
        return;
      }

      // 4. Caso padrão: mantém a aula original
      newClasses[className] = originalAsg;
    });

    return {
      ...period,
      classes: newClasses,
    };
  });

  return {
    ...daySchedule,
    periods: adjustedPeriods,
  };
}
