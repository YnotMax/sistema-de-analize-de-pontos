
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FuncionarioUnificado } from "@/utils/excel/types";

interface OccurrenceChartProps {
  funcionarios: FuncionarioUnificado[];
}

// Lista de tags que queremos exibir no gráfico. Podemos expandir isso.
const TAGS_DE_INTERESSE = ['ATESTADO', 'ATRASO', 'FALTA', 'FERIAS', 'DAY_OFF'];

export function OccurrenceChart({ funcionarios }: OccurrenceChartProps) {
  // 1. CALCULAR OS DADOS AGREGADOS PARA O GRÁFICO
  const dadosDoGrafico = TAGS_DE_INTERESSE.map(tag => {
    const total = funcionarios.reduce((acc, func) => {
      return acc + (func.contadores[tag] || 0);
    }, 0);

    return {
      name: tag.replace('_', ' '), // Formata o nome para exibição
      total: total,
    };
  }).filter(item => item.total > 0); // Mostra apenas barras com valor > 0

  if (dadosDoGrafico.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ocorrências por Tipo</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground">Nenhuma ocorrência registrada no período.</p>
        </CardContent>
      </Card>
    );
  }

  // 2. RENDERIZAR O GRÁFICO COM RECHARTS
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ocorrências por Tipo</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={dadosDoGrafico}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
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
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
