
import * as XLSX from 'xlsx';
import { calcularContadoresDeFrequencia } from '../frequenciaProcessor';
import { parsePlanilhaBanco } from './bancoSheetParser';
import { ColaboradorInfo, FuncionarioUnificado } from './types';

/**
 * Orquestra todo o processo de leitura do arquivo .xlsx.
 * 1. Lê a lista mestre da aba BANCO.
 * 2. Lê os dados de frequência de todas as abas de meses.
 * 3. Unifica tudo em um resultado final.
 */
export async function processarArquivoXLSXUnificado(file: File): Promise<FuncionarioUnificado[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });

  console.log('[processarArquivoXLSXUnificado] Iniciando processamento unificado...');
  console.log('[processarArquivoXLSXUnificado] Abas disponíveis:', workbook.SheetNames);

  // 1. Extrair a lista Mestre da aba BANCO
  const abaBanco = workbook.SheetNames.find(name => name.toUpperCase().includes('BANCO'));
  if (!abaBanco) {
    throw new Error("Aba 'BANCO' com a lista de colaboradores não encontrada.");
  }
  
  console.log(`[processarArquivoXLSXUnificado] Processando aba BANCO: ${abaBanco}`);
  const dadosMestre = parsePlanilhaBanco(workbook.Sheets[abaBanco]);
  
  // 2. Extrair dados de frequência de TODAS as abas de meses
  const abasFrequencia = workbook.SheetNames.filter(isAbaDeFrequencia);
  console.log(`[processarArquivoXLSXUnificado] Abas de frequência encontradas:`, abasFrequencia);
  
  const contadoresPorMatricula = new Map<string, {
    contadores: Record<string, number>;
    totalDias: number;
    diasDetalhados: Record<string, string>;
  }>();

  for (const sheetName of abasFrequencia) {
    console.log(`[processarArquivoXLSXUnificado] Processando aba: ${sheetName}`);
    const sheet = workbook.Sheets[sheetName];
    const dadosDaAba = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" });
    
    // Usa a função genérica para calcular os contadores da aba atual
    const funcionariosDoMes = calcularContadoresDeFrequencia(dadosDaAba, sheetName);

    // Consolida (soma) os contadores do mês no mapa geral
    funcionariosDoMes.forEach(funcionario => {
      const matricula = funcionario.matricula || funcionario.id?.toString();
      if (!matricula) return;

      const dadosAtuais = contadoresPorMatricula.get(matricula) || {
        contadores: {},
        totalDias: 0,
        diasDetalhados: {}
      };

      // Soma os contadores
      for (const [tag, count] of Object.entries(funcionario.contadores)) {
        dadosAtuais.contadores[tag] = (dadosAtuais.contadores[tag] || 0) + count;
      }

      // Soma total de dias
      dadosAtuais.totalDias += funcionario.totalDias;

      // Adiciona os dias detalhados com prefixo do mês
      for (const [dia, status] of Object.entries(funcionario.diasDetalhados)) {
        dadosAtuais.diasDetalhados[`${sheetName}-${dia}`] = status;
      }

      contadoresPorMatricula.set(matricula, dadosAtuais);
    });
  }

  // 3. Unificar dados mestres com os contadores consolidados
  const resultadoFinal = unificarDados(dadosMestre, contadoresPorMatricula);

  console.log('✅ Processamento XLSX unificado concluído! Dados finais:', resultadoFinal);
  console.log(`📊 Total de funcionários processados: ${resultadoFinal.length}`);
  console.log(`📅 Abas de frequência processadas: ${abasFrequencia.length}`);
  
  return resultadoFinal;
}

/**
 * Unifica os dados mestres com os contadores de frequência consolidados.
 */
function unificarDados(
  dadosMestre: Map<string, ColaboradorInfo>,
  contadores: Map<string, {
    contadores: Record<string, number>;
    totalDias: number;
    diasDetalhados: Record<string, string>;
  }>
): FuncionarioUnificado[] {
  const listaUnificada: FuncionarioUnificado[] = [];

  dadosMestre.forEach((colaborador, matricula) => {
    const dadosFrequencia = contadores.get(matricula) || {
      contadores: {},
      totalDias: 0,
      diasDetalhados: {}
    };

    listaUnificada.push({
      ...colaborador,
      contadores: dadosFrequencia.contadores,
      totalDias: dadosFrequencia.totalDias,
      diasDetalhados: dadosFrequencia.diasDetalhados
    });
  });

  return listaUnificada;
}

/**
 * Verifica se o nome de uma aba corresponde a um padrão de mês/ano.
 */
function isAbaDeFrequencia(sheetName: string): boolean {
  const nomeAba = sheetName.toUpperCase();
  const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  return meses.some(mes => nomeAba.startsWith(mes));
}
