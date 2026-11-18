"use client";

import React, { useState } from "react";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Plane,
  Lock,
  CheckCircle2,
  CreditCard,
  Sparkles,
  FileText,
  ArrowRight,
} from "lucide-react";
import {
  Product,
  ProductVariant,
  calculateTransparentPricing,
  OrderRecord,
} from "@/lib/mock-data";

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

interface SmartCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, variantId: string, delta: number) => void;
  onRemoveItem: (productId: string, variantId: string) => void;
  onClearCart: () => void;
  onOrderCreated: (newOrder: OrderRecord) => void;
}

export default function SmartCartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderCreated,
}: SmartCartDrawerProps) {
  const [step, setStep] = useState<"CART" | "CHECKOUT" | "SUCCESS">("CART");
  const [paymentProvider, setPaymentProvider] = useState<"IYZICO" | "PAYTR">("IYZICO");
  const [fullName, setFullName] = useState("Selin Yılmaz");
  const [email, setEmail] = useState("selin.yilmaz@example.com");
  const [phone, setPhone] = useState("+90 532 418 92 10");
  const [tcIdentity, setTcIdentity] = useState("24891048914");
  const [city, setCity] = useState("İstanbul / Beşiktaş");
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderRecord | null>(null);

  if (!isOpen) return null;

  const subtotalTry = items.reduce(
    (acc, item) =>
      acc + (item.product.priceTry + item.variant.priceDiffTry) * item.quantity,
    0
  );

  const pricing = calculateTransparentPricing(subtotalTry);
  const remainingForFreeShipping = Math.max(0, 5000 - subtotalTry);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch("/api/checkout/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: paymentProvider,
          subtotalTry,
          customerName: fullName,
          customerEmail: email,
          tcIdentityNo: tcIdentity,
          city,
          items,
        }),
      });
      const data = await response.json();

      const newOrder: OrderRecord = {
        id: `ord-${Date.now()}`,
        orderNumber: data.orderNumber || `EU-${Math.floor(10000 + Math.random() * 89999)}`,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        customerCity: city,
        tcIdentityMasked: `${tcIdentity.slice(0, 3)}*****${tcIdentity.slice(-3)}`,
        currentStage: "EU_WAREHOUSE",
        createdAt: "Şimdi (Canlı Sipariş)",
        guaranteedDeliveryDate: "4-6 İş Günü (SLA Garantili)",
        etgbDeclarationNo: data.etgbDeclarationNo || "ETGB-2026-IST-994120",
        airWaybillNo: data.airWaybillNo || "LH-7481-BER-IST",
        originHub: "Berlin Brandenburg Lojistik Merkezi (DE)",
        batchVerified: true,
        receiptHash: `SEP-EU-INV-${Math.floor(100000 + Math.random() * 899999)}`,
        pricing: {
          subtotalTry: pricing.subtotalTry,
          euLogisticsFeeTry: pricing.euLogisticsFeeTry,
          customsTaxTry: pricing.customsTaxTry,
          vipInsuranceTry: pricing.vipInsuranceTry,
          totalTry: pricing.totalTry,
        },
        items: items.map((it) => ({
          productId: it.product.id,
          name: it.product.name,
          brand: it.product.brand,
          variant: it.variant.name,
          quantity: it.quantity,
          unitPriceTry: it.product.priceTry + it.variant.priceDiffTry,
          batchCode: it.product.authenticityBatch,
          image: it.product.image,
        })),
        timeline: [
          {
            stage: "ORDER_CONFIRMED",
            title: `Sipariş & ${paymentProvider} 3D Secure Ödeme Onaylandı`,
            subtitle: "ETGB Gümrük Vergisi Koruması Aktif",
            description:
              "Siparişiniz onaylandı ve gümrük vergileri peşin ödenerek kur koruması altına alındı.",
            location: `${city} / Dijital Gümrük Kaydı`,
            timestamp: "Az Önce",
            operatorName: `${paymentProvider} Güvenli Ödeme Servisi`,
            badgeCode: "FIN-OK",
          },
          {
            stage: "EU_WAREHOUSE",
            title: "Avrupa Deposunda (Berlin Hub) Kalite & Batch Doğrulama",
            subtitle: "Orijinal Mağaza Fişi ve Barkod Eşleşmesi Başlatıldı",
            description:
              "Ürünleriniz Berlin depomuzda darbe emici termal pakete alınıyor.",
            location: "Berlin Brandenburg Hub, Almanya 🇩🇪",
            timestamp: "Şu Anda İşleniyor",
            operatorName: "Depo Denetçisi: Lukas Meyer",
            badgeCode: "BATCH-VERIFIED",
            telemetry: {
              batchCode: items[0]?.product.authenticityBatch || "EU-BATCH-2026",
              tempSensor: "18.1°C Termal Kabin",
            },
          },
          {
            stage: "EXPORT_CUSTOMS",
            title: "Gümrük İşleminde (AB İhracat)",
            subtitle: "Havalimanı Çıkış Manifestosu",
            description: "AB ihracat gümrük onayı.",
            location: "Berlin BER Cargo",
            timestamp: "Sıradaki Aşama",
            operatorName: "Zollamt Berlin",
            badgeCode: "EU-EXPORT",
          },
          {
            stage: "IN_FLIGHT_TRANSIT",
            title: "Uçuşta / Transit",
            subtitle: "Berlin -> İstanbul Hava Kargo",
            description: "Hava kargo uçuş aşaması.",
            location: "Hava Sahası",
            timestamp: "Planlanan",
            operatorName: "Turkish Cargo / Lufthansa",
            badgeCode: "AIR-TRANSIT",
          },
          {
            stage: "TR_CUSTOMS_HUB",
            title: "Türkiye Transfer Merkezinde",
            subtitle: "İstanbul Havalimanı ETGB Çıkışı",
            description: "Ek vergisiz hızlı ETGB çekimi.",
            location: "İstanbul Havalimanı (IST)",
            timestamp: "Planlanan",
            operatorName: "TR Gümrük Masası",
            badgeCode: "TR-HUB",
          },
          {
            stage: "OUT_FOR_DELIVERY",
            title: "VIP Kuryede",
            subtitle: "Son Mil Teslimat",
            description: "Adresinize kurye dağıtımı.",
            location: city,
            timestamp: "Planlanan",
            operatorName: "VIP Kurye",
            badgeCode: "LAST-MILE",
          },
          {
            stage: "DELIVERED",
            title: "Teslim Edildi",
            subtitle: "İmzalı Teslimat",
            description: "Orijinallik sertifikalı teslimat.",
            location: city,
            timestamp: "SLA Garantili",
            operatorName: "Müşteri Onayı",
            badgeCode: "SLA-DONE",
          },
        ],
      };

      setCreatedOrder(newOrder);
      onOrderCreated(newOrder);
      onClearCart();
      setStep("SUCCESS");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/75 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white text-slate-900 h-full flex flex-col shadow-2xl">
        {/* Üst Başlık */}
        <div className="p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              %100 Gümrük & Orijinallik Garantili Sepet
            </div>
            <h3 className="text-lg font-bold">
              {step === "CART" && `Akıllı Sepet & Vergi Şeffaflığı (${items.length})`}
              {step === "CHECKOUT" && "ETGB Gümrük Beyanı & Güvenli Ödeme"}
              {step === "SUCCESS" && "Siparişiniz & ETGB Dosyanız Oluşturuldu!"}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setStep("CART");
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ücretsiz Hava Kargo İlerleme Barı */}
        {step !== "SUCCESS" && (
          <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-950 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Plane className="w-4 h-4 text-indigo-600" />
                {remainingForFreeShipping === 0
                  ? "Tebrikler! Avrupa VIP Hava Kargo Ücretsiz!"
                  : `Ücretsiz Avrupa Hava Kargo için ${remainingForFreeShipping.toLocaleString("tr-TR")} ₺ kaldı`}
              </span>
              <span>{Math.min(100, Math.round((subtotalTry / 5000) * 100))}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-indigo-200 overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${Math.min(100, (subtotalTry / 5000) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* İçerik Alanı */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {step === "CART" && (
            <>
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <Plane className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-800">
                    Sepetinizde henüz ürün bulunmuyor
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Avrupa depolarımızda hazır bulunan Rhode, Space NK, Rare Beauty veya P.Louise ürünlerini hemen ekleyebilirsiniz.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => {
                    const unitPrice = item.product.priceTry + item.variant.priceDiffTry;
                    return (
                      <div
                        key={item.product.id + item.variant.id}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 flex gap-3.5"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-20 h-20 rounded-xl object-cover border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-600">
                              {item.product.originFlag} {item.product.brand}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                onRemoveItem(item.product.id, item.variant.id)
                              }
                              className="text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {item.product.name}
                          </h4>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Seçim: <span className="font-semibold text-slate-700">{item.variant.name}</span>
                          </div>
                          <div className="text-[11px] text-emerald-700 font-mono mt-0.5">
                            ✓ {item.product.sourceStore} • Batch: {item.product.authenticityBatch}
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateQuantity(item.product.id, item.variant.id, -1)
                                }
                                className="p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2.5 text-xs font-bold">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateQuantity(item.product.id, item.variant.id, 1)
                                }
                                className="p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-sm font-bold text-slate-900">
                              {(unitPrice * item.quantity).toLocaleString("tr-TR")} ₺
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {step === "CHECKOUT" && (
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Neden T.C. Kimlik Numarası İstiyoruz?
                </div>
                Türkiye Gümrük Yönetmeliği gereği hava kargo ile gelen paketlerin{" "}
                <strong>ETGB (Elektronik Ticaret Gümrük Beyannamesi)</strong> işlemlerini sizin adınıza vergisi ödenmiş olarak tamamlamamız için zorunludur.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adınız Soyadınız
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    T.C. Kimlik No (ETGB Beyanı)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    minLength={11}
                    value={tcIdentity}
                    onChange={(e) => setTcIdentity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Telefon (Canlı Kargo SMS)
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    E-Posta (Mağaza Faturası)
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    İl / İlçe
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              {/* Ödeme Altyapısı Seçimi: İyzico vs PayTR */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Ödeme Servis Katmanı Seçimi (3D Secure & Alıcı Koruması)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentProvider("IYZICO")}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      paymentProvider === "IYZICO"
                        ? "border-indigo-600 bg-indigo-50/70"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="text-xs font-bold text-indigo-950 flex items-center justify-between">
                      <span>iyzico Korumalı Ödeme</span>
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      3 Taksit & Teslimata Kadar Bloke Güvencesi
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentProvider("PAYTR")}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      paymentProvider === "PAYTR"
                        ? "border-indigo-600 bg-indigo-50/70"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="text-xs font-bold text-indigo-950 flex items-center justify-between">
                      <span>PayTR 3D Secure</span>
                      <Lock className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Tüm Kartlara Hızlı Onay & Sıfır Komisyon
                    </div>
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === "SUCCESS" && createdOrder && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  {paymentProvider} 3D SECURE ONAYLANDI
                </span>
                <h4 className="text-xl font-extrabold text-slate-900 mt-1">
                  Sipariş No: #{createdOrder.orderNumber}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Siparişiniz Berlin Lojistik Merkezimize iletildi ve canlı takip radarında en üst sıraya eklendi!
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-emerald-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">ETGB Gümrük Beyan No:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {createdOrder.etgbDeclarationNo}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hava Kargo AWB No:</span>
                  <span className="font-mono font-bold text-indigo-700">
                    {createdOrder.airWaybillNo}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ödenen Net Tutar (Vergi Dahil):</span>
                  <span className="font-bold text-slate-900">
                    {createdOrder.pricing.totalTry.toLocaleString("tr-TR")} ₺
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep("CART");
                  onClose();
                }}
                className="w-full py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm transition cursor-pointer"
              >
                Canlı Sipariş Takip Panelinde Görüntüle
              </button>
            </div>
          )}
        </div>

        {/* Alt Şeffaf Fiyat & Vergi Kırılımı Özeti */}
        {items.length > 0 && step !== "SUCCESS" && (
          <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Avrupa Resmi Mağaza Ara Toplamı</span>
                <span className="font-semibold text-slate-900">
                  {pricing.subtotalTry.toLocaleString("tr-TR")} ₺
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Avrupa Hava Kargo Lojistik (Berlin/Paris &rarr; İST)</span>
                <span className="font-semibold text-slate-900">
                  {pricing.euLogisticsFeeTry === 0 ? (
                    <span className="text-emerald-600 font-bold">ÜCRETSİZ</span>
                  ) : (
                    `${pricing.euLogisticsFeeTry.toLocaleString("tr-TR")} ₺`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Peşin Ödenmiş ETGB Gümrük & İthalat Vergisi
                </span>
                <span>{pricing.customsTaxTry.toLocaleString("tr-TR")} ₺</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Termal Soğuk Zincir & Kırılmazlık Sigortası</span>
                <span>{pricing.vipInsuranceTry.toLocaleString("tr-TR")} ₺</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-950 pt-2 border-t border-slate-200">
                <span>Kapıya Teslim Net Toplam</span>
                <span>{pricing.totalTry.toLocaleString("tr-TR")} ₺</span>
              </div>
              <p className="text-[11px] text-slate-500">
                * Kapıda veya gümrükte 1 TL dahi ek ücret çıkmaz. Tüm vergiler peşin ödenmiştir.
              </p>
            </div>

            {step === "CART" ? (
              <button
                type="button"
                onClick={() => setStep("CHECKOUT")}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                ETGB Gümrük Garantili Ödemeye Geç
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("CART")}
                  className="px-4 py-3.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Geri
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isProcessing}
                  className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  {isProcessing
                    ? "ETGB & 3D Secure Doğrulanıyor..."
                    : `${paymentProvider} ile ${pricing.totalTry.toLocaleString("tr-TR")} ₺ Öde`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
