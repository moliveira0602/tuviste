
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Article } from "@/api/entities";
import { Newspaper, Filter } from "lucide-react";
import CategoryFilter from "../components/news/CategoryFilter";
import ArticleCard from "../components/news/ArticleCard";
import SEO from "../components/SEO";

export default function NoticiasPage() {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");

  const [articles, setArticles] = useState([]);
  const [allArticles, setAllArticles] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || "todas");

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await Article.filter({ status: "publicado" }, "-published_date", 2000);
      setAllArticles(data);
      
      // Extrair categorias únicas dos artigos e criar lista dinâmica
      const uniqueCategories = [...new Set(data.map(a => a.category).filter(Boolean))].sort();
      const dynamicCategories = [
        { value: "todas", label: "Todas" },
        ...uniqueCategories.map(cat => ({ value: cat, label: cat }))
      ];
      setAvailableCategories(dynamicCategories);
      
    } catch (error) {
      console.error("Erro ao carregar artigos:", error);
      setAllArticles([]);
      setAvailableCategories([{ value: "todas", label: "Todas" }]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let filteredArticles = [...allArticles];
    if (selectedCategory && selectedCategory !== "todas") {
      filteredArticles = filteredArticles.filter(article => article.category === selectedCategory);
    }
    setArticles(filteredArticles);
  }, [allArticles, selectedCategory]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const pageTitle = selectedCategory === "todas" ? "Todas as Notícias" : `Notícias de ${selectedCategory}`;
  const pageDescription = `Explore os últimos acontecimentos na categoria de ${selectedCategory}.`;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title={`${pageTitle} - Tuviste?`}
        description={pageDescription}
        keywords={`notícias, ${selectedCategory}, portugal, atualidade`}
      />
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Newspaper className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {pageTitle}
          </h1>
          <p className="text-xl text-blue-100 leading-relaxed">
            Explore os últimos acontecimentos em todas as categorias
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-bold text-gray-900">Filtrar por Categoria</h2>
          </div>
          <CategoryFilter 
            categories={availableCategories}
            selected={selectedCategory} 
            onSelect={setSelectedCategory} 
          />
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="grid gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-24 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="grid gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Nenhuma notícia encontrada
            </h3>
            <p className="text-gray-600">
              {selectedCategory !== "todas"
                ? `Não há artigos para a categoria "${selectedCategory}".`
                : "Não há artigos disponíveis no momento."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
