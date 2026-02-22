import { Home, Settings, FolderKanban, Users, Lightbulb, Shield } from 'lucide-react';
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
      <div className="mb-8 px-4">
        <h1 className="text-2xl font-black text-primary-600 tracking-tighter">GEP 2.0</h1>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gestor de Escopos</p>
      </div>
      <nav className="flex flex-col space-y-2">
        <NavLink to="/" end className={linkClasses}>
          <Home className="w-5 h-5" />
          <span>Projetos</span>
        </NavLink>
        <NavLink to="/clientes" className={linkClasses}>
          <Users className="w-5 h-5" />
          <span>Central de Clientes</span>
        </NavLink>
        <NavLink to="/cofre" className={linkClasses}>
          <Shield className="w-5 h-5" />
          <span>Cofre Admin</span>
        </NavLink>
        <NavLink to="/conhecimento" className={linkClasses}>
          <Lightbulb className="w-5 h-5" />
          <span>Prompts & Tutoriais</span>
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
      <div className="mt-auto p-4 border-t border-gray-100">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dyad System</p>
      </div>
    </div>
  );
};

export default SidebarContent;