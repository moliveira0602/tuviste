
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { pt, enUS } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { getCategoryLabel } from "../utils/categories";
import { useLanguage } from "../context/LanguageContext";

const ArticleDisplay = ({ article }) => {
    const { language, translateArticle } = useLanguage();
    const [displayArticle, setDisplayArticle] = useState(article);
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationError, setTranslationError] = useState(false);

    useEffect(() => {
        const processTranslation = async () => {
            if (language === 'en-US' && !article.isTranslated) {
                setIsTranslating(true);
                setTranslationError(false);
                
                try {
                    const translated = await translateArticle(article);
                    setDisplayArticle({ ...translated, isTranslated: true });
                } catch (error) {
                    console.error("Translation failed:", error);
                    setTranslationError(true);
                    setDisplayArticle(article); // Fallback to original
                } finally {
                    setIsTranslating(false);
                }
            } else if (language === 'pt-PT') {
                setDisplayArticle(article);
                setTranslationError(false);
            }
        };
        processTranslation();
    }, [language, article, translateArticle]);

    // Separate effect to handle article changes
    useEffect(() => {
        if (article.id !== displayArticle.id && !isTranslating) {
            setDisplayArticle(article);
            setTranslationError(false);
        }
    }, [article.id, displayArticle.id, isTranslating, article]);

    if (isTranslating) {
        return (
            <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-white" />
                <p className="mt-2 text-blue-200">Translating...</p>
            </div>
        );
    }
    
    const locale = language === 'en-US' ? enUS : pt;
    const dateFormat = language === 'en-US' ? "MMMM d" : "d 'de' MMMM";

    return (
        <>
            <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white mb-6 inline-block border-none shadow-lg">
              {getCategoryLabel(displayArticle.category, language)}
            </Badge>
            
            <Link to={createPageUrl(`Article?id=${displayArticle.id}`)}>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight hover:text-blue-300 transition-colors mb-6 break-words text-white">
                {displayArticle.title}
              </h1>
            </Link>

            <div className="mb-6">
              {displayArticle.summary && (
                <p className="max-w-4xl mx-auto text-lg sm:text-xl text-blue-100 leading-relaxed break-words">
                  {displayArticle.summary}
                </p>
              )}
            </div>

            <div className="flex flex-wrap justify-center items-center gap-6 text-blue-200">
              {displayArticle.author && (
                <span className="text-sm sm:text-base font-medium">Por {displayArticle.author}</span>
              )}
              {displayArticle.published_date && (
                <div className="flex items-center text-sm sm:text-base">
                  <Calendar className="w-4 h-4 mr-1" />
                  {format(new Date(displayArticle.published_date), dateFormat, { locale })}
                </div>
              )}
              <div className="flex items-center text-sm sm:text-base">
                <Eye className="w-4 h-4 mr-1" />
                {(displayArticle.views || 0).toLocaleString()}
              </div>
            </div>
            
            {translationError && language === 'en-US' && (
                <div className="mt-4 text-center">
                    <p className="text-sm text-blue-200 opacity-75">
                        Translation temporarily unavailable - showing original content
                    </p>
                </div>
            )}
        </>
    );
};

export default function HeroSection({ articles }) {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeClass, setFadeClass] = useState("opacity-100");

  useEffect(() => {
    if (articles.length > 1) {
      const interval = setInterval(() => {
        setFadeClass("opacity-0");
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % articles.length);
          setFadeClass("opacity-100");
        }, 500);
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [articles.length]);

  if (!articles || articles.length === 0) return null;

  const mainArticle = articles[currentIndex];

  const goToNext = () => {
    setFadeClass("opacity-0");
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
      setFadeClass("opacity-100");
    }, 500);
  };
  const goToPrev = () => {
    setFadeClass("opacity-0");
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
      setFadeClass("opacity-100");
    }, 500);
  };

  // Supondo que o Hero tenha uma imagem de fundo para o artigo principal
  const heroBackgroundImage = mainArticle.image_url || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80';

  return (
    <section className="bg-gray-800 text-white relative isolate">
        <img 
            src={heroBackgroundImage}
            alt={`Imagem de fundo para o artigo: ${mainArticle.title}`}
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30"
            fetchpriority="high" /* Prioridade para a imagem principal */
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 -z-10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="lg:text-center relative min-h-[450px] flex flex-col justify-center">
          <div className={`transition-opacity duration-500 ease-in-out ${fadeClass}`}>
             <ArticleDisplay article={mainArticle} />
          </div>
          <div className="absolute inset-x-0 bottom-0 sm:bottom-1/2 sm:translate-y-1/2 flex justify-between items-center px-4">
            <button
              onClick={goToPrev}
              className="p-2 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-300 text-white shadow-lg z-10"
              aria-label="Previous article"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="p-2 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-300 text-white shadow-lg z-10"
              aria-label="Next article"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
          <div className="absolute inset-x-0 bottom-0 pb-4 flex justify-center gap-2">
            {articles.map((_, index) => (
              <span
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-white" : "bg-white bg-opacity-50"
                }`}
              ></span>
            ))}
          </div>
        </div>
        <div className="mt-16 border-t border-blue-800 pt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.slice(0, 3).map((article, index) => (
            <Link key={article.id} to={createPageUrl(`Article?id=${article.id}`)} className="block group">
              <div className="bg-blue-900 bg-opacity-30 rounded-lg p-6 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                <Badge className="bg-orange-500 text-white mb-4 inline-block">{getCategoryLabel(article.category, language)}</Badge>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-300 transition-colors flex-grow">
                  {article.title}
                </h3>
                <div className="flex items-center text-blue-200 text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  {format(new Date(article.published_date), language === 'en-US' ? "MMM d, yyyy" : "d 'de' MMM, yyyy", { locale: language === 'en-US' ? enUS : pt })}
                  <Eye className="w-4 h-4 ml-4 mr-1" />
                  {(article.views || 0).toLocaleString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
