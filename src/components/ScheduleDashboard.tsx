import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TimeSlot {
  time: string;
  period: string;
  content: string;
  isRenato: boolean;
  isEmpty: boolean;
}

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQy2FUEgwipIsB-OxQuw42xNPzj39y8TyF4Jp0V9kHpbA_2aYK4DMqCE0jkcK17mVpceNchwhHQlixU/pub?gid=1560992838&single=true&output=csv';

const ScheduleDashboard = () => {
  const [schedule, setSchedule] = useState<TimeSlot[]>([]);
  const [currentDay, setCurrentDay] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const dayNames = {
    0: 'DOMINGO',
    1: '2ª FEIRA',
    2: '3ª FEIRA', 
    3: '4ª FEIRA',
    4: '5ª FEIRA',
    5: '6ª FEIRA',
    6: 'SÁBADO'
  };

  const timeSlots = [
    { name: '1º Tempo', period: '07:30 - 08:15' },
    { name: '2º Tempo', period: '08:15 - 09:00' },
    { name: '3º Tempo', period: '09:20 - 10:05' },
    { name: '4º Tempo', period: '10:05 - 10:50' },
    { name: '5º Tempo', period: '11:10 - 11:55' },
    { name: '6º Tempo', period: '11:55 - 12:40' },
    { name: '7º Tempo', period: '13:30 - 14:15' }
  ];

  const getCurrentDay = (): string => {
    const today = new Date();
    const dayIndex = today.getDay() as keyof typeof dayNames;
    return dayNames[dayIndex];
  };

  const getCurrentDate = (): string => {
    const today = new Date();
    return today.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isRenatoClass = (content: string): boolean => {
    if (!content) return false;
    const renatoVariations = ['RENATO', 'RENATOPI', 'RENATOPV', 'RENATOEO'];
    const upperContent = content.toUpperCase();
    return renatoVariations.some(variation => upperContent.includes(variation));
  };

  const normalizeDayName = (dayName: string): string => {
    return dayName
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^A-Z0-9ª]/g, ''); // Keep only letters, numbers, and 'ª'
  };

  const fetchScheduleData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(CSV_URL);
      if (!response.ok) {
        throw new Error('Falha ao carregar dados');
      }
      
      const csvText = await response.text();
      const lines = csvText.split('\n');
      
      const today = getCurrentDay();
      const normalizedToday = normalizeDayName(today);
      setCurrentDay(today);
      setCurrentDate(getCurrentDate());
      
      // Find the row with today's schedule
      let todayRowIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        const cells = lines[i].split(',');
        if (cells[0]) {
          const normalizedCell = normalizeDayName(cells[0]);
          if (normalizedCell.includes(normalizedToday.slice(0, 2))) {
            todayRowIndex = i;
            break;
          }
        }
      }

      if (todayRowIndex === -1) {
        toast({
          title: "Dia não encontrado",
          description: `Não foi possível encontrar o horário para ${today} na planilha.`,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Extract the next 7 rows (7 time slots)
      const scheduleData: TimeSlot[] = [];
      for (let i = 0; i < 7; i++) {
        const rowIndex = todayRowIndex + i + 1;
        if (rowIndex < lines.length) {
          const cells = lines[rowIndex].split(',');
          const content = cells.length > 1 ? cells[1].trim().replace(/"/g, '') : '';
          
          scheduleData.push({
            time: timeSlots[i].name,
            period: timeSlots[i].period,
            content: content,
            isRenato: isRenatoClass(content),
            isEmpty: !content
          });
        }
      }

      setSchedule(scheduleData);
      toast({
        title: "Horário carregado!",
        description: `Dados de ${today} atualizados automaticamente.`
      });
      
    } catch (error) {
      console.error('Erro ao carregar horário:', error);
      toast({
        title: "Erro ao carregar horário",
        description: "Não foi possível conectar com a planilha online.",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchScheduleData();
  }, []);

  const getSlotStyle = (slot: TimeSlot) => {
    if (slot.isEmpty) {
      return "bg-vacant-time text-vacant-time-foreground";
    }
    if (slot.isRenato) {
      return "bg-renato-highlight text-renato-highlight-foreground shadow-[0_0_20px_rgba(0,191,255,0.3)]";
    }
    return "bg-other-teacher text-other-teacher-foreground";
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
              Horário de Hoje
            </h1>
            <div className="neon-line w-24 mx-auto"></div>
          </div>
          
          {currentDate && (
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <Calendar className="w-5 h-5" />
              <span className="text-lg font-medium capitalize">{currentDate}</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="loading-spinner"></div>
            <p className="text-muted-foreground">Carregando horário de hoje...</p>
          </div>
        ) : schedule.length > 0 ? (
          <>
            {/* Schedule Cards */}
            <div className="grid gap-4 md:gap-6">
              {schedule.map((slot, index) => (
                <Card key={index} className={`tech-card ${getSlotStyle(slot)}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-lg">{slot.time}</span>
                          <span className="text-sm opacity-75 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {slot.period}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-semibold ${slot.isEmpty ? 'italic opacity-75' : ''}`}>
                          {slot.isEmpty ? 'Tempo Vago' : slot.content}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50">
                <div className="w-6 h-6 rounded bg-renato-highlight shadow-[0_0_10px_rgba(0,191,255,0.5)]"></div>
                <span className="font-medium">Suas Aulas</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50">
                <div className="w-6 h-6 rounded bg-other-teacher"></div>
                <span className="font-medium">Outros Professores</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50">
                <div className="w-6 h-6 rounded bg-vacant-time border border-vacant-time-foreground/20"></div>
                <span className="font-medium">Tempo Vago</span>
              </div>
            </div>
          </>
        ) : (
          <Card className="tech-card border-dashed">
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground space-y-4">
                <Calendar className="w-16 h-16 mx-auto opacity-50" />
                <div>
                  <p className="text-xl font-medium">Nenhum horário encontrado</p>
                  <p className="text-sm">Verifique se há dados para hoje na planilha</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ScheduleDashboard;