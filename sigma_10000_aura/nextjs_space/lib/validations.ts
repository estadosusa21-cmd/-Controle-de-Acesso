
export const validarPlacaBrasil = (placa: string): boolean => {
  if (!placa) return false;
  
  // Remove espaços e converte para maiúscula
  const placaLimpa = placa.replace(/\s/g, '').toUpperCase();
  
  // Padrão antigo: ABC-1234
  const padraoAntigo = /^[A-Z]{3}[-\s]?[0-9]{4}$/;
  
  // Padrão Mercosul: ABC1D23
  const padraoMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  
  return padraoAntigo.test(placaLimpa) || padraoMercosul.test(placaLimpa);
};

export const formatarPlaca = (placa: string): string => {
  if (!placa) return '';
  
  const placaLimpa = placa.replace(/[^A-Z0-9]/g, '').toUpperCase();
  
  // Se tem 7 caracteres (formato antigo)
  if (placaLimpa.length === 7) {
    return placaLimpa.replace(/^([A-Z]{3})([0-9]{4})$/, '$1-$2');
  }
  
  // Se tem 7 caracteres (formato Mercosul)
  if (placaLimpa.length === 7 && /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(placaLimpa)) {
    return placaLimpa;
  }
  
  return placa;
};

export const validarCamposObrigatorios = (dados: any): string[] => {
  const erros: string[] = [];
  
  if (!dados.transportadora?.trim()) {
    erros.push('Transportadora é obrigatória');
  }
  
  if (!dados.placaCarreta?.trim()) {
    erros.push('Placa da carreta é obrigatória');
  } else if (!validarPlacaBrasil(dados.placaCarreta)) {
    erros.push('Formato de placa da carreta inválido');
  }
  
  if (dados.placaCavalo && !validarPlacaBrasil(dados.placaCavalo)) {
    erros.push('Formato de placa do cavalo inválido');
  }
  
  if (!dados.nomeMotorista?.trim()) {
    erros.push('Nome do motorista é obrigatório');
  }
  
  if (!dados.rgCpfMotorista?.trim()) {
    erros.push('RG/CPF do motorista é obrigatório');
  }
  
  if (!dados.cliente?.trim()) {
    erros.push('Cliente é obrigatório');
  }
  
  if (!dados.tipoOperacao) {
    erros.push('Tipo de operação é obrigatório');
  }
  
  if (!dados.assinaturaMotorista?.trim()) {
    erros.push('Assinatura do motorista é obrigatória');
  }
  
  if (dados.temAjudante) {
    if (!dados.nomeAjudante?.trim()) {
      erros.push('Nome do ajudante é obrigatório quando tem ajudante');
    }
    if (!dados.rgCpfAjudante?.trim()) {
      erros.push('RG/CPF do ajudante é obrigatório quando tem ajudante');
    }
  }
  
  return erros;
};
