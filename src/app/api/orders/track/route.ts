import { NextRequest, NextResponse } from "next/server";
import { INITIAL_ORDERS, ORDER_STAGE_META, OrderStageStatus } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.trim().toUpperCase();

  if (!code) {
    return NextResponse.json({
      success: true,
      orders: INITIAL_ORDERS,
      stages: ORDER_STAGE_META,
    });
  }

  const found = INITIAL_ORDERS.find(
    (o) =>
      o.orderNumber.toUpperCase() === code ||
      o.etgbDeclarationNo.toUpperCase() === code ||
      o.airWaybillNo.toUpperCase() === code
  );

  if (!found) {
    return NextResponse.json(
      {
        success: false,
        message: "Belirtilen sipariş, ETGB veya AWB konşimento numarasına ait kayıt bulunamadı.",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    order: found,
    stages: ORDER_STAGE_META,
  });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNumber, newStage, operatorNote } = body as {
      orderNumber: string;
      newStage: OrderStageStatus;
      operatorNote?: string;
    };

    return NextResponse.json({
      success: true,
      orderNumber,
      newStage,
      operatorNote: operatorNote || "Lojistik operatörü tarafından aşama güncellendi.",
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Geçersiz istek formatı." },
      { status: 400 }
    );
  }
}
