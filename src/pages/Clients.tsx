"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjects, updateClient } from "@/lib/api";
import { parseMetadata } from "@/lib/meta-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Search, Phone, TrendingUp, HandCoins, Briefcase, ChevronRight, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { EditClientDialog } from "@/components/clients/EditClientDialog";
import { showError, showSuccess } from "@/utils/toast";

const Clients = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [editingClient, setEditingClient] = useState<any>(null);
  const navigate = useNavigate();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const clientsData = useMemo(() => {
    if (!projects) return [];
    
    const clientsMap = new Map();

    projects.forEach(p => {
      const meta = parseMetadata<any>(p.descricao);
      const name = p.cliente_nome;
      const valor = parseFloat(meta.valor_fechado || "0");
      const status = meta.status || 'aguardando_inicio';
      const parcelas = parseInt(meta.projeto_parcelas || "1");
      
      if (!clientsMap.has(name)) {
        clientsMap.set(name, {
          nome: name,
          whatsapp: meta.cliente_whatsapp || "",
          projetos: [],
          indicacoes: [],
          totalInvestido: 0,
          aReceber: 0,
          concluidos: 0
        });
      }
      
      const client = clientsMap.get(name);
      client.projetos.push({ id: p.id, nome: p.nome, status, valor, parcelas });
      client.totalInvestido += valor;
      if (status !== 'concluido') client.aReceber += valor;
      if (status === 'concluido') client.concluidos += 1;

      if (meta.indicacao_nome) {
        if (!clientsMap.has(meta.indicacao_nome)) {
          clientsMap.set(meta.indicacao_nome, {
            nome: meta.indicacao_nome,
            whatsapp: meta.indicacao_whatsapp || "",
            projetos: [],
            indicacoes: [],
            totalInvestido: 0,
            aReceber: 0,
            concluidos: 0
          });
        }
        clientsMap.get(meta.indicacao_nome).indicacoes.push({
            id: p.id,
            projeto: p.nome,
            indicado: name,
            valorProjeto: valor,
            status
        });
      }
    });

    return Array.from(clientsMap.values());
  }, [projects]);

  const updateClientMutation = useMutation({
    mutationFn: ({ originalName, data }: { originalName: string, data: any }) => updateClient(originalName, data),
    onSuccess: () => {
        showSuccess('Cliente atualizado com sucesso!');
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        setEditingClient(null);
        setSelectedClient(null);
    },
    onError: (error: Error) => {
        showError(error.message);
    }
  });

  const handleSaveClient = (data: any) => {
    if (!editingClient) return;
    updateClientMutation.mutate({ originalName: editingClient.nome, data });
  };

  const filteredClients = clientsData.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
        case 'em_andamento':
            return <Badge className="bg-indigo-500 hover:bg-indigo-600 text-[9px] font-black">ATIVO</Badge>;
        case 'pausado':
            return <Badge className="bg-amber-500 hover:bg-amber-600 text-[9px] font-black">PAUSADO</Badge>;
        case 'concluido':
            return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[9px] font-black">CONCLUÍDO</Badge>;
        default:
            return <Badge className="bg-slate-400 hover:bg-slate-500 text-[9px] font-black">NA FILA</Badge>;
    }
  };

  return (
    <div className="p-4 lg:p-8 animate-slide-up max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Central de Clientes</h1>
          <p className="text-slate-500 font-medium">Gestão financeira e histórico de parcerias.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Buscar por nome..." 
            className="pl-10 h-11 rounded-xl border-slate-200 shadow-sm focus:ring-indigo-500" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client, idx) => (
            <Card 
                key={idx} 
                className="group hover:shadow-glow transition-all border-slate-100 cursor-pointer overflow-hidden rounded-2xl transform hover:-translate-y-1"
                onClick={() => setSelectedClient(client)}
            >
              <CardHeader className="pb-3 bg-slate-50/50">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-indigo-600 border border-slate-100">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">{client.nome}</CardTitle>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {client.projetos.length} Projetos | {client.indicacoes.length} Indicações
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Investimento</p>
                        <p className="text-sm font-black text-slate-800">{formatCurrency(client.totalInvestido)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase">A Receber</p>
                        <p className="text-sm font-black text-emerald-600">{formatCurrency(client.aReceber)}</p>
                    </div>
                </div>
                {client.whatsapp && (
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-green-500" />
                        {client.whatsapp}
                    </div>
                )}
              </CardContent>
            </Card>
          ))}
          {filteredClients.length === 0 && (
             <div className="col-span-full py-20 text-center">
                <p className="text-slate-400 font-bold uppercase tracking-widest">Nenhum cliente encontrado.</p>
             </div>
          )}
        </div>
      )}

      <Sheet open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <SheetContent className="sm:max-w-[500px] overflow-y-auto border-l-0 shadow-2xl p-0">
          {selectedClient && (
            <div className="p-8 space-y-8">
              <SheetHeader className="mb-8">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                            <User className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <SheetTitle className="text-2xl font-black text-slate-900 leading-tight">{selectedClient.nome}</SheetTitle>
                            <SheetDescription className="font-bold flex items-center gap-2 mt-1">
                                {selectedClient.whatsapp ? (
                                    <a 
                                        href={`https://wa.me/55${selectedClient.whatsapp.replace(/\D/g, "")}`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="flex items-center gap-1.5 text-green-600 hover:underline"
                                    >
                                        <Phone className="w-4 h-4" /> {selectedClient.whatsapp}
                                    </a>
                                ) : "Sem contato registrado"}
                            </SheetDescription>
                        </div>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => setEditingClient(selectedClient)}>
                        <Edit className="w-4 h-4" />
                    </Button>
                  </div>
              </SheetHeader>

              <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-soft">
                      <TrendingUp className="w-5 h-5 text-indigo-500 mb-2" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Contratado</p>
                      <p className="text-xl font-black text-slate-900">{formatCurrency(selectedClient.totalInvestido || 0)}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-soft">
                      <HandCoins className="w-5 h-5 text-emerald-600 mb-2" />
                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Fluxo a Receber</p>
                      <p className="text-xl font-black text-emerald-900">{formatCurrency(selectedClient.aReceber || 0)}</p>
                  </div>
              </div>

              <section>
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Briefcase className="w-4 h-4" /> Histórico de Projetos
                      </h3>
                      <Badge variant="outline" className="text-[10px] font-black">{selectedClient.projetos.length} Projetos</Badge>
                  </div>
                  <div className="space-y-3">
                      {selectedClient.projetos.map((p: any) => (
                          <button 
                              key={p.id} 
                              onClick={() => {
                                  setSelectedClient(null);
                                  navigate(`/projetos/${p.id}`);
                              }}
                              className="w-full text-left p-4 rounded-xl border border-slate-100 bg-white shadow-soft hover:border-indigo-300 hover:shadow-glow transition-all flex justify-between items-center group"
                          >
                              <div className="flex items-center gap-4">
                                  <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                      <ChevronRight className="w-4 h-4" />
                                  </div>
                                  <div>
                                      <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{p.nome}</p>
                                      <div className="mt-1">{getStatusBadge(p.status)}</div>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <p className="font-black text-slate-800">{formatCurrency(p.valor)}</p>
                                  {p.parcelas > 1 && <p className="text-[9px] text-indigo-600 font-bold uppercase">{p.parcelas}X Parcelado</p>}
                              </div>
                          </button>
                      ))}
                      {selectedClient.projetos.length === 0 && <p className="text-xs text-slate-400 italic py-4 text-center bg-slate-50 rounded-xl">Nenhum projeto direto.</p>}
                  </div>
              </section>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <EditClientDialog
        open={!!editingClient}
        onOpenChange={(open) => !open && setEditingClient(null)}
        client={editingClient}
        onSave={handleSaveClient}
        isSaving={updateClientMutation.isPending}
      />
    </div>
  );
};

export default Clients;