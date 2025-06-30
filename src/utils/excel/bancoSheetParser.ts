
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
 * Verifica se uma linha contém os cabeçalhos esperados de forma mais robusta
 */
function isLinhaDosCabecalhos(linha: any[]): boolean {
  if (!linha || linha.length === 0) return false;
  
  // Normaliza todas as células da linha
  const celulasNormalizadas = linha.map(cell => normalizarString(cell || ''));
  
  console.log(`[isLinhaDosCabecalhos] Analisando linha:`, celulasNormalizadas);
  
  // Verifica se existe pelo menos uma célula com MATRICULA e uma com NOME
  const temMatricula = celulasNormalizadas.some(cell => 
    cell.includes('MATRICULA') || cell.includes('MATRÍCULA')
  );
  const temNome = celulasNormalizadas.some(cell => 
    cell.includes('NOME')
  );
  
  console.log(`[isLinhaDosCabecalhos] MATRICULA: ${temMatricula}, NOME: ${temNome}`);
  
  return temMatricula && temNome;
}

/**
 * Encontra o índice de uma coluna no cabeçalho de forma robusta
 */
function encontrarIndiceDaColuna(cabecalho: any[], palavrasChave: string[]): number {
  const indice = cabecalho.findIndex(cell => {
    const textoNormalizado = normalizarString(cell || '');
    const encontrou = palavrasChave.some(palavra => textoNormalizado.includes(palavra.toUpperCase()));
    if (encontrou) {
      console.log(`[encontrarIndiceDaColuna] Encontrada coluna "${textoNormalizado}" para palavras-chave:`, palavrasChave);
    }
    return encontrou;
  });
  
  if (indice === -1) {
    console.warn(`[encontrarIndiceDaColuna] ⚠️ Coluna não encontrada para palavras-chave:`, palavrasChave);
  }
  
  return indice;
}

/**
 * Realiza o parsing da aba "BANCO" para extrair a lista oficial de colaboradores.
 * @param sheet A planilha (worksheet) a ser processada.
 * @returns Um Map contendo os colaboradores, com a matrícula como chave.
 */
