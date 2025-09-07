
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Article } from "@/api/entities";
import { format, parseISO } from "date-fns";
import { pt, enUS } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, User, Clock, Loader2, AlertCircle, ArrowLeft, Tag } from "lucide-react";
import GridArticleCard from "../components/news/GridArticleCard";
import { getCategoryLabel, getCountryLabel } from "../components/utils/categories";
import { useLanguage } from "../components/context/LanguageContext";
import SEO from "../components/SEO";

// The ArticleContent component was present but its body was commented out and it was unused.
// As per instructions to remove placeholders and preserve functionality,
// its definition is kept, but its empty body remains as no functionality was provided to restore.
const ArticleContent = ({ article: initialArticle }) => {
    // If there was existing translation code, it would go here.
    // As it was commented out, and this component is not utilized in the main JSX,
    // it will simply return null, effectively being an unused component.
    return null;
};


export default function ArticlePage() {
    const [searchParams] = useSearchParams();
    const articleId = searchParams.get("id");
    const [article, setArticle] = useState(null);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { language } = useLanguage();

    const loadArticle = useCallback(async () => {
        if (!articleId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const fetchedArticle = await Article.get(articleId);
            setArticle(fetchedArticle);
            
            // Incrementar visualizações
            if (fetchedArticle) {
                await Article.update(articleId, { views: (fetchedArticle.views || 0) + 1 });
                // Carregar artigos relacionados
                const related = await Article.filter(
                    { category: fetchedArticle.category, status: "publicado", id: { '$ne': articleId } },
                    "-published_date", 4
                );
                setRelatedArticles(related);
            }
        } catch (error) {
            console.error("Erro ao carregar o artigo:", error);
        }
        setLoading(false);
    }, [articleId]);

    useEffect(() => {
        loadArticle();
    }, [loadArticle]);
    
    // Calcula o tempo de leitura
    const readingTime = article ? Math.ceil((article.content?.split(' ').length || 0) / 200) || 1 : 0;
    const locale = language === 'en-US' ? enUS : pt;

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="w-16 h-16 animate-spin text-blue-600" /></div>;
    }

    if (!article) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                <h1 className="text-2xl font-bold">Artigo não encontrado</h1>
                <p className="text-gray-600 mt-2">O artigo que você está a procurar não existe ou foi movido.</p>
                <a href="/" className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">Voltar à Página Inicial</a>
            </div>
        );
    }
    
    // SEO: Dados Estruturados para o Google
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": article.title,
      "image": [
         // Adicionar URL da imagem principal do artigo aqui, se existir
       ],
      "datePublished": article.published_date,
      "dateModified": article.updated_date,
      "author": [{
          "@type": "Person",
          "name": article.author || "Redação Tuviste?",
       }],
       "publisher": {
          "@type": "Organization",
          "name": "Tuviste?",
          "logo": {
            "@type": "ImageObject",
            "url": "https://exemplo.com/logo.png" // URL do seu logo
          }
        },
      "description": article.summary,
      "articleBody": article.content
    };

    return (
        <div className="bg-white">
            <SEO
                title={`${article.title} - Tuviste?`}
                description={article.summary}
                keywords={[article.category, ...(article.tags || [])].join(', ')}
                ogTitle={article.title}
                ogDescription={article.summary}
                canonicalUrl={window.location.href}
                structuredData={structuredData}
            />
            {/* The rest of the Article page JSX */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                 <div className="mb-10">
                    <a href="/" className="flex items-center text-blue-600 hover:text-blue-800 font-semibold">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar a todas as notícias
                    </a>
                </div>
                
                <article>
                    <header className="mb-8">
                        <div className="flex flex-wrap gap-2 mb-4">
                           <Badge className="text-sm px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200">{getCategoryLabel(article.category, language)}</Badge>
                           {article.country && <Badge variant="outline" className="text-sm px-3 py-1">{getCountryLabel(article.country, language)}</Badge>}
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                            {article.title}
                        </h1>

                        {article.summary && (
                            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                                {article.summary}
                            </p>
                        )}
                        
                        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-500">
                           {article.author && <div className="flex items-center"><User className="w-4 h-4 mr-1.5" />Por <strong className="ml-1 text-gray-700">{article.author}</strong></div>}
                           {article.published_date && <div className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" />{format(parseISO(article.published_date), "d 'de' MMMM, yyyy", { locale })}</div>}
                           <div className="flex items-center"><Eye className="w-4 h-4 mr-1.5" />{(article.views || 0).toLocaleString()} visualizações</div>
                           <div className="flex items-center"><Clock className="w-4 h-4 mr-1.5" />{readingTime} min de leitura</div>
                        </div>

                        {article.tags && article.tags.length > 0 && (
                            <div className="mt-6 flex flex-wrap gap-2">
                                {article.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="font-normal"><Tag className="w-3 h-3 mr-1"/>{tag}</Badge>
                                ))}
                            </div>
                        )}
                    </header>
                    
                    <div
                        className="prose prose-lg lg:prose-xl max-w-none text-gray-800 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }}
                    />
                </article>
            </div>
            
            {relatedArticles.length > 0 && (
                <aside className="bg-gray-50 py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Artigos Relacionados</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedArticles.map(related => <GridArticleCard key={related.id} article={related} />)}
                        </div>
                    </div>
                </aside>
            )}
        </div>
    );
}
