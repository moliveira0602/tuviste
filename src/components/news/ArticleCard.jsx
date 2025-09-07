import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, Tag, Clock, ArrowUpRight } from "lucide-react";
import { getCategoryLabel, getCategoryColor, getCountryLabel } from "../utils/categories";

export default function ArticleCard({ article }) {
  const readingTime = Math.ceil((article.content?.length || 0) / 1000) || 1;
  const badgeLabel = getCategoryLabel(article.category);
  const badgeColor = getCategoryColor(article.category);

  return (
    <Link to={createPageUrl(`Article?id=${article.id}`)} className="group">
      <article className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:transform group-hover:scale-[1.02]">
        <div className="p-8 w-full">
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge className={`${badgeColor} border font-medium`}>
              {badgeLabel}
            </Badge>
            {article.country && getCountryLabel(article.country) && (
              <Badge variant="outline" className="text-xs border-gray-300">
                {getCountryLabel(article.country)}
              </Badge>
            )}
            {article.tags?.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs border-gray-300">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-start justify-between mb-3">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2 flex-1">
              {article.title}
            </h2>
            <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors ml-3 flex-shrink-0" />
          </div>

          {article.summary && (
            <p className="text-gray-600 mb-6 line-clamp-2 leading-relaxed text-base">
              {article.summary}
            </p>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-6">
              {article.author && (
                <span className="font-medium">Por {article.author}</span>
              )}
              {article.published_date && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {format(new Date(article.published_date), "d MMM", { locale: pt })}
                </div>
              )}
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {readingTime} min
              </div>
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              <span className="font-medium">{(article.views || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}