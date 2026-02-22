import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTemplates, deleteTemplate } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { NewTemplateDialog } from "@/components/templates/NewTemplateDialog";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, FileCode, Edit, MoreVertical } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { Template } from "@/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Templates = () => {
  const queryClient = useQueryClient();
  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ['templates'],
    queryFn: getTemplates,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      showSuccess('Removido!');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (error: Error) => showError(error.message),
  });

  return (
    <div className="p-4 lg:p-8 animate-slide-up max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Templates</h1>
          <p className="text-slate-500">Modelos base reutilizáveis.</p>
        </div>
        <NewTemplateDialog />
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates?.map(t => (
                <Card key={t.id} className="group hover:border-primary-300 transition-all shadow-card">
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                                <FileCode className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-lg">{t.nome}</CardTitle>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem><Edit className="w-4 mr-2" /> Editar</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-500" onClick={() => {
                                    if(confirm('Excluir?')) deleteMutation.mutate(t.id);
                                }}><Trash2 className="w-4 mr-2" /> Excluir</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500 line-clamp-2">{t.descricao || "Sem descrição."}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
      )}
    </div>
  );
};

export default Templates;