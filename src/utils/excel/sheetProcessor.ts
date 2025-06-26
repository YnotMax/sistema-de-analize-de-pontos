
import * as XLSX from 'xlsx';
import { calcularContadoresDeFrequencia } from '@/utils/frequenciaProcessor';
import { PeriodoData } from './types';

/**
 * Processa uma aba individual do Excel para extrair dados de frequência
 */
export function processarAbaFrequencia(
  planilha: XLSX.WorkSheet, 
  nomeAba: string
): PeriodoData | null {
  try {
    // Converter para array de arrays
    const dadosArray = XLSX.utils.sheet_to_json(planilha, {
      header: 1,
      defval: ''
    }) as string[][];

    // Usar a função genérica para processar os dados
    const funcionarios = calcularContadoresDeFrequencia(dadosArray, nomeAba);

    if (funcionarios.length > 0) {
      return {
        id: nomeAba.toLowerCase().replace(/\s+/g, '-'),
        nome: nomeAba,
        funcionarios,
        totalRegistros: funcionarios.reduce((total, f) => total + f.totalDias, 0),
        dataProcessamento: new Date()
      };
    }

    return null;
  } catch (error) {
    console.warn(`Erro ao processar aba ${nomeAba}:`, error);
    return null;
  }
}
