
import { AlertCircle } from 'lucide-react';

export const FileFormatInfo = () => {
  return (
    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-blue-900 mb-2">Formatos suportados:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>CSV:</strong> Separado por ponto e vírgula (;), encoding UTF-8</li>
            <li>• <strong>Excel:</strong> Múltiplas abas (.xlsx/.xls) - cada aba = um período</li>
            <li>• Colunas: NOME, CARGO e dias do mês</li>
            <li>• Tags como: 100%, ATESTADO, FÉRIAS, 1: (presença normal), etc.</li>
            <li>• <strong>Novo:</strong> Arquivos .xlsx com aba "LISTA DE COLABORADORES" são processados automaticamente</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