export function parsePlanilhaBanco(sheet: XLSX.WorkSheet): Map<string, ColaboradorInfo> {
  const dadosJson = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" });
  const mapaColaboradores = new Map<string, ColaboradorInfo>();

  console.log(`[parsePlanilhaBanco] 🚀 Iniciando análise de ${dadosJson.length} linhas`);

  // Debug: mostrar as primeiras 10 linhas para diagnóstico
  console.log("[parsePlanilhaBanco] 🔍 Primeiras linhas da planilha:");
  dadosJson.slice(0, 10).forEach((linha, i) => {
    const conteudo = linha.map(cell => cell || '').join(' | ').substring(0, 100);
    console.log(`  Linha ${i + 1}: ${conteudo}${conteudo.length >= 100 ? '...' : ''}`);
  });

  // 1. Encontrar o cabeçalho dinamicamente nas primeiras 15 linhas
  let indiceCabecalho = -1;
  const maxLinhasParaProcurar = Math.min(15, dadosJson.length);

  console.log(`[parsePlanilhaBanco] 🔎 Procurando cabeçalho nas primeiras ${maxLinhasParaProcurar} linhas...`);

  for (let i = 0; i < maxLinhasParaProcurar; i++) {
    console.log(`[parsePlanilhaBanco] 📋 Verificando linha ${i + 1}...`);
    
    if (isLinhaDosCabecalhos(dadosJson[i])) {
      indiceCabecalho = i;
      console.log(`[parsePlanilhaBanco] ✅ Cabeçalho encontrado na linha ${i + 1}!`);
      break;
    }
  }

  if (indiceCabecalho === -1) {
    console.error("[parsePlanilhaBanco] ❌ ERRO CRÍTICO: Cabeçalho não encontrado!");
    console.log("[parsePlanilhaBanco] 🔍 Detalhes das primeiras linhas analisadas:");
    dadosJson.slice(0, maxLinhasParaProcurar).forEach((linha, i) => {
      const linhaNormalizada = linha.map(cell => normalizarString(cell || '')).join(' | ');
      console.log(`  Linha ${i + 1} normalizada: "${linhaNormalizada}"`);
    });
    return mapaColaboradores;
  }

  // 2. Mapear as colunas a partir do cabeçalho encontrado
  const cabecalho = dadosJson[indiceCabecalho];
  console.log("[parsePlanilhaBanco] 📋 Cabeçalho bruto encontrado:", cabecalho);
  console.log("[parsePlanilhaBanco] 📋 Cabeçalho normalizado:", cabecalho.map(cell => normalizarString(cell || '')));

  const colunas = {
    matricula: encontrarIndiceDaColuna(cabecalho, ['MATRICULA', 'MATRÍCULA']),
    nome: encontrarIndiceDaColuna(cabecalho, ['NOME']),
    cargo: encontrarIndiceDaColuna(cabecalho, ['CARGO', 'FUNCAO', 'FUNÇÃO']),
    idade: encontrarIndiceDaColuna(cabecalho, ['IDADE']),
    lider: encontrarIndiceDaColuna(cabecalho, ['LIDER', 'LÍDER', 'SUPERVISOR', 'GESTOR']),
    dataAdmissao: encontrarIndiceDaColuna(cabecalho, ['ADMISSAO', 'ADMISSÃO', 'DATA', 'CONTRATACAO', 'CONTRATAÇÃO'])
  };

  console.log("[parsePlanilhaBanco] 🗂️ Mapeamento final de colunas:", colunas);

  // Verificar se as colunas essenciais foram encontradas
  if (colunas.matricula === -1 || colunas.nome === -1) {
    console.error("[parsePlanilhaBanco] ❌ ERRO: Colunas essenciais não encontradas!");
    console.error("  - Coluna MATRICULA encontrada:", colunas.matricula !== -1);
    console.error("  - Coluna NOME encontrada:", colunas.nome !== -1);
    return mapaColaboradores;
  }

  // 3. Iterar sobre as linhas de dados (após o cabeçalho)
  let funcionariosProcessados = 0;
  const totalLinhasParaProcessar = dadosJson.length - (indiceCabecalho + 1);
  
  console.log(`[parsePlanilhaBanco] 📊 Processando ${totalLinhasParaProcessar} linhas de dados...`);

  for (let i = indiceCabecalho + 1; i < dadosJson.length; i++) {
    const linha = dadosJson[i];
    
    // Pular linhas vazias
    if (!linha || linha.every(cell => !cell || cell.toString().trim() === '')) {
      console.log(`[parsePlanilhaBanco] ⏭️ Pulando linha vazia ${i + 1}`);
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
      if (funcionariosProcessados <= 5) {
        console.log(`[parsePlanilhaBanco] 👤 Funcionário ${funcionariosProcessados}:`, colaborador);
      }
    } else if (matricula) {
      console.warn(`[parsePlanilhaBanco] ⚠️ Matrícula inválida ignorada na linha ${i + 1}: "${matricula}"`);
    }
  }
  
  console.log(`[parsePlanilhaBanco] 🎉 SUCESSO! Processamento concluído:`);
  console.log(`  - ${mapaColaboradores.size} colaboradores extraídos da aba BANCO`);
  console.log(`  - ${funcionariosProcessados} funcionários processados com sucesso`);
  console.log(`  - Cabeçalho encontrado na linha ${indiceCabecalho + 1}`);
  
  // Mostrar alguns exemplos dos colaboradores extraídos
  if (mapaColaboradores.size > 0) {
    console.log("[parsePlanilhaBanco] 📋 Exemplos de colaboradores extraídos:");
    let contador = 0;
    for (const [matricula, colaborador] of mapaColaboradores) {
      console.log(`  ${contador + 1}. ${colaborador.nome} (${matricula}) - ${colaborador.cargo}`);
      contador++;
      if (contador >= 3) break;
    }
  }
  
  return mapaColaboradores;
}
