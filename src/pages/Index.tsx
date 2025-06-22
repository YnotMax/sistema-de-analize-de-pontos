
import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Dashboard } from '@/components/Dashboard';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { Header } from '@/components/Header';

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
  const [funcionarios, setFuncionarios] = useState<FuncionarioData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileProcessed = (data: FuncionarioData[], filename: string) => {
    setFuncionarios(data);
    setFileName(filename);
    setError(null);
  };

  const handleProcessingStart = () => {
    setIsProcessing(true);
    setError(null);
  };

  const handleProcessingEnd = () => {
    setIsProcessing(false);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setIsProcessing(false);
  };

  const handleReset = () => {
    setFuncionarios([]);
    setFileName('');
    setError(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {funcionarios.length === 0 && !isProcessing ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Sistema de Análise de Ponto
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Processe sua planilha CSV de controle de ponto e obtenha insights detalhados sobre a frequência dos funcionários
              </p>
            </div>
            
            <FileUpload
              onFileProcessed={handleFileProcessed}
              onProcessingStart={handleProcessingStart}
              onProcessingEnd={handleProcessingEnd}
              onError={handleError}
            />
            
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {isProcessing && <ProcessingStatus />}
            
            {funcionarios.length > 0 && (
              <Dashboard 
                funcionarios={funcionarios} 
                fileName={fileName}
                onReset={handleReset}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
