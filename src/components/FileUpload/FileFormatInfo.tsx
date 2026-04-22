import { Info } from 'lucide-react';

export const FileFormatInfo = () => {
  return (
    <div className="mt-8 bg-white/40 border border-white/60 rounded-3xl p-6 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 mb-2">Informações de Importação</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div className="text-sm text-slate-600 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span><strong>CSV:</strong> Ponto e vírgula (;), UTF-8</span>
            </div>
            <div className="text-sm text-slate-600 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span><strong>Excel:</strong> Múltiplas abas por período</span>
            </div>
            <div className="text-sm text-slate-600 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span>Colunas: NOME, CARGO e DIAS</span>
            </div>
            <div className="text-sm text-slate-600 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span>Aba <strong>LISTA DE COLABORADORES</strong> automática</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
