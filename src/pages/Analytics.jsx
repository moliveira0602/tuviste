import React, { useState, useEffect } from "react";
import { Article } from "@/api/entities";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { pt } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Eye, Calendar, Newspaper, Globe } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getCategoryLabel } from "../components/utils/categories";

export default function AnalyticsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const data = await Article.list("-created_date", 2000);
        setArticles(data);
        
        const published = data.filter(a => a.status === "publicado");
        const totalViews = data.reduce((sum, a) => sum + (a.views || 0), 0);
        const avgViews = totalViews / (published.length || 1);
        
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
          const date = subDays(new Date(), i);
          const dayArticles = published.filter(a => a.published_date && new Date(a.published_date) >= startOfDay(date) && new Date(a.published_date) <= endOfDay(date));
          return {
            date: format(date, "dd/MM", { locale: pt }),
            artigos: dayArticles.length,
            visualizacoes: dayArticles.reduce((sum, a) => sum + (a.views || 0), 0)
          };
        }).reverse();
        
        const categoryData = published.reduce((acc, article) => {
          const category = getCategoryLabel(article.category);
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});
        
        const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

        setStats({ totalArticles: data.length, publishedArticles: published.length, totalViews, avgViews: Math.round(avgViews) });
        setChartData({ last7Days, categoryData: categoryChartData });
      } catch (error) {
        console.error("Erro ao carregar analytics:", error);
      }
      setLoading(false);
    };
    loadAnalytics();
  }, []);

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];
  const topArticles = articles.filter(a => a.status === "publicado").sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics de Conteúdo</h1>
        {loading ? <p>Carregando...</p> : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total de Artigos" value={stats.totalArticles} icon={<Newspaper />} color="blue" />
              <StatCard title="Publicados" value={stats.publishedArticles} icon={<TrendingUp />} color="green" />
              <StatCard title="Total Visualizações" value={stats.totalViews?.toLocaleString()} icon={<Eye />} color="purple" />
              <StatCard title="Média por Artigo" value={stats.avgViews} icon={<BarChart3 />} color="orange" />
            </div>
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <ChartCard title="Atividade dos Últimos 7 Dias" icon={<Calendar />}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.last7Days}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis yAxisId="left" orientation="left" stroke="#3B82F6" /><YAxis yAxisId="right" orientation="right" stroke="#10B981" /><Tooltip /><Bar yAxisId="left" dataKey="artigos" fill="#3B82F6" name="Artigos" /><Bar yAxisId="right" dataKey="visualizacoes" fill="#10B981" name="Visualizações" /></BarChart>
                </ResponsiveContainer>
              </ChartCard>
              <ChartCard title="Distribuição por Categoria" icon={<Globe />}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart><Pie data={chartData.categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">{chartData.categoryData?.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}</Pie><Tooltip /></PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
            <Card>
              <CardHeader><CardTitle className="flex items-center"><TrendingUp className="w-5 h-5 mr-2" />Artigos Mais Visualizados</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topArticles.map((article, index) => (
                    <div key={article.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4"><div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><span className="text-sm font-bold text-blue-600">#{index + 1}</span></div><div className="flex-1 min-w-0"><h4 className="font-medium text-gray-900 line-clamp-1">{article.title}</h4><div className="flex items-center space-x-4 mt-1"><span className="text-sm text-gray-500">{article.published_date ? format(new Date(article.published_date), "dd/MM/yyyy", { locale: pt }) : "-"}</span><span className="text-sm text-gray-500 capitalize">{getCategoryLabel(article.category)}</span></div></div></div>
                      <div className="flex items-center space-x-2"><Eye className="w-4 h-4 text-gray-400" /><span className="font-semibold text-gray-900">{(article.views || 0).toLocaleString()}</span></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon, color }) => {
  const colors = { blue: "bg-blue-100 text-blue-600", green: "bg-green-100 text-green-600", purple: "bg-purple-100 text-purple-600", orange: "bg-orange-100 text-orange-600" };
  return (
    <Card className={`border-l-4 border-l-${color}-500`}><CardContent className="p-6"><div className="flex items-center"><div className={`p-3 rounded-full ${colors[color]}`}>{React.cloneElement(icon, { className: "w-6 h-6" })}</div><div className="ml-4"><p className="text-sm font-medium text-gray-600">{title}</p><p className="text-2xl font-bold text-gray-900">{value}</p></div></div></CardContent></Card>
  );
};

const ChartCard = ({ title, icon, children }) => (
  <Card><CardHeader><CardTitle className="flex items-center">{React.cloneElement(icon, { className: "w-5 h-5 mr-2" })}{title}</CardTitle></CardHeader><CardContent>{children}</CardContent></Card>
);