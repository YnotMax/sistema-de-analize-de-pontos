// Mapeamento de tags de entrada para tags internas padronizadas
export const mapeamentoTags: Record<string, string> = {
  // Tags para Presença Normal
  '1': 'PRESENCA_NORMAL', // Adicionado mapeamento para "1"
  'P': 'PRESENCA_NORMAL',
  '100%': 'PRESENCA_NORMAL',
  '1:': 'PRESENCA_NORMAL',
  'PRESENTE': 'PRESENCA_NORMAL',
  'COMPARECEU': 'PRESENCA_NORMAL',
  
  // Tags para Atraso
  '100% (C/ ATRASO)': 'ATRASO',
  'ATRASO': 'ATRASO',
  'A': 'ATRASO',
  
  // Tags para Ausências
  'ATESTADO': 'ATESTADO',
  'ATESTADO MÉDICO': 'ATESTADO',
  'LICENÇA MÉDICA': 'ATESTADO',
  
  // Tags para Férias
  'FÉRIAS': 'FERIAS',
  'FERIAS': 'FERIAS',
  'F': 'FERIAS',
  
  // Tags para Day Off
  'DAY OFF': 'DAY_OFF',
  'DAYOFF': 'DAY_OFF',
  'FOLGA': 'DAY_OFF',
  
  // Tags para dias não trabalhados
  'X': 'DIA_NAO_TRABALHADO',
  'FERIADO': 'FERIADO',
  'DOMINGO': 'DIA_NAO_TRABALHADO',
  'SABADO': 'DIA_NAO_TRABALHADO',
  'SÁBADO': 'DIA_NAO_TRABALHADO',
  
  // Adicione outras tags conforme necessário
};

// Função para normalizar e mapear uma tag
export const normalizarTag = (tagOriginal: string): string => {
  if (!tagOriginal || tagOriginal.trim() === '') {
    return tagOriginal;
  }
  
  // Limpa e padroniza para maiúsculas, removendo espaços extras
  const statusLimpo = tagOriginal.trim().toUpperCase();
  
  // Procura no mapa. Se não encontrar, usa a tag original limpa
  return mapeamentoTags[statusLimpo] || statusLimpo;
};

// Mapeamento reverso para exibição (tags internas -> tags amigáveis)
export const tagsAmigaveis: Record<string, string> = {
  'PRESENCA_NORMAL': 'Presença Normal',
  'ATRASO': 'Atraso', 
  'ATESTADO': 'Atestado',
  'FERIAS': 'Férias',
  'DAY_OFF': 'Day Off',
  'DIA_NAO_TRABALHADO': 'Dia não trabalhado',
  'FERIADO': 'Feriado'
};

// Função para obter nome amigável de uma tag
export const obterNomeAmigavel = (tagInterna: string): string => {
  return tagsAmigaveis[tagInterna] || tagInterna;
};
