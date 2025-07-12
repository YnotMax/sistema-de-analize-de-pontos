
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useKPICalculator } from "@/hooks/useKPICalculator";
import { FuncionarioUnificado } from "@/utils/excel/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface ComparisonByCargoProps {
  funcionarios: FuncionarioUnificado[];
}

const metricas = [
  { key: 'taxaAbsenteismo', label: 'Taxa de Absenteísmo (%)', color: '#ef4444' },
  { key: 'taxaAtrasos', label: 'Taxa de Atrasos (%)', color: '#f59e0b' },
  { key: 'taxaPresencaProdutiva', label: 'Presença Produtiva (%)', color: '#10b981' }
];

export function ComparisonByCargo({ funcionarios }: ComparisonByCargoProps) {
  const [metricaSelecionada, setMetricaSelecionada] = useState('taxaAbsenteismo');
  const kpis = useKPICalculator(funcionarios);

  const metricaAtual = metricas.find(m => m.key === metricaSelecionada) || metricas[0];

  const dadosGrafico = kpis.dadosPorCargo.map(cargo => ({
    cargo: cargo.cargo.length > 20 ? cargo.cargo.substring(0, 20) + '...' : cargo.cargo,
    cargoCompleto: cargo.cargo,
    valor: cargo[metricaSelecionada as keyof typeof cargo] as number,
    total: cargo.total
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Comparativo por Cargo</CardTitle>
          <Select value={metricaSelecionada} onValueChange={setMetricaSelecionada}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {metricas.map(metrica => (
                <SelectItem key={metrica.key} value={metrica.key}>
                  {metrica.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pl-2">
        {dadosGrafico.length === 0 ? (
          <div className="h-[350px] flex items-center justify-center">
            <p className="text-muted-foreground">Nenhum dado disponível</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={dadosGrafico}>
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
                label={{ value: metricaAtual.label, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{ 
                  background: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)' 
                }}
                formatter={(value: number, name: string, props: any) => [
                  `${value.toFixed(1)}%`,
                  metricaAtual.label
                ]}
                labelFormatter={(label: string, payload: any) => {
                  const item = payload?.[0]?.payload;
                  return item ? `${item.cargoCompleto} (${item.total} funcionários)` : label;
                }}
              />
              <Bar 
                dataKey="valor" 
                fill={metricaAtual.color} 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
