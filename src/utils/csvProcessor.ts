
import Papa from 'papaparse';
import { FuncionarioData } from '@/pages/Index';
import { normalizarTag } from '@/utils/tagMapping';

export const processarCSV = (textoCSV: string, filename: string): FuncionarioData[] => {
  console.log('Iniciando processamento do CSV...');
  
  const resultado = Papa.parse(textoCSV, {
    delimiter: ';',
    skipEmptyLines: true,
    dynamicTyping: false
  });

  console.log('CSV parseado:', resultado.data.length, 'linhas');

  // Encontrar linha do cabeçalho
  let indiceCabecalho = -1;
  for (let i = 0; i < resultado.data.length; i++) {
    const linha = resultado.data[i] as string[];
    if (linha.some(col => col && col.includes('NOME')) && 
        linha.some(col => col && col.includes('CARGO'))) {
      indiceCabecalho = i;
      break;
    }
  }

  if (indiceCabecalho === -1) {
    throw new Error('Cabeçalho não encontrado. Verifique se o arquivo possui as colunas NOME e CARGO.');
  }

  console.log('Cabeçalho encontrado na linha:', indiceCabecalho);

  const cabecalho = resultado.data[indiceCabecalho] as string[];
  
  const indiceDias = cabecalho.findIndex(col => col && (col.includes('-mai') || col.includes('-') || /\d+-\w+/.test(col)));
  
  if (indiceDias === -1) {
    throw new Error('Colunas de dias não encontradas. Verifique o formato das datas no cabeçalho.');
  }

  console.log('Dias começam na coluna:', indiceDias);

  const funcionarios: FuncionarioData[] = [];
  
  for (let i = indiceCabecalho + 1; i < resultado.data.length; i++) {
    const linha = resultado.data[i] as string[];
    
    if (linha[0] && linha[0].toString().match(/^\d+$/)) {
      const funcionario: FuncionarioData = {
        id: parseInt(linha[0]),
        matricula: linha[2] || '',
        nome: linha[3] || '',
        cargo: linha[4] || '',
        contadores: {},
        totalDias: 0,
        diasDetalhados: {}
      };

      for (let j = indiceDias; j < linha.length && j < cabecalho.length; j++) {
        const nomeDia = cabecalho[j];
        const statusOriginal = linha[j];

        if (nomeDia && statusOriginal && statusOriginal.toString().trim() !== '') {
          const statusLimpo = statusOriginal.toString().trim();
          
          // APLICAR MAPEAMENTO DE TAGS
          const statusNormalizado = normalizarTag(statusLimpo);
          
          console.log(`Tag original: "${statusLimpo}" -> Tag normalizada: "${statusNormalizado}"`);
          
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

      if (funcionario.nome) {
        funcionarios.push(funcionario);
      }
    }
  }

  console.log('Funcionários processados:', funcionarios.length);
  console.log('Exemplo de contadores normalizados:', funcionarios[0]?.contadores);

  if (funcionarios.length === 0) {
    throw new Error('Nenhum funcionário encontrado. Verifique o formato do arquivo.');
  }

  return funcionarios;
};
