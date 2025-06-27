
import { useState, useMemo } from 'react';
import { FuncionarioData } from '@/pages/Index';
import { StatsOverview as OldStatsOverview } from './StatsOverview';
import { StatsOverview } from './Dashboard/StatsOverview';
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

  // Estatísticas gerais
  const stats = useMemo(() => {
    const todasTags = new Set<string>();
    const contagemTags: Record<string, number> = {};
    
    // Debug: log dos funcionários e seus contadores
    console.log('Dashboard - Funcionários para estatísticas:', funcionarios.length);
    funcionarios.forEach((funcionario, index) => {
      if (index < 3) { // Log apenas os primeiros 3 para não poluir
        console.log(`Funcionário ${funcionario.nome}:`, funcionario.contadores);
      }
      
      Object.keys(funcionario.contadores).forEach(tag => {
        todasTags.add(tag);
        contagemTags[tag] = (contagemTags[tag] || 0) + funcionario.contadores[tag];
      });
    });

    console.log('Dashboard - Todas as tags encontradas:', Array.from(todasTags));
    console.log('Dashboard - Contagem final das tags:', contagemTags);

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

      {/* Nova Seção de KPIs - Visão Geral */}
      {funcionariosUnificados && funcionariosUnificados.length > 0 ? (
        <div>
          <h3 className="text-xl font-bold mb-4 text-gray-900">Visão Geral</h3>
          <StatsOverview funcionarios={funcionariosUnificados} />
        </div>
      ) : (
        <OldStatsOverview stats={stats} />
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
