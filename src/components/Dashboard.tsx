
import { useState, useMemo } from 'react';
import { FuncionarioData } from '@/pages/Index';
import { StatsOverview as OldStatsOverview } from './StatsOverview';
import { StatsOverview } from './Dashboard/StatsOverview';
import { OccurrenceChart } from './Dashboard/OccurrenceChart';
import { EmployeeRanking } from './Dashboard/EmployeeRanking';
import { ComparisonByRole } from './Dashboard/ComparisonByRole';
import { FuncionariosList } from './FuncionariosList';
import { SearchAndFilters } from './SearchAndFilters';
import { PeriodSelector } from './PeriodSelector';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload } from 'lucide-react';
import { FuncionarioUnificado, PeriodoData } from '@/utils/excel/types';

interface DashboardProps {
  funcionarios: FuncionarioData[];
  funcionariosUnificados?: FuncionarioUnificado[];
  periodosDisponiveis?: PeriodoData[];
  periodoAtivo?: string;
  onPeriodoChange?: (periodoId: string) => void;
  fileName: string;
  isMultiPeriod?: boolean;
  onReset: () => void;
}

export const Dashboard = ({ 
  funcionarios, 
  funcionariosUnificados, 
  periodosDisponiveis = [],
  periodoAtivo = '',
  onPeriodoChange,
  fileName, 
  isMultiPeriod = false,
  onReset 
}: DashboardProps) => {
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

      {/* Seletor de Período - só aparece para arquivos com múltiplos períodos */}
      {isMultiPeriod && periodosDisponiveis.length > 0 && onPeriodoChange && (
        <PeriodSelector
          periodosDisponiveis={periodosDisponiveis}
          periodoAtivo={periodoAtivo}
          onPeriodoChange={onPeriodoChange}
          fileName={fileName}
        />
      )}

      {/* Sistema de Abas */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="employees">Análise por Funcionário</TabsTrigger>
        </TabsList>
        
        {/* Aba: Visão Geral */}
        <TabsContent value="overview" className="space-y-8">
          {/* Seção de KPIs - Visão Geral */}
          {funcionariosUnificados && funcionariosUnificados.length > 0 ? (
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Indicadores Principais</h3>
              <StatsOverview funcionarios={funcionariosUnificados} />
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Indicadores Principais</h3>
              <OldStatsOverview stats={stats} />
            </div>
          )}

          {/* Seção de Análise de Frequência com Gráficos */}
          {funcionariosUnificados && funcionariosUnificados.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Análise de Frequência</h3>
              <div className="grid gap-6">
                {/* Primeira linha - Gráfico principal de ocorrências e ranking */}
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3 h-[400px]">
                  <div className="lg:col-span-2">
                    <OccurrenceChart funcionarios={funcionariosUnificados} />
                  </div>
                  <div className="lg:col-span-1">
                    <EmployeeRanking funcionarios={funcionariosUnificados} />
                  </div>
                </div>
                
                {/* Segunda linha - Comparativo por cargo */}
                <div className="grid gap-6 md:grid-cols-1">
                  <ComparisonByRole funcionarios={funcionariosUnificados} />
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Aba: Análise por Funcionário */}
        <TabsContent value="employees" className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
