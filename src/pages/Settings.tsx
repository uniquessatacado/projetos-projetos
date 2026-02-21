import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, saveSetting, getTemplates } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { DeployApiButton } from "@/components/DeployApiButton";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SettingsForm {
  empresa_nome: string;
  valor_hora: string;
  moeda: string;
}

const Settings = () => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue } = useForm<SettingsForm>();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  // Health Check: Tenta buscar templates para ver se a API nova está respondendo
  const { isError: isApiError, isLoading: isApiLoading, isSuccess: isApiSuccess, refetch: checkApi } = useQuery({
    queryKey: ['api-health-check'],
    queryFn: getTemplates,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (settings) {
      settings.forEach(s => {
        if (s.chave === 'empresa_nome') setValue('empresa_nome', s.valor);
        if (s.chave === 'valor_hora') setValue('valor_hora', s.valor);
        if (s.chave === 'moeda') setValue('moeda', s.valor);
      });
    }
  }, [settings, setValue]);

  const mutation = useMutation({
    mutationFn: async (data: SettingsForm) => {
        await saveSetting({ chave: 'empresa_nome', valor: data.empresa_nome });
        await saveSetting({ chave: 'valor_hora', valor: data.valor_hora });
        await saveSetting({ chave: 'moeda', valor: data.moeda });
    },
    onSuccess: () => {
      showSuccess('Configurações salvas!');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error: Error) => showError(error.message),
  });

  const onSubmit = (data: SettingsForm) => {
    mutation.mutate(data);
  };

  if (isLoading) return <div className="p-8"><Skeleton className="h-[400px] w-full max-w-2xl" /></div>;

  return (
    <div className="p-4 lg:p-8 animate-slide-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Configurações</h1>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => checkApi()} title="Verificar status novamente">
                Verificar Status
            </Button>
            <DeployApiButton />
        </div>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* Card de Diagnóstico */}
        <Card className={isApiSuccess ? "border-green-200 bg-green-50/50" : isApiError ? "border-red-200 bg-red-50/50" : ""}>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    {isApiLoading ? (
                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                    ) : isApiSuccess ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    Status do Sistema
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isApiLoading && <p className="text-sm text-gray-500">Verificando conexão com a API...</p>}
                
                {isApiSuccess && (
                    <div className="text-sm text-green-700">
                        <p className="font-medium">Sistema Operacional</p>
                        <p>A API foi atualizada e as tabelas (Templates, Configurações) estão acessíveis.</p>
                    </div>
                )}

                {isApiError && (
                    <div className="text-sm text-red-700">
                        <p className="font-medium mb-1">Atenção Necessária</p>
                        <p>Não foi possível acessar as novas funcionalidades. Por favor, clique no botão <strong>"Atualizar API Remota"</strong> acima para corrigir.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      
        <Card>
            <CardHeader>
            <CardTitle>Geral</CardTitle>
            <CardDescription>Defina as preferências globais do sistema.</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-2">
                <Label htmlFor="empresa_nome">Nome da Empresa</Label>
                <Input id="empresa_nome" {...register('empresa_nome')} placeholder="Minha Agência" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                    <Label htmlFor="moeda">Moeda</Label>
                    <Input id="moeda" {...register('moeda')} placeholder="BRL" />
                    </div>
                    <div className="grid gap-2">
                    <Label htmlFor="valor_hora">Valor Hora Padrão</Label>
                    <Input id="valor_hora" {...register('valor_hora')} type="number" placeholder="150.00" />
                    </div>
                </div>

                <Button type="submit" disabled={mutation.isPending} className="mt-4">
                {mutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </form>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;