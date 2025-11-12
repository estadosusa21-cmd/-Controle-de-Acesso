
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    if (!body.dataHoraSaida || !body.assinaturaResponsavel) {
      return NextResponse.json(
        { error: 'Data/hora de saída e assinatura do responsável são obrigatórias' },
        { status: 400 }
      );
    }

    // Verificar se o registro existe e está no pátio
    const registroExistente = await prisma.registro.findUnique({
      where: { id }
    });

    if (!registroExistente) {
      return NextResponse.json(
        { error: 'Registro não encontrado' },
        { status: 404 }
      );
    }

    if (registroExistente.status === 'Saiu') {
      return NextResponse.json(
        { error: 'Este registro já possui saída registrada' },
        { status: 400 }
      );
    }

    // Atualizar registro com dados da saída
    const registroAtualizado = await prisma.registro.update({
      where: { id },
      data: {
        dataHoraSaida: new Date(body.dataHoraSaida),
        assinaturaResponsavel: body.assinaturaResponsavel,
        status: 'Saiu'
      }
    });

    return NextResponse.json({ data: registroAtualizado });

  } catch (error) {
    console.error('Erro ao registrar saída:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
