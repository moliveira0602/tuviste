import React, { useState, useEffect } from "react";
import { InvokeLLM } from "@/api/integrations";
import { Badge } from "@/components/ui/badge";
import { Hash, TrendingUp } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function TrendingTopics() {
  const { t } = useLanguage();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const trendsPrompt = `
          Liste os 8 tópicos mais populares em trending no momento em Portugal e no mundo.
          Inclua hashtags, eventos atuais, celebridades, tecnologia, política.
          
          Para cada tópico inclua: nome, categoria, nivel de popularidade (1-10).
          
          Formato: {
            "trends": [
              {
                "topic": "Inteligência Artificial", 
                "category": "Tecnologia",
                "popularity": 9
              }
            ]
          }
        `;

        const result = await InvokeLLM({
          prompt: trendsPrompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              trends: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    topic: { type: "string" },
                    category: { type: "string" },
                    popularity: { type: "number" }
                  }
                }
              }
            }
          }
        });

        setTopics(result.trends || []);
      } catch (error) {
        console.error("Erro ao obter trends:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
    
    // Update every 30 minutes
    const interval = setInterval(fetchTrends, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getCategoryColor = (category) => {
    const colors = {
      'Tecnologia': 'bg-blue-100 text-blue-800',
      'Política': 'bg-red-100 text-red-800',
      'Entretenimento': 'bg-purple-100 text-purple-800',
      'Desporto': 'bg-green-100 text-green-800',
      'Economia': 'bg-yellow-100 text-yellow-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6 border-b-2 border-indigo-600 pb-2">
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="w-6 h-6 mr-3 text-indigo-600" />
                {t('home.trendingTopics')}
            </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-20 rounded-lg w-full"></div>
          ))}
        </div>
      </section>
    );
  }
  
  if (topics.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6 border-b-2 border-indigo-600 pb-2">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="w-6 h-6 mr-3 text-indigo-600" />
              {t('home.trendingTopics')}
          </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {topics.map((trend, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center mb-2">
                <Hash className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-md font-bold text-gray-900 truncate">
                  {trend.topic}
                </span>
            </div>
            <div className="flex items-center justify-between">
              <Badge className={`text-xs ${getCategoryColor(trend.category)}`}>
                {trend.category}
              </Badge>
              <div className="text-sm font-bold text-indigo-600">
                {trend.popularity}/10
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}