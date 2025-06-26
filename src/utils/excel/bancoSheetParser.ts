
import * as XLSX from 'xlsx';
import { ColaboradorInfo } from '@/utils/xlsxProcessor';

/**
 * Realiza o parsing da aba "BANCO" para extrair a lista oficial de colaboradores.
 * @param sheet A planilha (worksheet) a ser processada.
 * @returns Um Map contendo os colaboradores, com a matrícula como chave.
 */
export function parsePlanilhaBanco(sheet: XLSX.WorkSheet): Map<string, ColaboradorInfo> {
  const dadosJson = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" });
  const mapaColaboradores = new Map<string, ColaboradorInfo>();

  // 1. Encontrar o cabeçalho dinamicamente
  const indiceCabecalho = dadosJson.findIndex(row => 
    row.includes('MATRICULA') && row.includes('NOME')
  );

  if (indiceCabecalho === -1) {
    console.error("[parsePlanilhaBanco] Erro: Cabeçalho não encontrado na aba BANCO.");
    return mapaColaboradores;
  }

  // 2. Mapear as colunas a partir do cabeçalho
  const cabecalho = dadosJson[indiceCabecalho];
  const colMatricula = cabecalho.indexOf('MATRICULA');
  const colNome = cabecalho.indexOf('NOME');
  const colCargo = cabecalho.indexOf('CARGO');
  const colDataAdmissao = cabecalho.indexOf('ADMISSÃO');

  // 3. Iterar sobre as linhas de dados
  for (let i = indiceCabecalho + 1; i < dadosJson.length; i++) {
    const linha = dadosJson[i];
    const matricula = linha[colMatricula]?.toString().trim();

    if (matricula && /^\d+$/.test(matricula)) { // Garante que a matrícula é um número
      // Formata a data de admissão se ela for um objeto Date
      let dataAdmissaoFormatada = linha[colDataAdmissao];
      if (dataAdmissaoFormatada instanceof Date) {
        dataAdmissaoFormatada = dataAdmissaoFormatada.toLocaleDateString('pt-BR');
      }

      const colaborador: ColaboradorInfo = {
        matricula,
        nome: linha[colNome] || 'N/A',
        cargo: linha[colCargo] || 'Cargo não informado',
        dataAdmissao: dataAdmissaoFormatada,
      };
      mapaColaboradores.set(matricula, colaborador);
    }
  }
  
  console.log(`[parsePlanilhaBanco] Processamento concluído. ${mapaColaboradores.size} colaboradores encontrados na aba BANCO.`);
  return mapaColaboradores;
}
