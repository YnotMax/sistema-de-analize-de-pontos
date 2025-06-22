
import { Building, Clock } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-blue-600">
            <Clock className="w-6 h-6" />
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Sistema de Controle de Ponto
            </h1>
            <p className="text-sm text-gray-500">
              Análise e processamento de dados de frequência
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
