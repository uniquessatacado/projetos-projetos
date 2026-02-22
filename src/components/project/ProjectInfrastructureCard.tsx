import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HardDrive, Globe, AlertTriangle, TrendingUp } from 'lucide-react';
import { parseMetadata } from '@/lib/meta-utils';

const VPS_PLANS = {
  'basic': { usd: 3.49, label: '4 vCPU / 8GB RAM' },
  'popular': { usd: 6.49, label: '6 vCPU / 12GB RAM' },
  'pro': { usd: 10.49, label: '8 vCPU / 24GB RAM' },
  'elite': { usd: 17.49, label: '10 vCPU / 32GB RAM' },
  'maximum': { usd: 27.49, label: '16 vCPU / 64GB RAM' },
};

const DOLLAR_RATE = 6.0; // Taxa de conversão sugerida

export const ProjectInfrastructureCard = ({ descricao }: { descricao: string | undefined }) => {
  const meta = parseMetadata<any>(descricao);
  
  const hasServer = meta.has_server === 'yes';
  const hasDomain = meta.has_domain === 'yes';
  const vpsPlan = meta.vps_plan;

  const isPending = !meta.has_server || !meta.has_domain;

  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <Card className={`border-none shadow-soft overflow-hidden ${isPending ? 'ring-2 ring-amber-400 animate-pulse-slow' : ''}`}>
      <CardHeader className={`${isPending ? 'bg-amber-50' : 'bg-slate-50'} pb-3`}>
        <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-tight">
          {isPending ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : <HardDrive className="w-4 h-4 text-indigo-500" />}
          Infraestrutura
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {isPending ? (
          <div className="text-xs font-bold text-amber-700 bg-amber-100/50 p-3 rounded-lg border border-amber-200">
            Atenção: Defina o Servidor e Domínio deste projeto.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">VPS / Host</p>
                <p className="text-xs font-bold text-slate-800">
                  {hasServer ? VPS_PLANS[vpsPlan as keyof typeof VPS_PLANS]?.label || 'Plano Personalizado' : 'Não terá servidor'}
                </p>
              </div>
              {hasServer && vpsPlan && (
                <div className="text-right">
                    <p className="text-[10px] font-black text-emerald-600 uppercase">Custo Estimado</p>
                    <p className="text-xs font-black text-slate-900">{formatBRL(VPS_PLANS[vpsPlan as keyof typeof VPS_PLANS].usd * DOLLAR_RATE)}/mês</p>
                    <p className="text-[9px] text-slate-400 font-bold">USD {VPS_PLANS[vpsPlan as keyof typeof VPS_PLANS].usd}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-50">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-700">Domínio</span>
              </div>
              <Badge variant="outline" className={hasDomain ? "text-emerald-600 border-emerald-200" : "text-slate-400"}>
                {hasDomain ? "+ R$ 60,00 Anual" : "Sem Domínio"}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};