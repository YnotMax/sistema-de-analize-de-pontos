
import { useKPICalculator } from "@/hooks/useKPICalculator";
import { KPICard } from "./KPICard";
import { FuncionarioUnificado } from "@/utils/excel/types";
import { UserCheck, Clock, CheckCircle, Calendar } from "lucide-react";

interface AssiduidadeKPIsProps {
  funcionarios: FuncionarioUnificado[];
}

export function AssiduidadeKPIs({ funcionarios }: AssiduidadeKPIsProps) {
  const kpis = useKPICalculator(funcionarios);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-4">KPIs de Assiduidade e Absenteísmo</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Taxa de Absenteísmo"
            data={kpis.taxaAbsenteismo}
            icon={UserCheck}
            description="% de faltas não planejadas"
          />
          <KPICard
            title="Taxa de Atrasos"
            data={kpis.taxaAtrasos}
            icon={Clock}
            description="% de dias com atraso"
          />
          <KPICard
            title="Presença Produtiva"
            data={kpis.taxaPresencaProdutiva}
            icon={CheckCircle}
            description="% de dias trabalhando normalmente"
          />
          <KPICard
            title="Tempo Médio de Casa"
            data={kpis.mediaTempoCasa}
            icon={Calendar}
            description="Média de permanência na empresa"
          />
        </div>
      </div>
    </div>
  );
}
