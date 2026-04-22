import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertTriangle, CheckCircle2, TrendingUp, Search, UserMinus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { normalizarTag } from '@/utils/tagMapping';

interface AbsenteismoViewProps {
  funcionarios: any[];
}

export function AbsenteismoView({ funcionarios }: AbsenteismoViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFunc, setSelectedFunc] = useState<any | null>(null);

  if (!funcionarios || funcionarios.length === 0) return null;

  // 1. Cálculos Globais
  let totalDiasEsperados = 0;
  let totalDiasAusentes = 0;

  funcionarios.forEach(f => {
    // Dias úteis ou total do mês esperado (aproximação se totalDias não existir)
    const diasEsperados = f.totalDias || 30;
    
    // Consideramos Faltas e Atestados como absenteísmo não programado
    const faltas = f.contadores?.['FALTA'] || 0;
    const atestados = f.contadores?.['ATESTADO'] || 0;
    
    totalDiasEsperados += diasEsperados;
    totalDiasAusentes += (faltas + atestados);
  });

  const taxaGlobal = totalDiasEsperados > 0 
    ? ((totalDiasAusentes / totalDiasEsperados) * 100).toFixed(2) 
    : '0.00';

  const nivelSaude = Number(taxaGlobal) < 3 ? 'Saudável' : Number(taxaGlobal) < 5 ? 'Atenção' : 'Crítico';
  const corNivel = nivelSaude === 'Saudável' ? 'text-emerald-500' : nivelSaude === 'Atenção' ? 'text-amber-500' : 'text-red-500';
  const bgNivel = nivelSaude === 'Saudável' ? 'bg-emerald-50' : nivelSaude === 'Atenção' ? 'bg-amber-50' : 'bg-red-50';

  // 2. Ranking de Risco (Ordenar por maior taxa individual)
  const funcionariosComTaxa = funcionarios.map(f => {
    const faltas = f.contadores?.['FALTA'] || 0;
    const atestados = f.contadores?.['ATESTADO'] || 0;
    const atrasos = f.contadores?.['ATRASO'] || 0;
    const ausencias = faltas + atestados;
    const diasEsperados = f.totalDias || 30;
    const taxa = ((ausencias / diasEsperados) * 100).toFixed(1);
    
    return { ...f, taxaAbsenteismo: Number(taxa), ausencias, faltas, atestados, atrasos };
  }).sort((a, b) => b.taxaAbsenteismo - a.taxaAbsenteismo);

  // 3. Filtragem para a lista
  const funcionariosFiltrados = funcionariosComTaxa.filter(f => 
    f.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
          <Activity className="w-8 h-8 text-rose-500" />
          Gestão de Absenteísmo
        </h2>
      </div>

      {/* Cards de KPIs Globais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/60 backdrop-blur-xl border-white/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-bold text-slate-500 uppercase">Índice Global</CardDescription>
            <CardTitle className="text-4xl flex items-baseline gap-2 text-slate-800">
              {taxaGlobal}%
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${bgNivel} ${corNivel}`}>
               {nivelSaude === 'Saudável' && <CheckCircle2 className="w-4 h-4" />}
               {nivelSaude === 'Atenção' && <AlertTriangle className="w-4 h-4" />}
               {nivelSaude === 'Crítico' && <TrendingUp className="w-4 h-4" />}
               Status: {nivelSaude}
             </div>
             <p className="text-xs text-slate-400 mt-3">Relação entre horas/dias perdidos e o total esperado.</p>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-xl border-white/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-bold text-slate-500 uppercase">Dias Perdidos</CardDescription>
            <CardTitle className="text-4xl text-slate-800">{totalDiasAusentes}</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex items-center gap-2 text-sm text-slate-500">
               <UserMinus className="w-4 h-4 text-rose-400" />
               Impacto direto na produção
             </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-xl border-white/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-bold text-slate-500 uppercase">Colaboradores Críticos</CardDescription>
            <CardTitle className="text-4xl text-slate-800">
              {funcionariosComTaxa.filter(f => f.taxaAbsenteismo > 5).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex items-center gap-2 text-sm text-rose-500 font-medium">
               <AlertTriangle className="w-4 h-4" />
               Acima de 5% de ausência
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[600px]">
        {/* Lista de Colaboradores (Esquerda) */}
        <div className="lg:col-span-5 bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm flex flex-col h-full">
          <h3 className="text-lg font-bold mb-4 text-slate-800">Ranking Individual</h3>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Buscar colaborador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl bg-white/50 border-slate-200 shadow-sm"
            />
          </div>
          
          <div className="overflow-y-auto pr-2 space-y-3 flex-1 custom-scrollbar">
            {funcionariosFiltrados.slice(0, 50).map((funcionario, idx) => {
              const isSelected = selectedFunc?.nome === funcionario.nome;
              const isCritico = funcionario.taxaAbsenteismo > 5;
              
              return (
                <div 
                  key={idx}
                  onClick={() => setSelectedFunc(funcionario)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                    isSelected 
                      ? 'border-rose-400 bg-rose-50/50 shadow-md ring-2 ring-rose-100' 
                      : 'border-slate-100 bg-white hover:border-rose-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 text-sm">
                      {funcionario.nome.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm w-40 truncate" title={funcionario.nome}>{funcionario.nome}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        {isCritico && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                        {funcionario.ausencias} dias ausentes
                      </p>
                    </div>
                  </div>
                  <div className={`text-right ${isCritico ? 'text-rose-600 font-bold' : 'text-slate-600 font-semibold'}`}>
                    {funcionario.taxaAbsenteismo}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ficha Individual (Direita) */}
        <div className="lg:col-span-7 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center relative">
          {!selectedFunc ? (
            <div className="text-center text-slate-400 max-w-sm">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserMinus className="w-10 h-10 text-rose-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-600 mb-2">Ficha Individual</h3>
              <p>Selecione um colaborador no ranking ao lado para visualizar a análise completa de assiduidade.</p>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-rose-200">
                  {selectedFunc.nome.substring(0, 2)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{selectedFunc.nome}</h3>
                  <p className="text-slate-500 font-medium">Análise de Assiduidade</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white/80 p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Índice Pessoal</p>
                    <p className={`text-2xl font-black ${selectedFunc.taxaAbsenteismo > 5 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {selectedFunc.taxaAbsenteismo}%
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Total de Ocorrências</p>
                    <p className="text-2xl font-black text-slate-700">
                      {selectedFunc.ausencias + selectedFunc.atrasos}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 p-6 rounded-2xl border border-slate-100 shadow-sm flex-1 overflow-y-auto">
                <h4 className="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center justify-between">
                  Detalhamento das Ocorrências
                  <span className="text-xs font-normal text-slate-400 italic">Clique para ver os dias</span>
                </h4>
                
                <div className="space-y-2">
                  <CategoryDetail 
                    label="Faltas Injustificadas" 
                    color="bg-rose-500" 
                    count={selectedFunc.faltas} 
                    categoryTag="FALTA" 
                    diasDetalhados={selectedFunc.diasDetalhados}
                  />
                  <CategoryDetail 
                    label="Atestados Médicos" 
                    color="bg-amber-500" 
                    count={selectedFunc.atestados} 
                    categoryTag="ATESTADO" 
                    diasDetalhados={selectedFunc.diasDetalhados}
                  />
                  <CategoryDetail 
                    label="Atrasos" 
                    color="bg-orange-400" 
                    count={selectedFunc.atrasos} 
                    categoryTag="ATRASO" 
                    diasDetalhados={selectedFunc.diasDetalhados}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para mostrar as datas de cada categoria
function CategoryDetail({ label, color, count, categoryTag, diasDetalhados }: any) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (count === 0) {
    return (
      <div className="flex justify-between items-center py-3 border-b border-slate-50 opacity-50">
        <span className="text-slate-500 font-medium flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color}`}></div> {label}
        </span>
        <span className="font-bold text-slate-400">0</span>
      </div>
    );
  }

  // Filtrar os dias que correspondem à tag
  // Importante: A tag nos diasDetalhados é a tag ORIGINAL, então precisamos normalizar para comparar
  const diasOcorrencia = Object.entries(diasDetalhados)
    .filter(([_, tagOriginal]: any) => normalizarTag(tagOriginal) === categoryTag)
    .map(([dia, _]) => dia)
    .sort();

  return (
    <div className="border-b border-slate-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-3 hover:bg-slate-50 px-2 rounded-lg transition-colors group"
      >
        <span className="text-slate-600 font-medium flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color}`}></div> {label}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-slate-800">{count}</span>
          <svg 
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-4 pt-1 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-wrap gap-2">
            {diasOcorrencia.map((dia, idx) => (
              <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold border border-slate-200">
                {dia.replace(' 25', '').replace(' 24', '')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
