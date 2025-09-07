
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Eye } from "lucide-react";
import { getCategoryLabel } from "../utils/categories"; // Updated import path

export default function TrendingSection({ articles }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
        <TrendingUp className="w-4 h-4 mr-2 text-red-500" />
        Em Destaque
      </h3>
      <div className="space-y-4">
        {articles.map((article, index) => (
          <div key={article.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0">
            <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-red-600">{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <Badge variant="outline" className="text-xs mb-1">
                {getCategoryLabel(article.category)}
              </Badge>
              <Link to={createPageUrl(`Article?id=${article.id}`)}>
                <h4 className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 text-sm leading-tight">
                  {article.title}
                </h4>
              </Link>
              <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                {article.published_date && (
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {format(new Date(article.published_date), "d MMM", { locale: pt })}
                  </div>
                )}
                <div className="flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  {(article.views || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
