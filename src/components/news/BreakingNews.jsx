import React, { useState, useEffect } from "react";
import { Article } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export default function BreakingNews() {
  const [breakingNews, setBreakingNews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeClass, setFadeClass] = useState("opacity-100");

  useEffect(() => {
    const loadBreakingNews = async () => {
      try {
        // Buscar notícias urgentes dos últimos 2 dias
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const articles = await Article.filter(
          { 
            status: "publicado", 
            is_breaking: true 
          }, 
          "-published_date", 
          10
        );
        
        const recentBreaking = articles.filter(article => {
          if (!article.published_date) return false;
          const publishedDate = new Date(article.published_date);
          return publishedDate >= twoDaysAgo;
        });

        setBreakingNews(recentBreaking);
      } catch (error) {
        console.error("Erro ao carregar breaking news:", error);
      }
    };

    loadBreakingNews();
  }, []);

  useEffect(() => {
    if (breakingNews.length > 1) {
      const interval = setInterval(() => {
        setFadeClass("opacity-0"); // Começar o fade out
        
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
          setFadeClass("opacity-100"); // Fade in da nova notícia
        }, 300); // Esperar 300ms para trocar o conteúdo
      }, 5000); // Troca a cada 5 segundos

      return () => clearInterval(interval);
    }
  }, [breakingNews.length]);

  if (breakingNews.length === 0) return null;

  const currentNews = breakingNews[currentIndex];

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-2 overflow-hidden shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <div className="flex items-center space-x-2 mr-4 flex-shrink-0">
            <AlertCircle className="w-4 h-4 animate-pulse" />
            <span className="font-bold text-sm uppercase tracking-wide">
              Última Hora
            </span>
          </div>
          
          <div className={`flex-1 min-w-0 transition-opacity duration-300 ease-in-out ${fadeClass}`}>
            <Link 
              to={createPageUrl(`Article?id=${currentNews.id}`)}
              className="block hover:text-red-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <p className="text-sm font-medium truncate flex-1">
                  {currentNews.title}
                </p>
                <div className="flex items-center space-x-1 text-xs text-red-100">
                  <Clock className="w-3 h-3" />
                  <span>
                    {format(new Date(currentNews.published_date), "HH:mm", { locale: pt })}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}