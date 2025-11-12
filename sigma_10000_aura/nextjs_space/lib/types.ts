
export interface Registro {
  id: string;
  dataHoraChegada: Date;
  transportadora: string;
  placaCarreta: string;
  placaCavalo?: string | null;
  nomeMotorista: string;
  rgCpfMotorista: string;
  temAjudante: boolean;
  nomeAjudante?: string | null;
  rgCpfAjudante?: string | null;
  tipoOperacao: 'Descarregar' | 'Coletar';
  cliente: string;
  assinaturaMotorista: string;
  dataHoraSaida?: Date | null;
  assinaturaResponsavel?: string | null;
  status: 'No Pátio' | 'Saiu';
  createdAt: Date;
  updatedAt: Date;
}

export interface NovoRegistro {
  dataHoraChegada: string;
  transportadora: string;
  placaCarreta: string;
  placaCavalo?: string;
  nomeMotorista: string;
  rgCpfMotorista: string;
  temAjudante: boolean;
  nomeAjudante?: string;
  rgCpfAjudante?: string;
  tipoOperacao: 'Descarregar' | 'Coletar';
  cliente: string;
  assinaturaMotorista: string;
}

export interface RegistroSaida {
  id: string;
  dataHoraSaida: string;
  assinaturaResponsavel: string;
}

export interface FiltrosRegistro {
  transportadora?: string;
  cliente?: string;
  tipoOperacao?: string;
  status?: string;
}
