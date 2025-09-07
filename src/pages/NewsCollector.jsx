import React, { useState, useCallback } from "react";
import { Article } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Search, Loader2, CheckCircle, AlertTriangle, ExternalLink, Newspaper, Clock, Sparkles, Trash2, Shield } from "lucide-react";
import { availableCategories, COUNTRIES } from "../components/utils/categories";

export default function NewsCollectorPage() {
  const [loading, setLoading] = useState(false);
  const [searchTopic, setSearchTopic] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [results, setResults] = useState([]);
  const [processingIndex, setProcessingIndex] = useState(-1);
  const [automationStatus, setAutomationStatus] = useState("Inativo");

  const processNewsItem = useCallback(async (newsItem, index) => {
    if (newsItem.processed) return;
    setProcessingIndex(index);
    try {
      if (!newsItem.url || !newsItem.url.startsWith('http')) throw new Error("URL inválido.");
      
      const allArticles = await Article.list('-created_date', 1000);
      const isDuplicate = allArticles.some(article => article.source_urls?.includes(newsItem.url) || article.title.toLowerCase() === newsItem.title.toLowerCase());
      if (isDuplicate) throw new Error('Artigo duplicado.');

      const articlePrompt = `Baseado na notícia de ${newsItem.source} (Título: ${newsItem.title}), escreva um artigo jornalístico ORIGINAL e único em português (300-500 palavras). Reescreva completamente, NÃO copie. Estrutura: lead, desenvolvimento, conclusão.`;
      const originalArticle = await InvokeLLM({ prompt: articlePrompt, add_context_from_internet: false });
      const articleSummary = newsItem.summary || originalArticle.substring(0, 200).trim() + "...";
      
      const slug = newsItem.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").substring(0, 100);
      const categoryFromAPI = availableCategories.find(c => c.label.toLowerCase() === newsItem.category?.toLowerCase())?.value;
      const countryFromAPI = COUNTRIES.find(c => c.label.toLowerCase() === newsItem.country?.toLowerCase())?.value;

      const articleData = {
        title: newsItem.title,
        slug: slug,
        summary: articleSummary,
        content: originalArticle.split('\n').filter(l => l.trim()).map(p => p.trim()).join('\n\n'),
        category: selectedCategory || categoryFromAPI || 'mundo',
        country: selectedCountry || countryFromAPI || 'global',
        tags: [newsItem.category, newsItem.country, ...newsItem.title.split(' ').filter(w => w.length > 4).slice(0, 2)],
        status: "pendente",
        source_urls: [newsItem.url],
        author: `Tuviste? (via ${newsItem.source})`,
        trending_score: newsItem.relevance_score || 50,
      };

      await Article.create(articleData);
      setResults(prev => prev.map((item, i) => i === index ? { ...item, processed: true, success: true } : item));
    } catch (error) {
      console.error("Erro ao processar notícia:", error);
      setResults(prev => prev.map((item, i) => i === index ? { ...item, processed: true, success: false, error: error.message } : item));
    }
    setProcessingIndex(-1);
  }, [selectedCategory, selectedCountry]);

  const runAutomation = async (prompt, schema, statusStart, statusEnd, statusError, statusEmpty) => {
    setLoading(true);
    setResults([]);
    setAutomationStatus(statusStart);
    try {
      const response = await InvokeLLM({ prompt: prompt, add_context_from_internet: true, response_json_schema: schema });
      const news = response.news || [];
      if (news.length > 0) {
        setResults(news);
        setAutomationStatus(statusEnd);
      } else {
        setAutomationStatus(statusEmpty);
      }
    } catch (error) {
      console.error(error);
      setAutomationStatus(statusError);
    }
    setLoading(false);
  };
  
  const collectNews = () => runAutomation(
    `Pesquise notícias REAIS e ATUAIS (últimas 72h) sobre "${searchTopic}" em fontes credíveis (publico.pt, observador.pt, bbc.com, reuters.com). Retorne até 5 notícias.`,
    { type: "object", properties: { news: { type: "array", items: { type: "object", properties: { title: { type: "string" }, source: { type: "string" }, url: { type: "string" }, summary: { type: "string" }, date: { type: "string" }, category: { type: "string" } } } } } },
    "Pesquisa manual em andamento...",
    "Pesquisa manual concluída. Revise e crie artigos.",
    "Erro na pesquisa manual.",
    "Nenhuma notícia encontrada."
  );

  const generateTrendingNews = () => runAutomation(
    `Analise as tendências de notícias das últimas 48h e retorne um JSON com uma lista DIVERSIFICADA de 5 tópicos (Política/Economia PT, Notícias BR, Tecnologia Global, K-Pop). Para cada tópico, encontre uma notícia real e recente em fontes credíveis (publico.pt, g1.globo.com, reuters.com, soompi.com).`,
    { type: "object", properties: { news: { type: "array", items: { type: "object", properties: { title: { type: "string" }, source: { type: "string" }, url: { type: "string" }, summary: { type: "string" }, category: { type: "string" }, country: {type: "string"} } } } } },
    "Analisando tendências diversificadas...",
    "Encontradas notícias de tendências. Processando...",
    "Erro na geração automática.",
    "Nenhum artigo novo e único encontrado."
  ).then(async () => {
      setResults(prev => prev.map(item => ({...item, processed: false, success: false})));
      for (let i = 0; i < 5; i++) {
        const item = (await new Promise(resolve => setTimeout(() => resolve(results[i]), 0)));
        if(item) await processNewsItem(item, i);
      }
  });

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Coletor de Notícias</h1>
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <AutomationCard title="Geração Automática por Tendências" description="Cria até 5 notícias baseadas nos tópicos mais populares do momento." onRun={generateTrendingNews} loading={loading} status={automationStatus} />
          <ManualSearchCard onSearch={collectNews} loading={loading} topic={searchTopic} setTopic={setSearchTopic} category={selectedCategory} setCategory={setSelectedCategory} country={selectedCountry} setCountry={setSelectedCountry} />
        </div>
        
        {results.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-gray-900">Resultados da Coleta ({results.length})</h2><Button variant="outline" onClick={() => setResults([])}><Trash2 className="w-4 h-4 mr-2" />Limpar</Button></div>
            {results.map((item, index) => <NewsItemCard key={index} item={item} onProcess={() => processNewsItem(item, index)} processing={processingIndex === index} />)}
            <Card className="bg-blue-50 border-blue-200"><CardHeader><CardTitle className="flex items-center text-blue-900"><Shield className="w-5 h-5 mr-2" />Garantia de Conteúdo Único</CardTitle></CardHeader><CardContent className="text-blue-800 text-sm space-y-2"><p>✓ Todo o conteúdo gerado é 100% reescrito e original.</p><p>✓ Verificamos títulos e URLs para evitar duplicados.</p><p>✓ Artigos ficam pendentes para revisão editorial.</p></CardContent></Card>
          </div>
        )}
      </div>
    </div>
  );
}

