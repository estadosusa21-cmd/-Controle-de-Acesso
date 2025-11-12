
'use client';

import { useEffect, useState } from 'react';
import { Registro, FiltrosRegistro } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History, Search, FileDown, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { exportarPDF } from '@/lib/pdf-utils';
import { toast } from '@/hooks/use-toast';

interface Estatisticas {
  totalNoPatio: number;
  totalSaiu: number;
  total: number;
  transportadoras: string[];
  clientes: string[];
}

export function HistoricoCompleto() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosRegistro>({});
  const [busca, setBusca] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);

  const buscarDados = async (pagina = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagina.toString(),
        limit: '20',
        ...(filtros.transportadora && { transportadora: filtros.transportadora }),
        ...(filtros.cliente && { cliente: filtros.cliente }),
        ...(filtros.tipoOperacao && { tipoOperacao: filtros.tipoOperacao }),
        ...(filtros.status && { status: filtros.status })
      });

      const [registrosResponse, estatisticasResponse] = await Promise.all([
        fetch(`/api/registros?${params}`),
        fetch('/api/registros/estatisticas')
      ]);

      const registrosData = await registrosResponse.json();
      const estatisticasData = await estatisticasResponse.json();

      setRegistros(registrosData.data || []);
      setTotalPaginas(registrosData.pagination?.pages || 1);
      setTotalRegistros(registrosData.pagination?.total || 0);
      setPaginaAtual(pagina);
      setEstatisticas(estatisticasData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar histórico',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarDados(1);
  }, [filtros]);

  const registrosFiltrados = registros.filter(registro => {
    if (!busca) return true;
    
    const buscaLower = busca.toLowerCase();
    return (
      registro.placaCarreta.toLowerCase().includes(buscaLower) ||
      registro.nomeMotorista.toLowerCase().includes(buscaLower) ||
      registro.transportadora.toLowerCase().includes(buscaLower) ||
      registro.cliente.toLowerCase().includes(buscaLower)
    );
  });

  const limparFiltros = () => {
    setFiltros({});
    setBusca('');
    setPaginaAtual(1);
  };

  const handleExportarPDF = () => {
    exportarPDF(registrosFiltrados, filtros, 'historico');
  };

  const calcularTempoPermancia = (chegada: Date, saida?: Date | null): string => {
    const dataChegada = new Date(chegada);
    const dataSaida = saida ? new Date(saida) : new Date();
    
    const diffMs = dataSaida.getTime() - dataChegada.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m`;
    }
    return `${diffMins}m`;
  };

  if (loading && paginaAtual === 1) {
    return <div className="text-center py-8">Carregando histórico...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Resumo Estatístico */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total de Registros</p>
                  <p className="text-3xl font-bold text-blue-900">{estatisticas.total}</p>
                </div>
                <History className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Processados</p>
                  <p className="text-3xl font-bold text-green-900">{estatisticas.totalSaiu}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">No Pátio</p>
                  <p className="text-3xl font-bold text-orange-900">{estatisticas.totalNoPatio}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Transportadoras</p>
                  <p className="text-3xl font-bold text-purple-900">{estatisticas.transportadoras.length}</p>
                </div>
                <Search className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <Input
              placeholder="Buscar por placa, motorista, transportadora..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="md:col-span-2"
            />

            <Select value={filtros.transportadora || '__all__'} onValueChange={(value) => 
              setFiltros(prev => ({ ...prev, transportadora: value === '__all__' ? undefined : value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Transportadora" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todas</SelectItem>
                {estatisticas?.transportadoras?.map((transportadora) => (
                  <SelectItem key={transportadora} value={transportadora}>
                    {transportadora}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filtros.tipoOperacao || '__all__'} onValueChange={(value) => 
              setFiltros(prev => ({ ...prev, tipoOperacao: value === '__all__' ? undefined : value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Operação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos</SelectItem>
                <SelectItem value="Descarregar">Descarregar</SelectItem>
                <SelectItem value="Coletar">Coletar</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtros.status || '__all__'} onValueChange={(value) => 
              setFiltros(prev => ({ ...prev, status: value === '__all__' ? undefined : value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos</SelectItem>
                <SelectItem value="No Pátio">No Pátio</SelectItem>
                <SelectItem value="Saiu">Saiu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" onClick={limparFiltros}>
                Limpar Filtros
              </Button>
              <Button onClick={handleExportarPDF}>
                <FileDown className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
            
            <div className="text-sm text-gray-600">
              Mostrando {registrosFiltrados.length} de {totalRegistros} registros
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Registros</CardTitle>
        </CardHeader>
        <CardContent>
          {registrosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum registro encontrado</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {registrosFiltrados.map((registro) => (
                  <div
                    key={registro.id}
                    className={`border rounded-lg p-4 transition-colors ${
                      registro.status === 'No Pátio' ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      {/* Data/Hora Chegada */}
                      <div>
                        <p className="text-sm text-gray-500">Chegada</p>
                        <p className="font-medium text-sm">
                          {new Date(registro.dataHoraChegada).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(registro.dataHoraChegada).toLocaleTimeString('pt-BR')}
                        </p>
                      </div>

                      {/* Motorista e Transportadora */}
                      <div>
                        <p className="text-sm text-gray-500">Motorista</p>
                        <p className="font-medium text-sm">{registro.nomeMotorista}</p>
                        <p className="text-xs text-gray-600">{registro.transportadora}</p>
                        {registro.temAjudante && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            + Ajudante
                          </Badge>
                        )}
                      </div>

                      {/* Placas */}
                      <div>
                        <p className="text-sm text-gray-500">Placas</p>
                        <p className="font-medium text-sm">{registro.placaCarreta}</p>
                        {registro.placaCavalo && (
                          <p className="text-xs text-gray-600">{registro.placaCavalo}</p>
                        )}
                      </div>

                      {/* Cliente e Operação */}
                      <div>
                        <p className="text-sm text-gray-500">Cliente</p>
                        <p className="font-medium text-sm">{registro.cliente}</p>
                        <Badge 
                          variant={registro.tipoOperacao === 'Descarregar' ? 'default' : 'secondary'}
                          className="text-xs mt-1"
                        >
                          {registro.tipoOperacao}
                        </Badge>
                      </div>

                      {/* Status e Saída */}
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <Badge 
                          variant={registro.status === 'No Pátio' ? 'destructive' : 'default'}
                          className="text-xs"
                        >
                          {registro.status}
                        </Badge>
                        {registro.dataHoraSaida && (
                          <div className="mt-1">
                            <p className="text-xs text-gray-600">
                              Saída: {new Date(registro.dataHoraSaida).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Tempo de Permanência */}
                      <div>
                        <p className="text-sm text-gray-500">Tempo</p>
                        <p className="font-medium text-sm">
                          {calcularTempoPermancia(registro.dataHoraChegada, registro.dataHoraSaida)}
                        </p>
                        {registro.status === 'No Pátio' && (
                          <p className="text-xs text-blue-600">Em andamento</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginação */}
              {totalPaginas > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => buscarDados(paginaAtual - 1)}
                    disabled={paginaAtual === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPaginas - 4, paginaAtual - 2)) + i;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === paginaAtual ? "default" : "outline"}
                          size="sm"
                          onClick={() => buscarDados(pageNum)}
                          className="w-10 h-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => buscarDados(paginaAtual + 1)}
                    disabled={paginaAtual === totalPaginas}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
