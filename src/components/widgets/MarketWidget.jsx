import React, { useState, useEffect } from "react";
import { InvokeLLM } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Euro } from "lucide-react";

export default function MarketWidget() {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const marketPrompt = `
          Obtenha as cotações atuais dos seguintes instrumentos financeiros:
          - PSI20 (bolsa portuguesa)
          - EUR/USD
          - Bitcoin (BTC)
          - Petróleo Brent
          - Ouro (por onça)
          
          Para cada um, inclua o valor atual e a variação percentual do dia.
          
          Formato: { 
            "markets": [
              { "name": "PSI20", "value": "5234.56", "change": "+1.2", "positive": true },
              { "name": "EUR/USD", "value": "1.0856", "change": "-0.3", "positive": false }
            ]
          }
        `;

        const result = await InvokeLLM({
          prompt: marketPrompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              markets: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    value: { type: "string" },
                    change: { type: "string" },
                    positive: { type: "boolean" }
                  }
                }
              }
            }
          }
        });

        setMarketData(result.markets || []);
      } catch (error) {
        console.error("Erro ao obter dados do mercado:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    
    // Update every 5 minutes
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm">
            <DollarSign className="w-4 h-4 mr-2" />
            Mercados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-sm">
          <DollarSign className="w-4 h-4 mr-2" />
          Mercados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {marketData.map((market, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-700">{market.name}</span>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-semibold">{market.value}</span>
                <div className={`flex items-center text-xs ${
                  market.positive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {market.positive ? 
                    <TrendingUp className="w-3 h-3 mr-1" /> : 
                    <TrendingDown className="w-3 h-3 mr-1" />
                  }
                  <span>{market.change}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}