const AutomationCard = ({ title, description, onRun, loading, status }) => (
  <Card className="border-blue-200"><CardHeader><CardTitle className="flex items-center"><Sparkles className="w-5 h-5 mr-2 text-blue-600" />{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent><div className="space-y-4"><Button onClick={onRun} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">{loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}Gerar Notícias Populares</Button><div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg h-16 overflow-y-auto"><strong>Status:</strong> {status}</div></div></CardContent></Card>
);

const ManualSearchCard = ({ onSearch, loading, topic, setTopic, category, setCategory, country, setCountry }) => (
  <Card><CardHeader><CardTitle className="flex items-center"><Search className="w-5 h-5 mr-2" />Pesquisa Manual</CardTitle><CardDescription>Procure por um tópico específico para criar um artigo.</CardDescription></CardHeader><CardContent><div className="space-y-4"><div><Label>Tópico *</Label><Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ex: inteligência artificial" disabled={loading} /></div><div className="grid md:grid-cols-2 gap-4"><div><Label>Categoria (opcional)</Label><Select value={category} onValueChange={setCategory} disabled={loading}><SelectTrigger><SelectValue placeholder="Automática" /></SelectTrigger><SelectContent><SelectItem value={null}>Automática</SelectItem>{availableCategories.filter(c => c.value !== 'todas').map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}</SelectContent></Select></div><div><Label>País (opcional)</Label><Select value={country} onValueChange={setCountry} disabled={loading}><SelectTrigger><SelectValue placeholder="Automático" /></SelectTrigger><SelectContent><SelectItem value={null}>Automático</SelectItem>{COUNTRIES.filter(c => c.value !== 'todos').map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select></div></div><Button onClick={onSearch} disabled={loading || !topic.trim()} className="w-full md:w-auto">{loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Pesquisando...</> : <><Globe className="w-4 h-4 mr-2" />Pesquisar</>}</Button></div></CardContent></Card>
);

const NewsItemCard = ({ item, onProcess, processing }) => (
  <Card className={`border-l-4 ${item.processed ? item.success ? "border-l-green-500" : "border-l-red-500" : "border-l-blue-500"}`}><CardContent className="p-6"><div className="flex justify-between items-start mb-4"><div className="flex-1"><h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3><p className="text-gray-600 mb-3 leading-relaxed">{item.summary}</p><div className="flex flex-wrap gap-3 text-sm text-gray-500"><div className="flex items-center"><Newspaper className="w-4 h-4 mr-1" />{item.source}</div>{item.date && <div className="flex items-center"><Clock className="w-4 h-4 mr-1" />{item.date}</div>}</div><a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-3 text-blue-600 hover:text-blue-800 text-sm"><ExternalLink className="w-4 h-4 mr-1" />Ver notícia original</a></div><div className="ml-4 flex flex-col space-y-2">{item.processed ? (item.success ? <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-4 h-4 mr-1" />Processado</Badge> : <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-4 h-4 mr-1" />Erro</Badge>) : <Button onClick={onProcess} disabled={processing} size="sm">{processing ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Processando...</> : "Criar Artigo"}</Button>}</div></div>{item.error && <div className="mt-3 p-3 bg-red-50 border-red-200 rounded-lg"><p className="text-red-700 text-sm"><strong>Erro:</strong> {item.error}</p></div>}</CardContent></Card>
);