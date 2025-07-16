/**
 * Utilitários para conversão de datas do Excel
 */

/**
 * Converte número serial do Excel para data
 * Baseado no sistema de data do Excel que começa em 1900
 * @param serial - Número serial do Excel (ex: 45627)
 * @returns Data formatada como string (DD/MM/YYYY)
 */
export function converterSerialExcelParaData(serial: number): string {
  try {
    // Data base do Excel: 1 de janeiro de 1900
    // Mas o Excel considera 1900 como ano bissexto (erro histórico)
    const baseDate = new Date(1900, 0, 1);
    
    // Subtrai 2 para compensar o bug do Excel e começar do dia certo
    const days = serial - 2;
    
    // Calcula a data final
    const resultDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
    
    // Formata como DD/MM/YYYY
    const day = resultDate.getDate().toString().padStart(2, '0');
    const month = (resultDate.getMonth() + 1).toString().padStart(2, '0');
    const year = resultDate.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.warn(`Erro ao converter serial Excel ${serial}:`, error);
    return serial.toString();
  }
}

/**
 * Detecta se um valor é um número serial do Excel
 * @param value - Valor a ser verificado
 * @returns True se for um número serial válido
 */
export function isSerialExcel(value: any): boolean {
  if (typeof value !== 'number' && typeof value !== 'string') {
    return false;
  }
  
  const numero = Number(value);
  
  // Números seriais do Excel normalmente estão entre 1 (1900) e ~60000 (2064)
  return !isNaN(numero) && numero > 1 && numero < 100000;
}

/**
 * Converte valor para nome do dia de forma inteligente
 * @param dayValue - Valor do dia (pode ser serial, d-mmm, ou número)
 * @returns Nome do dia formatado
 */
export function formatarNomeDia(dayValue: any): string {
  if (!dayValue) return '';
  
  const valueStr = dayValue.toString().trim();
  
  // Se já está no formato d-mmm, retorna como está
  if (/^\d{1,2}-[A-Z]{3}$/i.test(valueStr)) {
    return valueStr;
  }
  
  // Se é um número serial do Excel, converte para data
  if (isSerialExcel(dayValue)) {
    const data = converterSerialExcelParaData(Number(dayValue));
    // Extrai apenas dia/mês para exibição compacta
    const [dia, mes] = data.split('/');
    return `${dia}/${mes}`;
  }
  
  // Se é apenas um número de dia (1-31), retorna como está
  const numero = parseInt(valueStr);
  if (!isNaN(numero) && numero >= 1 && numero <= 31) {
    return numero.toString();
  }
  
  // Retorna o valor original se não conseguir processar
  return valueStr;
}