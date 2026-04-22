
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
    <Card className={`transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl overflow-hidden ${hasProblems ? 'ring-2 ring-red-200 shadow-red-50' : 'shadow-sm'}`}>
      <CardHeader className="pb-3 px-6 pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-sm shadow-blue-200 flex items-center justify-center text-white font-bold text-lg">
              {funcionario.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            
            <div className="flex-1 mt-1">
              <h4 className="font-bold text-slate-800 text-lg leading-tight">
                {funcionario.nome}
              </h4>
              
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                <div className="flex items-center gap-1.5 bg-slate-100/50 px-2.5 py-1 rounded-md">
                  <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-medium text-slate-600">{funcionario.cargo}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <IdCard className="w-3.5 h-3.5" />
                  Mat. {funcionario.matricula}
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {funcionario.totalDias} dias
                </div>
              </div>
            </div>
          </div>

          {hasProblems && (
            <Badge variant="destructive" className="ml-2 bg-red-100 text-red-700 hover:bg-red-200 border-none px-3 py-1 rounded-full shadow-none">
              Atenção
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-2">
        <div className="space-y-4">
          {/* Tags principais */}
          <div className="flex flex-wrap gap-2 mt-2">
            {topTags.map(([tag, count]) => (
              <Badge 
                key={tag} 
                variant="secondary"
                className={`${getTagColor(tag)} font-medium px-3 py-1 rounded-lg border border-white/20 shadow-sm`}
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
            className="w-full justify-center gap-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl mt-4 transition-colors"
          >
            {isExpanded ? 'Ocultar detalhes' : 'Ver todos os detalhes'}
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          {/* Detalhes expandidos */}
          {isExpanded && (
            <div className="border-t border-slate-100 pt-5 space-y-4 animate-in fade-in slide-in-from-top-2">
              <h5 className="font-semibold text-slate-700">Todas as ocorrências do período:</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(funcionario.contadores)
                  .sort(([,a], [,b]) => b - a)
                  .map(([tag, count]) => (
                    <div 
                      key={tag}
                      className={`p-3 rounded-xl text-sm border border-white/50 shadow-sm flex flex-col justify-between h-full ${getTagColor(tag)}`}
                    >
                      <div className="font-semibold mb-1">{tag}</div>
                      <div className="text-sm font-medium opacity-80">{count} registro{count !== 1 ? 's' : ''}</div>
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
