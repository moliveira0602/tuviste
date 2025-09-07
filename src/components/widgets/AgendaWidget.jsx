
import React, { useState, useEffect } from "react";
import { InvokeLLM } from "@/api/integrations";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CalendarDays, MapPin, Clock, Loader2, Info, Flag, Users } from "lucide-react";

export default function AgendaWidget() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchEvents = async (month) => {
      setLoading(true);
      try {
        const monthName = format(month, 'MMMM', { locale: pt });
        const year = month.getFullYear();

        const eventsPrompt = `
          Liste os feriados nacionais de Portugal e os principais eventos culturais (feiras, romarias) para o mês de ${monthName} de ${year}.
          Responda APENAS com o objeto JSON. Não adicione texto ou explicações antes ou depois.

          O JSON deve seguir este formato estrito:
          {
            "events": [
              {
                "name": "Nome do Evento",
                "date": "YYYY-MM-DD",
                "location": "Cidade ou Nacional",
                "time": "Horário (ex: Todo o dia)",
                "type": "feriado"
              }
            ]
          }
        `;

        const result = await InvokeLLM({
          prompt: eventsPrompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              events: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    date: { type: "string", description: "Data no formato YYYY-MM-DD" },
                    location: { type: "string" },
                    time: { type: "string" },
                    type: { type: "string", enum: ["feriado", "evento"] },
                  },
                  required: ["name", "date", "location", "time", "type"],
                  additionalProperties: false,
                },
              },
            },
            required: ["events"],
            additionalProperties: false,
          },
        });
        
        setEvents(result.events || []);
      } catch (error) {
        console.error("Erro ao obter eventos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents(currentMonth);
  }, [currentMonth]);

  const eventDates = React.useMemo(() => new Set(events.map(e => e.date)), [events]);
  
  const modifiers = {
    eventDay: (date) => eventDates.has(format(date, 'yyyy-MM-dd')),
  };

  const modifiersStyles = {
    eventDay: {
      fontWeight: 'bold',
      color: '#2563EB', // blue-600
      textDecoration: 'underline',
    },
  };

  const handleDayClick = (day) => {
    const dayFormatted = format(day, 'yyyy-MM-dd');
    const eventsOnDay = events.filter(e => e.date === dayFormatted);
    if (eventsOnDay.length > 0) {
      setSelectedEvents(eventsOnDay);
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm">
            <CalendarDays className="w-4 h-4 mr-2" />
            Agenda de {format(currentMonth, 'MMMM', { locale: pt })}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex justify-center">
          {loading ? (
            <div className="flex justify-center items-center h-[280px]">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <Calendar
              mode="single"
              selected={null}
              onDayClick={handleDayClick}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="p-3"
              locale={pt}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
              {selectedEvents.length > 0 && format(new Date(selectedEvents[0].date), "d 'de' MMMM 'de' yyyy", { locale: pt })}
            </DialogTitle>
            <DialogDescription>
              {selectedEvents.length} evento{selectedEvents.length > 1 ? 's' : ''} neste dia
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[60vh] space-y-4 py-2">
            {/* Feriados primeiro */}
            {selectedEvents.filter(event => event.type === 'feriado').map((event, index) => (
              <div key={`feriado-${index}`} className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                    <Flag className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-blue-900 mb-2">{event.name}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-blue-700">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center text-blue-700">
                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Flag className="w-3 h-3 mr-1" />
                        Feriado Nacional
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Eventos culturais/feiras depois */}
            {selectedEvents.filter(event => event.type === 'evento').map((event, index) => (
              <div key={`evento-${index}`} className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-green-900 mb-2">{event.name}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-green-700">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center text-green-700">
                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Users className="w-3 h-3 mr-1" />
                        Evento Cultural
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Caso não haja eventos (não deveria acontecer, mas por segurança) */}
            {selectedEvents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Info className="w-8 h-8 mx-auto mb-2" />
                <p>Nenhum evento encontrado para esta data.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
