
import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Article } from "@/api/entities";
import { Search, Newspaper, Loader2, Command } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const categoryLabels = {
  politica: "Política",
  economia: "Economia",
  tecnologia: "Tecnologia", 
  saude: "Saúde",
  desporto: "Desporto",
  cultura: "Cultura",
  ciencia: "Ciência",
  mundo: "Mundo"
};

export default function SearchModal({ isOpen, setIsOpen }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch all articles once when the modal is first opened
  useEffect(() => {
    if (isOpen && initialLoad) {
      const fetchArticles = async () => {
        setLoading(true);
        const allArticles = await Article.filter({ status: "publicado" }, "-published_date", 500);
        setArticles(allArticles);
        setLoading(false);
        setInitialLoad(false);
      };
      fetchArticles();
    }
  }, [isOpen, initialLoad]);

  // Debounce search input
  useEffect(() => {
    if (initialLoad) return; // Don't search until articles are loaded

    const handler = setTimeout(() => {
      if (searchTerm) {
        const lowercasedTerm = searchTerm.toLowerCase();
        const results = articles.filter(article =>
          article.title.toLowerCase().includes(lowercasedTerm) ||
          article.summary?.toLowerCase().includes(lowercasedTerm)
        ).slice(0, 10); // Limit to top 10 results
        setFilteredArticles(results);
      } else {
        setFilteredArticles([]);
      }
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, articles, initialLoad]);

  // Clear search term when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setFilteredArticles([]);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[625px] p-0 gap-0">
        <DialogHeader className="py-6 pl-6 pr-12 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              placeholder="Pesquisar notícias..."
              className="pl-10 pr-14 text-lg h-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 border rounded-md px-1.5 py-0.5 flex items-center">
              <Command className="w-3 h-3 mr-1" /> K
            </div>
          </div>
        </DialogHeader>
        <div className="p-6 pt-0 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Carregando artigos...</span>
            </div>
          ) : searchTerm && filteredArticles.length === 0 ? (
            <div className="text-center text-gray-500 p-8">
              Nenhum resultado encontrado para "{searchTerm}".
            </div>
          ) : !searchTerm ? (
            <div className="text-center text-gray-400 p-8">
              Comece a digitar para pesquisar em mais de {articles.length} artigos.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredArticles.map(article => (
                <Link
                  key={article.id}
                  to={createPageUrl(`Article?id=${article.id}`)}
                  onClick={() => setIsOpen(false)}
                  className="block p-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 line-clamp-1">{article.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-1 mt-1">{article.summary}</p>
                    </div>
                    {article.category && (
                      <Badge variant="outline" className="ml-4">{categoryLabels[article.category] || article.category}</Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
