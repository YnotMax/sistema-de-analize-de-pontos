
import Papa from 'papaparse';
import { FuncionarioData } from '@/pages/Index';
import { calcularContadoresDeFrequencia } from '@/utils/frequenciaProcessor';

export const processarCSV = (textoCSV: string, filename: string): FuncionarioData[] => {
  console.log('[csvProcessor] Iniciando processamento do CSV...');
  
  const resultado = Papa.parse(textoCSV, {
    skipEmptyLines: true,
    dynamicTyping: false
  });

  console.log('[csvProcessor] CSV parseado:', resultado.data.length, 'linhas');

  if (resultado.data.length === 0) {
    throw new Error('Arquivo CSV vazio ou não foi possível fazer o parse.');
  }

  // Usar a função genérica para calcular os contadores
  const funcionarios = calcularContadoresDeFrequencia(resultado.data as any[][], filename);

  if (funcionarios.length === 0) {
    throw new Error('Nenhum funcionário encontrado. Verifique o formato do arquivo.');
  }

  console.log('[csvProcessor] Funcionários processados:', funcionarios.length);
  return funcionarios;
};
