
import { useState, useMemo } from 'react';
import { FuncionarioData } from '@/pages/Index';
import { StatsOverview } from './StatsOverview';
import { FuncionariosList } from './FuncionariosList';
import { SearchAndFilters } from './SearchAndFilters';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface DashboardProps {
  funcionarios: FuncionarioData[];
  fileName: string;
  onReset: () => void;
}

export const Dashboard = ({ funcionarios, fileName, onReset }: DashboardProps) => {
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
              Análise Processada
            </h2>
            <p className="text-gray-600">
              Arquivo: <span className="font-medium">{fileName}</span> • {stats.totalFuncionarios} funcionários
            </p>
          </div>
          <Button onClick={onReset} variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Novo Arquivo
          </Button>
        </div>
      </div>

      {/* Estatísticas gerais */}
      <StatsOverview stats={stats} />

      {/* Busca e filtros */}
      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterTag={filterTag}
        onFilterChange={setFilterTag}
        availableTags={stats.todasTags}
      />

      {/* Lista de funcionários */}
      <FuncionariosList funcionarios={funcionariosFiltrados} />
    </div>
  );
};
