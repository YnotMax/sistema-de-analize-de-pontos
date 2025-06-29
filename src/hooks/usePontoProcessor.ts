import { useState } from 'react';
import { FuncionarioData } from '@/pages/Index';
import { FuncionarioUnificado } from '@/utils/excel/types';

export interface PeriodoData {
  id: string;
  nome: string;
  funcionarios: FuncionarioData[];
  totalRegistros: number;
  dataProcessamento: Date;
}

export const usePontoProcessor = () => {
  const [funcionarios, setFuncionarios] = useState<FuncionarioData[]>([]);
  const [funcionariosUnificados, setFuncionariosUnificados] = useState<FuncionarioUnificado[]>([]);
  const [periodosDisponiveis, setPeriodosDisponiveis] = useState<PeriodoData[]>([]);
  const [periodoAtivo, setPeriodoAtivo] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isMultiPeriod, setIsMultiPeriod] = useState(false);
  const [dadosOriginaisPorPeriodo, setDadosOriginaisPorPeriodo] = useState<Map<string, FuncionarioData[]>>(new Map());

  // Função auxiliar para converter FuncionarioUnificado para FuncionarioData
  const converterUnificadoParaData = (funcionarioUnificado: FuncionarioUnificado): FuncionarioData => {
    return {
      id: Math.random(), // Gerar ID temporário
      matricula: funcionarioUnificado.matricula,
      nome: funcionarioUnificado.nome,
      cargo: funcionarioUnificado.cargo,
      contadores: { ...funcionarioUnificado.contadores },
      totalDias: Object.values(funcionarioUnificado.contadores).reduce((sum, count) => sum + count, 0),
      diasDetalhados: {} // Pode ser populado se necessário
    };
  };

  const handleFileProcessed = (data: FuncionarioData[], filename: string) => {
    console.log("🔍 [DEBUG] handleFileProcessed chamado com:", data.length, "funcionários");
    setFuncionarios(data);
    setFileName(filename);
    setError(null);
    setIsMultiPeriod(false);
    setPeriodosDisponiveis([]);
    setPeriodoAtivo('');
    setDadosOriginaisPorPeriodo(new Map());
    setFuncionariosUnificados([]);
  };

  const handleUnifiedDataProcessed = (data: FuncionarioUnificado[], filename: string) => {
    console.log("🔍 [DEBUG] handleUnifiedDataProcessed chamado com:", data.length, "funcionários unificados");
    console.log("🔍 [DEBUG] Dados recebidos:", data);
    
    // Verificar se os dados têm contadores válidos
    if (data.length > 0) {
      const primeiroFuncionario = data[0];
      console.log("🔍 [DEBUG] Primeiro funcionário:", primeiroFuncionario);
      console.log("🔍 [DEBUG] Contadores do primeiro funcionário:", primeiroFuncionario.contadores);
      
      // Verificar se há dados de frequência
      const totalContadores = Object.values(primeiroFuncionario.contadores).reduce((sum, count) => sum + count, 0);
      console.log("🔍 [DEBUG] Total de contadores do primeiro funcionário:", totalContadores);
    }
    
    // Atualizar estado dos funcionários unificados
    setFuncionariosUnificados(data);
    
    // CORREÇÃO: Também atualizar o estado de funcionários para a tabela de detalhes
    const funcionariosConvertidos = data.map(converterUnificadoParaData);
    setFuncionarios(funcionariosConvertidos);
    console.log("🔍 [DEBUG] Funcionários convertidos para tabela:", funcionariosConvertidos.length);
    
    setFileName(filename);
    setError(null);
    setIsMultiPeriod(false);
    setPeriodosDisponiveis([]);
    setPeriodoAtivo('');
    setDadosOriginaisPorPeriodo(new Map());
    
    console.log('✅ Dados unificados processados no hook:', data);
  };

  const handleMultiplePeriodsProcessed = (periods: PeriodoData[], filename: string) => {
    console.log('🔍 [DEBUG] handleMultiplePeriodsProcessed chamado com:', periods.length, 'períodos');
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
    
    // Limpar dados unificados quando processamos períodos múltiplos
    setFuncionariosUnificados([]);
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
    setFuncionariosUnificados([]);
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
  };
};
