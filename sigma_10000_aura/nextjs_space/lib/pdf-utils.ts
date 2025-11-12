
import jsPDF from 'jspdf';
import { Registro, FiltrosRegistro } from '@/lib/types';

export function exportarPDF(
  registros: Registro[], 
  filtros: FiltrosRegistro, 
  tipo: 'painel' | 'historico'
) {
  const pdf = new jsPDF();
  
  // Configurar fonte (usar fonte padrão do jsPDF)
  pdf.setFont('helvetica');
  
  // Título
  pdf.setFontSize(18);
  pdf.setTextColor(31, 41, 55); // gray-800
  pdf.text('SIGMA 10000 AURA', 20, 25);
  
  pdf.setFontSize(14);
  pdf.text('Relatório de Controle de Acesso', 20, 35);
  
  // Data de geração
  pdf.setFontSize(10);
  pdf.setTextColor(107, 114, 128); // gray-500
  const agora = new Date().toLocaleString('pt-BR');
  pdf.text(`Gerado em: ${agora}`, 20, 45);
  
  // Filtros aplicados
  let yPos = 55;
  if (filtros.transportadora || filtros.cliente || filtros.tipoOperacao || filtros.status) {
    pdf.text('Filtros aplicados:', 20, yPos);
    yPos += 10;
    
    if (filtros.transportadora) {
      pdf.text(`• Transportadora: ${filtros.transportadora}`, 25, yPos);
      yPos += 7;
    }
    if (filtros.cliente) {
      pdf.text(`• Cliente: ${filtros.cliente}`, 25, yPos);
      yPos += 7;
    }
    if (filtros.tipoOperacao) {
      pdf.text(`• Tipo de Operação: ${filtros.tipoOperacao}`, 25, yPos);
      yPos += 7;
    }
    if (filtros.status) {
      pdf.text(`• Status: ${filtros.status}`, 25, yPos);
      yPos += 7;
    }
    
    yPos += 5;
  }
  
  // Cabeçalho da tabela
  pdf.setFontSize(8);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'bold');
  
  const headers = [
    'Data/Hora Chegada',
    'Motorista',
    'Transportadora',
    'Placa Carreta',
    'Cliente',
    'Operação',
    'Status'
  ];
  
  if (tipo === 'historico' || filtros.status === 'Saiu') {
    headers.push('Data/Hora Saída');
  }
  
  let xPos = 20;
  const colWidths = [25, 25, 25, 20, 25, 18, 15];
  if (headers.length > 7) colWidths.push(25);
  
  headers.forEach((header, i) => {
    pdf.text(header, xPos, yPos);
    xPos += colWidths[i] || 20;
  });
  
  yPos += 10;
  
  // Linha separadora
  pdf.setLineWidth(0.5);
  pdf.line(20, yPos - 5, 190, yPos - 5);
  
  // Dados
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  
  registros.forEach((registro, index) => {
    if (yPos > 270) { // Nova página se necessário
      pdf.addPage();
      yPos = 20;
      
      // Re-adicionar cabeçalho na nova página
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      xPos = 20;
      headers.forEach((header, i) => {
        pdf.text(header, xPos, yPos);
        xPos += colWidths[i] || 20;
      });
      yPos += 10;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
    }
    
    xPos = 20;
    const rowData = [
      new Date(registro.dataHoraChegada).toLocaleString('pt-BR'),
      registro.nomeMotorista.substring(0, 20), // Limitar tamanho
      registro.transportadora.substring(0, 20),
      registro.placaCarreta,
      registro.cliente.substring(0, 20),
      registro.tipoOperacao,
      registro.status
    ];
    
    if (tipo === 'historico' || filtros.status === 'Saiu') {
      rowData.push(
        registro.dataHoraSaida 
          ? new Date(registro.dataHoraSaida).toLocaleString('pt-BR')
          : '-'
      );
    }
    
    rowData.forEach((data, i) => {
      pdf.text(data || '-', xPos, yPos);
      xPos += colWidths[i] || 20;
    });
    
    yPos += 8;
    
    // Linha separadora a cada 5 registros
    if ((index + 1) % 5 === 0) {
      pdf.setLineWidth(0.2);
      pdf.line(20, yPos - 2, 190, yPos - 2);
      yPos += 3;
    }
  });
  
  // Rodapé
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.text(`Página ${i} de ${totalPages}`, 20, 285);
    pdf.text(`Total de registros: ${registros.length}`, 150, 285);
  }
  
  // Salvar arquivo
  const nomeArquivo = `sigma_relatorio_${tipo}_${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(nomeArquivo);
}
