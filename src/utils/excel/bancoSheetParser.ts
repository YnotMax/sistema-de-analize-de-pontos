
import * as XLSX from 'xlsx';
import { ColaboradorInfo } from './types';

/**
 * Normaliza uma string removendo acentos, espaços extras e convertendo para maiúsculas
 */
function normalizarString(str: string): string {
  if (!str) return '';
  return str
    .toString()
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, ' '); // Remove espaços extras
}

/**
 * Verifica se uma linha contém os cabeçalhos esperados
 */
function isLinhaDosCabecalhos(linha: any[]): boolean {
  const textoLinha = linha.map(cell => normalizarString(cell || '')).join(' ');
  
  // Deve conter tanto MATRICULA quanto NOME para ser considerada linha de cabeçalho
  return textoLinha.includes('MATRICULA') && textoLinha.includes('NOME');
}

/**
 * Encontra o índice de uma coluna no cabeçalho de forma robusta
 */
function encontrarIndiceDaColuna(cabecalho: any[], palavrasChave: string[]): number {
  return cabecalho.findIndex(cell => {
    const textoNormalizado = normalizarString(cell || '');
    return palavrasChave.some(palavra => textoNormalizado.includes(palavra.toUpperCase()));
  });
}

/**
 * Realiza o parsing da aba "BANCO" para extrair a lista oficial de colaboradores.
 * @param sheet A planilha (worksheet) a ser processada.
 * @returns Um Map contendo os colaboradores, com a matrícula como chave.
 */
export function parsePlanilhaBanco(sheet: XLSX.WorkSheet): Map<string, ColaboradorInfo> {
  const dadosJson = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" });
  const mapaColaboradores = new Map<string, ColaboradorInfo>();

  console.log(`[parsePlanilhaBanco] Iniciando análise de ${dadosJson.length} linhas`);

  // 1. Encontrar o cabeçalho dinamicamente nas primeiras 15 linhas
  let indiceCabecalho = -1;
  const maxLinhasParaProcurar = Math.min(15, dadosJson.length);

  for (let i = 0; i < maxLinhasParaProcurar; i++) {
    if (isLinhaDosCabecalhos(dadosJson[i])) {
      indiceCabecalho = i;
      console.log(`[parsePlanilhaBanco] ✅ Cabeçalho encontrado na linha ${i + 1}`);
      break;
    }
  }

  if (indiceCabecalho === -1) {
    console.error("[parsePlanilhaBanco] ❌ Erro: Cabeçalho não encontrado nas primeiras", maxLinhasParaProcurar, "linhas.");
    console.log("[parsePlanilhaBanco] 🔍 Conteúdo das primeiras linhas para debug:");
    dadosJson.slice(0, 5).forEach((linha, i) => {
      console.log(`  Linha ${i + 1}:`, linha);
    });
    return mapaColaboradores;
  }

  // 2. Mapear as colunas a partir do cabeçalho encontrado
  const cabecalho = dadosJson[indiceCabecalho];
  console.log("[parsePlanilhaBanco] 📋 Cabeçalho encontrado:", cabecalho);

  const colunas = {
    matricula: encontrarIndiceDaColuna(cabecalho, ['MATRICULA']),
    nome: encontrarIndiceDaColuna(cabecalho, ['NOME']),
    cargo: encontrarIndiceDaColuna(cabecalho, ['CARGO', 'FUNCAO']),
    idade: encontrarIndiceDaColuna(cabecalho, ['IDADE']),
    lider: encontrarIndiceDaColuna(cabecalho, ['LIDER', 'LÍDER', 'SUPERVISOR']),
    dataAdmissao: encontrarIndiceDaColuna(cabecalho, ['ADMISSAO', 'ADMISSÃO', 'DATA'])
  };

  console.log("[parsePlanilhaBanco] 🗂️ Mapeamento de colunas:", colunas);

  // Verificar se as colunas essenciais foram encontradas
  if (colunas.matricula === -1 || colunas.nome === -1) {
    console.error("[parsePlanilhaBanco] ❌ Erro: Colunas essenciais (MATRICULA ou NOME) não encontradas");
    return mapaColaboradores;
  }

  // 3. Iterar sobre as linhas de dados (após o cabeçalho)
  let funcionariosProcessados = 0;
  for (let i = indiceCabecalho + 1; i < dadosJson.length; i++) {
    const linha = dadosJson[i];
    
    // Pular linhas vazias
    if (!linha || linha.every(cell => !cell || cell.toString().trim() === '')) {
      continue;
    }

    const matricula = linha[colunas.matricula]?.toString().trim();

    // Validar se a matrícula é válida (deve ser um número)
    if (matricula && /^\d+$/.test(matricula)) {
      // Formata a data de admissão se ela for um objeto Date
      let dataAdmissaoFormatada = linha[colunas.dataAdmissao];
      if (dataAdmissaoFormatada instanceof Date) {
        dataAdmissaoFormatada = dataAdmissaoFormatada.toLocaleDateString('pt-BR');
      }

      const colaborador: ColaboradorInfo = {
        matricula,
        nome: linha[colunas.nome]?.toString().trim() || 'N/A',
        cargo: linha[colunas.cargo]?.toString().trim() || 'Cargo não informado',
        idade: colunas.idade !== -1 && linha[colunas.idade] ? parseInt(linha[colunas.idade], 10) : undefined,
        lider: colunas.lider !== -1 ? linha[colunas.lider]?.toString().trim() : undefined,
        dataAdmissao: dataAdmissaoFormatada?.toString().trim(),
      };

      mapaColaboradores.set(matricula, colaborador);
      funcionariosProcessados++;

      // Log dos primeiros funcionários para debug
      if (funcionariosProcessados <= 3) {
        console.log(`[parsePlanilhaBanco] 👤 Funcionário ${funcionariosProcessados}:`, colaborador);
      }
    } else if (matricula) {
      console.warn(`[parsePlanilhaBanco] ⚠️ Matrícula inválida ignorada na linha ${i + 1}: "${matricula}"`);
    }
  }
  
  console.log(`[parsePlanilhaBanco] ✅ Processamento concluído. ${mapaColaboradores.size} colaboradores encontrados na aba BANCO.`);
  return mapaColaboradores;
}
