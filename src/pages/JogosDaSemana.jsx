import React, { useState, useEffect } from "react";
import { InvokeLLM } from "@/api/integrations";
import { Article } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, Trophy, Newspaper, Calendar } from "lucide-react";
import GridArticleCard from "../components/news/GridArticleCard";

const LeagueTable = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTable = async () => {
      try {
        const prompt = `Obtenha a tabela classificativa atual da Liga Portugal (Primeira Liga). Retorne um JSON com uma lista de equipas. Para cada equipa inclua: position, teamName, played, wins, draws, losses, points.`;
        const result = await InvokeLLM({
          prompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              standings: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    position: { type: "number" }, teamName: { type: "string" }, played: { type: "number" },
                    wins: { type: "number" }, draws: { type: "number" }, losses: { type: "number" }, points: { type: "number" }
                  }
                }
              }
            }
          }
        });
        setTableData(result.standings || []);
      } catch (error) { console.error("Erro ao obter tabela da liga:", error); }
      finally { setLoading(false); }
    };
    fetchTable();
  }, []);

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center"><Trophy className="w-5 h-5 mr-2 text-yellow-500" />Liga Portugal - Classificação</CardTitle></CardHeader>
      <CardContent>
        {loading ? <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div> :
          <Table>
            <TableHeader><TableRow><TableHead>Pos</TableHead><TableHead>Equipa</TableHead><TableHead>Pts</TableHead><TableHead>J</TableHead><TableHead>V</TableHead><TableHead>E</TableHead><TableHead>D</TableHead></TableRow></TableHeader>
            <TableBody>
              {tableData.map(row => (
                <TableRow key={row.position}>
                  <TableCell>{row.position}</TableCell><TableCell className="font-medium">{row.teamName}</TableCell><TableCell className="font-bold">{row.points}</TableCell>
                  <TableCell>{row.played}</TableCell><TableCell>{row.wins}</TableCell><TableCell>{row.draws}</TableCell><TableCell>{row.losses}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        }
      </CardContent>
    </Card>
  );
};

const CupRounds = () => {
    const [cupData, setCupData] = useState(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchCupData = async () => {
        try {
          const prompt = `Obtenha o estado atual da Taça de Portugal. Indique a fase atual e liste os próximos jogos ou os resultados da última eliminatória. Responda em JSON com 'current_round' (ex: "Oitavos de Final") e uma lista 'matches' com 'homeTeam', 'awayTeam', 'score', 'date'.`;
          const result = await InvokeLLM({
            prompt,
            add_context_from_internet: true,
            response_json_schema: {
              type: "object",
              properties: {
                current_round: { type: "string" },
                matches: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: { homeTeam: { type: "string" }, awayTeam: { type: "string" }, score: { type: "string" }, date: { type: "string" } }
                  }
                }
              }
            }
          });
          setCupData(result);
        } catch (error) { console.error("Erro ao obter dados da Taça:", error); }
        finally { setLoading(false); }
      };
      fetchCupData();
    }, []);
  
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center"><Shield className="w-5 h-5 mr-2 text-blue-500" />Taça de Portugal</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div> :
            cupData && (
              <div>
                <Badge className="mb-4 text-lg" variant="secondary">{cupData.current_round}</Badge>
                <div className="space-y-3">
                  {cupData.matches.map((match, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-sm">{match.homeTeam} vs {match.awayTeam}</div>
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline">{match.score || "A definir"}</Badge>
                        <span className="text-xs text-gray-500">{match.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        </CardContent>
      </Card>
    );
};

const SportNews = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const sportArticles = await Article.filter({ category: 'desporto', status: 'publicado' }, '-published_date', 12);
                setArticles(sportArticles);
            } catch (error) { console.error("Erro ao buscar notícias:", error); }
            finally { setLoading(false); }
        }
        fetchNews();
    }, []);

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center"><Newspaper className="w-8 h-8 mr-3 text-red-500"/>Notícias de Desporto</h2>
            {loading ? <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div> :
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map(article => <GridArticleCard key={article.id} article={article} />)}
                </div>
            }
        </div>
    );
}

export default function JogosDaSemanaPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Universo do Futebol</h1>
          <p className="mt-4 text-lg text-gray-600">Tudo sobre a Liga Portugal, Taça de Portugal, e as últimas notícias do desporto.</p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 space-y-8">
                <LeagueTable />
                <CupRounds />
            </div>
            <div className="lg:col-span-1">
                {/* Poderíamos adicionar aqui mais widgets, como próximos jogos, etc. */}
                 <Card>
                    <CardHeader><CardTitle className="flex items-center"><Calendar className="w-5 h-5 mr-2 text-green-500" />Próximos Jogos</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600">Em breve, aqui poderá ver uma lista mais detalhada dos próximos jogos de todas as competições.</p>
                    </CardContent>
                 </Card>
            </div>
        </div>

        <SportNews />
      </div>
    </div>
  );
}