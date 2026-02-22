"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircleDollarSign, UserPlus, PieChart, Coins, Repeat } from "lucide-react";
import { parseMetadata } from "@/lib/meta-utils";

interface FinancialInfoCardProps {
  descricao: string | undefined;
}

export const FinancialInfoCard = ({ descricao }: FinancialInfoCardProps) => {
  const meta = parseMetadata<{
    valor_fechado?: string;
    forma_pagamento?: string;
    projeto_parcelas?: string;
    indicacao_nome?: string;
    comissao_tipo?: 'fixo' | 'porcentagem';
    comissao_valor_base?: string;
    comissao_pagamento?: 'unico' | 'proporcional';
  }>(descricao);

  if (!meta.valor_fechado && !meta.indicacao_nome) {
    return (
      <Card className="border-dashed border-slate-200 bg-slate-50/50">
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-slate-500 italic">Nenhuma informação financeira registrada.</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (val: number | string | undefined) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (!num) return "R$ 0,00";
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  };

  const valorProjeto = parseFloat(meta.valor_fechado || "0");
  const parcelas = parseInt(meta.projeto_parcelas || "1");
  const valorParcela = valorProjeto / parcelas;

  // Cálculo da Comissão Total
  let comissaoTotal = 0;
  if (meta.comissao_tipo === 'porcentagem') {
    comissaoTotal = (valorProjeto * parseFloat(meta.comissao_valor_base || "0")) / 100;
  } else {
    comissaoTotal = parseFloat(meta.comissao_valor_base || "0");
  }

  const comissaoPorParcela = comissaoTotal / parcelas;

  return (
    <Card className="shadow-soft border-slate-100 overflow-hidden">
      <CardHeader className="bg-slate-50/80 pb-3 border-b border-slate-100">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700 uppercase tracking-tight">
          <CircleDollarSign className="w-4 h-4 text-emerald-500" />
          Financeiro e Comissão
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-5">
        {/* Lado do Projeto */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Contrato</p>
            <p className="text-lg font-black text-slate-900">{formatCurrency(valorProjeto)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pagamento</p>
            <div className="flex flex-col">
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 w-fit font-black text-[9px]">
                {meta.forma_pagamento === 'parcelado' ? `PARCELADO (${parcelas}X)` : "À VISTA"}
                </Badge>
                {meta.forma_pagamento === 'parcelado' && (
                    <span className="text-[10px] font-bold text-slate-500 mt-1">{formatCurrency(valorParcela)} /mês</span>
                )}
            </div>
          </div>
        </div>

        {/* Lado da Comissão */}
        {meta.indicacao_nome && (
            <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-black text-slate-600 uppercase">Parceiro:</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">{meta.indicacao_nome}</span>
                </div>

                <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-amber-800 uppercase flex items-center gap-1">
                            <PieChart className="w-3 h-3" /> Comissão Total
                        </span>
                        <span className="text-sm font-black text-amber-900">{formatCurrency(comissaoTotal)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-2 border-t border-amber-100">
                        <Repeat className="w-3 h-3 text-amber-600" />
                        <span className="text-[10px] font-bold text-amber-700 uppercase">
                            Fluxo: {meta.comissao_pagamento === 'proporcional' 
                                ? `Parcelado em ${parcelas}x de ${formatCurrency(comissaoPorParcela)}` 
                                : "Pagamento Integral à Vista"}
                        </span>
                    </div>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
};