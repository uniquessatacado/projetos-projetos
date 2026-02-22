"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTemplates, createTemplate, deleteTemplate } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Terminal, Copy, Trash2, FileText, Code, Lightbulb, ChevronRight } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const KnowledgeBase = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("todos");

  const { data: items, isLoading } = useQuery({
    queryKey: ['templates'], // Reutilizando a tabela de templates para conhecimento
    queryFn: getTemplates,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => createTemplate(data),
    onSuccess: () => {
      showSuccess('Salvo com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setIsAdding(false);
      setNewTitle("");
      setNewContent("");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      showSuccess('Removido!');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copiado para a área de transferência!');
  };

  const filteredItems = items?.filter(i => 
    i.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 animate-slide-up max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Prompts & Tutoriais</h1>
          <p className="text-slate-500 font-medium">Sua base de scripts e procedimentos técnicos.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-glow" onClick={() => setIsAdding(!isAdding)}>
          <Plus className="w-5 h-5 mr-2" /> Novo Tutorial / Prompt
        </Button>
      </header>

      {isAdding && (
        <Card className="mb-8 border-indigo-200 shadow-lg animate-fade-in">
            <CardHeader>
                <CardTitle className="text-lg">Adicionar à Base de Conhecimento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Input 
                    placeholder="Título (ex: Configurar Nginx Reverse Proxy)" 
                    value={newTitle} 
                    onChange={e => setNewTitle(e.target.value)} 
                    className="font-bold"
                />
                <Textarea 
                    placeholder="Cole aqui seu script, tutorial ou prompt da IA..." 
                    className="min-h-[200px] font-mono text-sm" 
                    value={newContent} 
                    onChange={e => setNewContent(e.target.value)}
                />
                <div className="flex gap-2">
                    <Button className="bg-emerald-600 px-8" onClick={() => mutation.mutate({ nome: newTitle, descricao: newContent })}>Salvar Agora</Button>
                    <Button variant="outline" onClick={() => setIsAdding(false)}>Cancelar</Button>
                </div>
            </CardContent>
        </Card>
      )}

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input 
            placeholder="Pesquisar por título ou conteúdo..." 
            className="pl-12 h-14 text-lg rounded-2xl border-slate-200 shadow-soft" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredItems?.map((item) => (
                <Card key={item.id} className="group hover:border-indigo-300 transition-all shadow-soft flex flex-col">
                    <CardHeader className="pb-3 border-b border-slate-50">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <Terminal className="w-5 h-5" />
                                </div>
                                <CardTitle className="text-lg font-bold group-hover:text-indigo-600 transition-colors">{item.nome}</CardTitle>
                            </div>
                            <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100" onClick={() => {
                                if(confirm('Excluir este tutorial?')) deleteMutation.mutate(item.id);
                            }}>
                                <Trash2 className="w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 flex-1 flex flex-col">
                        <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-hidden relative max-h-[300px]">
                            <div className="absolute top-2 right-2 flex gap-2">
                                <Button 
                                    size="sm" 
                                    className="bg-white/10 hover:bg-white/20 text-white h-7 text-[10px] font-black"
                                    onClick={() => copyToClipboard(item.descricao || "")}
                                >
                                    <Copy className="w-3 mr-1" /> COPIAR TUDO
                                </Button>
                            </div>
                            <pre className="whitespace-pre-wrap">{item.descricao}</pre>
                        </div>
                    </CardContent>
                </Card>
            ))}
            {filteredItems?.length === 0 && (
                <div className="col-span-full text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold uppercase tracking-widest">Nenhum tutorial encontrado.</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;