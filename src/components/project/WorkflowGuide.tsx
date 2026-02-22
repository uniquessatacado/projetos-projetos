import { CheckCircle2, Circle, Terminal, Server, Globe, ShieldCheck, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProject } from '@/lib/api';
import { parseMetadata, stringifyMetadata, getCleanDescription } from '@/lib/meta-utils';
import { Project } from '@/types';

interface WorkflowGuideProps {
  project: Project;
}

export const WorkflowGuide = ({ project }: WorkflowGuideProps) => {
  const queryClient = useQueryClient();
  const meta = parseMetadata<any>(project.descricao);
  const steps_status = meta.steps_status || {};

  const steps = [
    { id: 'db', title: "Criar Banco MySQL", desc: "No servidor via Terminal", icon: Database },
    { id: 'api', title: "Criar Backend PHP", desc: "Subir api.php no root", icon: Terminal },
    { id: 'front', title: "Conectar Front Dyad", desc: "Primeira página conectada", icon: Server },
    { id: 'dns', title: "Configurar Cloudflare", desc: "Apontar domínio (A Record)", icon: ShieldCheck },
    { id: 'proxy', title: "Nginx Reverse Proxy", desc: "Configurar proxy_pass", icon: Globe }
  ];

  const toggleStep = useMutation({
    mutationFn: (stepId: string) => {
      const newStatus = { ...steps_status, [stepId]: !steps_status[stepId] };
      const updatedDesc = stringifyMetadata(getCleanDescription(project.descricao), { ...meta, steps_status: newStatus });
      return updateProject(project.id, { ...project, descricao: updatedDesc });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project', project.id.toString()] })
  });

  const completedCount = Object.values(steps_status).filter(Boolean).length;

  return (
    <Card className="border-indigo-100 bg-indigo-50/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-black flex items-center justify-between text-indigo-700 uppercase">
          Setup Obrigatório
          <span className="text-[10px] bg-indigo-100 px-2 py-0.5 rounded-full">{completedCount}/5</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {steps.map((step) => {
          const isDone = !!steps_status[step.id];
          return (
            <div 
              key={step.id} 
              onClick={() => toggleStep.mutate(step.id)}
              className={`flex gap-3 items-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                isDone ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100'
              }`}
            >
              <div className={`${isDone ? 'text-emerald-500' : 'text-slate-300'}`}>
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <h4 className={`font-bold text-[11px] ${isDone ? 'text-emerald-700 line-through' : 'text-slate-800'}`}>{step.title}</h4>
                <p className="text-[9px] text-slate-400 font-medium">{step.desc}</p>
              </div>
              <step.icon className={`w-4 h-4 ${isDone ? 'text-emerald-400' : 'text-slate-300'}`} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};