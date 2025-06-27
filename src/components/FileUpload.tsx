
import { FuncionarioData } from '@/pages/Index';
import { useFileHandler } from '@/hooks/useFileHandler';
import { FileDropZone } from './FileUpload/FileDropZone';
import { FileFormatInfo } from './FileUpload/FileFormatInfo';
import { PeriodoData } from '@/utils/excel/types';
import { FuncionarioUnificado } from '@/utils/excel/types';
import { DadosUnificadosXLSX } from '@/utils/xlsxProcessor';

interface FileUploadProps {
  onFileProcessed: (data: FuncionarioData[], filename: string) => void;
  onUnifiedDataProcessed: (data: FuncionarioUnificado[], filename: string) => void;
  onMultiplePeriodsProcessed: (periods: PeriodoData[], filename: string) => void;
  onProcessingStart: () => void;
  onProcessingEnd: () => void;
  onError: (error: string) => void;
}

export const FileUpload = ({ 
  onFileProcessed, 
  onUnifiedDataProcessed,
  onMultiplePeriodsProcessed,
  onProcessingStart, 
  onProcessingEnd, 
  onError 
}: FileUploadProps) => {

  // Callback para dados XLSX (compatibilidade)
  const handleXlsxDataLoaded = (data: DadosUnificadosXLSX) => {
    console.log("🔍 [DEBUG] FileUpload recebeu dados XLSX:", data);
  };

  // Callback para dados unificados
  const handleUnifiedDataLoaded = (data: FuncionarioUnificado[]) => {
    console.log("🔍 [DEBUG] FileUpload recebeu dados unificados:", data);
    onUnifiedDataProcessed(data, 'arquivo.xlsx');
  };

  const {
    isDragOver,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleFileInput
  } = useFileHandler({
    onFileProcessed,
    onUnifiedDataProcessed,
    onMultiplePeriodsProcessed,
    onXlsxDataLoaded: handleXlsxDataLoaded,
    onUnifiedDataLoaded: handleUnifiedDataLoaded,
    onProcessingStart,
    onProcessingEnd,
    onError
  });

  return (
    <>
      <FileDropZone
        isDragOver={isDragOver}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onFileInput={handleFileInput}
      />
      <FileFormatInfo />
    </>
  );
};
