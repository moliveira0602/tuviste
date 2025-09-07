import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Newspaper } from 'lucide-react';
import ArticleCard from './ArticleCard'; // We'll reuse the existing card for consistency

export default function CategorySection({ title, articles, category, description }) {
  if (!articles || articles.length === 0) {
    return null; // Don't render the section if there are no articles
  }

  const mainArticle = articles[0];
  const sideArticles = articles.slice(1, 3); // Two smaller articles

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-6 border-b-2 border-blue-600 pb-2">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          {description && <p className="text-gray-600 mt-1">{description}</p>}
        </div>
        <Link 
          to={createPageUrl(`Noticias`)} // Simple link to all news page for now
          className="flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors"
        >
          Ver Mais <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {articles.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Main article of the section */}
          <div className="lg:col-span-1">
            <ArticleCard article={mainArticle} />
          </div>
          
          {/* Side articles */}
          <div className="lg:col-span-1 space-y-8">
            {sideArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <Newspaper className="w-12 h-12 mx-auto text-gray-400" />
          <p className="mt-4 text-gray-600">Nenhum artigo encontrado para esta categoria.</p>
        </div>
      )}
    </section>
  );
}