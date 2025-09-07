
import React, { useState, useEffect } from "react";
import { InvokeLLM } from "@/api/integrations";
import { Thermometer, Globe, Loader2, Clock } from "lucide-react";
import AnimatedWeatherIcon from './AnimatedWeatherIcon';

const worldCities = [
  { name: "Lisboa", country: "Portugal" },
  { name: "Londres", country: "Reino Unido" },
  { name: "Paris", country: "França" },
  { name: "Madrid", country: "Espanha" },
  { name: "Roma", country: "Itália" },
  { name: "Berlim", country: "Alemanha" },
  { name: "Nova York", country: "EUA" },
  { name: "São Paulo", country: "Brasil" },
  { name: "Tóquio", country: "Japão" },
  { name: "Pequim", country: "China" },
  { name: "Singapura", country: "Singapura" },
  { name: "Dubai", country: "EAU" },
];

export default function WeatherSlider() {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStartIndex, setCurrentStartIndex] = useState(0);
  const [fadeClass, setFadeClass] = useState("opacity-100");

  useEffect(() => {
    const fetchWorldWeather = async () => {
      try {
        const citiesString = worldCities.map(c => `${c.name}, ${c.country}`).join(', ');
        
        const weatherPrompt = `
          Obtenha a temperatura atual, condições meteorológicas e a hora local atual para as seguintes cidades do mundo: ${citiesString}.
          
          Use uma das seguintes condições: Ensolarado, Céu limpo, Parcialmente nublado, Nublado, Chuva fraca, Chuva, Trovoada, Neve, Vento.
          
          Para a hora local, forneça no formato HH:mm (24 horas).
          
          Retorne um JSON no seguinte formato: 
          { 
            "weather": [
              { 
                "city": "Lisboa", 
                "country": "Portugal", 
                "temperature": 22, 
                "condition": "Ensolarcado",
                "local_time": "14:30"
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
                    country: { type: "string" },
                    temperature: { type: "number" },
                    condition: { type: "string" },
                    local_time: { type: "string" }
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
        console.error("Erro ao obter clima mundial:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorldWeather();
  }, []);

  useEffect(() => {
    if (weatherData.length > 4) {
      const interval = setInterval(() => {
        setFadeClass("opacity-0");
        
        setTimeout(() => {
          setCurrentStartIndex((prevIndex) => {
            const nextIndex = prevIndex + 4;
            return nextIndex >= weatherData.length ? 0 : nextIndex;
          });
          setFadeClass("opacity-100");
        }, 500);
      }, 6000);

      return () => clearInterval(interval);
    }
  }, [weatherData.length]);

  if (loading) {
    return (
      <div className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-center text-sm text-gray-300 flex items-center justify-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>A carregar clima mundial...</span>
        </div>
      </div>
    );
  }
  
  if (weatherData.length === 0) return null;

  const currentCities = weatherData.slice(currentStartIndex, currentStartIndex + 4);

  while (currentCities.length > 0 && currentCities.length < 4 && weatherData.length > currentCities.length) {
    const remainingIndex = (currentStartIndex + currentCities.length) % weatherData.length;
    if (!currentCities.some(c => c.city === weatherData[remainingIndex].city)) {
        currentCities.push(weatherData[remainingIndex]);
    } else {
        break; 
    }
  }

  return (
    <div className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 overflow-hidden">
        <div className={`transition-opacity duration-500 ease-in-out ${fadeClass}`}>
          <div className="flex flex-wrap items-center justify-around gap-x-8 gap-y-2 text-sm">
            {currentCities.map((weather, index) => (
              <div key={`${weather.city}-${currentStartIndex}-${index}`} className="flex flex-col items-center space-y-1 text-white">
                <div className="flex items-center space-x-2">
                  <AnimatedWeatherIcon condition={weather.condition} className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{weather.city}</span>
                  <div className="flex items-center text-gray-300">
                    <Thermometer className="w-4 h-4 mr-1" />
                    <span className="font-semibold">{weather.temperature}°</span>
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-400">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{weather.local_time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
