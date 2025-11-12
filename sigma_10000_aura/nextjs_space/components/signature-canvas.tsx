
'use client';

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface SignatureCanvasProps {
  onSignatureChange?: (signature: string) => void;
  className?: string;
}

export interface SignatureCanvasRef {
  clear: () => void;
  getSignature: () => string;
  isEmpty: () => boolean;
}

export const CustomSignatureCanvas = forwardRef<SignatureCanvasRef, SignatureCanvasProps>(
  ({ onSignatureChange, className = '' }, ref) => {
    const signatureRef = useRef<SignatureCanvas>(null);

    useImperativeHandle(ref, () => ({
      clear: () => {
        signatureRef.current?.clear?.();
        onSignatureChange?.('');
      },
      getSignature: () => {
        if (signatureRef.current?.isEmpty?.()) {
          return '';
        }
        return signatureRef.current?.toDataURL?.() || '';
      },
      isEmpty: () => {
        return signatureRef.current?.isEmpty?.() || true;
      }
    }));

    const handleEnd = () => {
      if (signatureRef.current && !signatureRef.current.isEmpty()) {
        const signature = signatureRef.current.toDataURL();
        onSignatureChange?.(signature);
      }
    };

    const handleClear = () => {
      signatureRef.current?.clear?.();
      onSignatureChange?.('');
    };

    return (
      <div className={`space-y-2 ${className}`}>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-1 bg-white">
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              className: 'w-full h-32 rounded',
              style: { maxWidth: '100%' }
            }}
            backgroundColor="white"
            penColor="black"
            onEnd={handleEnd}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="w-full"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Limpar Assinatura
        </Button>
      </div>
    );
  }
);

CustomSignatureCanvas.displayName = 'CustomSignatureCanvas';
