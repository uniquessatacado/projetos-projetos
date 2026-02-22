"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/lib/api";
import { parseMetadata } from "@/lib/meta-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, User, Search, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const getClientData = () => {
    if (!projects) return [];
    
    const clientsMap = new Map();

    projects.forEach(p => {
      const meta = parseMetadata<any>(p.descricao);
      const name = p.cliente_nome;
      const whatsapp = meta.cliente_whatsapp || "";
      
      if (!clientsMap.has(name)) {
        clientsMap.set(name, {
          nome: name,
          whatsapp: whatsapp,
          projetos: [],
          indicacoes: 0
        });
      }
      
      const client = clientsMap.get(name);
      client.projetos.push({
        id: p.id,
        nome: p.nome,
        status: meta.status || "aguardando_inicio"
      });

      // Checar se alguém indicou esse cliente
      if (meta.indicacao_nome) {
        if (!clientsMap.has(meta.indicacao_nome)) {
          clientsMap.set(meta.indicacao_nome, {
            nome: meta.indicacao_nome,
            whatsapp: meta.indicacao_whatsapp || "",
            projetos: [],
            indicacoes: 0
          });
        }
        clientsMap.get(meta.indicacao_nome).indicacoes += 1;
      }
    });

    return Array.from(clientsMap.values());
  };

  const clients = getClientData().filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openWhatsApp = (phone: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(`https://wa.me/55${cleanPhone}`, "_blank");
  };

  return (
    <div className="p-4 lg:p-8 animate-slide-up max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Meus Clientes</h1>
          <p className="text-slate-500">Base de contatos e histórico de indicações.</p>
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
          {Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client, idx) => (
            <Card key={idx} className="hover:shadow-glow transition-all border-slate-100">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">{client.nome}</CardTitle>
                      <p className="text-xs text-slate-500 font-medium">{client.whatsapp || "Sem WhatsApp"}</p>
                    </div>
                  </div>
                  {client.whatsapp && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full border-green-200 text-green-600 hover:bg-green-50"
                      onClick={() => openWhatsApp(client.whatsapp)}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
                    {client.projetos.length} Projetos
                  </Badge>
                  {client.indicacoes > 0 && (
                    <Badge variant="secondary" className="bg-amber-50 text-amber-700">
                      {client.indicacoes} Indicações
                    </Badge>
                  )}
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Projetos Ativos</p>
                  {client.projetos.length > 0 ? (
                    client.projetos.map((p: any) => (
                      <div key={p.id} className="text-xs font-medium flex justify-between items-center bg-slate-50 p-1.5 rounded">
                        <span className="truncate max-w-[150px]">{p.nome}</span>
                        <span className="text-[9px] uppercase font-black text-slate-400">{p.status}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">Nenhum projeto registrado.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Clients;