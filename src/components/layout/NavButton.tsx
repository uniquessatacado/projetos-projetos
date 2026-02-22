import { Home, PlusCircle, Settings, Shield, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const icons = {
  Home,
  PlusCircle,
  Settings,
  Shield,
  Users,
};

interface NavButtonProps {
  icon: keyof typeof icons;
  label: string;
  to: string;
}

const NavButton = ({ icon, label, to }: NavButtonProps) => {
  const IconComponent = icons[icon];
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex flex-col items-center justify-center gap-1 w-20 h-16 rounded-lg transition-colors",
        isActive ? "text-primary-600 bg-primary-50" : "text-gray-500 hover:text-primary-600"
      )}
    >
      <IconComponent className="w-6 h-6" />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
};

export default NavButton;