import { NextRequest, NextResponse } from "next/server";
import { calculateTransparentPricing } from "@/lib/mock-data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      provider = "IYZICO",
      subtotalTry = 0,
      customerName,
      customerEmail,
      tcIdentityNo,
      city,
      items = [],
    } = body;

    if (!customerName || !tcIdentityNo || tcIdentityNo.length < 11) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Gümrük ETGB beyannamesi için Ad Soyad ve 11 haneli T.C. Kimlik Numarası zorunludur.",
        },
        { status: 400 }
      );
    }

    const pricing = calculateTransparentPricing(Number(subtotalTry));
    const generatedOrderNo = `EU-${Math.floor(10000 + Math.random() * 89999)}`;
    const generatedEtgbNo = `ETGB-2026-IST-${Math.floor(100000 + Math.random() * 899999)}`;
    const transactionId =
      provider === "IYZICO"
        ? `IYZ-3DS-${Date.now().toString().slice(-7)}`
        : `PAYTR-TOKEN-${Date.now().toString().slice(-7)}`;

    return NextResponse.json({
      success: true,
      provider,
      transactionId,
      orderNumber: generatedOrderNo,
      etgbDeclarationNo: generatedEtgbNo,
      airWaybillNo: `LH-${Math.floor(1000 + Math.random() * 8999)}-BER-IST`,
      customer: {
        customerName,
        customerEmail,
        city,
        tcIdentityMasked: `${tcIdentityNo.slice(0, 3)}*****${tcIdentityNo.slice(-3)}`,
      },
      pricing,
      itemCount: items.length,
      customsGuaranteeCertificate: {
        regime: "DDP (Delivered Duty Paid - Gümrük Vergisi Peşin Ödenmiş Teslim)",
        slaGuaranteeDays: "4-6 İş Günü (Gecikmede %15 Tutar İadesi)",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Ödeme servisi sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
