
'use client';

import { useEffect, useState } from 'react';
import { Registro, FiltrosRegistro } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Users, ArrowRight, Search, Filter, FileDown } from 'lucide-react';
import { RegistrarSaidaModal } from '@/components/registrar-saida-modal';
import { exportarPDF } from '@/lib/pdf-utils';
import { toast } from '@/hooks/use-toast';

interface Estatisticas {
  totalNoPatio: number;
  totalSaiu: number;
  total: number;
  transportadoras: string[];
  clientes: string[];
}

export function PainelControle() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosRegistro>({ status: 'No Pátio' });
  const [busca, setBusca] = useState('');
  const [registroSaida, setRegistroSaida] = useState<Registro | null>(null);

  const buscarDados = async () => {
    setLoading(true);
    try {
      const [registrosResponse, estatisticasResponse] = await Promise.all([
        fetch('/api/registros?' + new URLSearchParams({ 
          ...(filtros.transportadora && { transportadora: filtros.transportadora }),
          ...(filtros.cliente && { cliente: filtros.cliente }),
          ...(filtros.tipoOperacao && { tipoOperacao: filtros.tipoOperacao }),
          status: filtros.status || 'No Pátio'
        })),
        fetch('/api/registros/estatisticas')
      ]);

      const registrosData = await registrosResponse.json();
      const estatisticasData = await estatisticasResponse.json();

      setRegistros(registrosData.data || []);
      setEstatisticas(estatisticasData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarDados();
  }, [filtros]);

  const registrosFiltrados = registros.filter(registro => {
    if (!busca) return true;
    
    const buscaLower = busca.toLowerCase();
    return (
      registro.placaCarreta.toLowerCase().includes(buscaLower) ||
      registro.nomeMotorista.toLowerCase().includes(buscaLower) ||
      registro.transportadora.toLowerCase().includes(buscaLower)
    );
  });

  const limparFiltros = () => {
    setFiltros({ status: 'No Pátio' });
    setBusca('');
  };

  const handleExportarPDF = () => {
    exportarPDF(registrosFiltrados, filtros, 'painel');
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">No Pátio</CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{estatisticas.totalNoPatio}</div>
              <p className="text-xs text-blue-600">caminhoneiros ativos</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Saídas Hoje</CardTitle>
              <ArrowRight className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{estatisticas.totalSaiu}</div>
              <p className="text-xs text-green-600">registros processados</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Total Geral</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{estatisticas.total}</div>
              <p className="text-xs text-purple-600">registros totais</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Transportadoras</CardTitle>
              <Filter className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{estatisticas.transportadoras.length}</div>
              <p className="text-xs text-orange-600">empresas ativas</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
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
              placeholder="Buscar por placa ou motorista..."
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

            <Select value={filtros.status || 'No Pátio'} onValueChange={(value) => 
              setFiltros(prev => ({ ...prev, status: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="No Pátio">No Pátio</SelectItem>
                <SelectItem value="Saiu">Saiu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={limparFiltros}>
              Limpar Filtros
            </Button>
            <Button onClick={handleExportarPDF}>
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Registros */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filtros.status === 'No Pátio' ? 'Caminhoneiros no Pátio' : 'Histórico de Registros'} 
            ({registrosFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {registrosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum registro encontrado com os filtros aplicados
            </div>
          ) : (
            <div className="space-y-4">
              {registrosFiltrados.map((registro) => (
                <div
                  key={registro.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Chegada</p>
                        <p className="font-medium">
                          {new Date(registro.dataHoraChegada).toLocaleString('pt-BR')}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Motorista</p>
                        <p className="font-medium">{registro.nomeMotorista}</p>
                        <p className="text-sm text-gray-600">{registro.transportadora}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Placas</p>
                        <p className="font-medium">{registro.placaCarreta}</p>
                        {registro.placaCavalo && (
                          <p className="text-sm text-gray-600">{registro.placaCavalo}</p>
                        )}
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Cliente</p>
                        <p className="font-medium">{registro.cliente}</p>
                        <Badge variant={registro.tipoOperacao === 'Descarregar' ? 'default' : 'secondary'}>
                          {registro.tipoOperacao}
                        </Badge>
                      </div>
                    </div>

                    {registro.status === 'No Pátio' && (
                      <Button 
                        onClick={() => setRegistroSaida(registro)}
                        className="shrink-0"
                      >
                        Registrar Saída
                      </Button>
                    )}

                    {registro.status === 'Saiu' && (
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Saída</p>
                        <p className="font-medium">
                          {registro.dataHoraSaida 
                            ? new Date(registro.dataHoraSaida).toLocaleString('pt-BR')
                            : '-'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Registro de Saída */}
      {registroSaida && (
        <RegistrarSaidaModal
          registro={registroSaida}
          onClose={() => setRegistroSaida(null)}
          onSuccess={() => {
            setRegistroSaida(null);
            buscarDados();
          }}
        />
      )}
    </div>
  );
}
