
import { useState, useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FuncionarioUnificado } from "@/utils/excel/types";
import { BarChart3 } from "lucide-react";

interface ComparisonByRoleProps {
  funcionarios: FuncionarioUnificado[];
}

const METRICAS_DISPONIVEIS = [
  { key: 'ATESTADO', label: 'Atestados' },
  { key: 'ATRASO', label: 'Atrasos' },
  { key: 'FALTA', label: 'Faltas' },
  { key: 'FERIAS', label: 'Férias' },
];

export function ComparisonByRole({ funcionarios }: ComparisonByRoleProps) {
  const [metricaSelecionada, setMetricaSelecionada] = useState('ATESTADO');

  const dadosDoGrafico = useMemo(() => {
    if (!funcionarios || funcionarios.length === 0) return [];

    // Agrupar por cargo
    const dadosPorCargo = funcionarios.reduce((acc, funcionario) => {
      const cargo = funcionario.cargo || 'Não Informado';
      if (!acc[cargo]) {
        acc[cargo] = {
          cargo,
          total: 0,
          funcionarios: 0
        };
      }
      acc[cargo].total += funcionario.contadores[metricaSelecionada] || 0;
      acc[cargo].funcionarios += 1;
      return acc;
    }, {} as Record<string, { cargo: string; total: number; funcionarios: number }>);

    // Converter para array e calcular média
    return Object.values(dadosPorCargo)
      .map(item => ({
        cargo: item.cargo.length > 15 ? item.cargo.substring(0, 15) + '...' : item.cargo,
        cargoCompleto: item.cargo,
        total: item.total,
        media: Math.round((item.total / item.funcionarios) * 100) / 100,
        funcionarios: item.funcionarios
      }))
      .filter(item => item.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [funcionarios, metricaSelecionada]);

  const metricaAtual = METRICAS_DISPONIVEIS.find(m => m.key === metricaSelecionada);

  if (!funcionarios || funcionarios.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Comparativo por Cargo
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Comparativo por Cargo
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
      <CardContent className="pl-2">
        {dadosDoGrafico.length === 0 ? (
          <div className="h-[350px] flex items-center justify-center">
            <p className="text-muted-foreground">
              Nenhuma ocorrência de {metricaAtual?.label.toLowerCase()} por cargo
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={dadosDoGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="cargo"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{ 
                  background: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)' 
                }}
                formatter={(value: number, name: string, props: any) => [
                  `${value} ${metricaAtual?.label.toLowerCase()}`,
                  `${props.payload.cargoCompleto} (${props.payload.funcionarios} funcionários)`
                ]}
                labelFormatter={() => ''}
              />
              <Bar 
                dataKey="total" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
                name="Total"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
