import { LayoutDashboard, ArrowRightLeft, LogOut, Code2, Github, Linkedin, Instagram, Activity } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface AppSidebarProps {
  currentView?: 'dashboard' | 'compare' | 'absenteismo';
  onNavigate?: (view: 'dashboard' | 'compare' | 'absenteismo') => void;
  hasData?: boolean;
}

export const AppSidebar = ({ currentView = 'dashboard', onNavigate, hasData = false }: AppSidebarProps) => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-20 flex flex-col items-center py-6 bg-white/80 backdrop-blur-md border-r border-white/60 z-50 shadow-sm">
      {/* Logo Area */}
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mb-12 shadow-md shadow-blue-500/20 flex items-center justify-center text-white font-bold text-xl">
        P
      </div>

      {/* Navigation Icons - Só mostra se houver dados */}
      {hasData && (
        <nav className="flex-1 flex flex-col items-center gap-6 w-full px-3">
          <NavItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            active={currentView === 'dashboard'} 
            onClick={() => onNavigate?.('dashboard')}
            tooltip="Dashboard"
          />
          <NavItem 
            icon={<ArrowRightLeft className="w-5 h-5" />} 
            active={currentView === 'compare'} 
            onClick={() => onNavigate?.('compare')}
            tooltip="Comparativo"
          />
          <NavItem 
            icon={<Activity className="w-5 h-5" />} 
            active={currentView === 'absenteismo'} 
            onClick={() => onNavigate?.('absenteismo')}
            tooltip="Taxa de Absenteísmo"
          />
        </nav>
      )}

      {/* Bottom Icons */}
      <div className="mt-auto px-3 w-full flex flex-col gap-4">
        
        {/* Modal do Desenvolvedor */}
        <Dialog>
          <DialogTrigger asChild>
            <button 
              title="Sobre o Desenvolvedor"
              className="w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-300 relative group bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-110"
            >
              <Code2 className="w-5 h-5" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white/90 backdrop-blur-xl border border-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-800">Desenvolvido por Tony Max</DialogTitle>
              <DialogDescription className="text-base text-slate-500">
                Gostou do projeto? Vamos nos conectar! Acesse minhas redes sociais para acompanhar meu trabalho e conversarmos sobre tecnologia, desenvolvimento e oportunidades.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-4">
              <a href="https://github.com/YnotMax" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 text-slate-700">
                <Github className="w-6 h-6 text-slate-900" />
                <span className="font-semibold">GitHub (YnotMax)</span>
              </a>
              <a href="https://www.linkedin.com/in/tony-max-da-silva-costa/" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-100 text-blue-800">
                <Linkedin className="w-6 h-6 text-blue-600" />
                <span className="font-semibold">LinkedIn</span>
              </a>
              <a href="https://www.instagram.com/tony_max_silva/" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-pink-50 hover:bg-pink-100 transition-colors border border-pink-100 text-pink-800">
                <Instagram className="w-6 h-6 text-pink-600" />
                <span className="font-semibold">Instagram (@tony_max_silva)</span>
              </a>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset/Logout */}
        {hasData && (
          <NavItem 
            icon={<LogOut className="w-5 h-5" />} 
            onClick={() => window.location.reload()}
            tooltip="Sair / Resetar"
          />
        )}
      </div>
    </aside>
  );
};

interface NavItemProps {
  icon: React.ReactNode; 
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  tooltip?: string;
}

const NavItem = ({ icon, active = false, onClick, disabled = false, tooltip }: NavItemProps) => {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-300 relative group
        ${active 
          ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100' 
          : disabled 
            ? 'text-slate-300 cursor-not-allowed opacity-50'
            : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
        }`}
    >
      {/* Indicador de aba ativa */}
      {active && (
        <div className="absolute left-[-12px] top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>
      )}
      {icon}
    </button>
  );
};
