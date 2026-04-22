
import { FuncionarioData } from '@/pages/Index';
import { FuncionarioCard } from './FuncionarioCard';

interface FuncionariosListProps {
  funcionarios: FuncionarioData[];
}

export const FuncionariosList = ({ funcionarios }: FuncionariosListProps) => {
  if (funcionarios.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum funcionário encontrado
        </h3>
        <p className="text-gray-500">
          Tente ajustar os filtros ou termos de busca
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Funcionários ({funcionarios.length})
        </h3>
      </div>
      
      <div className="grid gap-4">
        {funcionarios.map((funcionario: any, index: number) => {
          const key = funcionario.matricula || funcionario.id || index;
          return <FuncionarioCard key={key} funcionario={funcionario} />;
        })}
      </div>
    </div>
  );
};
