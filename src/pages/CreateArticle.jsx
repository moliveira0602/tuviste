import React, { useState } from "react";
import { Article } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Save, Eye, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { availableCategories, COUNTRIES } from "../components/utils/categories";

export default function CreateArticlePage() {
  const navigate = useNavigate();
  const [article, setArticle] = useState({
    title: "",
    summary: "",
    content: "",
    category: "",
    country: "",
    tags: [],
    status: "rascunho",
    author: "",
    source_urls: [],
    is_breaking: false,
  });
  
  const [generating, setGenerating] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [sourceInput, setSourceInput] = useState("");

  const generateContent = async () => {
    if (!article.title) return alert("Por favor, insira um título primeiro.");
    setGenerating(true);
    try {
      const prompt = `Escreva um artigo jornalístico completo em português de Portugal sobre: "${article.title}". Requisitos: linguagem jornalística profissional, estrutura com lead, desenvolvimento e conclusão, 4-5 parágrafos. Retorne apenas o texto do artigo.`;
      const result = await InvokeLLM({ prompt: prompt, add_context_from_internet: true });
      const summaryPrompt = `Crie um resumo conciso de 1-2 frases para o artigo: "${result}". Retorne apenas o resumo.`;
      const summaryResult = await InvokeLLM({ prompt: summaryPrompt });

      setArticle(prev => ({
        ...prev,
        content: result.split('\n').filter(l => l.trim()).map(p => p.trim()).join('\n\n'),
        summary: summaryResult
      }));
    } catch (error) {
      console.error("Erro ao gerar conteúdo:", error);
      alert("Erro ao gerar conteúdo.");
    }
    setGenerating(false);
  };

  const handleListChange = (field, action, value) => {
    if (action === 'add' && value && !article[field].includes(value)) {
      setArticle(prev => ({ ...prev, [field]: [...prev[field], value] }));
    } else if (action === 'remove') {
      setArticle(prev => ({ ...prev, [field]: prev[field].filter(item => item !== value) }));
    }
  };

  const saveArticle = async (status) => {
    if (!article.title || !article.content || !article.category || !article.country) return alert("Preencha todos os campos obrigatórios.");
    
    try {
      const articleData = { ...article, status, slug: article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        ...(status === "publicado" && { published_date: new Date().toISOString() })
      };
      await Article.create(articleData);
      navigate(createPageUrl("Admin"));
    } catch (error) {
      console.error("Erro ao salvar artigo:", error);
      alert("Erro ao salvar artigo.");
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Criar Novo Artigo</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Informações Básicas</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <div className="flex gap-2">
                    <Input id="title" value={article.title} onChange={e => setArticle(p => ({ ...p, title: e.target.value }))} placeholder="Título do artigo..." />
                    <Button onClick={generateContent} disabled={generating || !article.title} variant="outline">
                      {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="summary">Resumo</Label>
                  <Textarea id="summary" value={article.summary} onChange={e => setArticle(p => ({ ...p, summary: e.target.value }))} placeholder="Resumo do artigo..." rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FieldSelect label="Categoria *" value={article.category} onValueChange={v => setArticle(p => ({ ...p, category: v }))} options={availableCategories.filter(c => c.value !== 'todas')} placeholder="Selecionar categoria" />
                  <FieldSelect label="País *" value={article.country} onValueChange={v => setArticle(p => ({ ...p, country: v }))} options={COUNTRIES.filter(c => c.value !== 'todos')} placeholder="Selecionar país" />
                </div>
                <div>
                  <Label htmlFor="author">Autor</Label>
                  <Input id="author" value={article.author} onChange={e => setArticle(p => ({ ...p, author: e.target.value }))} placeholder="Nome do autor..." />
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="is_breaking" checked={article.is_breaking} onChange={e => setArticle(p => ({ ...p, is_breaking: e.target.checked }))} className="rounded" />
                  <label htmlFor="is_breaking" className="text-sm font-medium">Marcar como "Última Hora"</label>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Conteúdo do Artigo *</CardTitle></CardHeader>
              <CardContent>
                <Textarea id="content" value={article.content} onChange={e => setArticle(p => ({ ...p, content: e.target.value }))} placeholder="Conteúdo do artigo..." rows={12} />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <ListManagerCard title="Tags" field="tags" items={article.tags} onUpdate={handleListChange} inputState={tagInput} setInputState={setTagInput} placeholder="Nova tag..." />
            <ListManagerCard title="Fontes" field="source_urls" items={article.source_urls} onUpdate={handleListChange} inputState={sourceInput} setInputState={setSourceInput} placeholder="URL da fonte..." />
            <Card>
              <CardHeader><CardTitle>Ações</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => saveArticle("rascunho")} variant="outline" className="w-full"><Save className="w-4 h-4 mr-2" />Salvar Rascunho</Button>
                <Button onClick={() => saveArticle("pendente")} className="w-full bg-yellow-600 hover:bg-yellow-700"><Eye className="w-4 h-4 mr-2" />Enviar para Revisão</Button>
                <Button onClick={() => saveArticle("publicado")} className="w-full bg-green-600 hover:bg-green-700">Publicar Imediatamente</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

const FieldSelect = ({ label, value, onValueChange, options, placeholder }) => (
  <div>
    <Label>{label}</Label>
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent className="max-h-60">{options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
    </Select>
  </div>
);

const ListManagerCard = ({ title, field, items, onUpdate, inputState, setInputState, placeholder }) => {
  const handleAdd = () => { onUpdate(field, 'add', inputState.trim()); setInputState(""); };
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input value={inputState} onChange={e => setInputState(e.target.value)} placeholder={placeholder} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())} />
            <Button onClick={handleAdd} size="sm">+</Button>
          </div>
          <div className={`flex flex-wrap gap-2 ${field === 'source_urls' ? 'flex-col' : ''}`}>
            {items.map((item, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                <span className="truncate max-w-xs">{item}</span>
                <button onClick={() => onUpdate(field, 'remove', item)}><X className="w-3 h-3" /></button>
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};