export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

// Retorna gift cards comprados pelo cliente
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "orderId é obrigatório" }, { status: 400 });
  }

  const isAdmin = (session.user as any)?.role === "ADMIN";

  // Verificar se o pedido pertence ao usuário (ou é admin) e está confirmado/entregue
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      ...(isAdmin ? {} : { userId: (session.user as any).id }),
      status: { in: ["CONFIRMED", "DELIVERED"] },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado ou não autorizado" }, { status: 404 });
  }

  // Buscar gift cards associados ao pedido
  const giftCards = await prisma.giftCard.findMany({
    where: { orderId: orderId },
    select: {
      id: true,
      numero: true,
      validade: true,
      cvv: true,
      nome: true,
      cpf: true,
      soldAt: true,
      product: { select: { name: true } },
    },
  });

  return NextResponse.json(giftCards);
}
