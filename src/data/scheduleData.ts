export interface TimeSlotConfig {
  id: number;
  name: string;
  startTime: string; // "07:30"
  endTime: string;   // "08:20"
  startMinutes: number; // minutes from midnight
  endMinutes: number;
}

export interface TeacherAssignment {
  raw: string;
  teacher: string;
  subject: string; // 'Principal', 'PIC', 'EO', 'PV', 'CL', etc.
  isMainSubject: boolean;
  isVacant: boolean;
  className: string;
}

export interface PeriodSchedule {
  slot: TimeSlotConfig;
  classes: Record<string, TeacherAssignment>;
}

export interface DaySchedule {
  dayKey: string; // 'SEGUNDA', 'TERCA', etc.
  dayName: string; // '2ª FEIRA', '3ª FEIRA', etc.
  dayIndex: number; // 1 = Monday, 5 = Friday
  classNames: string[];
  periods: PeriodSchedule[];
}

export const TIME_SLOTS: TimeSlotConfig[] = [
  { id: 1, name: '1º Tempo', startTime: '07:30', endTime: '08:20', startMinutes: 7 * 60 + 30, endMinutes: 8 * 60 + 20 },
  { id: 2, name: '2º Tempo', startTime: '08:20', endTime: '09:10', startMinutes: 8 * 60 + 20, endMinutes: 9 * 60 + 10 },
  // Intervalo 09:10 - 09:30 (20 min)
  { id: 3, name: '3º Tempo', startTime: '09:30', endTime: '10:20', startMinutes: 9 * 60 + 30, endMinutes: 10 * 60 + 20 },
  { id: 4, name: '4º Tempo', startTime: '10:20', endTime: '11:10', startMinutes: 10 * 60 + 20, endMinutes: 11 * 60 + 10 },
  { id: 5, name: '5º Tempo', startTime: '11:10', endTime: '12:00', startMinutes: 11 * 60 + 10, endMinutes: 12 * 60 + 0 },
  // Almoço 12:00 - 12:50 (50 min)
  { id: 6, name: '6º Tempo', startTime: '12:50', endTime: '13:40', startMinutes: 12 * 60 + 50, endMinutes: 13 * 60 + 40 },
  { id: 7, name: '7º Tempo', startTime: '13:40', endTime: '14:30', startMinutes: 13 * 60 + 40, endMinutes: 14 * 60 + 30 },
];

export const BREAK_MORNING = {
  name: 'Recreio / Intervalo',
  startTime: '09:10',
  endTime: '09:30',
  startMinutes: 9 * 60 + 10,
  endMinutes: 9 * 60 + 30,
};

export const BREAK_LUNCH = {
  name: 'Intervalo de Almoço',
  startTime: '12:00',
  endTime: '12:50',
  startMinutes: 12 * 60 + 0,
  endMinutes: 12 * 60 + 50,
};

export const KNOWN_SUFFIXES = ['PIC', 'EO', 'PV', 'CL', 'PI'];

export function parseTeacherCell(rawCell: string, className: string): TeacherAssignment {
  const trimmed = (rawCell || '').trim();
  if (!trimmed || trimmed.toUpperCase() === 'VAGO' || trimmed === '-') {
    return {
      raw: trimmed || 'VAGO',
      teacher: 'VAGO',
      subject: 'VAGO',
      isMainSubject: false,
      isVacant: true,
      className,
    };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1].toUpperCase();
    if (KNOWN_SUFFIXES.includes(lastPart)) {
      const teacherName = parts.slice(0, -1).join(' ').trim();
      return {
        raw: trimmed,
        teacher: teacherName.toUpperCase(),
        subject: lastPart,
        isMainSubject: false,
        isVacant: false,
        className,
      };
    }
  }

  return {
    raw: trimmed,
    teacher: trimmed.toUpperCase(),
    subject: 'Principal',
    isMainSubject: true,
    isVacant: false,
    className,
  };
}

