
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FuncionarioUnificado } from "@/utils/excel/types";
import { TrendingUp, User } from "lucide-react";

interface EmployeeRankingProps {
  funcionarios: FuncionarioUnificado[];
}

const METRICAS_DISPONIVEIS = [
  { key: 'ATESTADO', label: 'Atestados', color: 'bg-red-100 text-red-800' },
  { key: 'ATRASO', label: 'Atrasos', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'FALTA', label: 'Faltas', color: 'bg-orange-100 text-orange-800' },
  { key: 'FERIAS', label: 'Férias', color: 'bg-blue-100 text-blue-800' },
];

export function EmployeeRanking({ funcionarios }: EmployeeRankingProps) {
  const [metricaSelecionada, setMetricaSelecionada] = useState('ATESTADO');

  if (!funcionarios || funcionarios.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ranking de Funcionários
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    );
  }

  // Ordenar funcionários pela métrica selecionada
  const funcionariosRankeados = funcionarios
    .map(funcionario => ({
      ...funcionario,
      valorMetrica: funcionario.contadores[metricaSelecionada] || 0
    }))
    .filter(funcionario => funcionario.valorMetrica > 0)
    .sort((a, b) => b.valorMetrica - a.valorMetrica)
    .slice(0, 5);

  const metricaAtual = METRICAS_DISPONIVEIS.find(m => m.key === metricaSelecionada);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Ranking de Funcionários
          </CardTitle>
          <Select value={metricaSelecionada} onValueChange={setMetricaSelecionada}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {METRICAS_DISPONIVEIS.map(metrica => (
                <SelectItem key={metrica.key} value={metrica.key}>
                  {metrica.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {funcionariosRankeados.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">
              Nenhum funcionário com {metricaAtual?.label.toLowerCase()} registradas
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {funcionariosRankeados.map((funcionario, index) => (
              <div key={funcionario.matricula} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-lg font-bold text-muted-foreground min-w-[24px]">
                    #{index + 1}
                  </div>
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{funcionario.nome}</p>
                    <p className="text-sm text-muted-foreground truncate">{funcionario.cargo}</p>
                  </div>
                </div>
                <Badge className={`${metricaAtual?.color} flex-shrink-0`}>
                  {funcionario.valorMetrica} {metricaAtual?.label.toLowerCase()}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
