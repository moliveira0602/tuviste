
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { pt, enUS } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Loader2, AlertCircle } from 'lucide-react';
import { getCategoryLabel, getCategoryColor } from '../utils/categories';
import { useLanguage } from '../context/LanguageContext';

function GridArticleCard({ article }) {
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
  
  const categoryColor = getCategoryColor(displayArticle.category);
  const categoryLabel = getCategoryLabel(displayArticle.category, language);
  const locale = language === 'en-US' ? enUS : pt;
  const dateFormat = language === 'en-US' ? "MMM d" : "d 'de' MMM";

  // Simulação de uma imagem de artigo
  const imageUrl = `https://picsum.photos/seed/${displayArticle.id}/400/250`;

  return (
    <Link to={createPageUrl(`Article?id=${displayArticle.id}`)} className="group">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        <div className="relative">
            <img 
                src={imageUrl} 
                alt={`Imagem do artigo: ${displayArticle.title}`}
                className="w-full h-48 object-cover" 
                loading="lazy" /* Lazy loading para imagens nos cartões */
            />
        </div>
        <div className="p-6 flex flex-col flex-grow">
            <Badge className={`text-xs font-medium mb-3 ${categoryColor}`}>
                {categoryLabel}
            </Badge>
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-3 mb-4 flex-grow">
                {displayArticle.title}
            </h3>
            <div className="mt-auto border-t border-gray-100 pt-4 flex items-center justify-between text-xs text-gray-500">
                {displayArticle.author && (
                <div className="flex items-center">
                    <User className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{displayArticle.author}</span>
                </div>
                )}
                {displayArticle.published_date && (
                <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span>{format(new Date(displayArticle.published_date), dateFormat, { locale })}</span>
                </div>
                )}
            </div>
        </div>
      </div>
    </Link>
  );
}

// Otimização: Evitar re-renderizações desnecessárias
export default React.memo(GridArticleCard);
