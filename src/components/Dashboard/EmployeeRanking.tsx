import { useMemo } from 'react';
import { FuncionarioUnificado } from '@/utils/excel/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EmployeeRankingProps {
  funcionarios: FuncionarioUnificado[];
  metrica?: 'faltas' | 'atrasos' | 'atestados' | 'presencas';
}

export const EmployeeRanking = ({ funcionarios, metrica = 'faltas' }: EmployeeRankingProps) => {
  const ranking = useMemo(() => {
    const getValorMetrica = (funcionario: FuncionarioUnificado) => {
      switch (metrica) {
        case 'faltas':
          return funcionario.contadores['FALTA'] || 0;
        case 'atrasos':
          return funcionario.contadores['ATRASO'] || 0;
        case 'atestados':
          return funcionario.contadores['ATESTADO'] || 0;
        case 'presencas':
          return funcionario.contadores['PRESENTE'] || 0;
        default:
          return 0;
      }
    };

    return funcionarios
      .map(funcionario => ({
        ...funcionario,
        valorMetrica: getValorMetrica(funcionario)
      }))
      .sort((a, b) => b.valorMetrica - a.valorMetrica)
      .slice(0, 10);
  }, [funcionarios, metrica]);

  const getTituloMetrica = () => {
    switch (metrica) {
      case 'faltas': return 'Faltas';
      case 'atrasos': return 'Atrasos';
      case 'atestados': return 'Atestados';
      case 'presencas': return 'Presenças';
      default: return 'Faltas';
    }
  };

  const getCorBadge = (posicao: number) => {
    if (metrica === 'presencas') {
      // Para presenças, primeiros são melhores (verde)
      if (posicao <= 3) return 'default';
      if (posicao <= 6) return 'secondary';
      return 'outline';
    } else {
      // Para faltas/atrasos/atestados, primeiros são piores (vermelho)
      if (posicao <= 3) return 'destructive';
      if (posicao <= 6) return 'secondary';
      return 'outline';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Ranking - {getTituloMetrica()}</CardTitle>
        <CardDescription>
          Top 10 funcionários por {getTituloMetrica().toLowerCase()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-2">
          {ranking.map((funcionario, index) => (
            <div
              key={funcionario.matricula}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">
                    {funcionario.nome}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {funcionario.cargo}
                  </p>
                </div>
              </div>
              <Badge variant={getCorBadge(index + 1)} className="text-xs">
                {funcionario.valorMetrica}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};