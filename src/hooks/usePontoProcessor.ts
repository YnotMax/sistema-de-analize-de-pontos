
import { useState } from 'react';
import { FuncionarioData } from '@/pages/Index';

export interface PeriodoData {
  id: string;
  nome: string;
  funcionarios: FuncionarioData[];
  totalRegistros: number;
  dataProcessamento: Date;
}

export const usePontoProcessor = () => {
  const [funcionarios, setFuncionarios] = useState<FuncionarioData[]>([]);
  const [periodosDisponiveis, setPeriodosDisponiveis] = useState<PeriodoData[]>([]);
  const [periodoAtivo, setPeriodoAtivo] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isMultiPeriod, setIsMultiPeriod] = useState(false);
  const [dadosOriginaisPorPeriodo, setDadosOriginaisPorPeriodo] = useState<Map<string, FuncionarioData[]>>(new Map());

  const handleFileProcessed = (data: FuncionarioData[], filename: string) => {
    setFuncionarios(data);
    setFileName(filename);
    setError(null);
    setIsMultiPeriod(false);
    setPeriodosDisponiveis([]);
    setPeriodoAtivo('');
    setDadosOriginaisPorPeriodo(new Map());
  };

  const handleMultiplePeriodsProcessed = (periods: PeriodoData[], filename: string) => {
    console.log('Períodos processados:', periods);
    setPeriodosDisponiveis(periods);
    setFileName(filename);
    setError(null);
    setIsMultiPeriod(true);
    
    // Armazenar dados originais de cada período
    const dadosOriginais = new Map<string, FuncionarioData[]>();
    periods.forEach(periodo => {
      // Criar cópias profundas dos dados originais
      const funcionariosCopia = periodo.funcionarios.map(funcionario => ({
        ...funcionario,
        contadores: { ...funcionario.contadores },
        diasDetalhados: { ...funcionario.diasDetalhados }
      }));
      dadosOriginais.set(periodo.id, funcionariosCopia);
    });
    setDadosOriginaisPorPeriodo(dadosOriginais);
    
    // Selecionar automaticamente o período mais recente
    if (periods.length > 0) {
      const periodoMaisRecente = periods[periods.length - 1];
      setPeriodoAtivo(periodoMaisRecente.id);
      setFuncionarios(dadosOriginais.get(periodoMaisRecente.id) || []);
      console.log('Período ativo definido:', periodoMaisRecente.id);
    }
  };

  const consolidarTodosPeriodos = (): FuncionarioData[] => {
    const funcionariosConsolidados: FuncionarioData[] = [];
    const funcionariosPorMatricula = new Map<string, FuncionarioData>();
    
    periodosDisponiveis.forEach((periodo, indicePeriodo) => {
      console.log(`Consolidando período ${periodo.nome} com ${periodo.funcionarios.length} funcionários`);
      
      // Usar dados originais para evitar mutação
      const dadosOriginais = dadosOriginaisPorPeriodo.get(periodo.id) || periodo.funcionarios;
      
      dadosOriginais.forEach((funcionario) => {
        const chaveUnica = funcionario.matricula || `sem-matricula-${funcionario.id}-${indicePeriodo}`;
        
        if (funcionariosPorMatricula.has(chaveUnica)) {
          // Funcionário já existe, consolidar dados
          const funcionarioExistente = funcionariosPorMatricula.get(chaveUnica)!;
          
          // Debug: log dos contadores antes da consolidação
          console.log(`Consolidando ${funcionario.nome}:`, {
            existente: funcionarioExistente.contadores,
            novo: funcionario.contadores
          });
          
          // Somar contadores (incluindo "1:" para presença normal)
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
            id: funcionariosConsolidados.length + 1,
            matricula: funcionario.matricula,
            nome: funcionario.nome,
            cargo: funcionario.cargo,
            contadores: { ...funcionario.contadores }, // Cópia dos contadores
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
    console.log('Exemplo de contadores consolidados:', funcionariosConsolidados[0]?.contadores);
    
    return funcionariosConsolidados;
  };

  const handlePeriodoChange = (periodoId: string) => {
    console.log('Mudando para período:', periodoId);
    setPeriodoAtivo(periodoId);
    
    if (periodoId === 'todos') {
      // Consolidar todos os funcionários de todos os períodos
      const funcionariosConsolidados = consolidarTodosPeriodos();
      setFuncionarios(funcionariosConsolidados);
    } else {
      // Período específico - usar dados originais
      const dadosOriginais = dadosOriginaisPorPeriodo.get(periodoId);
      if (dadosOriginais) {
        console.log(`Exibindo período ${periodoId} com ${dadosOriginais.length} funcionários`);
        // Criar nova cópia para evitar mutação
        const funcionariosCopia = dadosOriginais.map(f => ({
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
    setDadosOriginaisPorPeriodo(new Map());
  };

  return {
    funcionarios,
    periodosDisponiveis,
    periodoAtivo,
    isProcessing,
    error,
    fileName,
    isMultiPeriod,
    handleFileProcessed,
    handleMultiplePeriodsProcessed,
    handlePeriodoChange,
    handleProcessingStart,
    handleProcessingEnd,
    handleError,
    handleReset
  };
};
