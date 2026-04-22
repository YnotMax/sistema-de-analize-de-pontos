import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Search, ArrowRightLeft, Info, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ComparativeRadarChart } from '../Dashboard/ComparativeRadarChart';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface ComparativeViewProps {
  funcionarios: any[];
}

export function ComparativeView({ funcionarios }: ComparativeViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('none');
  const [selectedToCompare, setSelectedToCompare] = useState<any[]>([]);
  const [showHelp, setShowHelp] = useState(true);

  // Filtrar e Ordenar funcionários
  const funcionariosFiltrados = [...funcionarios]
    .filter(f => 
      f.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (f.cargo && f.cargo.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'none') return 0;
      const valA = a.contadores?.[sortBy] || 0;
      const valB = b.contadores?.[sortBy] || 0;
      return valB - valA; // Maior para menor
    });

  const toggleSelection = (funcionario: any) => {
    // Usamos o 'nome' como chave principal de identificação, pois 'id' ou 'matricula' 
    // podem estar ausentes nos dados processados diretamente do Excel.
    const isAlreadySelected = selectedToCompare.some(f => f.nome === funcionario.nome);

    if (isAlreadySelected) {
      // Remove da seleção
      setSelectedToCompare(selectedToCompare.filter(f => f.nome !== funcionario.nome));
    } else {
      // Adiciona à seleção
      if (selectedToCompare.length < 2) {
        setSelectedToCompare([...selectedToCompare, funcionario]);
      } else {
        // Se já tem 2, substitui o segundo
        setSelectedToCompare([selectedToCompare[0], funcionario]);
      }
    }
  };

  // Mini Radar apenas para o card (simplificado)
  const MiniRadar = ({ funcionario }: { funcionario: any }) => {
    const TAGS = ['ATESTADO', 'ATRASO', 'FALTA', 'HORAS_EXTRAS', 'DAY_OFF'];
    const data = TAGS.map(tag => ({
      val: funcionario.contadores?.[tag] || 0
    }));

    return (
      <div className="h-24 w-full mt-2 pointer-events-none">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <Radar dataKey="val" stroke="#10b981" fill="#34d399" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
          <ArrowRightLeft className="w-8 h-8 text-blue-500" />
          Análise Dinâmica de Perfis
        </h2>
        <button 
          onClick={() => setShowHelp(!showHelp)}
          className="px-4 py-2 bg-white/60 border border-slate-200 text-slate-600 rounded-xl hover:bg-white hover:shadow-sm font-medium text-sm flex items-center gap-2 transition-all"
        >
          <Info className="w-4 h-4" />
          Como usar
        </button>
      </div>

      {showHelp && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 relative animate-in slide-in-from-top-4 duration-500">
          <button 
            onClick={() => setShowHelp(false)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            Bem-vindo à área de People Analytics! 🚀
          </h3>
          <p className="text-slate-600 max-w-3xl leading-relaxed">
            Esta tela permite identificar padrões de comportamento e gerar insights valiosos para o setor de Recursos Humanos. 
            Utilizamos o <strong>Gráfico de Radar</strong> para traçar o perfil de absenteísmo (Faltas, Atrasos, Atestados) 
            de cada colaborador.
          </p>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-slate-700 font-medium">
            <li className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">1</span> Selecione <strong>apenas um</strong> colaborador na lista à esquerda para comparar o perfil dele com a <strong>Média da Empresa</strong>.</li>
            <li className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">2</span> Selecione <strong>dois</strong> colaboradores para fazer um embate direto (Comparação 1x1).</li>
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Coluna da Esquerda: Lista de Colaboradores */}
        <div className="lg:col-span-4 bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm flex flex-col h-[75vh]">
          <h3 className="text-lg font-bold mb-4 text-slate-800">Colaboradores & Grupos</h3>
          
          <div className="space-y-3 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar colaborador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl bg-white/50 border-slate-200 shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Ordenar por Maior:</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full rounded-xl bg-white/50 border-slate-200 shadow-sm">
                  <SelectValue placeholder="Ordenar por..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Padrão</SelectItem>
                  <SelectItem value="ATESTADO">Atestados</SelectItem>
                  <SelectItem value="FALTA">Faltas</SelectItem>
                  <SelectItem value="ATRASO">Atrasos</SelectItem>
                  <SelectItem value="HORAS_EXTRAS">Horas Extras</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-y-auto pr-2 space-y-4 flex-1 custom-scrollbar">
            {funcionariosFiltrados.slice(0, 50).map((funcionario, idx) => {
              const isSelected = selectedToCompare.some(f => f.nome === funcionario.nome);
              
              return (
                <div 
                  key={funcionario.nome || idx}
                  onClick={() => toggleSelection(funcionario)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-blue-400 bg-blue-50/50 shadow-md ring-2 ring-blue-100' 
                      : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 text-sm">
                      {funcionario.nome.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{funcionario.nome}</h4>
                      <p className="text-xs text-slate-500">{funcionario.cargo}</p>
                    </div>
                  </div>
                  
                  <MiniRadar funcionario={funcionario} />
                  

                </div>
              );
            })}
          </div>
        </div>

        {/* Coluna da Direita: Área de Comparação */}
        <div className="lg:col-span-8">
          <h3 className="text-lg font-bold mb-4 text-slate-800">Área de Comparação</h3>
          <div className="bg-white/40 backdrop-blur-xl border-2 border-dashed border-slate-300 rounded-3xl p-6 h-[75vh] flex flex-col items-center justify-center relative">
            
            {selectedToCompare.length === 0 ? (
              <div className="text-center text-slate-400">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p>Selecione um ou dois colaboradores ao lado<br/>para comparar as métricas via Radar Chart.</p>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col">
                <div className="flex items-center justify-center gap-8 mb-6">
                  {selectedToCompare.map((func, idx) => (
                    <div key={idx} className={`px-4 py-2 rounded-xl flex items-center gap-3 font-semibold ${idx === 0 ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                      {func.nome}
                    </div>
                  ))}
                </div>
                <div className="flex-1 w-full bg-white/50 rounded-2xl p-4">
                   <ComparativeRadarChart 
                     funcionarios={funcionarios} 
                     selectedEmployees={selectedToCompare} 
                   />
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