const BASE_CLASSES = ['1601', '1602', '1603', '1701', '1702', '1703', '1801', '1802', '1901', '1902', '1903'];
const EXTENDED_CLASSES = [...BASE_CLASSES, 'SU 01', 'DI 01', 'DI 02'];

// Raw Matrix Data 2026 exactly from official PDF
const RAW_SCHEDULE = {
  '2ª FEIRA': {
    classes: BASE_CLASSES,
    periods: [
      ['CLAUDIO', 'RENATO', 'MÁRCIA', 'SANDRA', 'THAYANE', 'JULIA', 'JAQUELINE EO', 'ANA', 'WILIAM', 'MAURÍCIO', 'WILTON'],
      ['CLAUDIO', 'MAURÍCIO', 'MÁRCIA', 'JAQUELINE', 'THAYANE', 'JULIA', 'SANDRA', 'ANA', 'WILTON', 'WILIAM', 'RENATO CL'],
      ['THAYANE', 'CLAUDIO', 'MAURÍCIO', 'MÁRCIA', 'JAQUELINE', 'SANDRA PV', 'ANA', 'WILIAM', 'RENATO CL', 'WILTON', 'THAÍS'],
      ['THAYANE', 'CLAUDIO', 'MAURÍCIO', 'JAQUELINE', 'RENATO', 'LEANDRO', 'ANA', 'JULIA', 'WILIAM', 'WILTON', 'THAÍS'],
      ['THAÍS', 'THAYANE', 'RENATO', 'MÁRCIA', 'JAQUELINE', 'LEANDRO', 'MAURÍCIO', 'JULIA', 'ANA', 'WILIAM', 'WILTON'],
      ['MAURÍCIO', 'SANDRA PV', 'CLAUDIO', 'LEANDRO', 'MÁRCIA', 'THAYANE', 'JULIA', 'RENATO PIC', 'ANA', 'THAÍS', 'WILIAM'],
      ['MAURÍCIO', 'MÁRCIA', 'CLAUDIO', 'LEANDRO', 'SANDRA PV', 'THAYANE', 'JULIA', 'RENATO PIC', 'WILTON', 'THAÍS', 'WILIAM'],
    ],
  },
  '3ª FEIRA': {
    classes: BASE_CLASSES,
    periods: [
      ['JAQUELINE', 'THAÍS', 'MÁRCIA', 'THAYANE', 'WILTON', 'SANDRA', 'WILIAM', 'ANA', 'MAURÍCIO', 'LEANDRO CL', 'RENATO PIC'],
      ['JAQUELINE', 'THAÍS', 'MÁRCIA', 'THAYANE', 'WILTON', 'SANDRA', 'WILIAM', 'ANA', 'MAURÍCIO', 'LEANDRO CL', 'RENATO PIC'],
      ['THAÍS', 'MÁRCIA', 'JAQUELINE', 'RENATO EO', 'THAYANE', 'MAURÍCIO', 'SANDRA PV', 'WILTON', 'ANA', 'LEANDRO', 'WILIAM'],
      ['THAÍS', 'WILTON', 'RENATO', 'MÁRCIA', 'THAYANE', 'MAURÍCIO', 'ANA', 'SANDRA', 'JAQUELINE', 'LEANDRO', 'WILIAM'],
      ['THAYANE', 'JAQUELINE', 'RENATO', 'LEANDRO', 'MÁRCIA', 'WILTON', 'WILIAM', 'SANDRA PV', 'ANA', 'THAÍS PV', 'MAURÍCIO'],
      ['WILTON', 'THAYANE', 'THAÍS', 'MÁRCIA', 'RENATO', 'JAQUELINE', 'SANDRA', 'WILIAM', 'LEANDRO PIC', 'MAURÍCIO', 'ANA'],
      ['WILTON', 'THAYANE', 'THAÍS', 'MÁRCIA', 'RENATO', 'JAQUELINE', 'SANDRA', 'WILIAM', 'LEANDRO PIC', 'MAURÍCIO', 'ANA'],
    ],
  },
  '4ª FEIRA': {
    classes: EXTENDED_CLASSES,
    periods: [
      ['CLAUDIO EO', 'RENATO', 'JAQUELINE EO', 'WILTON', 'MÁRCIA', 'THAYANE', 'PATRÍCIA', 'SANDRA', 'THAÍS', 'ANA', 'WILIAM', '', '', 'LEANDRO CL'],
      ['CLAUDIO EO', 'RENATO', 'JAQUELINE EO', 'THAYANE', 'MÁRCIA', 'MAURÍCIO', 'ANA CL', 'SANDRA', 'THAÍS', 'LEANDRO PIC', 'WILIAM', 'WILTON', '', 'PATRÍCIA'],
      ['MÁRCIA', 'CLAUDIO', 'WILTON', 'SANDRA', 'THAYANE', 'WILIAM', 'ANA CL', 'MAURÍCIO', 'JAQUELINE', 'LEANDRO PIC', 'THAÍS EO', 'RENATO CL', '', 'PATRÍCIA'],
      ['CLAUDIO PV', 'JAQUELINE EO', 'WILTON', 'RENATO EO', 'THAYANE', 'MÁRCIA PIC', 'WILIAM', 'MAURÍCIO', 'SANDRA PV', 'ANA', 'THAÍS EO', 'PATRÍCIA', '', 'LEANDRO CL'],
      ['CLAUDIO', 'JAQUELINE EO', 'MAURÍCIO', 'THAYANE', 'SANDRA', 'MÁRCIA PIC', 'WILIAM', 'ANA', 'RENATO CL', 'THAÍS EO', 'LEANDRO', 'PATRÍCIA', '', 'WILTON'],
      ['THAYANE', 'MÁRCIA', 'THAÍS PV', 'LEANDRO PIC', 'MAURÍCIO', 'WILTON', 'JAQUELINE EO', 'PATRÍCIA', 'WILIAM', 'SANDRA', 'RENATO CL', '', '', ''],
      ['RENATO', 'MÁRCIA', 'CLAUDIO', 'LEANDRO PIC', 'MAURÍCIO', 'THAYANE', 'WILTON', 'PATRÍCIA', 'WILIAM', 'THAÍS', 'SANDRA', '', '', ''],
    ],
  },
  '5ª FEIRA': {
    classes: EXTENDED_CLASSES,
    periods: [
      ['MÁRCIA', 'THAYANE', 'THAÍS', 'MAURÍCIO', 'SANDRA', 'LEANDRO EO', 'JULIA', 'WILTON', 'ANA', 'WILIAM', 'JAQUELINE', '', '', ''],
      ['MÁRCIA', 'THAÍS', 'JULIA CL', 'MAURÍCIO', 'SANDRA', 'LEANDRO EO', 'WILTON', 'VAGO', 'ANA', 'WILIAM', 'JAQUELINE', '', 'PATRÍCIA', ''],
      ['RENATO', 'WILTON', 'LUANA', 'THAÍS', 'LEANDRO PIC', 'THAYANE', 'JAQUELINE', 'WILIAM', 'SANDRA', 'ANA', 'MAURÍCIO', '', 'PATRÍCIA', ''],
      ['RENATO', 'JULIA CL', 'LUANA', 'SANDRA', 'LEANDRO PIC', 'THAYANE', 'JAQUELINE', 'PATRÍCIA', 'WILIAM', 'ANA', 'MAURÍCIO', '', 'WILTON', ''],
      ['THAYANE CL', 'MÁRCIA', 'JULIA CL', 'WILTON', 'MAURÍCIO', 'SANDRA', 'ANA', 'JAQUELINE', 'WILIAM', 'LEANDRO', 'THAÍS', 'RENATO CL', '', ''],
      ['RENATO PIC', 'THAYANE', 'LUANA', 'JULIA CL', 'MÁRCIA', 'WILIAM', 'PATRÍCIA', 'JAQUELINE', 'THAÍS', 'SANDRA', 'ANA', '', '', ''],
      ['RENATO PIC', 'THAYANE', 'JAQUELINE', 'MÁRCIA', 'THAÍS', 'WILIAM', 'PATRÍCIA', 'JULIA', 'LEANDRO', 'SANDRA', 'ANA', '', '', ''],
    ],
  },
  '6ª FEIRA': {
    classes: BASE_CLASSES,
    periods: [
      ['THAYANE', 'MÁRCIA', 'RENATO PIC', 'MAURÍCIO', 'LEANDRO EO', 'JULIA', 'ANA', 'JAQUELINE CL', 'THAÍS EO', 'WILIAM', 'SANDRA'],
      ['MAURÍCIO', 'JULIA CL', 'RENATO PIC', 'THAYANE', 'MÁRCIA', 'LEANDRO', 'ANA', 'JAQUELINE CL', 'THAÍS EO', 'WILIAM', 'SANDRA'],
      ['MÁRCIA', 'MAURÍCIO', 'LUANA', 'THAYANE', 'THAÍS', 'JULIA CL', 'WILIAM', 'ANA', 'LEANDRO', 'JAQUELINE', 'SANDRA PV'],
      ['MÁRCIA', 'MAURÍCIO', 'LUANA', 'SANDRA PV', 'THAÍS', 'JULIA CL', 'RENATO PIC', 'WILIAM', 'LEANDRO', 'JAQUELINE', 'ANA'],
      ['THAYANE CL', 'JAQUELINE', 'MÁRCIA', 'JULIA CL', 'LEANDRO EO', 'VAGO', 'RENATO PIC', 'WILIAM', 'MAURÍCIO', 'THAÍS EO', 'ANA'],
      ['MÁRCIA', 'RENATO PIC', 'LUANA', 'THAÍS', 'JULIA CL', 'WILIAM', 'MAURÍCIO', 'JAQUELINE EO', 'SANDRA', 'ANA', 'LEANDRO'],
      ['THAYANE', 'RENATO PIC', 'MÁRCIA', 'THAÍS', 'JULIA CL', 'WILIAM', 'MAURÍCIO', 'JAQUELINE EO', 'SANDRA', 'ANA', 'LEANDRO'],
    ],
  },
};

