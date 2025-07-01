
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

  // Encontrar linha do cabeçalho - procurar por linha que contém NOME e CARGO
  let indiceCabecalho = -1;
  for (let i = 0; i < dadosDaGrade.length; i++) {
    const linha = dadosDaGrade[i];
    if (linha.some(col => col && col.toString().toUpperCase().includes('NOME')) && 
        linha.some(col => col && col.toString().toUpperCase().includes('CARGO'))) {
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
  
  // Identificar onde começam os dias
  // Para CSV: procurar pelo padrão específico d-mmm (ex: 1-fev., 2-fev.)
  // Para Excel: pode ser d-mmm ou apenas números
  const indiceDias = cabecalho.findIndex(col => {
    if (!col) return false;
    const texto = col.toString().trim();
    
    // Padrão para CSV: d-mmm. (1-fev., 2-fev., etc.)
    const padraoCsvMes = /^\d{1,2}-[a-zA-Z]{3}\.?$/;
    
    // Padrão para Excel: d-mmm (1-JAN, 2-FEV, etc.)
    const padraoExcelMes = /^\d{1,2}-[A-Za-z]{3}$/;
    
    // Padrão apenas número (1, 2, 3, etc.)
    const padraoNumero = /^\d{1,2}$/;
    
    const match = padraoCsvMes.test(texto) || padraoExcelMes.test(texto) || padraoNumero.test(texto);
    
    if (match) {
      console.log(`[frequenciaProcessor] Primeira coluna de dia detectada: "${texto}" na posição ${cabecalho.indexOf(col)}`);
    }
    
    return match;
  });
  
  if (indiceDias === -1) {
    console.warn(`[frequenciaProcessor] Colunas de dias não encontradas em: ${nomeOrigem}`);
    console.log(`[frequenciaProcessor] Cabeçalho analisado:`, cabecalho);
    return [];
  }

  console.log(`[frequenciaProcessor] Dias começam na coluna: ${indiceDias}`);

  const funcionarios: FuncionarioData[] = [];
  
  // Processar cada linha de funcionário
  for (let i = indiceCabecalho + 1; i < dadosDaGrade.length; i++) {
    const linha = dadosDaGrade[i];
    
    // Só processar se for linha de funcionário (começa com número)
    if (linha[0] && linha[0].toString().match(/^\d+$/)) {
      // Para CSV, as colunas seguem o padrão: IT., BD, MAT., NOME, CARGO, ...dias
      // Identificar as colunas importantes
      let colunaNome = -1;
      let colunaCargo = -1;
      let colunaMatricula = -1;
      
      // Buscar as colunas no cabeçalho
      for (let j = 0; j < cabecalho.length; j++) {
        const headerCell = cabecalho[j]?.toString().toUpperCase().trim();
        if (headerCell === 'NOME') colunaNome = j;
        if (headerCell === 'CARGO') colunaCargo = j;
        if (headerCell === 'MAT.' || headerCell === 'MATRICULA') colunaMatricula = j;
      }
      
      // Se não encontrou as colunas pelo header, usar posições padrão para CSV
      if (colunaNome === -1) colunaNome = 3; // Posição padrão do NOME no CSV
      if (colunaCargo === -1) colunaCargo = 4; // Posição padrão do CARGO no CSV
      if (colunaMatricula === -1) colunaMatricula = 2; // Posição padrão da MAT. no CSV
      
      const funcionario: FuncionarioData = {
        id: parseInt(linha[0].toString()),
        matricula: linha[colunaMatricula]?.toString() || '',
        nome: linha[colunaNome]?.toString() || '',
        cargo: linha[colunaCargo]?.toString() || '',
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
