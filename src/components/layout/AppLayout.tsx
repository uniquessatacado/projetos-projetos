import { Outlet } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import SidebarContent from "@/components/layout/Sidebar";
import NavButton from "@/components/layout/NavButton";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const AppLayout = () => {
    const isMobile = useIsMobile();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
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
                <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 px-2 py-2">
                        <div className="flex justify-around items-center">
                            <NavButton icon="Home" label="Projetos" to="/" />
                            <NavButton icon="Users" label="Clientes" to="/clientes" />
                            
                            <SheetTrigger asChild>
                                <Button 
                                    variant="default" 
                                    size="icon" 
                                    className="w-16 h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-glow transform -translate-y-4 flex flex-col gap-1"
                                >
                                    <Menu className="w-6 h-6" />
                                    <span className="text-xs font-medium">Menu</span>
                                </Button>
                            </SheetTrigger>

                            <NavButton icon="Shield" label="Cofre" to="/cofre" />
                            <NavButton icon="Settings" label="Config" to="/configuracoes" />
                        </div>
                    </nav>
                    
                    <SheetContent side="left" className="p-0 w-[280px] border-none">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            )}
        </div>
    );
};

export default AppLayout;