export const WEEK_DAYS: DaySchedule[] = [
  { dayKey: 'SEGUNDA', dayName: '2ª FEIRA', dayIndex: 1, classNames: RAW_SCHEDULE['2ª FEIRA'].classes, periods: [] },
  { dayKey: 'TERCA', dayName: '3ª FEIRA', dayIndex: 2, classNames: RAW_SCHEDULE['3ª FEIRA'].classes, periods: [] },
  { dayKey: 'QUARTA', dayName: '4ª FEIRA', dayIndex: 3, classNames: RAW_SCHEDULE['4ª FEIRA'].classes, periods: [] },
  { dayKey: 'QUINTA', dayName: '5ª FEIRA', dayIndex: 4, classNames: RAW_SCHEDULE['5ª FEIRA'].classes, periods: [] },
  { dayKey: 'SEXTA', dayName: '6ª FEIRA', dayIndex: 5, classNames: RAW_SCHEDULE['6ª FEIRA'].classes, periods: [] },
];

// Populate processed periods
WEEK_DAYS.forEach(day => {
  const rawDay = RAW_SCHEDULE[day.dayName as keyof typeof RAW_SCHEDULE];
  if (!rawDay) return;

  day.periods = TIME_SLOTS.map((slot, periodIdx) => {
    const row = rawDay.periods[periodIdx] || [];
    const classMap: Record<string, TeacherAssignment> = {};

    day.classNames.forEach((cName, colIdx) => {
      const cellValue = row[colIdx] || '';
      classMap[cName] = parseTeacherCell(cellValue, cName);
    });

    return {
      slot,
      classes: classMap,
    };
  });
});

