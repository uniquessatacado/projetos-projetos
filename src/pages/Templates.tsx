import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTemplates, deleteTemplate } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { NewTemplateDialog } from "@/components/NewTemplateDialog";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, FileCode } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { Template } from "@/types";

const Templates = () => {
  const queryClient = useQueryClient();
  const { data: templates, isLoading, isError } = useQuery<Template[]>({
    queryKey: ['templates'],
    queryFn: getTemplates,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      showSuccess('Template removido!');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (error: Error) => showError(error.message),
  });

  return (
    <div className="p-4 lg:p-8 animate-slide-up">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Meus Templates</h1>
          <p className="text-slate-500">Gerencie modelos para agilizar a criação de projetos.</p>
        </div>
        <NewTemplateDialog />
      </header>

      {isLoading && <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-40 w-full" />)}</div>}
      {isError && <p className="text-center text-red-500">Falha ao carregar templates.</p>}
      
      {!isLoading && !isError && templates && (
        <>
          {templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileCode className="w-5 h-5 text-primary-600" />
                        {template.nome}
                    </CardTitle>
                    <CardDescription>{template.descricao || 'Sem descrição.'}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-end border-t pt-4">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                            if(confirm('Tem certeza que deseja excluir este template?')) {
                                deleteMutation.mutate(template.id);
                            }
                        }}
                    >
                        <Trash2 className="w-4 h-4 mr-2" /> Excluir
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-xl font-semibold text-slate-700">Nenhum template encontrado.</h2>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Templates;