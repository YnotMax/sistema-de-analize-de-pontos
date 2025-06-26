
import { FuncionarioData } from '@/pages/Index';
import { useFileHandler } from '@/hooks/useFileHandler';
import { FileDropZone } from './FileUpload/FileDropZone';
import { FileFormatInfo } from './FileUpload/FileFormatInfo';

export interface PeriodoData {
  id: string;
  nome: string;
  funcionarios: FuncionarioData[];
  totalRegistros: number;
  dataProcessamento: Date;
}

interface FileUploadProps {
  onFileProcessed: (data: FuncionarioData[], filename: string) => void;
  onMultiplePeriodsProcessed: (periods: PeriodoData[], filename: string) => void;
  onProcessingStart: () => void;
  onProcessingEnd: () => void;
  onError: (error: string) => void;
}

export const FileUpload = ({ 
  onFileProcessed, 
  onMultiplePeriodsProcessed,
  onProcessingStart, 
  onProcessingEnd, 
  onError 
}: FileUploadProps) => {
  const {
    isDragOver,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleFileInput
  } = useFileHandler({
    onFileProcessed,
    onMultiplePeriodsProcessed,
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
