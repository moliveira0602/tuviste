import React, { useState, useEffect, useCallback } from "react";
import { InvokeLLM } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SportsWidget() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = useCallback(async () => {
    setLoading(true); 
    try {
      const sportsPrompt = `
        Get live scores and upcoming/finished matches for "Liga Portugal" and "Taça de Portugal". Follow these rules strictly.
        Your response MUST be ONLY a JSON object.

        PRIORITY:
        1. Find games that are "Ao Vivo" (Live) or at "Intervalo" (Half-time).
        2. Find games with status "Fim" (Finished) that happened today.
        3. Find the next "Agendado" (Scheduled) games.

        Return a maximum of 5 of the most relevant games based on this priority.

        REQUIRED FIELDS BY STATUS:
        - For "Ao Vivo" or "Intervalo": 'homeScore', 'awayScore', and 'minute' are MANDATORY.
        - For "Fim": 'homeScore' and 'awayScore' are MANDATORY.
        - For "Agendado": 'time' is MANDATORY.

        Example:
        { "matches": [{ "competition": "Liga Portugal", "homeTeam": "FC Porto", "awayTeam": "Benfica", "status": "Ao Vivo", "date": "2024-09-15", "homeScore": 1, "awayScore": 0, "minute": 75, "time": null }] }
      `;

      const result = await InvokeLLM({
        prompt: sportsPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  competition: { type: "string" },
                  homeTeam: { type: "string" },
                  awayTeam: { type: "string" },
                  status: { type: "string", enum: ["Ao Vivo", "Intervalo", "Fim", "Agendado"] },
                  date: { type: "string" },
                  time: { type: ["string", "null"] },
                  homeScore: { type: ["number", "null"] },
                  awayScore: { type: ["number", "null"] },
                  minute: { type: ["number", "null"] },
                },
                required: ["competition", "homeTeam", "awayTeam", "status", "date"]
              },
            },
          },
        },
      });

      const sortedMatches = (result.matches || []).sort((a, b) => {
        const statusOrder = { "Ao Vivo": 1, "Intervalo": 2, "Fim": 3, "Agendado": 4 };
        return (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5);
      });

      setMatches(sortedMatches.slice(0, 5));
    } catch (error) {
      console.error("Erro ao obter jogos:", error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 60000);
    return () => clearInterval(interval);
  }, [fetchMatches]);

  const renderMatch = (match, index) => {
    const isLiveOrFinished = ["Ao Vivo", "Intervalo", "Fim"].includes(match.status);
    return (
      <div key={index} className="border-l-2 border-blue-500 pl-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">{match.competition}</span>
          {match.status === "Ao Vivo" && <Badge className="bg-red-500 text-white text-xs animate-pulse">AO VIVO</Badge>}
          {match.status === "Intervalo" && <Badge variant="secondary" className="text-xs">Intervalo</Badge>}
          {match.status === "Fim" && <Badge variant="outline" className="text-xs">Terminado</Badge>}
        </div>
        <div className={`flex items-center justify-between ${isLiveOrFinished ? 'mb-1' : ''}`}>
          <div className="text-sm font-medium text-gray-900">{match.homeTeam}</div>
          {isLiveOrFinished && <div className="text-lg font-bold text-gray-900">{match.homeScore}</div>}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-900">{match.awayTeam}</div>
          {isLiveOrFinished && <div className="text-lg font-bold text-gray-900">{match.awayScore}</div>}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
          <div>{format(new Date(match.date), "d MMM", { locale: pt })}</div>
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {match.status === 'Ao Vivo' && `${match.minute}'`}
            {match.status === 'Agendado' && match.time}
            {match.status === 'Fim' && 'Final'}
            {match.status === 'Intervalo' && 'INT'}
          </div>
        </div>
      </div>
    );
  };

  if (loading && matches.length === 0) {
    return (
      <Card><CardHeader><CardTitle className="text-sm">⚽ Futebol em Destaque</CardTitle></CardHeader><CardContent><div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="animate-pulse h-10 bg-gray-200 rounded"></div>)}</div></CardContent></Card>
    );
  }

  if (!loading && matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">⚽ Futebol em Destaque</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">De momento, não foram encontrados jogos ao vivo ou agendados para os próximos dias.</p>
        </CardContent>
        <CardFooter className="p-4">
          <Link to={createPageUrl('JogosDaSemana')} className="w-full">
            <Button variant="outline" className="w-full">
              Ver Classificações <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">⚽ Futebol em Destaque</CardTitle>
      </CardHeader>
      <CardContent><div className="space-y-5">{matches.map(renderMatch)}</div></CardContent>
      <CardFooter className="p-4">
        <Link to={createPageUrl('JogosDaSemana')} className="w-full">
          <Button variant="outline" className="w-full">
            Ver Tudo <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}