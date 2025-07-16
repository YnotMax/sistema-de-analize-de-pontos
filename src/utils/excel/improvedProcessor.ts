import * as XLSX from 'xlsx';
import { calcularContadoresDeFrequencia } from '@/utils/frequenciaProcessor';
import { parsePlanilhaBanco } from './bancoSheetParser';
import { enriquecerComDadosBanco, analisarInconsistencias } from '@/utils/dataEnrichment';
import { PeriodoData, FuncionarioUnificado, ColaboradorInfo } from './types';
import { FuncionarioData } from '@/pages/Index';

/**
 * Processador melhorado baseado na análise da planilha real
 * Processa abas mensais primeiro, depois enriquece com dados do BANCO
 */
export async function processarExcelMelhorado(file: File): Promise<{
  periodos: PeriodoData[];
  funcionariosUnificados?: FuncionarioUnificado[];
  metadados: {
    abasProcessadas: string[];
    totalFuncionarios: number;
    periodoMaisRecente: string;
    inconsistencias?: any;
  };
}> {
  console.log('[processarExcelMelhorado] 🚀 Iniciando processamento melhorado...');
  
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  
  console.log('[processarExcelMelhorado] 📋 Abas disponíveis:', workbook.SheetNames);
  
  // ETAPA 1: Identificar e processar abas mensais
  const abasFrequencia = workbook.SheetNames.filter(isAbaDeFrequenciaMelhorada);
  console.log('[processarExcelMelhorado] 📅 Abas de frequência detectadas:', abasFrequencia);
  
  const periodosProcessados: PeriodoData[] = [];
  const todosFuncionarios: FuncionarioData[] = [];
  
  // Processar cada aba mensal
  for (const nomeAba of abasFrequencia) {
    console.log(`[processarExcelMelhorado] 🔄 Processando aba: ${nomeAba}`);
    
    const planilha = workbook.Sheets[nomeAba];
    const dadosArray = XLSX.utils.sheet_to_json(planilha, {
      header: 1,
      defval: ''
    }) as any[][];
    
    // Usar o processador de frequência melhorado
    const funcionariosDoMes = calcularContadoresDeFrequencia(dadosArray, nomeAba);
    
    if (funcionariosDoMes.length > 0) {
      const periodo: PeriodoData = {
        id: gerarIdPeriodo(nomeAba),
        nome: nomeAba,
        funcionarios: funcionariosDoMes,
        totalRegistros: funcionariosDoMes.reduce((total, f) => total + f.totalDias, 0),
        dataProcessamento: new Date()
      };
      
      periodosProcessados.push(periodo);
      todosFuncionarios.push(...funcionariosDoMes);
      
      console.log(`[processarExcelMelhorado] ✅ Aba ${nomeAba} processada: ${funcionariosDoMes.length} funcionários`);
    }
  }
  
  // ETAPA 2: Processar aba BANCO (se existir)
  let dadosBanco: Map<string, ColaboradorInfo> = new Map();
  let funcionariosUnificados: FuncionarioUnificado[] | undefined;
  let inconsistencias: any;
  
  const abaBanco = workbook.SheetNames.find(nome => 
    nome.toUpperCase().includes('BANCO')
  );
  
  if (abaBanco) {
    console.log(`[processarExcelMelhorado] 🏦 Processando aba BANCO: ${abaBanco}`);
    
    try {
      dadosBanco = parsePlanilhaBanco(workbook.Sheets[abaBanco]);
      console.log(`[processarExcelMelhorado] ✅ Aba BANCO processada: ${dadosBanco.size} colaboradores`);
      
      // ETAPA 3: Enriquecer dados com informações do BANCO
      if (dadosBanco.size > 0 && todosFuncionarios.length > 0) {
        funcionariosUnificados = enriquecerComDadosBanco(todosFuncionarios, dadosBanco);
        inconsistencias = analisarInconsistencias(todosFuncionarios, dadosBanco);
        
        console.log(`[processarExcelMelhorado] 🔗 Dados unificados: ${funcionariosUnificados.length} funcionários`);
        
        // Log das inconsistências encontradas
        if (inconsistencias.nomesDiferentes.length > 0) {
          console.warn(`[processarExcelMelhorado] ⚠️ ${inconsistencias.nomesDiferentes.length} diferenças de nome encontradas`);
        }
        if (inconsistencias.cargosDiferentes.length > 0) {
          console.warn(`[processarExcelMelhorado] ⚠️ ${inconsistencias.cargosDiferentes.length} diferenças de cargo encontradas`);
        }
        if (inconsistencias.funcionariosAusentes.length > 0) {
          console.warn(`[processarExcelMelhorado] ⚠️ ${inconsistencias.funcionariosAusentes.length} funcionários do BANCO não encontrados nas abas mensais`);
        }
      }
    } catch (bancoError) {
      console.warn(`[processarExcelMelhorado] ⚠️ Erro ao processar aba BANCO: ${bancoError}`);
    }
  } else {
    console.log('[processarExcelMelhorado] ℹ️ Nenhuma aba BANCO encontrada, continuando sem enriquecimento');
  }
  
  // ETAPA 4: Consolidar dados por funcionário (somar períodos)
  const funcionariosConsolidados = consolidarFuncionariosPorPeriodo(todosFuncionarios);
  
  // ETAPA 5: Criar período consolidado "TODOS"
  if (funcionariosConsolidados.length > 0) {
    const periodoConsolidado: PeriodoData = {
      id: 'todos',
      nome: 'Todos os Períodos',
      funcionarios: funcionariosConsolidados,
      totalRegistros: funcionariosConsolidados.reduce((total, f) => total + f.totalDias, 0),
      dataProcessamento: new Date()
    };
    
    periodosProcessados.unshift(periodoConsolidado);
  }
  
  // ETAPA 6: Preparar metadados
  const metadados = {
    abasProcessadas: abasFrequencia,
    totalFuncionarios: funcionariosConsolidados.length,
    periodoMaisRecente: encontrarPeriodoMaisRecente(abasFrequencia),
    inconsistencias
  };
  
  console.log(`[processarExcelMelhorado] 🎉 Processamento concluído!`);
  console.log(`[processarExcelMelhorado] 📊 Períodos processados: ${periodosProcessados.length}`);
  console.log(`[processarExcelMelhorado] 👥 Total funcionários: ${metadados.totalFuncionarios}`);
  console.log(`[processarExcelMelhorado] 📅 Período mais recente: ${metadados.periodoMaisRecente}`);
  
  return {
    periodos: periodosProcessados,
    funcionariosUnificados,
    metadados
  };
}

