import { Outlet } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import SidebarContent from "@/components/layout/Sidebar";
import NavButton from "@/components/layout/NavButton";

const AppLayout = () => {
    const isMobile = useIsMobile();
    
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {!isMobile && (
                <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-200 shadow-soft flex-col z-40">
                    <SidebarContent />
                </aside>
            )}
            
            <main className="lg:ml-72 pb-24 lg:pb-0">
                <Outlet />
            </main>
            
            {isMobile && (
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 px-4 py-2">
                    <div className="flex justify-around items-center">
                        <NavButton icon="Home" label="Projetos" to="/" />
                        <NavButton icon="Settings" label="Config" to="/config" />
                    </div>
                </nav>
            )}
        </div>
    );
};

export default AppLayout;