
import * as XLSX from 'xlsx';

// --- DEFINIÇÃO DAS ESTRUTURAS DE DADOS ---

// Estrutura para os dados mestre de cada colaborador, extraídos da aba "LISTA"
export interface ColaboradorInfo {
  matricula: string;
  nome: string;
  cargo: string;
  dataAdmissao?: string; // Armazenaremos como string formatada
}

// Estrutura que irá conter todos os dados extraídos do arquivo XLSX
export interface DadosUnificadosXLSX {
  // Usamos um Map para acesso rápido aos colaboradores pela matrícula
  colaboradores: Map<string, ColaboradorInfo>; 
  // ... outras estruturas de dados para Banco de Horas, etc, serão adicionadas no futuro
}

// --- FUNÇÃO PRINCIPAL DE PROCESSAMENTO ---

/**
 * Processa um arquivo .xlsx, lê suas abas e extrai os dados estruturados.
 * @param file O arquivo .xlsx carregado pelo usuário.
 * @returns Uma promessa que resolve para o objeto com todos os dados extraídos.
 */
export async function processarArquivoXLSX(file: File): Promise<DadosUnificadosXLSX> {
  // Converte o arquivo para um formato que a biblioteca possa ler
  const data = await file.arrayBuffer();
  // Lê o arquivo. A opção cellDates: true é importante para tratar datas corretamente.
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });

  const resultado: DadosUnificadosXLSX = {
    colaboradores: new Map(),
  };

  // Itera sobre o nome de cada aba presente no arquivo
  for (const sheetName of workbook.SheetNames) {
    // Transforma o nome para maiúsculas para facilitar a comparação
    const nomeAba = sheetName.toUpperCase();
    const sheet = workbook.Sheets[sheetName];

    // **Lógica de Roteamento**: Decide qual função de "parsing" chamar
    // com base no nome da aba. Por agora, só nos importa a "LISTA".
    if (nomeAba.includes('LISTA')) {
      console.log(`[xlsxProcessor] Encontrada aba de Lista: "${sheetName}". Iniciando processamento...`);
      resultado.colaboradores = parsePlanilhaLista(sheet);
    } 
    // No futuro, adicionaremos outras condições aqui:
    // else if (nomeAba.includes('BANCO')) { ... }
    // else if (isAbaDeFrequencia(nomeAba)) { ... }
  }

  return resultado;
}

// --- FUNÇÕES "PARSERS" ESPECÍFICAS POR ABA ---

/**
 * Realiza o parsing da aba "LISTA DE COLABORADORES".
 * Extrai os dados mestre de cada funcionário de forma robusta.
 * @param sheet A planilha (worksheet) a ser processada.
 * @returns Um Map contendo os colaboradores, com a matrícula como chave.
 */
function parsePlanilhaLista(sheet: XLSX.WorkSheet): Map<string, ColaboradorInfo> {
  // Converte a planilha em um array de arrays (JSON) para fácil manipulação
  const dadosJson = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" });
  const mapaColaboradores = new Map<string, ColaboradorInfo>();

  // 1. Encontrar a linha do cabeçalho dinamicamente
  let indiceCabecalho = -1;
  for(let i = 0; i < dadosJson.length; i++) {
      // Procuramos por uma coluna que sabemos que sempre existirá, como 'MATRICULA'
      if (dadosJson[i].includes('MATRICULA')) {
          indiceCabecalho = i;
          break;
      }
  }

  if (indiceCabecalho === -1) {
    console.error("[parsePlanilhaLista] Erro: Cabeçalho com 'MATRICULA' não encontrado na aba LISTA.");
    return mapaColaboradores; // Retorna o mapa vazio se não achar o cabeçalho
  }

  // 2. Mapear as colunas a partir do cabeçalho encontrado
  const cabecalho = dadosJson[indiceCabecalho];
  const colMatricula = cabecalho.indexOf('MATRICULA');
  const colNome = cabecalho.indexOf('NOME COMPLETO');
  const colCargo = cabecalho.indexOf('CARGO');
  const colAdmissao = cabecalho.indexOf('ADMISSÃO');

  // 3. Iterar sobre as linhas de dados (começando da linha após o cabeçalho)
  for (let i = indiceCabecalho + 1; i < dadosJson.length; i++) {
    const linha = dadosJson[i];
    const matricula = linha[colMatricula]?.toString().trim();

    // Processa a linha apenas se houver uma matrícula válida
    if (matricula) {
      // Formata a data de admissão se ela for um objeto Date
      let dataAdmissaoFormatada = linha[colAdmissao];
      if (dataAdmissaoFormatada instanceof Date) {
        dataAdmissaoFormatada = dataAdmissaoFormatada.toLocaleDateString('pt-BR');
      }

      const colaborador: ColaboradorInfo = {
        matricula,
        nome: linha[colNome] || 'Nome não encontrado',
        cargo: linha[colCargo] || 'Cargo não informado',
        dataAdmissao: dataAdmissaoFormatada,
      };
      
      // Adiciona o colaborador ao Map, usando a matrícula como chave
      mapaColaboradores.set(matricula, colaborador);
    }
  }

  console.log(`[parsePlanilhaLista] Processamento concluído. ${mapaColaboradores.size} colaboradores encontrados.`);
  return mapaColaboradores;
}
