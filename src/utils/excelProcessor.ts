import * as XLSX from 'xlsx';
import { FuncionarioData } from '@/pages/Index';
import { normalizarTag } from '@/utils/tagMapping';
import { processarArquivoXLSX, DadosUnificadosXLSX, ColaboradorInfo } from '@/utils/xlsxProcessor';

export interface PeriodoData {
  id: string;
  nome: string;
  funcionarios: FuncionarioData[];
  totalRegistros: number;
  dataProcessamento: Date;
}

/**
 * Realiza o parsing da aba "BANCO" para extrair a lista oficial de colaboradores.
 * @param sheet A planilha (worksheet) a ser processada.
 * @returns Um Map contendo os colaboradores, com a matrícula como chave.
 */
function parsePlanilhaBanco(sheet: XLSX.WorkSheet): Map<string, ColaboradorInfo> {
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

/**
 * Função principal atualizada para processar a aba BANCO.
 */
export async function processarArquivoXLSXBanco(file: File): Promise<DadosUnificadosXLSX> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });

  const resultado: DadosUnificadosXLSX = {
    colaboradores: new Map(),
  };

  for (const sheetName of workbook.SheetNames) {
    const nomeAba = sheetName.toUpperCase();
    const sheet = workbook.Sheets[sheetName];

    // Lógica de roteamento para chamar o parser da aba BANCO
    if (nomeAba.includes('BANCO')) {
      console.log(`[processarArquivoXLSXBanco] Encontrada aba de Colaboradores: "${sheetName}".`);
      resultado.colaboradores = parsePlanilhaBanco(sheet);
      // Podemos parar aqui por enquanto, já que a lista mestra é o mais importante
      break; 
    }
  }

  if (resultado.colaboradores.size === 0) {
      throw new Error("Não foi possível encontrar a aba 'BANCO' com a lista de colaboradores no arquivo.");
  }

  return resultado;
}

export const processarExcel = async (file: File): Promise<PeriodoData[]> => {
  console.log('Iniciando processamento do Excel...');
  
  // Verificar se devemos usar o novo processador para arquivos .xlsx com aba BANCO
  if (file.name.toLowerCase().endsWith('.xlsx')) {
    try {
      // Tentar usar o processador da aba BANCO primeiro
      const dadosUnificados: DadosUnificadosXLSX = await processarArquivoXLSXBanco(file);
      
      // CRITÉRIO DE ACEITE: Exibe os dados extraídos no console para verificação
      console.log("DADOS MESTRE EXTRAÍDOS DA ABA BANCO:", dadosUnificados);
      console.log("Mapa de Colaboradores:", dadosUnificados.colaboradores);
      
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
    try {
      const planilha = workbook.Sheets[nomeAba];
      
      // Converter para array de arrays
      const dadosArray = XLSX.utils.sheet_to_json(planilha, {
        header: 1,
        defval: ''
      }) as string[][];

      // Processar como CSV
      const funcionarios = processarDadosAba(dadosArray, nomeAba);

      if (funcionarios.length > 0) {
        periodosDisponiveis.push({
          id: nomeAba.toLowerCase().replace(/\s+/g, '-'),
          nome: nomeAba,
          funcionarios,
          totalRegistros: funcionarios.reduce((total, f) => total + f.totalDias, 0),
          dataProcessamento: new Date()
        });
      }
    } catch (error) {
      console.warn(`Erro ao processar aba ${nomeAba}:`, error);
    }
  });

  if (periodosDisponiveis.length === 0) {
    throw new Error('Nenhuma aba válida encontrada. Verifique o formato das planilhas.');
  }

  console.log('Períodos processados:', periodosDisponiveis.length);
  return periodosDisponiveis;
};

const processarDadosAba = (dadosArray: string[][], nomeAba: string): FuncionarioData[] => {
  // Encontrar linha do cabeçalho
  let indiceCabecalho = -1;
  for (let i = 0; i < dadosArray.length; i++) {
    const linha = dadosArray[i];
    if (linha.some(col => col && col.toString().includes('NOME')) && 
        linha.some(col => col && col.toString().includes('CARGO'))) {
      indiceCabecalho = i;
      break;
    }
  }

  if (indiceCabecalho === -1) {
    console.warn(`Cabeçalho não encontrado na aba ${nomeAba}`);
    return [];
  }

  const cabecalho = dadosArray[indiceCabecalho];
  
  // Identificar onde começam os dias
  const indiceDias = cabecalho.findIndex(col => 
    col && (col.toString().includes('-') || /\d+/.test(col.toString()))
  );
  
  if (indiceDias === -1) {
    console.warn(`Colunas de dias não encontradas na aba ${nomeAba}`);
    return [];
  }

  const funcionarios: FuncionarioData[] = [];
  
  for (let i = indiceCabecalho + 1; i < dadosArray.length; i++) {
    const linha = dadosArray[i];
    
    // Só processar se for linha de funcionário (começa com número)
    if (linha[0] && linha[0].toString().match(/^\d+$/)) {
      const funcionario: FuncionarioData = {
        id: parseInt(linha[0].toString()),
        matricula: linha[2]?.toString() || '',
        nome: linha[3]?.toString() || '',
        cargo: linha[4]?.toString() || '',
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
          
          console.log(`[${nomeAba}] ${funcionario.nome} - Tag original: "${statusLimpo}" -> Tag normalizada: "${statusNormalizado}"`);
          
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

      console.log(`[${nomeAba}] ${funcionario.nome} - Contadores finais:`, funcionario.contadores);

      if (funcionario.nome) {
        funcionarios.push(funcionario);
      }
    }
  }

  return funcionarios;
};