export interface TeacherMeta {
  name: string;
  subjects: string[]; // ['Principal', 'PIC', 'EO', etc.]
  color: string;
  avatarGradient: string;
  totalClassesPerWeek: number;
}

export const TEACHER_THEMES: Record<string, { color: string; gradient: string }> = {
  RENATO: { color: '#00F0FF', gradient: 'from-cyan-500 to-blue-600' },
  JAQUELINE: { color: '#A855F7', gradient: 'from-purple-500 to-pink-600' },
  MÁRCIA: { color: '#EC4899', gradient: 'from-pink-500 to-rose-600' },
  LEANDRO: { color: '#10B981', gradient: 'from-emerald-500 to-teal-600' },
  THAYANE: { color: '#F59E0B', gradient: 'from-amber-500 to-orange-600' },
  THAÍS: { color: '#3B82F6', gradient: 'from-blue-500 to-indigo-600' },
  SANDRA: { color: '#8B5CF6', gradient: 'from-violet-500 to-purple-600' },
  JULIA: { color: '#14B8A6', gradient: 'from-teal-500 to-emerald-600' },
  CLAUDIO: { color: '#EF4444', gradient: 'from-red-500 to-rose-600' },
  WILTON: { color: '#6366F1', gradient: 'from-indigo-500 to-violet-600' },
  MAURÍCIO: { color: '#EAB308', gradient: 'from-yellow-500 to-amber-600' },
  WILIAM: { color: '#06B6D4', gradient: 'from-cyan-500 to-sky-600' },
  PATRÍCIA: { color: '#F43F5E', gradient: 'from-rose-500 to-pink-600' },
  ANA: { color: '#84CC16', gradient: 'from-lime-500 to-green-600' },
  LUANA: { color: '#D946EF', gradient: 'from-fuchsia-500 to-purple-600' },
};

