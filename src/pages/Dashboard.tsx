import ProjectCard from "@/components/project/ProjectCard";
import { NewProjectDialog } from "@/components/project/NewProjectDialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const filteredProjects = projects?.filter(project => 
    project.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 animate-slide-up">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Meus Projetos</h1>
          <p className="text-gray-500">Visualize e gerencie todos os seus escopos.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
      {isError && <p className="text-center text-red-500">Falha ao carregar projetos.</p>}
      
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
              <h2 className="text-xl font-semibold text-gray-700">Nenhum projeto encontrado.</h2>
              <p className="text-gray-500 mt-2">Que tal criar o primeiro?</p>
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
      <div key={i} className="space-y-4 bg-white p-6 rounded-2xl">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-5" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-20 w-full" />
      </div>
    ))}
  </div>
);

export default Dashboard;