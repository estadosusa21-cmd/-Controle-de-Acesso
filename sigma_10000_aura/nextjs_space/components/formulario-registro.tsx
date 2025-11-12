'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomSignatureCanvas, SignatureCanvasRef } from '@/components/signature-canvas';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validarPlacaBrasil, formatarPlaca } from '@/lib/validations';
import { toast } from '@/hooks/use-toast';
import { Truck, User, FileText, PenTool, AlertTriangle, CheckCircle, Plus, Trash2 } from 'lucide-react';

interface Ajudante {
  nome: string;
  rgCpf: string;
}

export function FormularioRegistro() {
  const router = useRouter();
  const signatureRef = useRef<SignatureCanvasRef>(null);

  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<any>(null);
  const [assinaturaPreenchida, setAssinaturaPreenchida] = useState(false);

  const [formData, setFormData] = useState({
    dataHoraChegada: new Date().toISOString().slice(0, 16),
    transportadora: '',
    placaCarreta: '',
    placaCavalo: '',
    nomeMotorista: '',
    rgCpfMotorista: '',
    temAjudante: false,
    tipoOperacao: '' as 'Descarregar' | 'Coletar' | '',
    cliente: ''
  });

  const [ajudantes, setAjudantes] = useState<Ajudante[]>([{ nome: '', rgCpf: '' }]);

  const [placaErrors, setPlacaErrors] = useState({
    carreta: false,
    cavalo: false
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'placaCarreta' || field === 'placaCavalo') {
      const formattedValue = formatarPlaca(value);
      setFormData(prev => ({ ...prev, [field]: formattedValue }));

      if (value && !validarPlacaBrasil(value)) {
        setPlacaErrors(prev => ({ 
          ...prev, 
          [field === 'placaCarreta' ? 'carreta' : 'cavalo']: true 
        }));
      } else {
        setPlacaErrors(prev => ({ 
          ...prev, 
          [field === 'placaCarreta' ? 'carreta' : 'cavalo']: false 
        }));
      }
    }

    if (field === 'temAjudante' && !value) {
      setAjudantes([{ nome: '', rgCpf: '' }]);
    }
  };

  const adicionarAjudante = () => {
    setAjudantes([...ajudantes, { nome: '', rgCpf: '' }]);
  };

  const removerAjudante = (index: number) => {
    if (ajudantes.length > 1) {
      const novosAjudantes = ajudantes.filter((_, i) => i !== index);
      setAjudantes(novosAjudantes);
    }
  };

  const atualizarAjudante = (index: number, campo: 'nome' | 'rgCpf', valor: string) => {
    const novosAjudantes = [...ajudantes];
    novosAjudantes[index][campo] = valor;
    setAjudantes(novosAjudantes);
  };

  const validarFormulario = (): string[] => {
    const erros: string[] = [];

    if (!formData.transportadora.trim()) erros.push('Transportadora é obrigatória');
    if (!formData.placaCarreta.trim()) erros.push('Placa da carreta é obrigatória');
    if (!formData.nomeMotorista.trim()) erros.push('Nome do motorista é obrigatório');
    if (!formData.rgCpfMotorista.trim()) erros.push('RG/CPF do motorista é obrigatório');
    if (!formData.cliente.trim()) erros.push('Cliente é obrigatório');
    if (!formData.tipoOperacao) erros.push('Tipo de operação é obrigatório');

    if (formData.placaCarreta && !validarPlacaBrasil(formData.placaCarreta)) {
      erros.push('Formato da placa da carreta é inválido');
    }

    if (formData.placaCavalo && !validarPlacaBrasil(formData.placaCavalo)) {
      erros.push('Formato da placa do cavalo é inválido');
    }

    if (formData.temAjudante) {
      ajudantes.forEach((ajudante, index) => {
        if (!ajudante.nome.trim()) erros.push(`Nome do ajudante ${index + 1} é obrigatório`);
        if (!ajudante.rgCpf.trim()) erros.push(`RG/CPF do ajudante ${index + 1} é obrigatório`);
      });
    }

    if (!assinaturaPreenchida) {
      erros.push('Assinatura do motorista é obrigatória');
    }

    return erros;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const erros = validarFormulario();
    if (erros.length > 0) {
      toast({
        title: 'Dados inválidos',
        description: erros.join(', '),
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setWarning(null);

    try {
      const assinaturaMotorista = signatureRef.current?.getSignature() || '';

      const dadosRegistro = {
        ...formData,
        ajudantes: formData.temAjudante ? ajudantes : [],
        assinaturaMotorista
      };

      const response = await fetch('/api/registros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosRegistro)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar registro');
      }

      if (data.warning) {
        setWarning(data.warning);
      }

      toast({
        title: 'Registro salvo com sucesso!',
        description: `Entrada de ${formData.nomeMotorista} registrada`,
      });

      setFormData({
        dataHoraChegada: new Date().toISOString().slice(0, 16),
        transportadora: '',
        placaCarreta: '',
        placaCavalo: '',
        nomeMotorista: '',
        rgCpfMotorista: '',
        temAjudante: false,
        tipoOperacao: '',
        cliente: ''
      });

      setAjudantes([{ nome: '', rgCpf: '' }]);
      setAssinaturaPreenchida(false);
      signatureRef.current?.clear?.();

      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao salvar registro:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Erro interno do servidor',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {warning && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="font-semibold">{warning.message}</div>
            <div className="mt-2 text-sm">
              Registro existente: {warning.registro.motorista} - {warning.registro.transportadora}
              <br />
              Chegada: {new Date(warning.registro.dataHoraChegada).toLocaleString('pt-BR')}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Dados do Veículo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataHoraChegada">Data e Hora de Chegada *</Label>
              <Input
                id="dataHoraChegada"
                type="datetime-local"
                value={formData.dataHoraChegada}
                onChange={(e) => handleInputChange('dataHoraChegada', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="transportadora">Transportadora *</Label>
              <Input
                id="transportadora"
                value={formData.transportadora}
                onChange={(e) => handleInputChange('transportadora', e.target.value)}
                placeholder="Nome da transportadora"
                required
              />
            </div>

            <div>
              <Label htmlFor="placaCarreta">Placa da Carreta *</Label>
              <Input
                id="placaCarreta"
                value={formData.placaCarreta}
                onChange={(e) => handleInputChange('placaCarreta', e.target.value)}
                placeholder="ABC-1234 ou ABC1D23"
                required
                className={placaErrors.carreta ? 'border-red-500' : ''}
              />
              {placaErrors.carreta && (
                <p className="text-sm text-red-500 mt-1">
                  Formato inválido. Use ABC-1234 ou ABC1D23
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="placaCavalo">Placa do Cavalo</Label>
              <Input
                id="placaCavalo"
                value={formData.placaCavalo}
                onChange={(e) => handleInputChange('placaCavalo', e.target.value)}
                placeholder="ABC-1234 ou ABC1D23 (opcional)"
                className={placaErrors.cavalo ? 'border-red-500' : ''}
              />
              {placaErrors.cavalo && (
                <p className="text-sm text-red-500 mt-1">
                  Formato inválido. Use ABC-1234 ou ABC1D23
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados do Motorista
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nomeMotorista">Nome do Motorista *</Label>
              <Input
                id="nomeMotorista"
                value={formData.nomeMotorista}
                onChange={(e) => handleInputChange('nomeMotorista', e.target.value)}
                placeholder="Nome completo"
                required
              />
            </div>

            <div>
              <Label htmlFor="rgCpfMotorista">RG/CPF do Motorista *</Label>
              <Input
                id="rgCpfMotorista"
                value={formData.rgCpfMotorista}
                onChange={(e) => handleInputChange('rgCpfMotorista', e.target.value)}
                placeholder="Documento de identificação"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="temAjudante"
                checked={formData.temAjudante}
                onCheckedChange={(checked) => handleInputChange('temAjudante', checked)}
              />
              <Label htmlFor="temAjudante">Tem ajudante?</Label>
            </div>

            {formData.temAjudante && (
              <div className="space-y-3 pl-6 border-l-4 border-blue-200 bg-blue-50 p-4 rounded-r-lg">
                {ajudantes.map((ajudante, index) => (
                  <div key={index} className="space-y-3 p-3 bg-white rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold text-blue-700">Ajudante {index + 1}</Label>
                      {ajudantes.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removerAjudante(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`nomeAjudante${index}`}>Nome do Ajudante *</Label>
                        <Input
                          id={`nomeAjudante${index}`}
                          value={ajudante.nome}
                          onChange={(e) => atualizarAjudante(index, 'nome', e.target.value)}
                          placeholder="Nome completo do ajudante"
                          required={formData.temAjudante}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`rgCpfAjudante${index}`}>RG/CPF do Ajudante *</Label>
                        <Input
                          id={`rgCpfAjudante${index}`}
                          value={ajudante.rgCpf}
                          onChange={(e) => atualizarAjudante(index, 'rgCpf', e.target.value)}
                          placeholder="Documento do ajudante"
                          required={formData.temAjudante}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={adicionarAjudante}
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Outro Ajudante
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Dados da Operação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipoOperacao">Tipo de Operação *</Label>
              <Select
                value={formData.tipoOperacao}
                onValueChange={(value: 'Descarregar' | 'Coletar') => 
                  handleInputChange('tipoOperacao', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Descarregar">Descarregar</SelectItem>
                  <SelectItem value="Coletar">Coletar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cliente">Cliente *</Label>
              <Input
                id="cliente"
                value={formData.cliente}
                onChange={(e) => handleInputChange('cliente', e.target.value)}
                placeholder="Nome do cliente"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Assinatura Digital
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Assinatura do Motorista *</Label>
            <div className="mt-2">
              <CustomSignatureCanvas 
                ref={signatureRef}
                onSignatureChange={(signature) => {
                  setAssinaturaPreenchida(signature.length > 0);
                }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              O motorista deve assinar no campo acima para confirmar os dados fornecidos
            </p>
            {assinaturaPreenchida && (
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Assinatura confirmada
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/')}
        >
          Cancelar
        </Button>

        <Button type="submit" disabled={loading} className="min-w-32">
          {loading ? (
            'Salvando...'
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Salvar Registro
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
