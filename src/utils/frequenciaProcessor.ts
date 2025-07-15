
import { FuncionarioData } from '@/pages/Index';
import { normalizarTag } from '@/utils/tagMapping';

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
  for (let i = 0; i < dadosDaGrade.length; i++) {
    const linha = dadosDaGrade[i];
    if (linha.some(col => col && col.toString().includes('NOME')) && 
        linha.some(col => col && col.toString().includes('CARGO'))) {
      indiceCabecalho = i;
      break;
    }
  }

  if (indiceCabecalho === -1) {
    console.warn(`[frequenciaProcessor] Cabeçalho não encontrado em: ${nomeOrigem}`);
    return [];
  }

  console.log(`[frequenciaProcessor] Cabeçalho encontrado na linha: ${indiceCabecalho}`);

  const cabecalho = dadosDaGrade[indiceCabecalho];
  
  // Identificar onde começam os dias - padrão mais específico para d-mmm (1-JAN, 2-FEV, etc.)
  const indiceDias = cabecalho.findIndex(col => {
    if (!col) return false;
    const colStr = col.toString().trim();
    // Procurar por padrões específicos de data: d-mmm, dd-mmm, ou apenas números seguidos de hífen
    return /^\d{1,2}-[A-Za-z]{3}/i.test(colStr) || 
           /^\d{1,2}$/.test(colStr) || 
           colStr.includes('mai') || 
           colStr.includes('jan') || 
           colStr.includes('fev') || 
           colStr.includes('mar') || 
           colStr.includes('abr') || 
           colStr.includes('jun') || 
           colStr.includes('jul') || 
           colStr.includes('ago') || 
           colStr.includes('set') || 
           colStr.includes('out') || 
           colStr.includes('nov') || 
           colStr.includes('dez');
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
      const funcionario: FuncionarioData = {
        id: parseInt(linha[0].toString()),
        matricula: linha[2]?.toString() || '',
        nome: linha[3]?.toString() || '',
        cargo: linha[4]?.toString() || '',
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
          
          // Armazenar o status original nos detalhes
          funcionario.diasDetalhados[nomeDia] = statusLimpo;
          
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
