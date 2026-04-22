import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface ComparativeRadarChartProps {
  funcionarios: any[];
  selectedEmployees?: any[];
}

export function ComparativeRadarChart({ funcionarios, selectedEmployees = [] }: ComparativeRadarChartProps) {
  if (!funcionarios || funcionarios.length === 0) return null;

  // Filtramos as tags principais de comportamento
  const TAGS = ['ATESTADO', 'ATRASO', 'FALTA', 'HORAS_EXTRAS', 'DAY_OFF'];

  // 1. Calcular a média geral da empresa/setor
  const mediaGeral: Record<string, number> = {};
  TAGS.forEach(tag => {
    const total = funcionarios.reduce((acc, func) => acc + (func.contadores?.[tag] || 0), 0);
    mediaGeral[tag] = Number((total / funcionarios.length).toFixed(1));
  });

  // 2. Determinar as entidades de comparação
  let entidade1 = { nome: 'Média da Equipe', data: mediaGeral, colorStroke: '#94a3b8', colorFill: '#cbd5e1' };
  let entidade2 = { nome: '', data: {} as Record<string, number>, colorStroke: '#3b82f6', colorFill: '#60a5fa' };

  if (selectedEmployees.length === 0) {
    const funcionarioDestaque = funcionarios.find(f => 
      (f.contadores?.['ATESTADO'] || 0) > 0 || (f.contadores?.['FALTA'] || 0) > 0
    ) || funcionarios[0];
    
    entidade2 = {
      nome: funcionarioDestaque.nome,
      data: TAGS.reduce((acc, tag) => ({ ...acc, [tag]: funcionarioDestaque.contadores?.[tag] || 0 }), {}),
      colorStroke: '#3b82f6',
      colorFill: '#60a5fa'
    };
  } else if (selectedEmployees.length === 1) {
    entidade2 = {
      nome: selectedEmployees[0].nome,
      data: TAGS.reduce((acc, tag) => ({ ...acc, [tag]: selectedEmployees[0].contadores?.[tag] || 0 }), {}),
      colorStroke: '#3b82f6',
      colorFill: '#60a5fa'
    };
  } else {
    // 2 empregados selecionados
    entidade1 = {
      nome: selectedEmployees[0].nome,
      data: TAGS.reduce((acc, tag) => ({ ...acc, [tag]: selectedEmployees[0].contadores?.[tag] || 0 }), {}),
      colorStroke: '#3b82f6',
      colorFill: '#60a5fa'
    };
    entidade2 = {
      nome: selectedEmployees[1].nome,
      data: TAGS.reduce((acc, tag) => ({ ...acc, [tag]: selectedEmployees[1].contadores?.[tag] || 0 }), {}),
      colorStroke: '#10b981',
      colorFill: '#34d399'
    };
  }

  // 3. Montar a estrutura de dados para o Recharts
  const data = TAGS.map(tag => {
    return {
      comportamento: tag.replace('_', ' '),
      [entidade1.nome]: entidade1.data[tag] || 0,
      [entidade2.nome]: entidade2.data[tag] || 0,
      fullMark: Math.max(entidade1.data[tag] || 0, entidade2.data[tag] || 0, 5) // Teto visual
    };
  });

  return (
    <Card className="h-full border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg font-bold text-slate-800">Análise Comportamental</CardTitle>
        <CardDescription>
          Comparativo: {entidade1.nome} vs {entidade2.nome.split(' ')[0]}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="comportamento" tick={{ fill: '#64748b', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
            
            <Radar 
              name={entidade1.nome} 
              dataKey={entidade1.nome} 
              stroke={entidade1.colorStroke} 
              fill={entidade1.colorFill} 
              fillOpacity={0.4} 
            />
            <Radar 
              name={entidade2.nome} 
              dataKey={entidade2.nome} 
              stroke={entidade2.colorStroke} 
              fill={entidade2.colorFill} 
              fillOpacity={0.6} 
            />
            
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '14px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
