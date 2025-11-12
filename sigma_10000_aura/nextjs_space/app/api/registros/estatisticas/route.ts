
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [
      totalNoPatio,
      totalSaiu,
      totalDescarregar,
      totalColetar,
      transportadorasUnicas,
      clientesUnicos
    ] = await Promise.all([
      prisma.registro.count({ where: { status: 'No Pátio' } }),
      prisma.registro.count({ where: { status: 'Saiu' } }),
      prisma.registro.count({ where: { tipoOperacao: 'Descarregar' } }),
      prisma.registro.count({ where: { tipoOperacao: 'Coletar' } }),
      prisma.registro.findMany({
        select: { transportadora: true },
        distinct: ['transportadora'],
        orderBy: { transportadora: 'asc' }
      }),
      prisma.registro.findMany({
        select: { cliente: true },
        distinct: ['cliente'],
        orderBy: { cliente: 'asc' }
      })
    ]);

    return NextResponse.json({
      totalNoPatio,
      totalSaiu,
      totalDescarregar,
      totalColetar,
      total: totalNoPatio + totalSaiu,
      transportadoras: transportadorasUnicas.map(t => t.transportadora),
      clientes: clientesUnicos.map(c => c.cliente)
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
