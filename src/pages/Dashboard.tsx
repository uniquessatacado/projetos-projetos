import ProjectCard from "@/components/project/ProjectCard";
import { NewProjectDialog } from "@/components/project/NewProjectDialog";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: projects, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    retry: 1,
  });

  const filteredProjects = projects?.filter(project => 
    project.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 animate-slide-up">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Meus Projetos</h1>
          <p className="text-slate-500">Visualize e gerencie todos os seus escopos.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Buscar projeto..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <NewProjectDialog />
        </div>
      </header>

      {isLoading && <DashboardSkeleton />}
      
      {isError && (
        <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto border-red-200 bg-red-50">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Erro na Conexão com o Backend</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="font-mono text-xs bg-white/50 p-2 rounded mb-3">
              {error instanceof Error ? error.message : 'Não foi possível conectar ao servidor.'}
            </p>
            <div className="flex flex-col gap-2">
              <p className="text-sm">
                Se o erro for <strong>"Failed to fetch"</strong>, você precisa permitir <strong>"Conteúdo Inseguro"</strong> nas configurações do seu navegador para este site, pois a API usa HTTP e este site usa HTTPS.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                className="w-fit"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Tentar Novamente
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {!isLoading && !isError && filteredProjects && (
        <>
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} projeto={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-xl font-semibold text-slate-700">Nenhum projeto encontrado.</h2>
              <p className="text-slate-500 mt-2">Que tal criar o primeiro?</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="space-y-3 bg-white p-5 rounded-2xl">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <div className="grid grid-cols-2 gap-3 pt-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      </div>
    ))}
  </div>
);

export default Dashboard;