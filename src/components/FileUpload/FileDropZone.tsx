
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
    <div className="max-w-2xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50 scale-105' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
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
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center transition-colors
            ${isDragOver ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}
          `}>
            <Upload className="w-8 h-8" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Envie sua planilha
            </h3>
            <p className="text-gray-600 mb-4">
              Arraste e solte o arquivo aqui ou clique para selecionar
            </p>
            <p className="text-sm text-gray-500">
              Formatos aceitos: CSV ou Excel (.xlsx, .xls)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
