import { Home, Settings, FolderKanban } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const SidebarContent = () => {
  const linkClasses = ({ isActive }: { isActive: boolean }) => 
    cn(
      "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
      isActive 
        ? "bg-primary-50 text-primary-700 font-semibold" 
        : "text-gray-600 hover:bg-gray-100"
    );

  return (
    <div className="flex flex-col h-full p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-600">GEP</h1>
        <p className="text-sm text-gray-500">Gestor de Escopos</p>
      </div>
      <nav className="flex flex-col space-y-2">
        <NavLink to="/" end className={linkClasses}>
          <Home className="w-5 h-5" />
          <span>Projetos</span>
        </NavLink>
        <NavLink to="/templates" className={linkClasses}>
          <FolderKanban className="w-5 h-5" />
          <span>Templates</span>
        </NavLink>
        <NavLink to="/configuracoes" className={linkClasses}>
          <Settings className="w-5 h-5" />
          <span>Configurações</span>
        </NavLink>
      </nav>
      <div className="mt-auto">
        <p className="text-xs text-gray-400">Versão 2.1.0</p>
      </div>
    </div>
  );
};

export default SidebarContent;