/**
 * Versão melhorada da detecção de abas de frequência
 */
function isAbaDeFrequenciaMelhorada(sheetName: string): boolean {
  const nomeAba = sheetName.toUpperCase().trim();
  
  // Ignora abas especiais explicitamente
  const abasEspeciais = [
    'BANCO', 'LISTA', 'ORGANOGRAMA', 'ABS', 'ABSENTEÍSMO', 'ABSENTEISMO'
  ];
  
  if (abasEspeciais.some(aba => nomeAba.includes(aba))) {
    return false;
  }
  
  // Detecta padrão "MMM AA" (ex: "JAN 25", "DEZ 24")
  const padraoEspecifico = /^(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\s+\d{2}$/;
  if (padraoEspecifico.test(nomeAba)) {
    return true;
  }
  
  // Detecta padrão só mês (ex: "JAN25", "JANEIRO")
  const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const isMonth = meses.some(mes => nomeAba.startsWith(mes));
  
  return isMonth;
}

/**
 * Gera ID único para o período baseado no nome da aba
 */
function gerarIdPeriodo(nomeAba: string): string {
  return nomeAba.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Consolida funcionários por matrícula, somando contadores de múltiplos períodos
 */
function consolidarFuncionariosPorPeriodo(funcionarios: FuncionarioData[]): FuncionarioData[] {
  const consolidado = new Map<string, FuncionarioData>();
  
  for (const funcionario of funcionarios) {
    const chave = funcionario.matricula || funcionario.id?.toString();
    
    if (!chave) continue;
    
    if (consolidado.has(chave)) {
      const existente = consolidado.get(chave)!;
      
      // Somar contadores
      for (const [tag, count] of Object.entries(funcionario.contadores)) {
        existente.contadores[tag] = (existente.contadores[tag] || 0) + count;
      }
      
      // Somar total de dias
      existente.totalDias += funcionario.totalDias;
      
      // Combinar dias detalhados
      existente.diasDetalhados = {
        ...existente.diasDetalhados,
        ...funcionario.diasDetalhados
      };
    } else {
      consolidado.set(chave, {
        ...funcionario,
        contadores: { ...funcionario.contadores },
        diasDetalhados: { ...funcionario.diasDetalhados }
      });
    }
  }
  
  return Array.from(consolidado.values());
}

/**
 * Encontra o período mais recente baseado nos nomes das abas
 */
function encontrarPeriodoMaisRecente(abas: string[]): string {
  if (abas.length === 0) return '';
  
  // Ordenar por ano e mês para encontrar o mais recente
  const abasOrdenadas = abas.sort((a, b) => {
    const aMatch = a.match(/(\w+)\s*(\d{2})/);
    const bMatch = b.match(/(\w+)\s*(\d{2})/);
    
    if (!aMatch || !bMatch) return 0;
    
    const aAno = parseInt(aMatch[2]);
    const bAno = parseInt(bMatch[2]);
    
    if (aAno !== bAno) return bAno - aAno;
    
    const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const aMes = meses.indexOf(aMatch[1]);
    const bMes = meses.indexOf(bMatch[1]);
    
    return bMes - aMes;
  });
  
  return abasOrdenadas[0] || '';
}