import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { User } from '@/api/entities';
import { translations } from '../lib/translations';
import { InvokeLLM } from '@/api/integrations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'pt-PT');
  const [loading, setLoading] = useState(true);
  const [translationCache, setTranslationCache] = useState(new Map());
  const [translationQueue, setTranslationQueue] = useState([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  useEffect(() => {
    const applyLanguage = async () => {
      let lang = 'pt-PT';
      try {
        const user = await User.me();
        lang = user.preferences?.language || 'pt-PT';
      } catch (error) {
        lang = localStorage.getItem('language') || 'pt-PT';
      }
      setLanguage(lang);
      localStorage.setItem('language', lang);
      setLoading(false);
    };
    applyLanguage();
  }, []);

  const setAndStoreLanguage = (lang) => {
    if (lang === 'pt-PT') {
      setTranslationCache(new Map()); // Limpar cache ao voltar para o idioma original
    }
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };
  
  const t = useMemo(() => (key) => {
    if (!key) return '';
    const keys = key.split('.');
    let result = translations;
    try {
      for (const k of keys) {
        result = result[k];
      }
      return result[language] || result['pt-PT'] || key;
    } catch (e) {
      return key;
    }
  }, [language]);

  // Process translation queue with rate limiting
  useEffect(() => {
    const processQueue = async () => {
      if (isProcessingQueue || translationQueue.length === 0) return;
      
      setIsProcessingQueue(true);
      const currentItem = translationQueue[0];
      
      try {
        // Add delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const translationPrompt = `
          Translate the 'title', 'summary', and 'content' fields of the following JSON object to English (en-US).
          Do not translate any other fields. Return only the JSON object with the translated fields.
          Keep the same formatting and structure.

          Original JSON:
          ${JSON.stringify({ 
            title: currentItem.article.title, 
            summary: currentItem.article.summary, 
            content: currentItem.article.content 
          })}
        `;
        
        const translatedData = await InvokeLLM({
          prompt: translationPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              summary: { type: "string" },
              content: { type: "string" },
            },
          },
        });

        const translatedArticle = { ...currentItem.article, ...translatedData };
        setTranslationCache(prevCache => new Map(prevCache).set(currentItem.article.id, translatedArticle));
        
        // Call the resolve function to return the translated article
        currentItem.resolve(translatedArticle);
        
      } catch (error) {
        console.error("Error translating article:", error);
        
        // If rate limit error, wait longer and retry
        if (error.message?.includes('429') || error.message?.includes('rate limit')) {
          console.log("Rate limit hit, waiting 5 seconds before retry...");
          await new Promise(resolve => setTimeout(resolve, 5000));
          setIsProcessingQueue(false);
          return; // Don't remove from queue, will retry
        }
        
        // For other errors, return original article
        currentItem.resolve(currentItem.article);
      }
      
      // Remove processed item from queue
      setTranslationQueue(prev => prev.slice(1));
      setIsProcessingQueue(false);
    };

    processQueue();
  }, [translationQueue, isProcessingQueue]);

  const translateArticle = useCallback(async (article) => {
    if (language === 'pt-PT') return article;
    if (translationCache.has(article.id)) {
      return translationCache.get(article.id);
    }

    // Return a promise that will be resolved when the translation is complete
    return new Promise((resolve) => {
      // Check if article is already in queue
      const isInQueue = translationQueue.some(item => item.article.id === article.id);
      if (isInQueue) {
        // If already in queue, return original for now
        resolve(article);
        return;
      }

      // Add to translation queue
      setTranslationQueue(prev => [...prev, { article, resolve }]);
    });
  }, [language, translationCache, translationQueue]);

  const value = { language, setLanguage: setAndStoreLanguage, t, loading, translateArticle };

  if (loading) return null;

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}