
import { Users, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsOverviewProps {
  stats: {
    totalFuncionarios: number;
    todasTags: string[];
    contagemTags: Record<string, number>;
    funcionariosMaisAtestados: any[];
  };
}

export const StatsOverview = ({ stats }: StatsOverviewProps) => {
  const tagsPrincipais = [
    { tag: '100%', label: 'Presença Normal', icon: Calendar, color: 'text-green-600 bg-green-100' },
    { tag: 'ATESTADO', label: 'Atestados', icon: AlertTriangle, color: 'text-red-600 bg-red-100' },
    { tag: '100% (C/ ATRASO)', label: 'Atrasos', icon: TrendingUp, color: 'text-yellow-600 bg-yellow-100' },
    { tag: 'FÉRIAS', label: 'Férias', icon: Calendar, color: 'text-blue-600 bg-blue-100' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total de Funcionários
          </CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stats.totalFuncionarios}</div>
          <p className="text-xs text-gray-500 mt-1">
            Funcionários analisados
          </p>
        </CardContent>
      </Card>

      {tagsPrincipais.map(({ tag, label, icon: Icon, color }) => (
        <Card key={tag}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {label}
            </CardTitle>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.contagemTags[tag] || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total de ocorrências
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
