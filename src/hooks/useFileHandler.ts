import { useState, useCallback } from 'react';
import { FuncionarioData } from '@/pages/Index';
import { processarCSV } from '@/utils/csvProcessor';
import { processarExcel, processarArquivoXLSXBanco, FuncionarioUnificado } from '@/utils/excelProcessor';
import { PeriodoData } from '@/utils/excel/types';
import { DadosUnificadosXLSX } from '@/utils/xlsxProcessor';

interface UseFileHandlerProps {
  onFileProcessed: (data: FuncionarioData[], filename: string) => void;
  onUnifiedDataProcessed: (data: FuncionarioUnificado[], filename: string) => void;
  onMultiplePeriodsProcessed: (periods: PeriodoData[], filename: string) => void;
  onXlsxDataLoaded?: (data: DadosUnificadosXLSX) => void;
  onUnifiedDataLoaded?: (data: FuncionarioUnificado[]) => void;
  onProcessingStart: () => void;
  onProcessingEnd: () => void;
  onError: (error: string) => void;
}

export const useFileHandler = ({
  onFileProcessed,
  onUnifiedDataProcessed,
  onMultiplePeriodsProcessed,
  onXlsxDataLoaded,
  onUnifiedDataLoaded,
  onProcessingStart,
  onProcessingEnd,
  onError
}: UseFileHandlerProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback((file: File) => {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
      onProcessingStart();
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const textoCSV = e.target?.result as string;
          const funcionarios = processarCSV(textoCSV, file.name);
          onFileProcessed(funcionarios, file.name);
        } catch (error) {
          console.error('Erro ao processar CSV:', error);
          onError(error instanceof Error ? error.message : 'Erro desconhecido ao processar o arquivo');
        } finally {
          onProcessingEnd();
        }
      };
      
      reader.onerror = () => {
        onError('Erro ao ler o arquivo. Tente novamente.');
        onProcessingEnd();
      };
      
      reader.readAsText(file, 'utf-8');
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      onProcessingStart();
      
      // CORREÇÃO CRÍTICA: Para arquivos .xlsx, priorizar o processamento unificado
      if (fileName.endsWith('.xlsx')) {
        console.log('🔄 [useFileHandler] Iniciando processamento unificado para arquivo .xlsx');
        
        processarArquivoXLSXBanco(file)
          .then(dadosUnificados => {
            console.log("🔍 [useFileHandler] Dados processados da aba BANCO:", dadosUnificados);
            
            // PRIORIDADE 1: Se temos funcionários unificados, usar esse fluxo
            if (dadosUnificados.funcionariosUnificados && dadosUnificados.funcionariosUnificados.length > 0) {
              console.log("✅ [useFileHandler] FLUXO UNIFICADO: Processando funcionários unificados:", dadosUnificados.funcionariosUnificados.length);
              
              // Chamar callback para dados unificados
              if (onUnifiedDataLoaded) {
                console.log("🔍 [useFileHandler] Chamando onUnifiedDataLoaded");
                onUnifiedDataLoaded(dadosUnificados.funcionariosUnificados);
              }
              
              // Chamar callback principal para dados unificados
              if (onUnifiedDataProcessed) {
                console.log("🔍 [useFileHandler] Chamando onUnifiedDataProcessed");
                onUnifiedDataProcessed(dadosUnificados.funcionariosUnificados, file.name);
              }
              
              // Enviar dados para compatibilidade
              if (onXlsxDataLoaded && dadosUnificados.colaboradores) {
                onXlsxDataLoaded({
                  colaboradores: dadosUnificados.colaboradores
                });
              }
              
              // IMPORTANTE: Não continuar para o processamento de múltiplos períodos
              onProcessingEnd();
              return;
            }
            
            // FALLBACK: Se não conseguiu dados unificados, tentar múltiplos períodos
            console.log("⚠️ [useFileHandler] Dados unificados não disponíveis, tentando múltiplos períodos");
            return processarExcel(file);
          })
          .then(periodosDisponiveis => {
            // Só chega aqui se o processamento unificado falhou
            if (periodosDisponiveis) {
              console.log("🔍 [useFileHandler] FALLBACK: Processando múltiplos períodos:", periodosDisponiveis.length);
              onMultiplePeriodsProcessed(periodosDisponiveis, file.name);
            }
          })
          .catch(error => {
            console.error('❌ [useFileHandler] Erro no processamento:', error);
            onError(error instanceof Error ? error.message : 'Erro ao processar arquivo Excel');
          })
          .finally(() => {
            onProcessingEnd();
          });
      } else {
        // Para arquivos .xls, usar apenas o processamento normal
        processarExcel(file)
          .then(periodosDisponiveis => {
            console.log("🔍 [useFileHandler] Processando arquivo .xls com múltiplos períodos:", periodosDisponiveis.length);
            onMultiplePeriodsProcessed(periodosDisponiveis, file.name);
          })
          .catch(error => {
            console.error('Erro ao processar Excel:', error);
            onError(error instanceof Error ? error.message : 'Erro ao processar arquivo Excel');
          })
          .finally(() => {
            onProcessingEnd();
          });
      }
    } else {
      onError('Por favor, selecione um arquivo CSV ou Excel válido.');
    }
  }, [onFileProcessed, onUnifiedDataProcessed, onMultiplePeriodsProcessed, onXlsxDataLoaded, onUnifiedDataLoaded, onProcessingStart, onProcessingEnd, onError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return {
    isDragOver,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleFileInput
  };
};