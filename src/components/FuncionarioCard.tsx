
import { useState } from 'react';
import { FuncionarioData } from '@/pages/Index';
import { ChevronDown, ChevronUp, User, IdCard, Briefcase, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FuncionarioCardProps {
  funcionario: FuncionarioData;
}

export const FuncionarioCard = ({ funcionario }: FuncionarioCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTagColor = (tag: string): string => {
    const colors: Record<string, string> = {
      '100%': 'bg-green-100 text-green-800 hover:bg-green-200',
      'ATESTADO': 'bg-red-100 text-red-800 hover:bg-red-200',
      '100% (C/ ATRASO)': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      '100% (ANTECIP.)': 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      'FÉRIAS': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      'DAY OFF': 'bg-purple-100 text-purple-800 hover:bg-purple-200',
      'FERIADO': 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
      'X': 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      '50%': 'bg-amber-100 text-amber-800 hover:bg-amber-200',
      'FEZ HORAS EXTRAS': 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
      'DESLIGADO': 'bg-slate-100 text-slate-800 hover:bg-slate-200'
    };
    return colors[tag] || 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  };

  const topTags = Object.entries(funcionario.contadores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const hasProblems = funcionario.contadores['ATESTADO'] > 5 || 
                     funcionario.contadores['100% (C/ ATRASO)'] > 3;

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${hasProblems ? 'ring-2 ring-red-100' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {funcionario.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-lg leading-tight">
                {funcionario.nome}
              </h4>
              
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {funcionario.cargo}
                </div>
                <div className="flex items-center gap-1">
                  <IdCard className="w-3 h-3" />
                  Mat. {funcionario.matricula}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {funcionario.totalDias} dias
                </div>
              </div>
            </div>
          </div>

          {hasProblems && (
            <Badge variant="destructive" className="ml-2">
              Atenção
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Tags principais */}
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => (
              <Badge 
                key={tag} 
                variant="secondary"
                className={`${getTagColor(tag)} font-medium`}
              >
                {tag}: {count}
              </Badge>
            ))}
          </div>

          {/* Botão para expandir detalhes */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full justify-center gap-2 text-gray-600 hover:text-gray-900"
          >
            {isExpanded ? 'Ocultar detalhes' : 'Ver todos os detalhes'}
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          {/* Detalhes expandidos */}
          {isExpanded && (
            <div className="border-t pt-4 space-y-3">
              <h5 className="font-medium text-gray-900">Todas as ocorrências:</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(funcionario.contadores)
                  .sort(([,a], [,b]) => b - a)
                  .map(([tag, count]) => (
                    <div 
                      key={tag}
                      className={`p-2 rounded-lg text-sm ${getTagColor(tag)}`}
                    >
                      <div className="font-medium">{tag}</div>
                      <div className="text-xs opacity-75">{count} vez{count !== 1 ? 'es' : ''}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
