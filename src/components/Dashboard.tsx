import { useState, useMemo } from 'react';
import { FuncionarioData } from '@/pages/Index';
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

  // Base de dados ativa
  const dadosAtivos = useMemo(() => {
    return (funcionariosUnificados && funcionariosUnificados.length > 0) 
      ? funcionariosUnificados as any[]
      : funcionarios;
  }, [funcionarios, funcionariosUnificados]);

  // Filtrar funcionários baseado na busca e filtros
  const funcionariosFiltrados = useMemo(() => {
    return dadosAtivos.filter((funcionario: any) => {
      const matriculaStr = funcionario.matricula ? funcionario.matricula.toString() : '';
      const matchesSearch = funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           funcionario.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           matriculaStr.includes(searchTerm);
      
      const matchesFilter = !filterTag || (funcionario.contadores && funcionario.contadores[filterTag] > 0);
      
      return matchesSearch && matchesFilter;
    });
  }, [dadosAtivos, searchTerm, filterTag]);

  // Estatísticas gerais para fallback (dados legados)
  const stats = useMemo(() => {
    const todasTags = new Set<string>();
    const contagemTags: Record<string, number> = {};
    
    dadosAtivos.forEach((funcionario: any) => {
      if (funcionario.contadores) {
        Object.keys(funcionario.contadores).forEach(tag => {
          todasTags.add(tag);
          contagemTags[tag] = (contagemTags[tag] || 0) + funcionario.contadores[tag];
        });
      }
    });

    return {
      totalFuncionarios: dadosAtivos.length,
      todasTags: Array.from(todasTags),
      contagemTags,
      funcionariosMaisAtestados: dadosAtivos
        .filter((f: any) => f.contadores && f.contadores['ATESTADO'] > 0)
        .sort((a: any, b: any) => (b.contadores['ATESTADO'] || 0) - (a.contadores['ATESTADO'] || 0))
        .slice(0, 5)
    };
  }, [dadosAtivos]);

  return (
    <div className="space-y-8">
      {/* Header com informações do arquivo */}
      <div className="bg-white/70 backdrop-blur-md border border-white/40 rounded-3xl shadow-sm p-6 lg:p-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Análise de Tendências Departamentais
          </h2>
          <p className="text-slate-500 mt-1">
            Fonte: <span className="font-medium text-slate-700">{fileName}</span> • {stats.totalFuncionarios} colaboradores processados
          </p>
        </div>
        <Button onClick={onReset} variant="outline" className="gap-2 bg-white/50 hover:bg-white rounded-xl border-slate-200 text-slate-600 shadow-sm transition-all">
          <Upload className="w-4 h-4" />
          Importar Novo
        </Button>
      </div>

      {/* Seção de KPIs - Visão Geral */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 lg:p-8 shadow-sm">
        <h3 className="text-xl font-bold mb-6 text-slate-800">Visão Geral</h3>
        <StatsOverview funcionarios={dadosAtivos} />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Busca e filtros (Sidebar da lista) */}
        <div className="lg:col-span-3">
          <div className="sticky top-8 bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm">
             <h3 className="text-lg font-bold mb-4 text-slate-800">Filtros de Análise</h3>
             <SearchAndFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterTag={filterTag}
              onFilterChange={setFilterTag}
              availableTags={stats.todasTags}
            />
          </div>
        </div>

        {/* Lista de funcionários (Painel Principal) */}
        <div className="lg:col-span-9 bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 lg:p-8 shadow-sm">
          <FuncionariosList funcionarios={funcionariosFiltrados} />
        </div>
      </div>
    </div>
  );
};
