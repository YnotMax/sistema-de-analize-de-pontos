
import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { FuncionarioData } from '@/pages/Index';

interface FileUploadProps {
  onFileProcessed: (data: FuncionarioData[], filename: string) => void;
  onProcessingStart: () => void;
  onProcessingEnd: () => void;
  onError: (error: string) => void;
}

export const FileUpload = ({ onFileProcessed, onProcessingStart, onProcessingEnd, onError }: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const processarCSV = useCallback((textoCSV: string, filename: string) => {
    try {
      console.log('Iniciando processamento do CSV...');
      
      const resultado = Papa.parse(textoCSV, {
        delimiter: ';',
        skipEmptyLines: true,
        dynamicTyping: false
      });

      console.log('CSV parseado:', resultado.data.length, 'linhas');

      // Encontrar linha do cabeçalho
      let indiceCabecalho = -1;
      for (let i = 0; i < resultado.data.length; i++) {
        const linha = resultado.data[i] as string[];
        if (linha.some(col => col && col.includes('NOME')) && 
            linha.some(col => col && col.includes('CARGO'))) {
          indiceCabecalho = i;
          break;
        }
      }

      if (indiceCabecalho === -1) {
        throw new Error('Cabeçalho não encontrado. Verifique se o arquivo possui as colunas NOME e CARGO.');
      }

      console.log('Cabeçalho encontrado na linha:', indiceCabecalho);

      const cabecalho = resultado.data[indiceCabecalho] as string[];
      
      // Identificar onde começam os dias
      const indiceDias = cabecalho.findIndex(col => col && (col.includes('-mai') || col.includes('-') || /\d+-\w+/.test(col)));
      
      if (indiceDias === -1) {
        throw new Error('Colunas de dias não encontradas. Verifique o formato das datas no cabeçalho.');
      }

      console.log('Dias começam na coluna:', indiceDias);

      // Processar funcionários
      const funcionarios: FuncionarioData[] = [];
      
      for (let i = indiceCabecalho + 1; i < resultado.data.length; i++) {
        const linha = resultado.data[i] as string[];
        
        // Só processar se for linha de funcionário (começa com número)
        if (linha[0] && linha[0].toString().match(/^\d+$/)) {
          const funcionario: FuncionarioData = {
            id: parseInt(linha[0]),
            matricula: linha[2] || '',
            nome: linha[3] || '',
            cargo: linha[4] || '',
            contadores: {},
            totalDias: 0,
            diasDetalhados: {}
          };

          // Processar cada dia do mês
          for (let j = indiceDias; j < linha.length && j < cabecalho.length; j++) {
            const nomeDia = cabecalho[j];
            const status = linha[j];

            if (nomeDia && status && status.toString().trim() !== '') {
              const statusLimpo = status.toString().trim();
              
              funcionario.diasDetalhados[nomeDia] = statusLimpo;
              
              if (funcionario.contadores[statusLimpo]) {
                funcionario.contadores[statusLimpo]++;
              } else {
                funcionario.contadores[statusLimpo] = 1;
              }
              
              funcionario.totalDias++;
            }
          }

          if (funcionario.nome) {
            funcionarios.push(funcionario);
          }
        }
      }

      console.log('Funcionários processados:', funcionarios.length);

      if (funcionarios.length === 0) {
        throw new Error('Nenhum funcionário encontrado. Verifique o formato do arquivo.');
      }

      onFileProcessed(funcionarios, filename);
    } catch (error) {
      console.error('Erro ao processar CSV:', error);
      onError(error instanceof Error ? error.message : 'Erro desconhecido ao processar o arquivo');
    } finally {
      onProcessingEnd();
    }
  }, [onFileProcessed, onProcessingEnd, onError]);

  const handleFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      onError('Por favor, selecione um arquivo CSV válido.');
      return;
    }

    onProcessingStart();
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const textoCSV = e.target?.result as string;
      processarCSV(textoCSV, file.name);
    };
    reader.onerror = () => {
      onError('Erro ao ler o arquivo. Tente novamente.');
      onProcessingEnd();
    };
    reader.readAsText(file, 'utf-8');
  }, [processarCSV, onProcessingStart, onProcessingEnd, onError]);

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

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50 scale-105' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center transition-colors
            ${isDragOver ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}
          `}>
            <Upload className="w-8 h-8" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Envie sua planilha CSV
            </h3>
            <p className="text-gray-600 mb-4">
              Arraste e solte o arquivo aqui ou clique para selecionar
            </p>
            <p className="text-sm text-gray-500">
              Formato esperado: CSV separado por ponto e vírgula (;)
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Formato esperado do arquivo:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Arquivo CSV separado por ponto e vírgula (;)</li>
              <li>• Encoding UTF-8</li>
              <li>• Colunas: NOME, CARGO e dias do mês</li>
              <li>• Tags como: 100%, ATESTADO, FÉRIAS, etc.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
