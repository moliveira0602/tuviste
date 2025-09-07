
import React, { useState, useEffect, useCallback } from "react";
import { Article } from "@/api/entities";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search,
  Filter,
  Plus,
  TrendingUp,
  Zap,
  Tag,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { getCategoryLabel, getCategoryColor, availableCategories } from "../components/utils/categories";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [stats, setStats] = useState({});
  const [selectedArticles, setSelectedArticles] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let filters = {};
      if (statusFilter !== "todos") {
        filters.status = statusFilter;
      }
      
      const articleData = await Article.filter(filters, "-created_date", 500);
      setArticles(articleData);

      const published = articleData.filter(a => a.status === "publicado").length;
      const pending = articleData.filter(a => a.status === "pendente").length;
      const drafts = articleData.filter(a => a.status === "rascunho").length;
      const totalViews = articleData.reduce((sum, a) => sum + (a.views || 0), 0);
      
      setStats({ total: articleData.length, published, pending, drafts, totalViews });
      
      setSelectedArticles([]);
      
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setArticles([]);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateArticleStatus = async (articleId, newStatus) => {
    try {
      const articleToUpdate = articles.find(a => a.id === articleId);
      const publishedDate = newStatus === "publicado" && !articleToUpdate?.published_date 
                              ? new Date().toISOString() 
                              : undefined;

      await Article.update(articleId, { 
        status: newStatus,
        ...(publishedDate && { published_date: publishedDate })
      });
      loadData();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const updateArticleCategory = async (articleId, newCategory) => {
    try {
      await Article.update(articleId, { category: newCategory });
      loadData();
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
    }
  };

  const toggleBreakingNews = async (articleId, currentValue) => {
    try {
      await Article.update(articleId, { is_breaking: !currentValue });
      await loadData();
    } catch (error) {
      console.error("Erro ao alternar 'Última Hora':", error);
    }
  };

  const toggleEditorsPick = async (articleId, currentValue) => {
    try {
      await Article.update(articleId, { is_editors_pick: !currentValue });
      await loadData();
    } catch (error) {
      console.error("Erro ao alternar 'Seleção do Editor':", error);
    }
  };

  const deleteSelectedArticles = async () => {
    if (confirm(`Tem certeza que deseja excluir os ${selectedArticles.length} artigos selecionados?`)) {
      try {
        await Promise.all(selectedArticles.map(id => Article.delete(id)));
        setSelectedArticles([]);
        loadData();
      } catch (error) {
        console.error("Erro ao excluir artigos selecionados:", error);
      }
    }
  };

  const handleSelectOne = (id) => {
    setSelectedArticles(prev => 
      prev.includes(id) ? prev.filter(articleId => articleId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedArticles(filteredArticles.map(a => a.id));
    } else {
      setSelectedArticles([]);
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusLabels = { rascunho: "Rascunho", pendente: "Pendente", publicado: "Publicado", rejeitado: "Rejeitado" };
  const statusColors = { rascunho: "bg-gray-100 text-gray-800", pendente: "bg-yellow-100 text-yellow-800", publicado: "bg-green-100 text-green-800", rejeitado: "bg-red-100 text-red-800" };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Artigos</h1>
            <p className="text-gray-600 mt-1">Gerir conteúdo, publicações e estatísticas</p>
          </div>
          <Link to={createPageUrl("CreateArticle")}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Criar Artigo
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <StatCard title="Total" value={stats.total || 0} icon={<TrendingUp />} color="blue" />
          <StatCard title="Publicados" value={stats.published || 0} icon={<CheckCircle />} color="green" />
          <StatCard title="Pendentes" value={stats.pending || 0} icon={<Clock />} color="yellow" />
          <StatCard title="Rascunhos" value={stats.drafts || 0} icon={<Edit />} color="gray" />
          <StatCard title="Visualizações" value={(stats.totalViews || 0).toLocaleString()} icon={<Eye />} color="purple" />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input placeholder="Pesquisar artigos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option value="todos">Todos os status</option>
                  <option value="rascunho">Rascunhos</option>
                  <option value="pendente">Pendentes</option>
                  <option value="publicado">Publicados</option>
                  <option value="rejeitado">Rejeitados</option>
                </select>
              </div>
              {selectedArticles.length > 0 && (
                <Button variant="destructive" onClick={deleteSelectedArticles}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir ({selectedArticles.length})
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left w-12"><Checkbox checked={selectedArticles.length === filteredArticles.length && filteredArticles.length > 0} onCheckedChange={handleSelectAll} /></th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">Artigo</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-3 py-4 w-12"><Checkbox checked={selectedArticles.includes(article.id)} onCheckedChange={() => handleSelectOne(article.id)} /></td>
                    <td className="px-4 py-4 w-2/5">
                      <div className="max-w-md">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 truncate flex-1 min-w-0">{article.title}</span>
                          {article.is_editors_pick && <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs font-bold flex items-center gap-1 flex-shrink-0"><Star className="w-3 h-3" />Editor</Badge>}
                          {article.is_breaking && <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-none text-xs font-bold flex items-center gap-1 flex-shrink-0"><Zap className="w-3 h-3" />UH</Badge>}
                        </div>
                        {article.summary && <div className="text-xs text-gray-500 truncate mt-1">{article.summary}</div>}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Badge className={`${getCategoryColor(article.category)} text-xs truncate max-w-20 cursor-pointer`}>{getCategoryLabel(article.category)}</Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {availableCategories.filter(c => c.value !== 'todas').map(cat => (
                            <DropdownMenuItem key={cat.value} onSelect={() => updateArticleCategory(article.id, cat.value)}>{cat.label}</DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap"><Badge className={`${statusColors[article.status]} text-xs`}>{statusLabels[article.status]}</Badge></td>
                    <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-500">{article.created_date ? format(new Date(article.created_date), "dd/MM/yy", { locale: pt }) : "-"}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-xs text-gray-500"><div className="flex items-center"><Eye className="w-3 h-3 mr-1" />{(article.views || 0).toLocaleString()}</div></td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-xs font-medium">
                      <div className="flex items-center justify-end space-x-1">
                        {article.status === "pendente" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => updateArticleStatus(article.id, "publicado")} className="text-green-600 hover:bg-green-50 border-green-200 p-1" title="Aprovar"><CheckCircle className="w-3 h-3" /></Button>
                            <Button size="sm" variant="outline" onClick={() => updateArticleStatus(article.id, "rejeitado")} className="text-red-600 hover:bg-red-50 border-red-200 p-1" title="Rejeitar"><XCircle className="w-3 h-3" /></Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" onClick={() => toggleEditorsPick(article.id, article.is_editors_pick)} className={`${article.is_editors_pick ? "text-yellow-600 hover:bg-yellow-50 border-yellow-200" : ""} p-1`} title={article.is_editors_pick ? "Remover Seleção" : "Marcar como Seleção"}><Star className="w-3 h-3" /></Button>
                        <Button size="sm" variant="outline" onClick={() => toggleBreakingNews(article.id, article.is_breaking)} className={`${article.is_breaking ? "text-blue-600 hover:bg-blue-50 border-blue-200" : ""} p-1`} title={article.is_breaking ? "Remover UH" : "Marcar UH"}><Zap className="w-3 h-3" /></Button>
                        {article.status === "publicado" && <Link to={createPageUrl(`Article?id=${article.id}`)}><Button size="sm" variant="outline" title="Ver" className="p-1"><Eye className="w-3 h-3" /></Button></Link>}
                        <Button size="sm" variant="outline" onClick={() => deleteSelectedArticles([article.id])} className="text-red-600 hover:bg-red-50 border-red-200 p-1" title="Excluir"><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredArticles.length === 0 && <div className="p-8 text-center"><p className="text-gray-500">Nenhum artigo encontrado.</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    gray: "bg-gray-100 text-gray-600",
    purple: "bg-purple-100 text-purple-600",
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colors[color]}`}>{React.cloneElement(icon, { className: "w-6 h-6" })}</div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};
