
import React, { useState, useEffect } from "react";
import { InvokeLLM } from "@/api/integrations";
import { Thermometer, MapPin, Loader2 } from "lucide-react";
import AnimatedWeatherIcon from './AnimatedWeatherIcon';

const portugueseCities = [
  { name: "Lisboa" },
  { name: "Porto" },
  { name: "Sintra" },
  { name: "Vila Nova de Gaia" },
  { name: "Braga" },
  { name: "Coimbra" },
  { name: "Cascais" },
  { name: "Funchal" },
  { name: "Aveiro" },
  { name: "Guimarães" },
  { name: "Faro" },
];

const cityAbbreviations = {
  "Vila Nova de Gaia": "V.N. Gaia",
  "Guimarães": "Guimarães"
};

export default function HeaderWeather() {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeClass, setFadeClass] = useState("opacity-100");

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const weatherPrompt = `
          Obtenha a temperatura atual e condições meteorológicas para as seguintes cidades de Portugal: ${portugueseCities.map(c => c.name).join(', ')}.
          Use uma das seguintes condições: Ensolado, Céu limpo, Parcialmente nublado, Nublado, Chuva fraca, Chuva, Trovoada, Neve, Vento.
          
          Retorne um JSON no seguinte formato:
          {
            "weather": [
              {
                "city": "Lisboa",
                "temperature": 22,
                "condition": "Ensolado"
              }
            ]
          }
        `;

        const result = await InvokeLLM({
          prompt: weatherPrompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              weather: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    city: { type: "string" },
                    temperature: { type: "number" },
                    condition: { type: "string" }
                  }
                }
              }
            }
          }
        });
        
        if (result.weather && result.weather.length > 0) {
          setWeatherData(result.weather);
        }
      } catch (error) {
        console.error("Erro ao obter clima de Portugal:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  useEffect(() => {
    if (weatherData.length > 1) {
      const interval = setInterval(() => {
        setFadeClass("opacity-0");
        
        setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % weatherData.length);
          setFadeClass("opacity-100");
        }, 500); // tempo para o fade-out
      }, 5000); // muda a cada 5 segundos

      return () => clearInterval(interval);
    }
  }, [weatherData.length]);

  if (loading) {
    return (
      <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400 w-44 justify-start">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-xs">A carregar...</span>
      </div>
    );
  }
  
  if (weatherData.length === 0) return null;

  const currentWeather = weatherData[currentIndex];
  const cityName = cityAbbreviations[currentWeather.city] || currentWeather.city;

  return (
    <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 w-44 justify-start">
      <div className={`transition-opacity duration-500 ease-in-out ${fadeClass} w-full`}>
        <div className="flex items-center space-x-2">
           <AnimatedWeatherIcon condition={currentWeather.condition} className="w-5 h-5 flex-shrink-0" />
           <span className="truncate font-medium" title={currentWeather.city}>{cityName}</span>
           <div className="flex items-center space-x-1 flex-shrink-0 text-gray-500">
             <Thermometer className="w-4 h-4" />
             <span className="font-semibold">{currentWeather.temperature}°</span>
           </div>
        </div>
      </div>
    </div>
  );
}
