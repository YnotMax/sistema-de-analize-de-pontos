
import { useMemo } from 'react';
import { FuncionarioUnificado } from '@/utils/excel/types';

export const useKPICalculator = (funcionarios: FuncionarioUnificado[]) => {
  return useMemo(() => {
    if (!funcionarios || funcionarios.length === 0) {
      return {
        taxaAbsenteismo: { value: 0, trend: 'stable' as const, format: 'percentage' as const },
        taxaAtrasos: { value: 0, trend: 'stable' as const, format: 'percentage' as const },
        taxaPresencaProdutiva: { value: 0, trend: 'stable' as const, format: 'percentage' as const },
        mediaTempoCasa: { value: 0, trend: 'stable' as const, format: 'days' as const },
        totalFuncionarios: 0,
        dadosPorCargo: [],
        dadosPorLider: []
      };
    }

    // Calcular totais gerais
    const totalDiasTrabalhados = funcionarios.reduce((acc, f) => acc + f.totalDias, 0);
    const totalFaltas = funcionarios.reduce((acc, f) => acc + (f.contadores['FALTA'] || 0), 0);
    const totalAtrasos = funcionarios.reduce((acc, f) => acc + (f.contadores['ATRASO'] || 0), 0);
    const totalPresencaNormal = funcionarios.reduce((acc, f) => acc + (f.contadores['PRESENCA_NORMAL'] || 0), 0);

    // KPIs principais
    const taxaAbsenteismo = totalDiasTrabalhados > 0 ? (totalFaltas / totalDiasTrabalhados) * 100 : 0;
    const taxaAtrasos = totalDiasTrabalhados > 0 ? (totalAtrasos / totalDiasTrabalhados) * 100 : 0;
    const taxaPresencaProdutiva = totalDiasTrabalhados > 0 ? (totalPresencaNormal / totalDiasTrabalhados) * 100 : 0;

    // Tempo médio de casa (simulado - seria calculado com dataAdmissao real)
    const mediaTempoCasa = 365; // Placeholder - implementar quando tiver dataAdmissao

    // Dados por cargo
    const cargoMap = new Map<string, {
      total: number;
      faltas: number;
      atrasos: number;
      presencas: number;
      totalDias: number;
    }>();

    funcionarios.forEach(f => {
      const cargo = f.cargo || 'Não informado';
      if (!cargoMap.has(cargo)) {
        cargoMap.set(cargo, { total: 0, faltas: 0, atrasos: 0, presencas: 0, totalDias: 0 });
      }
      const dados = cargoMap.get(cargo)!;
      dados.total++;
      dados.faltas += f.contadores['FALTA'] || 0;
      dados.atrasos += f.contadores['ATRASO'] || 0;
      dados.presencas += f.contadores['PRESENCA_NORMAL'] || 0;
      dados.totalDias += f.totalDias;
    });

    const dadosPorCargo = Array.from(cargoMap.entries()).map(([cargo, dados]) => ({
      cargo,
      total: dados.total,
      taxaAbsenteismo: dados.totalDias > 0 ? (dados.faltas / dados.totalDias) * 100 : 0,
      taxaAtrasos: dados.totalDias > 0 ? (dados.atrasos / dados.totalDias) * 100 : 0,
      taxaPresencaProdutiva: dados.totalDias > 0 ? (dados.presencas / dados.totalDias) * 100 : 0
    }));

    // Dados por líder
    const liderMap = new Map<string, {
      total: number;
      faltas: number;
      atrasos: number;
      presencas: number;
      totalDias: number;
    }>();

    funcionarios.forEach(f => {
      const lider = f.lider || 'Não informado';
      if (!liderMap.has(lider)) {
        liderMap.set(lider, { total: 0, faltas: 0, atrasos: 0, presencas: 0, totalDias: 0 });
      }
      const dados = liderMap.get(lider)!;
      dados.total++;
      dados.faltas += f.contadores['FALTA'] || 0;
      dados.atrasos += f.contadores['ATRASO'] || 0;
      dados.presencas += f.contadores['PRESENCA_NORMAL'] || 0;
      dados.totalDias += f.totalDias;
    });

    const dadosPorLider = Array.from(liderMap.entries()).map(([lider, dados]) => ({
      lider,
      total: dados.total,
      taxaAbsenteismo: dados.totalDias > 0 ? (dados.faltas / dados.totalDias) * 100 : 0,
      taxaAtrasos: dados.totalDias > 0 ? (dados.atrasos / dados.totalDias) * 100 : 0,
      taxaPresencaProdutiva: dados.totalDias > 0 ? (dados.presencas / dados.totalDias) * 100 : 0
    }));

    return {
      taxaAbsenteismo: { 
        value: Number(taxaAbsenteismo.toFixed(1)), 
        trend: 'stable' as const, 
        format: 'percentage' as const 
      },
      taxaAtrasos: { 
        value: Number(taxaAtrasos.toFixed(1)), 
        trend: 'stable' as const, 
        format: 'percentage' as const 
      },
      taxaPresencaProdutiva: { 
        value: Number(taxaPresencaProdutiva.toFixed(1)), 
        trend: 'stable' as const, 
        format: 'percentage' as const 
      },
      mediaTempoCasa: { 
        value: mediaTempoCasa, 
        trend: 'stable' as const, 
        format: 'days' as const 
      },
      totalFuncionarios: funcionarios.length,
      dadosPorCargo,
      dadosPorLider
    };
  }, [funcionarios]);
};
