
import { useState } from 'react';
import { FileUpload, PeriodoData } from '@/components/FileUpload';
import { Dashboard } from '@/components/Dashboard';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { Header } from '@/components/Header';
import { PeriodSelector } from '@/components/PeriodSelector';

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
  const [funcionarios, setFuncionarios] = useState<FuncionarioData[]>([]);
  const [periodosDisponiveis, setPeriodosDisponiveis] = useState<PeriodoData[]>([]);
  const [periodoAtivo, setPeriodoAtivo] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isMultiPeriod, setIsMultiPeriod] = useState(false);

  const handleFileProcessed = (data: FuncionarioData[], filename: string) => {
    setFuncionarios(data);
    setFileName(filename);
    setError(null);
    setIsMultiPeriod(false);
    setPeriodosDisponiveis([]);
    setPeriodoAtivo('');
  };

  const handleMultiplePeriodsProcessed = (periods: PeriodoData[], filename: string) => {
    console.log('Períodos processados:', periods);
    setPeriodosDisponiveis(periods);
    setFileName(filename);
    setError(null);
    setIsMultiPeriod(true);
    
    // Selecionar automaticamente o período mais recente
    if (periods.length > 0) {
      const periodoMaisRecente = periods[periods.length - 1];
      setPeriodoAtivo(periodoMaisRecente.id);
      setFuncionarios(periodoMaisRecente.funcionarios);
      console.log('Período ativo definido:', periodoMaisRecente.id);
    }
  };

  const handlePeriodoChange = (periodoId: string) => {
    console.log('Mudando para período:', periodoId);
    setPeriodoAtivo(periodoId);
    
    if (periodoId === 'todos') {
      // Consolidar todos os funcionários de todos os períodos
      const funcionariosConsolidados: FuncionarioData[] = [];
      const funcionariosPorMatricula = new Map<string, FuncionarioData>();
      
      periodosDisponiveis.forEach((periodo, indicePeriodo) => {
        console.log(`Processando período ${periodo.nome} com ${periodo.funcionarios.length} funcionários`);
        
        periodo.funcionarios.forEach((funcionario) => {
          const chaveUnica = funcionario.matricula || `sem-matricula-${funcionario.id}-${indicePeriodo}`;
          
          if (funcionariosPorMatricula.has(chaveUnica)) {
            // Funcionário já existe, consolidar dados
            const funcionarioExistente = funcionariosPorMatricula.get(chaveUnica)!;
            
            // Somar contadores
            Object.entries(funcionario.contadores).forEach(([tag, quantidade]) => {
              funcionarioExistente.contadores[tag] = (funcionarioExistente.contadores[tag] || 0) + quantidade;
            });
            
            // Somar total de dias
            funcionarioExistente.totalDias += funcionario.totalDias;
            
            // Consolidar dias detalhados com prefixo do período
            Object.entries(funcionario.diasDetalhados).forEach(([dia, status]) => {
              const diaComPeriodo = `${periodo.nome}-${dia}`;
              funcionarioExistente.diasDetalhados[diaComPeriodo] = status;
            });
          } else {
            // Novo funcionário, criar cópia com ID único
            const funcionarioConsolidado: FuncionarioData = {
              id: funcionariosConsolidados.length + 1, // ID sequencial único
              matricula: funcionario.matricula,
              nome: funcionario.nome,
              cargo: funcionario.cargo,
              contadores: { ...funcionario.contadores },
              totalDias: funcionario.totalDias,
              diasDetalhados: {}
            };
            
            // Adicionar dias detalhados com prefixo do período
            Object.entries(funcionario.diasDetalhados).forEach(([dia, status]) => {
              const diaComPeriodo = `${periodo.nome}-${dia}`;
              funcionarioConsolidado.diasDetalhados[diaComPeriodo] = status;
            });
            
            funcionariosPorMatricula.set(chaveUnica, funcionarioConsolidado);
            funcionariosConsolidados.push(funcionarioConsolidado);
          }
        });
      });
      
      console.log('Funcionários consolidados:', funcionariosConsolidados.length);
      setFuncionarios(funcionariosConsolidados);
    } else {
      // Período específico - buscar dados originais
      const periodo = periodosDisponiveis.find(p => p.id === periodoId);
      if (periodo) {
        console.log(`Exibindo período ${periodo.nome} com ${periodo.funcionarios.length} funcionários`);
        // Criar cópia dos dados originais para evitar mutação
        const funcionariosCopia = periodo.funcionarios.map(f => ({
          ...f,
          contadores: { ...f.contadores },
          diasDetalhados: { ...f.diasDetalhados }
        }));
        setFuncionarios(funcionariosCopia);
      } else {
        console.error('Período não encontrado:', periodoId);
        setError(`Período ${periodoId} não encontrado`);
      }
    }
  };

  const handleProcessingStart = () => {
    setIsProcessing(true);
    setError(null);
  };

  const handleProcessingEnd = () => {
    setIsProcessing(false);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setIsProcessing(false);
  };

  const handleReset = () => {
    setFuncionarios([]);
    setPeriodosDisponiveis([]);
    setPeriodoAtivo('');
    setFileName('');
    setError(null);
    setIsProcessing(false);
    setIsMultiPeriod(false);
  };

  const hasData = funcionarios.length > 0 || periodosDisponiveis.length > 0;

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
