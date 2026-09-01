import { useState, useEffect, useMemo } from 'react';
import { TIME_SLOTS, BREAK_MORNING, BREAK_LUNCH, WEEK_DAYS, TimeSlotConfig } from '@/data/scheduleData';

export type DayStatus = 'BEFORE_SCHOOL' | 'IN_CLASS' | 'MORNING_BREAK' | 'LUNCH_BREAK' | 'AFTER_SCHOOL' | 'WEEKEND';

// Helper to get current Date in America/Sao_Paulo timezone
export function getBrasiliaDate(): Date {
  const now = new Date();
  // Using Intl format to ensure accurate Brasília time on Cloudflare Pages or any client worldwide
  try {
    const brasiliaString = now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
    return new Date(brasiliaString);
  } catch {
    return now;
  }
}

export function useScheduleTracker() {
  const [now, setNow] = useState<Date>(() => getBrasiliaDate());
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedMinutes, setSimulatedMinutes] = useState<number>(8 * 60 + 30); // Default simulation: 08:30
  
  const [selectedDayName, setSelectedDayName] = useState<string>(() => {
    const bDate = getBrasiliaDate();
    const day = bDate.getDay();
    const dayMap: Record<number, string> = {
      1: '2ª FEIRA',
      2: '3ª FEIRA',
      3: '4ª FEIRA',
      4: '5ª FEIRA',
      5: '6ª FEIRA',
    };
    return dayMap[day] || '2ª FEIRA';
  });

  // Tick clock every second with accurate Brasília time
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(getBrasiliaDate());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const realMinutes = useMemo(() => {
    return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  }, [now]);

  const effectiveMinutes = isSimulating ? simulatedMinutes : realMinutes;

  // Derive current status based on effective minutes
  const statusInfo = useMemo(() => {
    const m = effectiveMinutes;

    // Before school (before 07:30)
    if (m < TIME_SLOTS[0].startMinutes) {
      const diffSeconds = Math.max(0, Math.floor((TIME_SLOTS[0].startMinutes - m) * 60));
      return {
        status: 'BEFORE_SCHOOL' as DayStatus,
        activeSlot: null,
        nextSlot: TIME_SLOTS[0],
        breakType: null,
        label: 'Aulas ainda não iniciaram hoje',
        sublabel: `1º Tempo começa às ${TIME_SLOTS[0].startTime}`,
        progress: 0,
        secondsRemaining: diffSeconds,
      };
    }

    // After school (after 14:30)
    if (m >= TIME_SLOTS[TIME_SLOTS.length - 1].endMinutes) {
      return {
        status: 'AFTER_SCHOOL' as DayStatus,
        activeSlot: null,
        nextSlot: null,
        breakType: null,
        label: 'Aulas encerradas hoje',
        sublabel: 'Horário letivo concluído.',
        progress: 100,
        secondsRemaining: 0,
      };
    }

    // Check morning break (09:10 - 09:30)
    if (m >= BREAK_MORNING.startMinutes && m < BREAK_MORNING.endMinutes) {
      const totalSec = (BREAK_MORNING.endMinutes - BREAK_MORNING.startMinutes) * 60;
      const elapsedSec = (m - BREAK_MORNING.startMinutes) * 60;
      const remainingSec = Math.max(0, Math.floor((BREAK_MORNING.endMinutes - m) * 60));
      const nextSlot = TIME_SLOTS.find(s => s.id === 3) || null;

      return {
        status: 'MORNING_BREAK' as DayStatus,
        activeSlot: null,
        nextSlot,
        breakType: 'RECREIO' as const,
        label: 'Intervalo / Recreio',
        sublabel: `3º Tempo inicia às ${BREAK_MORNING.endTime}`,
        progress: Math.min(100, Math.round((elapsedSec / totalSec) * 100)),
        secondsRemaining: remainingSec,
      };
    }

    // Check lunch break (12:00 - 12:50)
    if (m >= BREAK_LUNCH.startMinutes && m < BREAK_LUNCH.endMinutes) {
      const totalSec = (BREAK_LUNCH.endMinutes - BREAK_LUNCH.startMinutes) * 60;
      const elapsedSec = (m - BREAK_LUNCH.startMinutes) * 60;
      const remainingSec = Math.max(0, Math.floor((BREAK_LUNCH.endMinutes - m) * 60));
      const nextSlot = TIME_SLOTS.find(s => s.id === 6) || null;

      return {
        status: 'LUNCH_BREAK' as DayStatus,
        activeSlot: null,
        nextSlot,
        breakType: 'ALMOÇO' as const,
        label: 'Intervalo de Almoço',
        sublabel: `6º Tempo inicia às ${BREAK_LUNCH.endTime}`,
        progress: Math.min(100, Math.round((elapsedSec / totalSec) * 100)),
        secondsRemaining: remainingSec,
      };
    }

    // Check active class slot
    for (let i = 0; i < TIME_SLOTS.length; i++) {
      const slot = TIME_SLOTS[i];
      if (m >= slot.startMinutes && m < slot.endMinutes) {
        const totalSec = (slot.endMinutes - slot.startMinutes) * 60;
        const elapsedSec = (m - slot.startMinutes) * 60;
        const remainingSec = Math.max(0, Math.floor((slot.endMinutes - m) * 60));
        const nextSlot = TIME_SLOTS[i + 1] || null;

        return {
          status: 'IN_CLASS' as DayStatus,
          activeSlot: slot,
          nextSlot,
          breakType: null,
          label: `Em aula: ${slot.name}`,
          sublabel: `Horário: ${slot.startTime} às ${slot.endTime}`,
          progress: Math.min(100, Math.round((elapsedSec / totalSec) * 100)),
          secondsRemaining: remainingSec,
        };
      }
    }

    return {
      status: 'AFTER_SCHOOL' as DayStatus,
      activeSlot: null,
      nextSlot: null,
      breakType: null,
      label: 'Fora do horário letivo',
      sublabel: '',
      progress: 0,
      secondsRemaining: 0,
    };
  }, [effectiveMinutes]);

  const formattedTimeRemaining = useMemo(() => {
    const secs = statusInfo.secondsRemaining;
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  }, [statusInfo.secondsRemaining]);

  const currentDaySchedule = useMemo(() => {
    return WEEK_DAYS.find(d => d.dayName === selectedDayName) || WEEK_DAYS[0];
  }, [selectedDayName]);

  const formattedCurrentTime = useMemo(() => {
    if (isSimulating) {
      const hours = Math.floor(simulatedMinutes / 60);
      const mins = Math.floor(simulatedMinutes % 60);
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
    }
    return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, [isSimulating, simulatedMinutes, now]);

  const isTodaySelected = useMemo(() => {
    const bDate = getBrasiliaDate();
    const day = bDate.getDay();
    const dayMap: Record<number, string> = {
      1: '2ª FEIRA',
      2: '3ª FEIRA',
      3: '4ª FEIRA',
      4: '5ª FEIRA',
      5: '6ª FEIRA',
    };
    return dayMap[day] === selectedDayName;
  }, [selectedDayName, now]);

  return {
    now,
    effectiveMinutes,
    isSimulating,
    setIsSimulating,
    simulatedMinutes,
    setSimulatedMinutes,
    selectedDayName,
    setSelectedDayName,
    currentDaySchedule,
    formattedCurrentTime,
    statusInfo,
    formattedTimeRemaining,
    isTodaySelected,
  };
}
