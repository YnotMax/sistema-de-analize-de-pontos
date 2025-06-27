
import { FileUpload } from '@/components/FileUpload';
import { Dashboard } from '@/components/Dashboard';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { Header } from '@/components/Header';
import { PeriodSelector } from '@/components/PeriodSelector';
import { usePontoProcessor } from '@/hooks/usePontoProcessor';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {!hasData && !isProcessing ? (
          <div className="max-w-4xl mx-auto">
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
        ) : (
          <>
            {isProcessing && <ProcessingStatus />}
            
            {hasData && (
              <>
                {/* Seletor de período (só aparece para arquivos Excel com múltiplas abas) */}
                {isMultiPeriod && (
                  <PeriodSelector
                    periodosDisponiveis={periodosDisponiveis}
                    periodoAtivo={periodoAtivo}
                    onPeriodoChange={handlePeriodoChange}
                    fileName={fileName}
                  />
                )}
                
                {/* Dashboard */}
                <Dashboard 
                  funcionarios={funcionarios} 
                  funcionariosUnificados={funcionariosUnificados}
                  fileName={fileName}
                  onReset={handleReset}
                />
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
