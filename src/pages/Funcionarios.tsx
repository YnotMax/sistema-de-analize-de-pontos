
import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { FuncionariosList } from '@/components/FuncionariosList';
import { SearchAndFilters } from '@/components/SearchAndFilters';
import { PeriodSelector } from '@/components/PeriodSelector';
import { usePontoProcessor } from '@/hooks/usePontoProcessor';

export default function Funcionarios() {
  const {
    funcionarios,
    periodosDisponiveis,
    periodoAtivo,
    fileName,
    isMultiPeriod,
    handlePeriodoChange,
    handleReset
  } = usePontoProcessor();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<string>('');

  const funcionariosFiltrados = useMemo(() => {
    return funcionarios.filter(funcionario => {
      const matchesSearch = funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           funcionario.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           funcionario.matricula.includes(searchTerm);
      
      const matchesFilter = !filterTag || funcionario.contadores[filterTag] > 0;
      
      return matchesSearch && matchesFilter;
    });
  }, [funcionarios, searchTerm, filterTag]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    funcionarios.forEach(funcionario => {
      Object.keys(funcionario.contadores).forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [funcionarios]);

  if (funcionarios.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhum dado disponível
            </h2>
            <p className="text-gray-500">
              Faça upload de um arquivo para visualizar a análise por funcionário.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout fileName={fileName} onReset={handleReset}>
      <div className="space-y-6">
        {/* Seletor de Período */}
        {isMultiPeriod && periodosDisponiveis.length > 0 && handlePeriodoChange && (
          <PeriodSelector
            periodosDisponiveis={periodosDisponiveis}
            periodoAtivo={periodoAtivo}
            onPeriodoChange={handlePeriodoChange}
            fileName={fileName}
          />
        )}

        {/* Filtros e Busca */}
        <SearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterTag={filterTag}
          onFilterChange={setFilterTag}
          availableTags={availableTags}
        />

        {/* Lista de Funcionários */}
        <div>
          <h3 className="text-xl font-bold mb-4 text-gray-900">
            Análise Detalhada por Funcionário
          </h3>
          <FuncionariosList funcionarios={funcionariosFiltrados} />
        </div>
      </div>
    </DashboardLayout>
  );
}
