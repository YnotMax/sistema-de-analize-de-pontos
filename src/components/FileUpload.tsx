import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { FuncionarioData } from '@/pages/Index';
import { normalizarTag } from '@/utils/tagMapping';

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
      
      const indiceDias = cabecalho.findIndex(col => col && (col.includes('-mai') || col.includes('-') || /\d+-\w+/.test(col)));
      
      if (indiceDias === -1) {
        throw new Error('Colunas de dias não encontradas. Verifique o formato das datas no cabeçalho.');
      }

      console.log('Dias começam na coluna:', indiceDias);

      const funcionarios: FuncionarioData[] = [];
      
      for (let i = indiceCabecalho + 1; i < resultado.data.length; i++) {
        const linha = resultado.data[i] as string[];
        
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

          for (let j = indiceDias; j < linha.length && j < cabecalho.length; j++) {
            const nomeDia = cabecalho[j];
            const statusOriginal = linha[j];

            if (nomeDia && statusOriginal && statusOriginal.toString().trim() !== '') {
              const statusLimpo = statusOriginal.toString().trim();
              
              // APLICAR MAPEAMENTO DE TAGS
              const statusNormalizado = normalizarTag(statusLimpo);
              
              console.log(`Tag original: "${statusLimpo}" -> Tag normalizada: "${statusNormalizado}"`);
              
              // Armazenar o status original nos detalhes
              funcionario.diasDetalhados[nomeDia] = statusLimpo;
              
              // Usar a tag NORMALIZADA para os contadores
              if (funcionario.contadores[statusNormalizado]) {
                funcionario.contadores[statusNormalizado]++;
              } else {
                funcionario.contadores[statusNormalizado] = 1;
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
      console.log('Exemplo de contadores normalizados:', funcionarios[0]?.contadores);

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

  const processarExcel = useCallback((file: File) => {
    try {
      console.log('Iniciando processamento do Excel...');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target?.result, {
            type: 'binary',
            cellStyles: true,
            cellDates: true
          });

          const abas = workbook.SheetNames;
          console.log('Abas encontradas:', abas);

          if (abas.length === 0) {
            throw new Error('Nenhuma aba encontrada no arquivo Excel.');
          }

          const periodosDisponiveis: PeriodoData[] = [];

          abas.forEach(nomeAba => {
            try {
              const planilha = workbook.Sheets[nomeAba];
              
              // Converter para array de arrays
              const dadosArray = XLSX.utils.sheet_to_json(planilha, {
                header: 1,
                defval: ''
              }) as string[][];

              // Processar como CSV
              const funcionarios = processarDadosAba(dadosArray, nomeAba);

              if (funcionarios.length > 0) {
                periodosDisponiveis.push({
                  id: nomeAba.toLowerCase().replace(/\s+/g, '-'),
                  nome: nomeAba,
                  funcionarios,
                  totalRegistros: funcionarios.reduce((total, f) => total + f.totalDias, 0),
                  dataProcessamento: new Date()
                });
              }
            } catch (error) {
              console.warn(`Erro ao processar aba ${nomeAba}:`, error);
            }
          });

          if (periodosDisponiveis.length === 0) {
            throw new Error('Nenhuma aba válida encontrada. Verifique o formato das planilhas.');
          }

          console.log('Períodos processados:', periodosDisponiveis.length);
          onMultiplePeriodsProcessed(periodosDisponiveis, file.name);

        } catch (error) {
          console.error('Erro ao processar Excel:', error);
          onError(error instanceof Error ? error.message : 'Erro ao processar arquivo Excel');
        } finally {
          onProcessingEnd();
        }
      };

      reader.onerror = () => {
        onError('Erro ao ler o arquivo Excel. Tente novamente.');
        onProcessingEnd();
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Erro ao iniciar processamento do Excel:', error);
      onError('Erro ao processar arquivo Excel');
      onProcessingEnd();
    }
  }, [onMultiplePeriodsProcessed, onProcessingEnd, onError]);

  const processarDadosAba = (dadosArray: string[][], nomeAba: string): FuncionarioData[] => {
    // Encontrar linha do cabeçalho
    let indiceCabecalho = -1;
    for (let i = 0; i < dadosArray.length; i++) {
      const linha = dadosArray[i];
      if (linha.some(col => col && col.toString().includes('NOME')) && 
          linha.some(col => col && col.toString().includes('CARGO'))) {
        indiceCabecalho = i;
        break;
      }
    }

    if (indiceCabecalho === -1) {
      console.warn(`Cabeçalho não encontrado na aba ${nomeAba}`);
      return [];
    }

    const cabecalho = dadosArray[indiceCabecalho];
    
    // Identificar onde começam os dias
    const indiceDias = cabecalho.findIndex(col => 
      col && (col.toString().includes('-') || /\d+/.test(col.toString()))
    );
    
    if (indiceDias === -1) {
      console.warn(`Colunas de dias não encontradas na aba ${nomeAba}`);
      return [];
    }

    const funcionarios: FuncionarioData[] = [];
    
    for (let i = indiceCabecalho + 1; i < dadosArray.length; i++) {
      const linha = dadosArray[i];
      
      // Só processar se for linha de funcionário (começa com número)
      if (linha[0] && linha[0].toString().match(/^\d+$/)) {
        const funcionario: FuncionarioData = {
          id: parseInt(linha[0].toString()),
          matricula: linha[2]?.toString() || '',
          nome: linha[3]?.toString() || '',
          cargo: linha[4]?.toString() || '',
          contadores: {},
          totalDias: 0,
          diasDetalhados: {}
        };

        // Processar cada dia do mês
        for (let j = indiceDias; j < linha.length && j < cabecalho.length; j++) {
          const nomeDia = cabecalho[j]?.toString();
          const statusOriginal = linha[j]?.toString();

          if (nomeDia && statusOriginal && statusOriginal.trim() !== '') {
            const statusLimpo = statusOriginal.trim();
            
            // APLICAR MAPEAMENTO DE TAGS
            const statusNormalizado = normalizarTag(statusLimpo);
            
            console.log(`[${nomeAba}] ${funcionario.nome} - Tag original: "${statusLimpo}" -> Tag normalizada: "${statusNormalizado}"`);
            
            // Armazenar o status original nos detalhes
            funcionario.diasDetalhados[nomeDia] = statusLimpo;
            
            // Usar a tag NORMALIZADA para os contadores
            if (funcionario.contadores[statusNormalizado]) {
              funcionario.contadores[statusNormalizado]++;
            } else {
              funcionario.contadores[statusNormalizado] = 1;
            }
            
            funcionario.totalDias++;
          }
        }

        console.log(`[${nomeAba}] ${funcionario.nome} - Contadores finais:`, funcionario.contadores);

        if (funcionario.nome) {
          funcionarios.push(funcionario);
        }
      }
    }

    return funcionarios;
  };

  const handleFile = useCallback((file: File) => {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) {
      if (!fileName.endsWith('.csv')) {
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
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      onProcessingStart();
      processarExcel(file);
    } else {
      onError('Por favor, selecione um arquivo CSV ou Excel válido.');
    }
  }, [processarCSV, processarExcel, onProcessingStart, onProcessingEnd, onError]);

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
          accept=".csv,.xlsx,.xls"
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
              Envie sua planilha
            </h3>
            <p className="text-gray-600 mb-4">
              Arraste e solte o arquivo aqui ou clique para selecionar
            </p>
            <p className="text-sm text-gray-500">
              Formatos aceitos: CSV ou Excel (.xlsx, .xls)
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Formatos suportados:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>CSV:</strong> Separado por ponto e vírgula (;), encoding UTF-8</li>
              <li>• <strong>Excel:</strong> Múltiplas abas (.xlsx/.xls) - cada aba = um período</li>
              <li>• Colunas: NOME, CARGO e dias do mês</li>
              <li>• Tags como: 100%, ATESTADO, FÉRIAS, 1: (presença normal), etc.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
