// Mapeamento de tags de entrada para tags internas padronizadas
export const mapeamentoTags: Record<string, string> = {
  // Tags para Presença Normal
  '1': 'PRESENCA_NORMAL',
  'P': 'PRESENCA_NORMAL',
  '100%': 'PRESENCA_NORMAL',
  '1:': 'PRESENCA_NORMAL',
  'PRESENTE': 'PRESENCA_NORMAL',
  'COMPARECEU': 'PRESENCA_NORMAL',
  
  // Tags para Presença Parcial
  '0.25': 'PRESENCA_PARCIAL_25',
  '0.5': 'PRESENCA_PARCIAL_50',
  '0.75': 'PRESENCA_PARCIAL_75',
  
  // Tags para Atraso
  '100% (C/ ATRASO)': 'ATRASO',
  'ATRASO': 'ATRASO',
  'A': 'ATRASO',
  
  // Tags para Antecipação
  '100% (ANTECIP.)': 'ANTECIPACAO',
  'ANTECIPAÇÃO': 'ANTECIPACAO',
  'ANTECIPACAO': 'ANTECIPACAO',
  
  // Tags para Ausências
  'ATESTADO': 'ATESTADO',
  'ATESTADO MÉDICO': 'ATESTADO',
  'LICENÇA MÉDICA': 'ATESTADO',
  
  // Tags para Férias
  'FÉRIAS': 'FERIAS',
  'FERIAS': 'FERIAS',
  'F': 'FERIAS',
  
  // Tags para Faltas
  'FALTA': 'FALTA',
  'FALTAS': 'FALTA',
  
  // Tags para Abonado
  'ABONADO': 'ABONADO',
  'FALTA ABONADA': 'ABONADO',
  
  // Tags para Folgas
  'FOLGA CONCEDIDA': 'FOLGA_CONCEDIDA',
  'FOLGA COMPENSADA': 'FOLGA_COMPENSADA',
  'DAY OFF': 'DAY_OFF',
  'DAYOFF': 'DAY_OFF',
  'FOLGA': 'FOLGA_CONCEDIDA',
  
  // Tags para Horas Extras
  'FEZ HORAS EXTRAS': 'HORAS_EXTRAS',
  'HORAS EXTRAS': 'HORAS_EXTRAS',
  'HE': 'HORAS_EXTRAS',
  
  // Tags para Integração
  'INTEGRAÇÃO RH': 'INTEGRACAO_RH',
  'INTEGRACAO RH': 'INTEGRACAO_RH',
  'INTEGRAÇÃO': 'INTEGRACAO_RH',
  
  // Tags para Compensação
  'COMPENSAÇÃO': 'COMPENSACAO',
  'COMPESAÇÃO': 'COMPENSACAO', // Corrige erro de grafia
  'COMPENSACAO': 'COMPENSACAO',
  
  // Tags para Desligamento
  'DESLIGADO': 'DESLIGADO',
  'DESLIGAMENTO': 'DESLIGADO',
  
  // Tags para Não Iniciado
  'NÃO INICIOU': 'NAO_INICIOU',
  'NAO INICIOU': 'NAO_INICIOU',
  'NÃO INICIADO': 'NAO_INICIOU',
  
  // Tags para Mudança de Turno
  'TRABALHOU 1º TURNO': 'TRABALHOU_1_TURNO',
  'TRABALHOU 2º TURNO': 'TRABALHOU_2_TURNO',
  'TRABALHOU 1 TURNO': 'TRABALHOU_1_TURNO',
  'TRABALHOU 2 TURNO': 'TRABALHOU_2_TURNO',
  
  // Tags para dias não trabalhados
  'X': 'DIA_NAO_TRABALHADO',
  'FERIADO': 'FERIADO',
  'DOMINGO': 'DIA_NAO_TRABALHADO',
  'SABADO': 'DIA_NAO_TRABALHADO',
  'SÁBADO': 'DIA_NAO_TRABALHADO',
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
  'PRESENCA_PARCIAL_25': 'Presença Parcial (25%)',
  'PRESENCA_PARCIAL_50': 'Presença Parcial (50%)',
  'PRESENCA_PARCIAL_75': 'Presença Parcial (75%)',
  'ATRASO': 'Atraso',
  'ANTECIPACAO': 'Antecipação',
  'ATESTADO': 'Atestado',
  'FERIAS': 'Férias',
  'FALTA': 'Falta',
  'ABONADO': 'Abonado',
  'FOLGA_CONCEDIDA': 'Folga Concedida',
  'FOLGA_COMPENSADA': 'Folga Compensada',
  'DAY_OFF': 'Day Off',
  'HORAS_EXTRAS': 'Horas Extras',
  'INTEGRACAO_RH': 'Integração RH',
  'COMPENSACAO': 'Compensação',
  'DESLIGADO': 'Desligado',
  'NAO_INICIOU': 'Não Iniciou',
  'TRABALHOU_1_TURNO': 'Trabalhou 1º Turno',
  'TRABALHOU_2_TURNO': 'Trabalhou 2º Turno',
  'DIA_NAO_TRABALHADO': 'Dia não trabalhado',
  'FERIADO': 'Feriado'
};

// Função para obter nome amigável de uma tag
export const obterNomeAmigavel = (tagInterna: string): string => {
  return tagsAmigaveis[tagInterna] || tagInterna;
};
