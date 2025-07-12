
import { AssiduidadeKPIs } from "@/components/Dashboard/AssiduidadeKPIs";
import { ComparisonByCargo } from "@/components/Dashboard/ComparisonByCargo";
import { usePontoProcessor } from "@/hooks/usePontoProcessor";

export default function KPIAssiduidade() {
  const { funcionariosUnificados } = usePontoProcessor();

  if (!funcionariosUnificados || funcionariosUnificados.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Nenhum dado disponível
          </h2>
          <p className="text-gray-500">
            Faça upload de um arquivo para visualizar os KPIs de assiduidade.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AssiduidadeKPIs funcionarios={funcionariosUnificados} />
      
      <div className="grid gap-6">
        <ComparisonByCargo funcionarios={funcionariosUnificados} />
      </div>
    </div>
  );
}
