"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircleDollarSign, CreditCard, UserPlus, PieChart } from "lucide-react";
import { parseMetadata } from "@/lib/meta-utils";

interface FinancialInfoCardProps {
  descricao: string | undefined;
}

export const FinancialInfoCard = ({ descricao }: FinancialInfoCardProps) => {
  const meta = parseMetadata<{
    valor_fechado?: string;
    forma_pagamento?: string;
    indicacao?: string;
    comissao_valor?: string;
  }>(descricao);

  if (!meta.valor_fechado && !meta.indicacao) {
    return (
      <Card className="border-dashed border-slate-200 bg-slate-50/50">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-slate-500 italic">Nenhuma informação financeira registrada.</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (val: string | undefined) => {
    if (!val) return "R$ 0,00";
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(val));
  };

  return (
    <Card className="shadow-soft border-slate-100 overflow-hidden">
      <CardHeader className="bg-slate-50/80 pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700">
          <CircleDollarSign className="w-4 h-4 text-emerald-500" />
          Dados Comerciais
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Valor do Contrato</p>
            <p className="text-lg font-black text-slate-900">{formatCurrency(meta.valor_fechado)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pagamento</p>
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 font-bold">
              {meta.forma_pagamento || "Não informado"}
            </Badge>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-slate-600">Indicação:</span>
            </div>
            <span className="text-xs font-medium text-slate-900">{meta.indicacao || "Nenhuma"}</span>
          </div>
          
          {meta.comissao_valor && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-slate-600">Comissão:</span>
              </div>
              <span className="text-xs font-black text-rose-600">{formatCurrency(meta.comissao_valor)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};