import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TimeSlot {
  time: string;
  content: string;
  isRenato: boolean;
  isEmpty: boolean;
}

const ScheduleDashboard = () => {
  const [schedule, setSchedule] = useState<TimeSlot[]>([]);
  const [currentDay, setCurrentDay] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    '1º Tempo',
    '2º Tempo', 
    '3º Tempo',
    '4º Tempo',
    '5º Tempo',
    '6º Tempo',
    '7º Tempo'
  ];

  const getCurrentDay = (): string => {
    const today = new Date();
    const dayIndex = today.getDay() as keyof typeof dayNames;
    return dayNames[dayIndex];
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

  const processSpreadsheet = (file: File) => {
    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        const today = getCurrentDay();
        const normalizedToday = normalizeDayName(today);
        setCurrentDay(today);
        
        // Find the row with today's schedule
        let todayRowIndex = -1;
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row[0] && typeof row[0] === 'string') {
            const normalizedCell = normalizeDayName(row[0]);
            if (normalizedCell.includes(normalizedToday.slice(0, 2))) { // Match first 2 chars (2ª, 3ª, etc.)
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
          const row = jsonData[rowIndex] as any[];
          const content = row && row.length > 1 ? String(row[1] || '') : '';
          
          scheduleData.push({
            time: timeSlots[i],
            content: content.trim(),
            isRenato: isRenatoClass(content),
            isEmpty: !content.trim()
          });
        }

        setSchedule(scheduleData);
        toast({
          title: "Planilha carregada com sucesso!",
          description: `Horário de ${today} carregado.`
        });
        
      } catch (error) {
        console.error('Erro ao processar planilha:', error);
        toast({
          title: "Erro ao processar planilha",
          description: "Verifique se o arquivo está no formato correto (.xlsx).",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo .xlsx",
          variant: "destructive"
        });
        return;
      }
      processSpreadsheet(file);
    }
  };

  const getSlotStyle = (slot: TimeSlot) => {
    if (slot.isEmpty) {
      return "bg-vacant-time text-vacant-time-foreground border-vacant-time/20";
    }
    if (slot.isRenato) {
      return "bg-renato-highlight text-renato-highlight-foreground border-renato-highlight/30 shadow-lg";
    }
    return "bg-other-teacher text-other-teacher-foreground border-other-teacher/30";
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Meu Horário de Hoje
          </h1>
          {currentDay && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-lg">{currentDay}</span>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-lg"
          >
            <Upload className="w-5 h-5 mr-2" />
            {isLoading ? 'Processando...' : 'Carregar Planilha (.xlsx)'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Schedule Display */}
        {schedule.length > 0 ? (
          <div className="space-y-3">
            {schedule.map((slot, index) => (
              <Card key={index} className={`border transition-all duration-200 ${getSlotStyle(slot)}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm md:text-base">
                      {slot.time}
                    </div>
                    <div className={`text-sm md:text-base ${slot.isEmpty ? 'italic' : 'font-medium'}`}>
                      {slot.isEmpty ? 'Tempo Vago' : slot.content}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-muted-foreground/20">
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground space-y-2">
                <Calendar className="w-12 h-12 mx-auto opacity-50" />
                <p className="text-lg">Por favor, carregue sua planilha de horários</p>
                <p className="text-sm">Selecione um arquivo .xlsx com seus horários escolares</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        {schedule.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-renato-highlight"></div>
              <span className="text-foreground">Suas Aulas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-other-teacher"></div>
              <span className="text-foreground">Outros Professores</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-vacant-time border border-vacant-time-foreground/20"></div>
              <span className="text-foreground">Tempo Vago</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleDashboard;