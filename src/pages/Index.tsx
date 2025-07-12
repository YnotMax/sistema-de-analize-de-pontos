
import { FileUpload } from '@/components/FileUpload';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { AssiduidadeKPIs } from '@/components/Dashboard/AssiduidadeKPIs';
import { ComparisonByCargo } from '@/components/Dashboard/ComparisonByCargo';
import { OccurrenceChart } from '@/components/Dashboard/OccurrenceChart';
import { EmployeeRanking } from '@/components/Dashboard/EmployeeRanking';
import { PeriodSelector } from '@/components/PeriodSelector';
import { usePontoProcessor } from '@/hooks/usePontoProcessor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface FuncionarioData {
  id: number;
  matricula: string;
  nome: string;
  cargo: string;
  contadores: Record<string, number>;
  totalDias: number;
  diasDetalhados: Record<string, string>;
}

const Index = () => {
  const {
    funcionarios,
    funcionariosUnificados,
    periodosDisponiveis,
    periodoAtivo,
    isProcessing,
    error,
    fileName,
    isMultiPeriod,
    handleFileProcessed,
    handleUnifiedDataProcessed,
    handleMultiplePeriodsProcessed,
    handlePeriodoChange,
    handleProcessingStart,
    handleProcessingEnd,
    handleError,
    handleReset
  } = usePontoProcessor();

  const hasData = funcionarios.length > 0 || periodosDisponiveis.length > 0 || funcionariosUnificados.length > 0;

  if (!hasData && !isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Sistema de Análise de Ponto
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Processe suas planilhas CSV ou Excel de controle de ponto e obtenha insights detalhados sobre a frequência dos funcionários
            </p>
          </div>
          
          <FileUpload
            onFileProcessed={handleFileProcessed}
            onUnifiedDataProcessed={handleUnifiedDataProcessed}
            onMultiplePeriodsProcessed={handleMultiplePeriodsProcessed}
            onProcessingStart={handleProcessingStart}
            onProcessingEnd={handleProcessingEnd}
            onError={handleError}
          />
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout fileName={fileName} onReset={handleReset}>
      <div className="space-y-8">
        {/* Seletor de Período */}
        {isMultiPeriod && periodosDisponiveis.length > 0 && handlePeriodoChange && (
          <PeriodSelector
            periodosDisponiveis={periodosDisponiveis}
            periodoAtivo={periodoAtivo}
            onPeriodoChange={handlePeriodoChange}
            fileName={fileName}
          />
        )}

        {/* Dashboard Principal */}
        <div className="space-y-8">
          {/* KPIs de Assiduidade */}
          {funcionariosUnificados && funcionariosUnificados.length > 0 && (
            <AssiduidadeKPIs funcionarios={funcionariosUnificados} />
          )}

          {/* Gráficos e Análises */}
          <div className="grid gap-6">
            {funcionariosUnificados && funcionariosUnificados.length > 0 && (
              <>
                {/* Primeira linha - Gráficos principais */}
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <OccurrenceChart funcionarios={funcionariosUnificados} />
                  </div>
                  <div className="lg:col-span-1">
                    <EmployeeRanking funcionarios={funcionariosUnificados} />
                  </div>
                </div>
                
                {/* Segunda linha - Comparativo por cargo */}
                <ComparisonByCargo funcionarios={funcionariosUnificados} />
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
