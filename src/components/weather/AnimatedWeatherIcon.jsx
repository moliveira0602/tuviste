import React from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, CloudSnow, CloudSun, Wind } from 'lucide-react';

const AnimatedWeatherIcon = ({ condition, className = "w-6 h-6" }) => {

  const getIcon = () => {
    const lowerCondition = condition?.toLowerCase() || '';

    if (lowerCondition.includes('sol') || lowerCondition.includes('céu limpo')) {
      return <Sun className={`${className} text-yellow-400 animate-spin-slow`} />;
    }
    if (lowerCondition.includes('trovoada')) {
      return <CloudLightning className={`${className} text-yellow-500 animate-pulse`} />;
    }
    if (lowerCondition.includes('chuva')) {
      return <CloudRain className={`${className} text-blue-400 animate-bounce-short`} />;
    }
    if (lowerCondition.includes('neve')) {
      return <CloudSnow className={`${className} text-white animate-pulse`} />;
    }
    if (lowerCondition.includes('parcialmente nublado') || lowerCondition.includes('algumas nuvens')) {
        return <CloudSun className={`${className} text-gray-400 animate-fade-in-out`} />;
    }
    if (lowerCondition.includes('nublado')) {
      return <Cloud className={`${className} text-gray-400 animate-fade-in-out`} />;
    }
    if (lowerCondition.includes('vento')) {
      return <Wind className={`${className} text-gray-500`} />;
    }

    return <Sun className={`${className} text-yellow-400`} />;
  };

  return (
    <>
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
          50% { transform: translateY(-4px); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
        }
        .animate-bounce-short {
          animation: bounce-short 2s infinite;
        }

        @keyframes fade-in-out {
          0%, 100% { opacity: 0.6; transform: translateX(0); }
          50% { opacity: 1; transform: translateX(2px); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 4s ease-in-out infinite;
        }
      `}</style>
      {getIcon()}
    </>
  );
};

export default AnimatedWeatherIcon;