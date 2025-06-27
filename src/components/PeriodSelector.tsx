import { ChevronDown, Calendar, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PeriodoData } from '@/utils/excel/types';

interface PeriodSelectorProps {
  periodosDisponiveis: PeriodoData[];
  periodoAtivo: string;
  onPeriodoChange: (periodoId: string) => void;
  fileName: string;
}

export const PeriodSelector = ({
  periodosDisponiveis,
  periodoAtivo,
  onPeriodoChange,
  fileName
}: PeriodSelectorProps) => {
  if (periodosDisponiveis.length === 0) {
    return null;
  }

  const periodoAtual = periodosDisponiveis.find(p => p.id === periodoAtivo);
  const totalFuncionariosUnicos = new Set(
    periodosDisponiveis.flatMap(p => p.funcionarios.map(f => f.matricula || f.id))
  ).size;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* Informações do arquivo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Arquivo Processado</h3>
            <p className="text-sm text-gray-600">
              📁 {fileName} • {periodosDisponiveis.length} período(s) • {totalFuncionariosUnicos} funcionários únicos
            </p>
          </div>
        </div>

        {/* Seletor principal */}
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">
            Analisar período:
          </label>
          <Select value={periodoAtivo} onValueChange={onPeriodoChange}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Selecione um período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">
                📊 Todos os Períodos ({totalFuncionariosUnicos} funcionários)
              </SelectItem>
              {periodosDisponiveis.map(periodo => (
                <SelectItem key={periodo.id} value={periodo.id}>
                  📅 {periodo.nome} ({periodo.funcionarios.length} funcionários)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Abas rápidas para os últimos períodos */}
      {periodosDisponiveis.length > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Navegação rápida:</p>
          <div className="flex flex-wrap gap-2">
            {periodosDisponiveis.slice(-6).map(periodo => (
              <button
                key={periodo.id}
                onClick={() => onPeriodoChange(periodo.id)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  periodoAtivo === periodo.id 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {periodo.nome.split(' ')[0]}
              </button>
            ))}
            {periodosDisponiveis.length > 1 && (
              <button
                onClick={() => onPeriodoChange('todos')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  periodoAtivo === 'todos' 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                Todos
              </button>
            )}
          </div>
        </div>
      )}

      {/* Informações do período ativo */}
      {periodoAtual && periodoAtivo !== 'todos' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Período selecionado: <strong>{periodoAtual.nome}</strong>
            </span>
            <span className="text-gray-600">
              {periodoAtual.funcionarios.length} funcionários • {periodoAtual.totalRegistros} registros
            </span>
          </div>
        </div>
      )}

      {/* Informações consolidadas */}
      {periodoAtivo === 'todos' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Visualização: <strong>Todos os Períodos Consolidados</strong>
            </span>
            <span className="text-gray-600">
              {totalFuncionariosUnicos} funcionários únicos • Dados combinados de {periodosDisponiveis.length} períodos
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
