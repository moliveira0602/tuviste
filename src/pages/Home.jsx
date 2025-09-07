import React, { useState, useEffect, useCallback, Suspense, lazy } from "react";
import { Article } from "@/api/entities";
import { ArrowRight, Star, Zap, Newspaper, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import GridArticleCard from "../components/news/GridArticleCard";
import HeroSection from "../components/news/HeroSection";
import TrendingSection from "../components/news/TrendingSection";
import { useLanguage } from "../components/context/LanguageContext";
import SEO from "../components/SEO";

// Lazy loading dos widgets da sidebar
const MarketWidget = lazy(() => import("../components/widgets/MarketWidget"));
const SportsWidget = lazy(() => import("../components/widgets/SportsWidget"));
const UsefulNumbersWidget = lazy(() => import("../components/widgets/UsefulNumbersWidget"));
const FireMapWidget = lazy(() => import("../components/widgets/FireMapWidget"));
const AgendaWidget = lazy(() => import("../components/widgets/AgendaWidget"));
const TrendingTopics = lazy(() => import("../components/widgets/TrendingTopics"));

const WidgetLoader = () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg w-full"></div>;

export default function HomePage() {
  const { t } = useLanguage();
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [mostViewed, setMostViewed] = useState([]);
  const [latest24h, setLatest24h] = useState([]);
  const [editorsPicks, setEditorsPicks] = useState([]);
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Busca otimizada de artigos por categoria/critério
      const [
        featuredData,
        trendingData,
        mostViewedData,
        latest24hData,
        editorsPicksData,
        politicaData,
        tecnologiaData,
        desportoData,
      ] = await Promise.all([
        Article.list("-published_date", 5),
        Article.filter({ trending_score: { '$gt': 50 } }, "-trending_score", 5),
        Article.list("-views", 6),
        Article.filter({ published_date: { '$gte': new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() } }, "-published_date", 6),
        Article.filter({ is_editors_pick: true }, "-published_date", 6),
        Article.filter({ category: "politica", status: "publicado" }, "-published_date", 6),
        Article.filter({ category: "tecnologia", status: "publicado" }, "-published_date", 6),
        Article.filter({ category: "desporto", status: "publicado" }, "-published_date", 6),
      ]);
      
      setFeatured(featuredData.filter(a => new Date(a.published_date) >= thirtyDaysAgo));
      setTrending(trendingData);
      setMostViewed(mostViewedData.filter(a => new Date(a.published_date) >= thirtyDaysAgo));
      setLatest24h(latest24hData);
      setEditorsPicks(editorsPicksData.filter(a => new Date(a.published_date) >= thirtyDaysAgo));
      setSections({
        politica: politicaData,
        tecnologia: tecnologiaData,
        desporto: desportoData
      });

    } catch (error) {
      console.error("Erro ao carregar artigos:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadAllData(); }, [loadAllData]);
  
  const Section = ({ title, category }) => {
    const sectionArticles = sections[category] || [];
    if (loading || sectionArticles.length === 0) return null;
    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6 border-b-2 border-blue-600 pb-2">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          <Link to={createPageUrl(`Noticias?category=${category}`)} className="flex items-center text-blue-600 hover:text-blue-800 font-semibold">{t('home.seeMore')} <ArrowRight className="w-4 h-4 ml-1" /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sectionArticles.map(article => <GridArticleCard key={article.id} article={article} />)}
        </div>
      </section>
    );
  };

  const SpecialSection = ({ title, articles: sectionArticles, icon }) => {
    if (loading || sectionArticles.length === 0) return null;
    return (
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6 border-b-2 border-purple-600 pb-2">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">{icon && <span className="mr-3">{icon}</span>}{title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sectionArticles.map(article => <GridArticleCard key={article.id} article={article} />)}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title="Tuviste? - As Últimas Notícias de Portugal e do Mundo"
        description="Acompanhe as notícias de última hora, política, desporto, tecnologia e muito mais. O seu portal de informação atualizado ao minuto."
        keywords="notícias, portugal, mundo, desporto, política, tecnologia, economia"
      />
      
      {loading ? 
        <div className="animate-pulse bg-gray-300 h-[600px] w-full"></div> : 
        featured.length > 0 && <HeroSection articles={featured} />
      }
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-9">
            {loading ? (
              <div className="space-y-4">{Array(12).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>)}</div>
            ) : (
              <div className="space-y-16">
                <Section title={t('categories.politica')} category="politica" />
                <Section title={t('categories.tecnologia')} category="tecnologia" />
                <Suspense fallback={null}>
                  <TrendingTopics />
                </Suspense>
                <SpecialSection title={t('home.mostRead')} articles={mostViewed} icon={<Star className="w-6 h-6 text-purple-600" />} />
                <SpecialSection title={t('home.last24h')} articles={latest24h} icon={<Zap className="w-6 h-6 text-purple-600" />} />
                <SpecialSection title={t('home.editorsPicks')} articles={editorsPicks} icon={<Award className="w-6 h-6 text-purple-600" />} />
                <Section title={t('categories.desporto')} category="desporto" />
              </div>
            )}
          </div>
          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-8 pb-8">
              <Suspense fallback={<WidgetLoader />}>
                <AgendaWidget />
                <SportsWidget />
                <MarketWidget />
                <FireMapWidget />
                <UsefulNumbersWidget />
                {trending.length > 0 && <TrendingSection articles={trending} />}
              </Suspense>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}