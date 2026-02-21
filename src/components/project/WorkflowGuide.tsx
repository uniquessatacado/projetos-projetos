import { CheckCircle2, Circle, ExternalLink, Server, Globe, ShieldCheck, Terminal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const WorkflowGuide = () => {
  const steps = [
    {
      title: "Backend PHP",
      desc: "Subir o arquivo api.php no diretório /root do servidor Peramix.",
      icon: Terminal,
      link: null
    },
    {
      title: "Docker Compose",
      desc: "Configurar o stack no Portainer usando a imagem PHP-Apache ou customizada.",
      icon: Server,
      link: "http://seu-servidor:9000" // Link genérico para o Portainer
    },
    {
      title: "Cloudflare DNS",
      desc: "Apontar o domínio (A record) para o IP 206.183.128.27.",
      icon: ShieldCheck,
      link: "https://dash.cloudflare.com"
    },
    {
      title: "Nginx Reverse Proxy",
      desc: "Configurar o proxy_pass no Nginx para encaminhar o domínio ao container Docker.",
      icon: Globe,
      link: null
    }
  ];

  return (
    <Card className="border-indigo-100 bg-indigo-50/30">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-indigo-700">
          <CheckCircle2 className="w-5 h-5" />
          Assistente de Deploy Inteligente
        </CardTitle>
        <CardDescription>
          Siga o seu procedimento padrão para colocar este projeto no ar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-4 items-start bg-white p-3 rounded-xl border border-indigo-50 shadow-sm">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <step.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 text-sm">{step.title}</h4>
                <p className="text-xs text-slate-500">{step.desc}</p>
              </div>
              {step.link && (
                <Button variant="ghost" size="icon" asChild>
                  <a href={step.link} target="_blank" rel="noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};