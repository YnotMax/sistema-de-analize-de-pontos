import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Dashboard } from '@/components/Dashboard';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { AppSidebar } from '@/components/AppSidebar';
import { PeriodSelector } from '@/components/PeriodSelector';
import { ComparativeView } from '@/components/Compare/ComparativeView';
import { AbsenteismoView } from '@/components/Compare/AbsenteismoView';
import { usePontoProcessor } from '@/hooks/usePontoProcessor';

export interface FuncionarioData {
  id: number;
  matricula: string;
  nome: string;
  cargo: string;
  contadores: Record<string, number>;
  totalDias: number;
  diasDetalhados: Record<string, string>;
}

const Index = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'compare' | 'absenteismo'>('dashboard');
  const {
    funcionarios,
    funcionariosUnificados,
    periodosDisponiveis,
    periodoAtivo,
    isProcessing,
    error,
    fileName,
    isMultiPeriod,
    handleFileProcessed,
    handleUnifiedDataProcessed,
    handleMultiplePeriodsProcessed,
    handlePeriodoChange,
    handleProcessingStart,
    handleProcessingEnd,
    handleError,
    handleReset
  } = usePontoProcessor();

  const hasData = funcionarios.length > 0 || periodosDisponiveis.length > 0 || funcionariosUnificados.length > 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-hidden relative">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[10%] w-[30%] h-[30%] bg-indigo-100/40 rounded-full blur-[100px] pointer-events-none"></div>
      
      <AppSidebar currentView={currentView} onNavigate={setCurrentView} hasData={hasData} />
      
      <main className="flex-1 ml-20 p-8 relative z-10 overflow-y-auto">
        {!hasData && !isProcessing ? (
          <div className="max-w-4xl mx-auto min-h-[90vh] flex flex-col items-center justify-center py-12">
            <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-bold tracking-wide uppercase">
                Versão 2.0 Professional
              </div>
              <h1 className="text-5xl font-extrabold text-slate-800 mb-6 tracking-tight">
                Análise Avançada de Ponto
              </h1>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                Bem-vindo ao seu novo cockpit de RH. Esta plataforma transforma planilhas estáticas em um dashboard dinâmico de People Analytics.
              </p>
            </div>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white/60 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h4 className="font-bold text-slate-800 mb-2">Visão Geral</h4>
                <p className="text-sm text-slate-500">Gere KPIs automáticos de presença, faltas e atestados em segundos.</p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white/60 shadow-sm">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <h4 className="font-bold text-slate-800 mb-2">Comparativo</h4>
                <p className="text-sm text-slate-500">Compare perfis comportamentais de colaboradores usando gráficos de radar.</p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white/60 shadow-sm">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h4 className="font-bold text-slate-800 mb-2">Histórico</h4>
                <p className="text-sm text-slate-500">Importe múltiplos meses e navegue entre os períodos facilmente.</p>
              </div>
            </div>
            
            <div className="w-full bg-white/60 backdrop-blur-2xl border border-white p-10 rounded-[3rem] shadow-2xl shadow-blue-500/5 animate-in fade-in zoom-in-95 duration-1000 delay-300">
              <FileUpload
                onFileProcessed={handleFileProcessed}
                onUnifiedDataProcessed={handleUnifiedDataProcessed}
                onMultiplePeriodsProcessed={handleMultiplePeriodsProcessed}
                onProcessingStart={handleProcessingStart}
                onProcessingEnd={handleProcessingEnd}
                onError={handleError}
              />
            </div>
            
            {error && (
              <div className="mt-8 p-5 bg-red-50 border border-red-100 rounded-2xl animate-shake">
                <p className="text-red-600 text-center font-semibold">{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-[1600px] mx-auto py-4">
            {isProcessing && <ProcessingStatus />}
            
            {hasData && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {isMultiPeriod && (
                  <div className="mb-8">
                    <PeriodSelector
                      periodosDisponiveis={periodosDisponiveis}
                      periodoAtivo={periodoAtivo}
                      onPeriodoChange={handlePeriodoChange}
                      fileName={fileName}
                    />
                  </div>
                )}
                
                {currentView === 'dashboard' && (
                  <Dashboard 
                    funcionarios={funcionarios} 
                    funcionariosUnificados={funcionariosUnificados}
                    fileName={fileName}
                    onReset={handleReset}
                  />
                )}
                {currentView === 'compare' && (
                  <ComparativeView 
                    funcionarios={funcionariosUnificados.length > 0 ? funcionariosUnificados : funcionarios} 
                  />
                )}
                {currentView === 'absenteismo' && (
                  <AbsenteismoView 
                    funcionarios={funcionariosUnificados.length > 0 ? funcionariosUnificados : funcionarios} 
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
