
export interface DashboardConfig {
  id: string;
  title: string;
  description: string;
  component: string;
  category: 'kpis' | 'analytics' | 'individual';
  isActive: boolean;
  order: number;
}

export interface KPIData {
  value: number;
  previousValue?: number;
  trend: 'up' | 'down' | 'stable';
  format: 'percentage' | 'number' | 'days';
}

export interface AssiduidadeKPIs {
  taxaAbsenteismo: KPIData;
  taxaAtrasos: KPIData;
  taxaPresencaProdutiva: KPIData;
  mediaTempoCasa: KPIData;
}