// Build comprehensive teacher directory
export function getAllTeachers(): TeacherMeta[] {
  const teacherMap = new Map<string, { subjects: Set<string>; count: number }>();

  WEEK_DAYS.forEach(day => {
    day.periods.forEach(p => {
      Object.values(p.classes).forEach(assignment => {
        if (!assignment.isVacant && assignment.teacher && assignment.teacher !== 'VAGO') {
          if (!teacherMap.has(assignment.teacher)) {
            teacherMap.set(assignment.teacher, { subjects: new Set(), count: 0 });
          }
          const item = teacherMap.get(assignment.teacher)!;
          item.subjects.add(assignment.subject);
          item.count++;
        }
      });
    });
  });

  return Array.from(teacherMap.entries())
    .map(([name, data]) => {
      const theme = TEACHER_THEMES[name] || {
        color: '#38BDF8',
        gradient: 'from-sky-500 to-blue-600',
      };
      return {
        name,
        subjects: Array.from(data.subjects).sort((a, b) => (a === 'Principal' ? -1 : b === 'Principal' ? 1 : a.localeCompare(b))),
        color: theme.color,
        avatarGradient: theme.gradient,
        totalClassesPerWeek: data.count,
      };
    })
    .sort((a, b) => b.totalClassesPerWeek - a.totalClassesPerWeek);
}

export function getTeacherClassesForDay(teacherName: string, dayName: string, subjectFilter: string = 'TODAS') {
  const day = WEEK_DAYS.find(d => d.dayName === dayName);
  if (!day) return [];

  return day.periods.map(period => {
    const matchingAssignments: TeacherAssignment[] = [];
    Object.values(period.classes).forEach(asg => {
      if (asg.teacher.toUpperCase() === teacherName.toUpperCase()) {
        if (subjectFilter === 'TODAS' || asg.subject.toUpperCase() === subjectFilter.toUpperCase()) {
          matchingAssignments.push(asg);
        }
      }
    });

    return {
      slot: period.slot,
      assignments: matchingAssignments,
      hasTeacher: matchingAssignments.length > 0,
    };
  });
}
