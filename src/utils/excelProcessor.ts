
import * as XLSX from 'xlsx';
import { processarArquivoXLSX, DadosUnificadosXLSX } from '@/utils/xlsxProcessor';
import { processarAbaFrequencia } from '@/utils/excel/sheetProcessor';
import { processarArquivoXLSXUnificado } from '@/utils/excel/unifiedProcessor';
import { PeriodoData, FuncionarioUnificado } from '@/utils/excel/types';

// Re-export types for backward compatibility
export type { PeriodoData, FuncionarioUnificado } from '@/utils/excel/types';

/**
 * Função principal atualizada para processar a aba BANCO e retornar dados unificados.
 */
export async function processarArquivoXLSXBanco(file: File): Promise<{
  colaboradores: Map<string, any>;
  funcionariosUnificados?: FuncionarioUnificado[];
}> {
  // Primeiro, tentar o processamento unificado completo
  try {
    const funcionariosUnificados = await processarArquivoXLSXUnificado(file);
    
    // Criar o mapa de colaboradores para compatibilidade
    const colaboradores = new Map();
    funcionariosUnificados.forEach(funcionario => {
      colaboradores.set(funcionario.matricula, funcionario);
    });

    console.log(`[processarArquivoXLSXBanco] Processamento unificado bem-sucedido: ${funcionariosUnificados.length} funcionários`);
    
    return {
      colaboradores,
      funcionariosUnificados
    };
  } catch (unifiedError) {
    console.warn('[processarArquivoXLSXBanco] Erro no processamento unificado, tentando fallback:', unifiedError);
    
    // Fallback para o processamento original
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });

    const resultado = {
      colaboradores: new Map(),
    };

    for (const sheetName of workbook.SheetNames) {
      const nomeAba = sheetName.toUpperCase();
      const sheet = workbook.Sheets[sheetName];

      if (nomeAba.includes('BANCO')) {
        console.log(`[processarArquivoXLSXBanco] Encontrada aba de Colaboradores: "${sheetName}".`);
        const { parsePlanilhaBanco } = await import('@/utils/excel/bancoSheetParser');
        resultado.colaboradores = parsePlanilhaBanco(sheet);
        break; 
      }
    }

    if (resultado.colaboradores.size === 0) {
        throw new Error("Não foi possível encontrar a aba 'BANCO' com a lista de colaboradores no arquivo.");
    }

    return resultado;
  }
}

export const processarExcel = async (file: File): Promise<PeriodoData[]> => {
  console.log('Iniciando processamento do Excel...');
  
  // Verificar se devemos usar o novo processador para arquivos .xlsx com aba BANCO
  if (file.name.toLowerCase().endsWith('.xlsx')) {
    try {
      // Tentar usar o processador da aba BANCO primeiro
      const dadosUnificados = await processarArquivoXLSXBanco(file);
      
      // CRITÉRIO DE ACEITE: Exibe os dados extraídos no console para verificação
      console.log("DADOS MESTRE EXTRAÍDOS DA ABA BANCO:", dadosUnificados);
      console.log("Mapa de Colaboradores:", dadosUnificados.colaboradores);
      
      // Se conseguiu extrair funcionários unificados, exibe informações detalhadas
      if (dadosUnificados.funcionariosUnificados) {
        console.log(`[ExcelProcessor] Encontrados ${dadosUnificados.funcionariosUnificados.length} funcionários unificados.`);
        console.log("EXEMPLO DE FUNCIONÁRIO UNIFICADO:", dadosUnificados.funcionariosUnificados[0]);
      }
      
      // Se conseguiu extrair colaboradores, exibe no console
      if (dadosUnificados.colaboradores.size > 0) {
        console.log(`[ExcelProcessor] Encontrados ${dadosUnificados.colaboradores.size} colaboradores na aba BANCO.`);
      }
    } catch (bancoError) {
      console.warn('[ExcelProcessor] Erro ao processar aba BANCO, tentando processador LISTA:', bancoError);
      
      // Se falhar com BANCO, tentar com LISTA
      try {
        const dadosUnificados: DadosUnificadosXLSX = await processarArquivoXLSX(file);
        
        // CRITÉRIO DE ACEITE: Exibe os dados extraídos no console para verificação
        console.log("DADOS MESTRE EXTRAÍDOS DO XLSX:", dadosUnificados);
        console.log("Mapa de Colaboradores:", dadosUnificados.colaboradores);
        
        if (dadosUnificados.colaboradores.size > 0) {
          console.log(`[ExcelProcessor] Encontrados ${dadosUnificados.colaboradores.size} colaboradores na aba LISTA.`);
        }
      } catch (xlsxError) {
        console.warn('[ExcelProcessor] Erro ao processar com xlsxProcessor, continuando com método tradicional:', xlsxError);
      }
    }
  }

  // Continuar com o processamento normal para as abas de frequência
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, {
    type: 'array',
    cellStyles: true,
    cellDates: true
  });

  const abas = workbook.SheetNames;
  console.log('Abas encontradas:', abas);

  if (abas.length === 0) {
    throw new Error('Nenhuma aba encontrada no arquivo Excel.');
  }

  const periodosDisponiveis: PeriodoData[] = [];

  abas.forEach(nomeAba => {
    const planilha = workbook.Sheets[nomeAba];
    const periodo = processarAbaFrequencia(planilha, nomeAba);
    
    if (periodo) {
      periodosDisponiveis.push(periodo);
    }
  });

  if (periodosDisponiveis.length === 0) {
    throw new Error('Nenhuma aba válida encontrada. Verifique o formato das planilhas.');
  }

  console.log('Períodos processados:', periodosDisponiveis.length);
  return periodosDisponiveis;
};
