
import { Loader2, FileText } from 'lucide-react';

export const ProcessingStatus = () => {
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <FileText className="w-12 h-12 text-blue-600" />
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin absolute -top-1 -right-1" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Processando arquivo...
        </h3>
        <p className="text-gray-600">
          Analisando dados dos funcionários e calculando estatísticas
        </p>
        
        <div className="mt-6">
          <div className="bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
