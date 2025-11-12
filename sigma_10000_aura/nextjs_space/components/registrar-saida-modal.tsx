
'use client';

import { useState, useRef } from 'react';
import { Registro } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomSignatureCanvas, SignatureCanvasRef } from '@/components/signature-canvas';
import { toast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';

interface RegistrarSaidaModalProps {
  registro: Registro;
  onClose: () => void;
  onSuccess: () => void;
}

export function RegistrarSaidaModal({ registro, onClose, onSuccess }: RegistrarSaidaModalProps) {
  const [loading, setLoading] = useState(false);
  const [dataHoraSaida, setDataHoraSaida] = useState(
    new Date().toISOString().slice(0, 16)
  );
  
  const signatureRef = useRef<SignatureCanvasRef>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      toast({
        title: 'Assinatura obrigatória',
        description: 'Por favor, assine para confirmar a saída',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    
    try {
      const assinaturaResponsavel = signatureRef.current.getSignature();
      
      const response = await fetch(`/api/registros/${registro.id}/saida`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataHoraSaida,
          assinaturaResponsavel
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao registrar saída');
      }

      toast({
        title: 'Saída registrada!',
        description: `Saída de ${registro.nomeMotorista} registrada com sucesso`,
      });

      onSuccess();
      
    } catch (error: any) {
      console.error('Erro ao registrar saída:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao registrar saída',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Registrar Saída
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do registro */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Dados do Caminhoneiro</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-blue-700">Motorista:</span>
                <p className="font-medium">{registro.nomeMotorista}</p>
              </div>
              <div>
                <span className="text-blue-700">Placa:</span>
                <p className="font-medium">{registro.placaCarreta}</p>
              </div>
              <div>
                <span className="text-blue-700">Transportadora:</span>
                <p className="font-medium">{registro.transportadora}</p>
              </div>
              <div>
                <span className="text-blue-700">Chegada:</span>
                <p className="font-medium">
                  {new Date(registro.dataHoraChegada).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="dataHoraSaida">Data e Hora de Saída *</Label>
              <Input
                id="dataHoraSaida"
                type="datetime-local"
                value={dataHoraSaida}
                onChange={(e) => setDataHoraSaida(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Assinatura do Responsável pela Liberação *</Label>
              <CustomSignatureCanvas ref={signatureRef} />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Processando...' : 'Registrar Saída'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
