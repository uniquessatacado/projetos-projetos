"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/lib/api";
import { parseMetadata } from "@/lib/meta-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Search, Phone, CircleDollarSign, TrendingUp, HandCoins, UserCheck, Briefcase, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<any>(null);

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
      
      // Dados do Cliente
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

      // Dados de Indicação (O cliente pode ter indicado alguém)
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
            projeto: p.nome,
            indicado: name,
            valorProjeto: valor,
            status
        });
      }
    });

    return Array.from(clientsMap.values());
  }, [projects]);

  const filteredClients = clientsData.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const openWhatsApp = (phone: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(`https://wa.me/55${cleanPhone}`, "_blank");
  };

  return (
    <div className="p-4 lg:p-8 animate-slide-up max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Central de Clientes</h1>
          <p className="text-slate-500">Gestão financeira e histórico de parcerias.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Buscar por nome..." 
            className="pl-10" 
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
                className="group hover:shadow-glow transition-all border-slate-100 cursor-pointer overflow-hidden rounded-2xl"
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
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full rounded-xl border-green-200 text-green-700 hover:bg-green-50 font-bold text-xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            openWhatsApp(client.whatsapp);
                        }}
                    >
                        <Phone className="w-3.5 h-3.5 mr-2" /> WhatsApp
                    </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detalhes do Cliente (Sheet Lateral) */}
      <Sheet open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <SheetContent className="sm:max-w-[500px] overflow-y-auto">
          <SheetHeader className="mb-8">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <User className="w-8 h-8" />
                </div>
                <div>
                    <SheetTitle className="text-2xl font-black">{selectedClient?.nome}</SheetTitle>
                    <SheetDescription className="font-bold flex items-center gap-2">
                        {selectedClient?.whatsapp || "Sem contato registrado"}
                        {selectedClient?.whatsapp && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-green-600" onClick={() => openWhatsApp(selectedClient.whatsapp)}>
                                <Phone className="w-4 h-4" />
                            </Button>
                        )}
                    </SheetDescription>
                </div>
            </div>
          </SheetHeader>

          <div className="space-y-8">
            {/* Métricas Rápidas */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <TrendingUp className="w-5 h-5 text-indigo-500 mb-2" />
                    <p className="text-[10px] font-black text-slate-400 uppercase">Total Contratado</p>
                    <p className="text-xl font-black text-slate-900">{formatCurrency(selectedClient?.totalInvestido || 0)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <HandCoins className="w-5 h-5 text-emerald-600 mb-2" />
                    <p className="text-[10px] font-black text-emerald-700 uppercase">Fluxo a Receber</p>
                    <p className="text-xl font-black text-emerald-900">{formatCurrency(selectedClient?.aReceber || 0)}</p>
                </div>
            </div>

            {/* Projetos */}
            <section>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Histórico de Projetos
                </h3>
                <div className="space-y-3">
                    {selectedClient?.projetos.map((p: any) => (
                        <div key={p.id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-soft flex justify-between items-center">
                            <div>
                                <p className="font-bold text-slate-900">{p.nome}</p>
                                <p className="text-[10px] text-slate-400 font-black uppercase">Status: {p.status}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-slate-800">{formatCurrency(p.valor)}</p>
                                {p.parcelas > 1 && <p className="text-[9px] text-indigo-600 font-bold uppercase">{p.parcelas}X Parcelado</p>}
                            </div>
                        </div>
                    ))}
                    {selectedClient?.projetos.length === 0 && <p className="text-xs text-slate-400 italic">Nenhum projeto direto.</p>}
                </div>
            </section>

            {/* Indicações */}
            <section>
                <h3 className="text-sm font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <UserCheck className="w-4 h-4" /> Indicações Realizadas
                </h3>
                <div className="space-y-3">
                    {selectedClient?.indicacoes.map((ind: any, i: number) => (
                        <div key={i} className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-amber-900">{ind.projeto}</p>
                                <p className="text-[10px] text-amber-700 font-black uppercase">Indicou: {ind.indicado}</p>
                            </div>
                            <Badge variant="outline" className="border-amber-200 text-amber-800 text-[9px] font-black">
                                {ind.status.toUpperCase()}
                            </Badge>
                        </div>
                    ))}
                    {selectedClient?.indicacoes.length === 0 && <p className="text-xs text-slate-400 italic">Ainda não fez indicações.</p>}
                </div>
            </section>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Clients;