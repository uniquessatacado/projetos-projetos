import { Home, PlusCircle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const icons = {
  Home,
  PlusCircle,
  Settings,
};

interface NavButtonProps {
  icon: keyof typeof icons;
  label: string;
  to: string;
  isPrimary?: boolean;
}

const NavButton = ({ icon, label, to, isPrimary = false }: NavButtonProps) => {
  const IconComponent = icons[icon];

  return (
    <Link
      to={to}
      className={cn(
        "flex flex-col items-center justify-center gap-1 text-gray-500 transition-colors",
        isPrimary ? "text-primary-600" : "hover:text-primary-600"
      )}
    >
      {isPrimary ? (
        <div className="p-3 bg-primary-600 text-white rounded-full -mt-8 shadow-glow">
          <IconComponent className="w-7 h-7" />
        </div>
      ) : (
        <IconComponent className="w-6 h-6" />
      )}
      <span className={cn("text-xs", isPrimary && "font-bold mt-1")}>{label}</span>
    </Link>
  );
};

export default NavButton;