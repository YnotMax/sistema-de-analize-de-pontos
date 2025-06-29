
import { useState, useMemo } from 'react';
import { FuncionarioData } from '@/pages/Index';
import { StatsOverview as OldStatsOverview } from './StatsOverview';
import { StatsOverview } from './Dashboard/StatsOverview';
import { OccurrenceChart } from './Dashboard/OccurrenceChart';
import { FuncionariosList } from './FuncionariosList';
import { SearchAndFilters } from './SearchAndFilters';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { FuncionarioUnificado } from '@/utils/excel/types';

interface DashboardProps {
  funcionarios: FuncionarioData[];
  funcionariosUnificados?: FuncionarioUnificado[];
  fileName: string;
  onReset: () => void;
}

export const Dashboard = ({ funcionarios, funcionariosUnificados, fileName, onReset }: DashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<string>('');

  // Filtrar funcionários baseado na busca e filtros
  const funcionariosFiltrados = useMemo(() => {
    return funcionarios.filter(funcionario => {
      const matchesSearch = funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           funcionario.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           funcionario.matricula.includes(searchTerm);
      
      const matchesFilter = !filterTag || funcionario.contadores[filterTag] > 0;
      
      return matchesSearch && matchesFilter;
    });
  }, [funcionarios, searchTerm, filterTag]);

  // Estatísticas gerais para fallback (dados legados)
  const stats = useMemo(() => {
    const todasTags = new Set<string>();
    const contagemTags: Record<string, number> = {};
    
    funcionarios.forEach((funcionario) => {
      Object.keys(funcionario.contadores).forEach(tag => {
        todasTags.add(tag);
        contagemTags[tag] = (contagemTags[tag] || 0) + funcionario.contadores[tag];
      });
    });

    return {
      totalFuncionarios: funcionarios.length,
      todasTags: Array.from(todasTags),
      contagemTags,
      funcionariosMaisAtestados: funcionarios
        .filter(f => f.contadores['ATESTADO'] > 0)
        .sort((a, b) => (b.contadores['ATESTADO'] || 0) - (a.contadores['ATESTADO'] || 0))
        .slice(0, 5)
    };
  }, [funcionarios]);

  return (
    <div className="space-y-8">
      {/* Header com informações do arquivo */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Dashboard de Análise
            </h2>
            <p className="text-gray-600">
              Analisando o arquivo: <span className="font-medium">{fileName}</span> • {stats.totalFuncionarios} funcionários
            </p>
          </div>
          <Button onClick={onReset} variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Novo Arquivo
          </Button>
        </div>
      </div>

      {/* Seção de KPIs - Visão Geral */}
      {funcionariosUnificados && funcionariosUnificados.length > 0 ? (
        <div>
          <h3 className="text-xl font-bold mb-4 text-gray-900">Visão Geral</h3>
          <StatsOverview funcionarios={funcionariosUnificados} />
        </div>
      ) : (
        <div>
          <h3 className="text-xl font-bold mb-4 text-gray-900">Visão Geral (Fallback)</h3>
          <OldStatsOverview stats={stats} />
        </div>
      )}

      {/* Nova Seção de Análise de Frequência com Gráfico */}
      {funcionariosUnificados && funcionariosUnificados.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 text-gray-900">Análise de Frequência</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-1 lg:col-span-4">
              <OccurrenceChart funcionarios={funcionariosUnificados} />
            </div>
            <div className="col-span-1 lg:col-span-3">
              {/* Espaço para o próximo gráfico, como o Ranking de Funcionários */}
            </div>
          </div>
        </div>
      )}

      {/* Busca e filtros */}
      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterTag={filterTag}
        onFilterChange={setFilterTag}
        availableTags={stats.todasTags}
      />

      {/* Lista de funcionários */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-gray-900">Detalhes por Funcionário</h3>
        <FuncionariosList funcionarios={funcionariosFiltrados} />
      </div>
    </div>
  );
};
