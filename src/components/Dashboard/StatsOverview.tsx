
import { Users, Clock, AlertCircle, BadgeCheck } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { FuncionarioUnificado } from "@/utils/excel/types";

interface StatsOverviewProps {
  funcionarios: FuncionarioUnificado[];
}

export function StatsOverview({ funcionarios }: StatsOverviewProps) {
  if (!funcionarios || funcionarios.length === 0) {
    return null;
  }

  // --- CÁLCULO DOS KPIs ---
  
  const totalFuncionarios = funcionarios.length;

  const totalAtestados = funcionarios.reduce((acc, func) => {
    return acc + (func.contadores['ATESTADO'] || 0);
  }, 0);

  const totalAtrasos = funcionarios.reduce((acc, func) => {
    return acc + (func.contadores['ATRASO'] || 0);
  }, 0);

  const totalPresencas = funcionarios.reduce((acc, func) => {
    return acc + (func.contadores['PRESENCA_NORMAL'] || 0);
  }, 0);
  
  const totalDiasTrabalhaveis = funcionarios.reduce((acc, func) => {
      // Soma todas as ocorrências que não sejam DIA_NAO_TRABALHADO
      return acc + Object.entries(func.contadores).reduce((sum, [key, value]) => {
          return key !== 'DIA_NAO_TRABALHADO' ? sum + value : sum;
      }, 0);
  }, 0);

  const taxaPresenca = totalDiasTrabalhaveis > 0 
    ? ((totalPresencas / totalDiasTrabalhaveis) * 100).toFixed(1)
    : "0.0";

  // --- RENDERIZAÇÃO DA GRADE ---

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Funcionários Ativos"
        value={totalFuncionarios.toString()}
        icon={Users}
        description="Total de colaboradores no período"
      />
      <StatsCard
        title="Total de Atestados"
        value={totalAtestados.toString()}
        icon={AlertCircle}
        description="Soma de todos os dias de atestado"
      />
      <StatsCard
        title="Total de Atrasos"
        value={totalAtrasos.toString()}
        icon={Clock}
        description="Soma de todas as ocorrências de atraso"
      />
      <StatsCard
        title="Taxa de Presença Normal"
        value={`${taxaPresenca}%`}
        icon={BadgeCheck}
        description="Presenças normais vs. dias trabalháveis"
      />
    </div>
  );
}
