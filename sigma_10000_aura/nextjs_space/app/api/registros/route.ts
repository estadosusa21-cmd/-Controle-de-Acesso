
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validarCamposObrigatorios } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const transportadora = searchParams.get('transportadora');
    const cliente = searchParams.get('cliente');
    const tipoOperacao = searchParams.get('tipoOperacao');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const where: any = {};
    
    if (transportadora) {
      where.transportadora = { contains: transportadora, mode: 'insensitive' };
    }
    
    if (cliente) {
      where.cliente = { contains: cliente, mode: 'insensitive' };
    }
    
    if (tipoOperacao) {
      where.tipoOperacao = tipoOperacao;
    }
    
    if (status) {
      where.status = status;
    }
    
    const [registros, total] = await Promise.all([
      prisma.registro.findMany({
        where,
        orderBy: { dataHoraChegada: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.registro.count({ where })
    ]);

    return NextResponse.json({
      data: registros,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar registros:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar campos obrigatórios
    const erros = validarCamposObrigatorios(body);
    if (erros.length > 0) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: erros },
        { status: 400 }
      );
    }

    // Verificar se já existe um registro ativo com a mesma placa
    const registroExistente = await prisma.registro.findFirst({
      where: {
        placaCarreta: body.placaCarreta,
        status: 'No Pátio'
      }
    });

    let warning = null;
    if (registroExistente) {
      warning = {
        message: 'ATENÇÃO: Já existe um caminhoneiro com esta placa no pátio!',
        registro: {
          id: registroExistente.id,
          motorista: registroExistente.nomeMotorista,
          transportadora: registroExistente.transportadora,
          dataHoraChegada: registroExistente.dataHoraChegada
        }
      };
    }

    // Criar novo registro
    const novoRegistro = await prisma.registro.create({
      data: {
        dataHoraChegada: new Date(body.dataHoraChegada),
        transportadora: body.transportadora,
        placaCarreta: body.placaCarreta,
        placaCavalo: body.placaCavalo || null,
        nomeMotorista: body.nomeMotorista,
        rgCpfMotorista: body.rgCpfMotorista,
        temAjudante: body.temAjudante,
        nomeAjudante: body.nomeAjudante || null,
        rgCpfAjudante: body.rgCpfAjudante || null,
        tipoOperacao: body.tipoOperacao,
        cliente: body.cliente,
        assinaturaMotorista: body.assinaturaMotorista,
        status: 'No Pátio'
      }
    });

    return NextResponse.json({
      data: novoRegistro,
      warning
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar registro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
