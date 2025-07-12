
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar/AppSidebar";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  fileName?: string;
  onReset?: () => void;
}

export function DashboardLayout({ children, fileName, onReset }: DashboardLayoutProps) {
  return (
    <SidebarProvider collapsedWidth={56}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b bg-white/80 backdrop-blur-sm flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Sistema de Análise de Ponto
                </h1>
                {fileName && (
                  <p className="text-sm text-gray-600">
                    Arquivo: {fileName}
                  </p>
                )}
              </div>
            </div>
            
            {onReset && (
              <Button onClick={onReset} variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Novo Arquivo
              </Button>
            )}
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
