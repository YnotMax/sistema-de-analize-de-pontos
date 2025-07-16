import { FuncionarioData } from '@/pages/Index';
import { ColaboradorInfo, FuncionarioUnificado } from '@/utils/excel/types';

/**
 * Enriquece os dados de funcionários com informações da aba BANCO
 * @param funcionarios - Dados processados das abas mensais
 * @param dadosBanco - Dados da aba BANCO
 * @returns Dados enriquecidos com informações adicionais
 */
export function enriquecerComDadosBanco(
  funcionarios: FuncionarioData[],
  dadosBanco: Map<string, ColaboradorInfo>
): FuncionarioUnificado[] {
  console.log(`[dataEnrichment] Enriquecendo ${funcionarios.length} funcionários com dados do BANCO`);
  
  const funcionariosEnriquecidos: FuncionarioUnificado[] = [];
  
  for (const funcionario of funcionarios) {
    const matriculaStr = funcionario.matricula || funcionario.id?.toString();
    const dadosAdicionais = dadosBanco.get(matriculaStr);
    
    if (dadosAdicionais) {
      // Funcionário encontrado no BANCO - enriquecer com dados adicionais
      const funcionarioEnriquecido: FuncionarioUnificado = {
        ...dadosAdicionais,
        // Sobrescrever com dados das abas mensais quando disponíveis
        nome: funcionario.nome || dadosAdicionais.nome,
        cargo: funcionario.cargo || dadosAdicionais.cargo,
        contadores: funcionario.contadores,
        totalDias: funcionario.totalDias,
        diasDetalhados: funcionario.diasDetalhados
      };
      
      funcionariosEnriquecidos.push(funcionarioEnriquecido);
      console.log(`[dataEnrichment] Funcionário ${funcionario.nome} enriquecido com dados do BANCO`);
    } else {
      // Funcionário não encontrado no BANCO - converter para formato unificado
      const funcionarioUnificado: FuncionarioUnificado = {
        matricula: funcionario.matricula,
        nome: funcionario.nome,
        cargo: funcionario.cargo,
        contadores: funcionario.contadores,
        totalDias: funcionario.totalDias,
        diasDetalhados: funcionario.diasDetalhados
      };
      
      funcionariosEnriquecidos.push(funcionarioUnificado);
      console.warn(`[dataEnrichment] Funcionário ${funcionario.nome} (${matriculaStr}) não encontrado no BANCO`);
    }
  }
  
  console.log(`[dataEnrichment] Enriquecimento concluído: ${funcionariosEnriquecidos.length} funcionários processados`);
  return funcionariosEnriquecidos;
}

/**
 * Identifica funcionários que estão no BANCO mas não nas abas mensais
 * @param funcionarios - Dados processados das abas mensais
 * @param dadosBanco - Dados da aba BANCO
 * @returns Lista de funcionários ausentes nas abas mensais
 */
export function identificarFuncionariosAusentes(
  funcionarios: FuncionarioData[],
  dadosBanco: Map<string, ColaboradorInfo>
): ColaboradorInfo[] {
  const matriculasProcessadas = new Set(
    funcionarios.map(f => f.matricula || f.id?.toString()).filter(Boolean)
  );
  
  const funcionariosAusentes: ColaboradorInfo[] = [];
  
  for (const [matricula, dados] of dadosBanco) {
    if (!matriculasProcessadas.has(matricula)) {
      funcionariosAusentes.push(dados);
    }
  }
  
  if (funcionariosAusentes.length > 0) {
    console.warn(`[dataEnrichment] ${funcionariosAusentes.length} funcionários do BANCO não encontrados nas abas mensais:`);
    funcionariosAusentes.forEach(f => console.warn(`  - ${f.nome} (${f.matricula})`));
  }
  
  return funcionariosAusentes;
}

/**
 * Analisa inconsistências entre dados das abas mensais e BANCO
 * @param funcionarios - Dados processados das abas mensais
 * @param dadosBanco - Dados da aba BANCO
 * @returns Relatório de inconsistências
 */
export function analisarInconsistencias(
  funcionarios: FuncionarioData[],
  dadosBanco: Map<string, ColaboradorInfo>
): {
  nomesDiferentes: Array<{ matricula: string; nomeAba: string; nomeBanco: string }>;
  cargosDiferentes: Array<{ matricula: string; cargoAba: string; cargoBanco: string }>;
  funcionariosAusentes: ColaboradorInfo[];
} {
  const nomesDiferentes: Array<{ matricula: string; nomeAba: string; nomeBanco: string }> = [];
  const cargosDiferentes: Array<{ matricula: string; cargoAba: string; cargoBanco: string }> = [];
  
  for (const funcionario of funcionarios) {
    const matriculaStr = funcionario.matricula || funcionario.id?.toString();
    const dadosBancoFuncionario = dadosBanco.get(matriculaStr);
    
    if (dadosBancoFuncionario) {
      // Verificar diferenças de nome
      if (funcionario.nome !== dadosBancoFuncionario.nome) {
        nomesDiferentes.push({
          matricula: matriculaStr,
          nomeAba: funcionario.nome,
          nomeBanco: dadosBancoFuncionario.nome
        });
      }
      
      // Verificar diferenças de cargo
      if (funcionario.cargo !== dadosBancoFuncionario.cargo) {
        cargosDiferentes.push({
          matricula: matriculaStr,
          cargoAba: funcionario.cargo,
          cargoBanco: dadosBancoFuncionario.cargo
        });
      }
    }
  }
  
  const funcionariosAusentes = identificarFuncionariosAusentes(funcionarios, dadosBanco);
  
  return {
    nomesDiferentes,
    cargosDiferentes,
    funcionariosAusentes
  };
}