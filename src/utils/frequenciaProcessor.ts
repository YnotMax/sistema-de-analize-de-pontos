
import { FuncionarioData } from '@/pages/Index';
import { normalizarTag } from '@/utils/tagMapping';
import { formatarNomeDia } from '@/utils/dateUtils';

/**
 * Função genérica para calcular contadores de frequência a partir de dados em formato de grade.
 * Esta função pode ser usada tanto para dados vindos do CSV quanto do Excel.
 * 
 * @param dadosDaGrade Array de arrays contendo os dados da planilha/CSV
 * @param nomeOrigem Nome do arquivo ou aba de origem (para logs)
 * @returns Array de funcionários com contadores de frequência calculados
 */
export const calcularContadoresDeFrequencia = (
  dadosDaGrade: any[][], 
  nomeOrigem: string
): FuncionarioData[] => {
  console.log(`[frequenciaProcessor] Iniciando processamento de frequência para: ${nomeOrigem}`);

  // Encontrar linha do cabeçalho
  let indiceCabecalho = -1;
  
  // Prioridade 1: Buscar estrutura específica da linha 4 (baseado na análise)
  // Procura por colunas: IT., BD, MAT., NOME, CARGO
  for (let i = 0; i < dadosDaGrade.length; i++) {
    const linha = dadosDaGrade[i];
    if (linha.some(col => col && col.toString().includes('IT.')) &&
        linha.some(col => col && col.toString().includes('MAT.')) &&
        linha.some(col => col && col.toString().includes('NOME')) && 
        linha.some(col => col && col.toString().includes('CARGO'))) {
      indiceCabecalho = i;
      console.log(`[frequenciaProcessor] Cabeçalho específico encontrado na linha ${i} em: ${nomeOrigem}`);
      break;
    }
  }
  
  // Fallback: Manter busca original por compatibilidade
  if (indiceCabecalho === -1) {
    for (let i = 0; i < dadosDaGrade.length; i++) {
      const linha = dadosDaGrade[i];
      if (linha.some(col => col && col.toString().includes('NOME')) && 
          linha.some(col => col && col.toString().includes('CARGO'))) {
        indiceCabecalho = i;
        console.log(`[frequenciaProcessor] Cabeçalho fallback encontrado na linha ${i} em: ${nomeOrigem}`);
        break;
      }
    }
  }

  if (indiceCabecalho === -1) {
    console.warn(`[frequenciaProcessor] Cabeçalho não encontrado em: ${nomeOrigem}`);
    return [];
  }

  console.log(`[frequenciaProcessor] Cabeçalho encontrado na linha: ${indiceCabecalho}`);

  const cabecalho = dadosDaGrade[indiceCabecalho];
  
  // Identificar onde começam os dias - usar padrão mais específico
  const indiceDias = cabecalho.findIndex(col => {
    if (!col) return false;
    const colStr = col.toString().trim();
    
    // Padrão 1: d-mmm (ex: 1-JAN, 2-FEV) 
    if (/^\d{1,2}-[A-Z]{3}$/i.test(colStr)) {
      return true;
    }
    
    // Padrão 2: Números seriais do Excel (ex: 45627, 45628) - detecta números > 40000
    const numero = parseInt(colStr);
    if (!isNaN(numero) && numero > 40000 && numero < 60000) {
      return true;
    }
    
    // Padrão 3: Apenas números de dias (1-31)
    if (/^\d{1,2}$/.test(colStr) && numero >= 1 && numero <= 31) {
      return true;
    }
    
    return false;
  });
  
  if (indiceDias === -1) {
    console.warn(`[frequenciaProcessor] Colunas de dias não encontradas em: ${nomeOrigem}`);
    return [];
  }

  console.log(`[frequenciaProcessor] Dias começam na coluna: ${indiceDias}`);

  const funcionarios: FuncionarioData[] = [];
  
  // Processar cada linha de funcionário
  for (let i = indiceCabecalho + 1; i < dadosDaGrade.length; i++) {
    const linha = dadosDaGrade[i];
    
    // Só processar se for linha de funcionário (começa com número)
    if (linha[0] && linha[0].toString().match(/^\d+$/)) {
      // Encontrar índices das colunas baseado no cabeçalho
      const indiceMatricula = cabecalho.findIndex(col => col && col.toString().includes('MAT'));
      const indiceNome = cabecalho.findIndex(col => col && col.toString().includes('NOME'));
      const indiceCargo = cabecalho.findIndex(col => col && col.toString().includes('CARGO'));
      
      const funcionario: FuncionarioData = {
        id: parseInt(linha[0].toString()),
        matricula: (indiceMatricula !== -1 ? linha[indiceMatricula]?.toString() : linha[2]?.toString()) || '',
        nome: (indiceNome !== -1 ? linha[indiceNome]?.toString() : linha[3]?.toString()) || '',
        cargo: (indiceCargo !== -1 ? linha[indiceCargo]?.toString() : linha[4]?.toString()) || '',
        contadores: {},
        totalDias: 0,
        diasDetalhados: {}
      };

      // Processar cada dia do mês
      for (let j = indiceDias; j < linha.length && j < cabecalho.length; j++) {
        const nomeDia = cabecalho[j]?.toString();
        const statusOriginal = linha[j]?.toString();

        if (nomeDia && statusOriginal && statusOriginal.trim() !== '') {
          const statusLimpo = statusOriginal.trim();
          
          // APLICAR MAPEAMENTO DE TAGS
          const statusNormalizado = normalizarTag(statusLimpo);
          
          console.log(`[${nomeOrigem}] ${funcionario.nome} - Tag original: "${statusLimpo}" -> Tag normalizada: "${statusNormalizado}"`);
          
          // Armazenar o status original nos detalhes com nome do dia formatado
          const nomeFormatado = formatarNomeDia(nomeDia);
          funcionario.diasDetalhados[nomeFormatado] = statusLimpo;
          
          // Usar a tag NORMALIZADA para os contadores
          if (funcionario.contadores[statusNormalizado]) {
            funcionario.contadores[statusNormalizado]++;
          } else {
            funcionario.contadores[statusNormalizado] = 1;
          }
          
          funcionario.totalDias++;
        }
      }

      console.log(`[${nomeOrigem}] ${funcionario.nome} - Contadores finais:`, funcionario.contadores);

      if (funcionario.nome) {
        funcionarios.push(funcionario);
      }
    }
  }

  console.log(`[frequenciaProcessor] Processamento concluído para ${nomeOrigem}. ${funcionarios.length} funcionários processados.`);
  return funcionarios;
};
