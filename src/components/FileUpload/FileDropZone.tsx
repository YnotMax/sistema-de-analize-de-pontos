
import { Upload } from 'lucide-react';

interface FileDropZoneProps {
  isDragOver: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileDropZone = ({
  isDragOver,
  onDrop,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onFileInput
}: FileDropZoneProps) => {
  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-[2rem] p-16 text-center transition-all duration-300 overflow-hidden
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50/50 scale-[1.02] shadow-xl shadow-blue-500/10' 
            : 'border-slate-300/60 bg-white/40 hover:border-blue-300 hover:bg-white/60 hover:shadow-lg'
          }
        `}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
      >
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={onFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        <div className="flex flex-col items-center gap-6 relative z-0 pointer-events-none">
          <div className={`
            w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300
            ${isDragOver 
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 scale-110' 
              : 'bg-white shadow-sm text-blue-500'
            }
          `}>
            <Upload className="w-8 h-8" strokeWidth={2.5} />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-800">
              Importar Dados de Frequência
            </h3>
            <p className="text-slate-500 max-w-sm mx-auto leading-relaxed text-lg">
              Arraste e solte seu arquivo aqui ou <span className="text-blue-600 font-semibold">clique para procurar</span>
            </p>
          </div>
          
          <div className="flex gap-3 mt-2">
             <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold uppercase tracking-wider">.XLSX</span>
             <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold uppercase tracking-wider">.CSV</span>
          </div>
        </div>
      </div>
    </div>
  );
};
