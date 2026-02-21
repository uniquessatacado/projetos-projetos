import ProjectCard, { ProjectType } from "@/components/project/ProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle } from "lucide-react";

const mockProjects: ProjectType[] = [
  { id: 1, nome: "Loja Virtual Fashion", cliente_nome: "Maria Boutique", status: "em_desenvolvimento", is_favorito: true, prazo_estimado_dias: 45, complexidade_global: "alta", progresso: 60 },
  { id: 2, nome: "Controle de Estoque Básico", cliente_nome: "Interno", status: "concluido", is_favorito: false, prazo_estimado_dias: 15, complexidade_global: "baixa", progresso: 100 },
  { id: 3, nome: "App Mobile de Delivery", cliente_nome: "FoodFast", status: "analise", is_favorito: false, prazo_estimado_dias: 90, complexidade_global: "muito_alta", progresso: 10 },
  { id: 4, nome: "Website Institucional", cliente_nome: "Advocacia & Cia", status: "rascunho", is_favorito: false, prazo_estimado_dias: 20, complexidade_global: "media", progresso: 0 },
];

const Dashboard = () => {
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
            <Input placeholder="Buscar projeto..." className="pl-10" />
          </div>
          <Button className="bg-primary-600 hover:bg-primary-700">
            <PlusCircle className="w-5 h-5 mr-2" />
            Novo Projeto
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {mockProjects.map((project) => (
          <ProjectCard key={project.id} projeto={project} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;