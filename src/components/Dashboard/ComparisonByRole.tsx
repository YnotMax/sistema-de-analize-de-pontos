import { useMemo, useState } from 'react';
import { FuncionarioUnificado } from '@/utils/excel/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ComparisonByRoleProps {
  funcionarios: FuncionarioUnificado[];
}

export const ComparisonByRole = ({ funcionarios }: ComparisonByRoleProps) => {
  const [metricaSelecionada, setMetricaSelecionada] = useState<string>('totalFaltas');

  const dadosGrafico = useMemo(() => {
    const cargosAgrupados = funcionarios.reduce((acc, funcionario) => {
      const cargo = funcionario.cargo || 'Não informado';
      
      if (!acc[cargo]) {
        acc[cargo] = {
          cargo,
          totalFuncionarios: 0,
          totalFaltas: 0,
          totalAtrasos: 0,
          totalAtestados: 0,
          totalPresencas: 0,
          totalHorasExtras: 0
        };
      }

      acc[cargo].totalFuncionarios++;
      acc[cargo].totalFaltas += funcionario.contadores['FALTA'] || 0;
      acc[cargo].totalAtrasos += funcionario.contadores['ATRASO'] || 0;
      acc[cargo].totalAtestados += funcionario.contadores['ATESTADO'] || 0;
      acc[cargo].totalPresencas += funcionario.contadores['PRESENTE'] || 0;
      acc[cargo].totalHorasExtras += funcionario.contadores['HORA_EXTRA'] || 0;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(cargosAgrupados).map((cargo: any) => ({
      ...cargo,
      // Calcular médias por funcionário
      mediaFaltas: Number((cargo.totalFaltas / cargo.totalFuncionarios).toFixed(1)),
      mediaAtrasos: Number((cargo.totalAtrasos / cargo.totalFuncionarios).toFixed(1)),
      mediaAtestados: Number((cargo.totalAtestados / cargo.totalFuncionarios).toFixed(1)),
      mediaPresencas: Number((cargo.totalPresencas / cargo.totalFuncionarios).toFixed(1)),
      mediaHorasExtras: Number((cargo.totalHorasExtras / cargo.totalFuncionarios).toFixed(1))
    }));
  }, [funcionarios]);

  const metricas = [
    { value: 'totalFaltas', label: 'Total de Faltas', color: '#ef4444' },
    { value: 'totalAtrasos', label: 'Total de Atrasos', color: '#f97316' },
    { value: 'totalAtestados', label: 'Total de Atestados', color: '#eab308' },
    { value: 'totalPresencas', label: 'Total de Presenças', color: '#22c55e' },
    { value: 'totalHorasExtras', label: 'Total de Horas Extras', color: '#3b82f6' },
    { value: 'mediaFaltas', label: 'Média de Faltas por Funcionário', color: '#ef4444' },
    { value: 'mediaAtrasos', label: 'Média de Atrasos por Funcionário', color: '#f97316' },
    { value: 'mediaAtestados', label: 'Média de Atestados por Funcionário', color: '#eab308' },
    { value: 'mediaPresencas', label: 'Média de Presenças por Funcionário', color: '#22c55e' },
    { value: 'mediaHorasExtras', label: 'Média de Horas Extras por Funcionário', color: '#3b82f6' }
  ];

  const metricaAtual = metricas.find(m => m.value === metricaSelecionada);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Comparação por Cargo</CardTitle>
            <CardDescription>
              Análise comparativa entre diferentes funções
            </CardDescription>
          </div>
          <Select value={metricaSelecionada} onValueChange={setMetricaSelecionada}>
            <SelectTrigger className="w-[250px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {metricas.map((metrica) => (
                <SelectItem key={metrica.value} value={metrica.value}>
                  {metrica.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dadosGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="cargo" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              fontSize={12}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [value, metricaAtual?.label]}
              labelStyle={{ color: '#000' }}
            />
            <Bar 
              dataKey={metricaSelecionada} 
              fill={metricaAtual?.color || '#3b82f6'}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};