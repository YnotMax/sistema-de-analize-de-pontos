
import { useState, useCallback } from 'react';
import { FuncionarioData } from '@/pages/Index';
import { processarCSV } from '@/utils/csvProcessor';
import { processarExcel, PeriodoData } from '@/utils/excelProcessor';

interface UseFileHandlerProps {
  onFileProcessed: (data: FuncionarioData[], filename: string) => void;
  onMultiplePeriodsProcessed: (periods: PeriodoData[], filename: string) => void;
  onProcessingStart: () => void;
  onProcessingEnd: () => void;
  onError: (error: string) => void;
}

export const useFileHandler = ({
  onFileProcessed,
  onMultiplePeriodsProcessed,
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
      
      processarExcel(file)
        .then(periodosDisponiveis => {
          onMultiplePeriodsProcessed(periodosDisponiveis, file.name);
        })
        .catch(error => {
          console.error('Erro ao processar Excel:', error);
          onError(error instanceof Error ? error.message : 'Erro ao processar arquivo Excel');
        })
        .finally(() => {
          onProcessingEnd();
        });
    } else {
      onError('Por favor, selecione um arquivo CSV ou Excel válido.');
    }
  }, [onFileProcessed, onMultiplePeriodsProcessed, onProcessingStart, onProcessingEnd, onError]);

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
