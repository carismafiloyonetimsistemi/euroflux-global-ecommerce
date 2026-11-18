"use client";

import React, { useState } from "react";
import {
  X,
  Trash2,
  Plus,
  Minus,
  Lock,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";
import {
  Product,
  ProductVariant,
  calculateTransparentPricing,
  OrderRecord,
  formatTL,
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
  const [fullName, setFullName] = useState("Ceren Bulut");
  const [email, setEmail] = useState("ceren.bulut@example.com");
  const [phone, setPhone] = useState("+90 532 418 92 10");
  const [tcIdentity, setTcIdentity] = useState("24891048914");
  const [city, setCity] = useState("İstanbul / Nişantaşı");
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
        orderNumber: data.orderNumber ? data.orderNumber.replace("EU-", "AVK-") : `AVK-${Math.floor(10000 + Math.random() * 89999)}`,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        customerCity: city,
        tcIdentityMasked: `${tcIdentity.slice(0, 3)}*****${tcIdentity.slice(-3)}`,
        currentStage: "EU_WAREHOUSE",
        createdAt: "Bugün",
        guaranteedDeliveryDate: "7-10 İş Günü",
        etgbDeclarationNo: data.etgbDeclarationNo || "ETGB-2026-994120",
        airWaybillNo: data.airWaybillNo || "TK-1724-PAR-IST",
        originHub: "Avrupa Transfer Merkezi",
        batchVerified: true,
        receiptHash: `AVK-INV-${Math.floor(10000 + Math.random() * 89999)}`,
        pricing: {
          subtotalTry: pricing.subtotalTry,
          euLogisticsFeeTry: pricing.euLogisticsFeeTry,
          customsTaxTry: 0,
          vipInsuranceTry: 0,
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
            title: "Siparişiniz Onaylandı",
            subtitle: `${paymentProvider} Güvenli Ödeme`,
            description: "Siparişiniz alındı ve Avrupa tedarik ekibimize iletildi.",
            location: city,
            timestamp: "Şimdi",
            operatorName: "Avrupadan Kargom",
            badgeCode: "ONAYLANDI",
          },
          {
            stage: "EU_WAREHOUSE",
            title: "Avrupa Deposunda Hazırlanıyor",
            subtitle: "Kalite Kontrol & Paketleme",
            description: "Ürünleriniz özenle kontrol edilerek uçuş için paketleniyor.",
            location: "Avrupa Lojistik Merkezi",
            timestamp: "İşleniyor",
            operatorName: "Tedarik Ekibi",
            badgeCode: "AVRUPA DEPO",
          },
          {
            stage: "EXPORT_CUSTOMS",
            title: "Gümrük İşleminde",
            subtitle: "Avrupa Çıkış İşlemleri",
            description: "Havalimanı gümrük çıkış onayı.",
            location: "Avrupa Çıkış",
            timestamp: "Sıradaki Adım",
            operatorName: "Gümrük Ekibi",
            badgeCode: "GÜMRÜK",
          },
          {
            stage: "IN_FLIGHT_TRANSIT",
            title: "Uçuşta / Transit",
            subtitle: "Türkiye'ye Transfer",
            description: "Hava kargo uçuş aşaması.",
            location: "Uçuşta",
            timestamp: "Planlanan",
            operatorName: "Hava Kargo",
            badgeCode: "UÇUŞTA",
          },
          {
            stage: "TR_CUSTOMS_HUB",
            title: "Türkiye Transfer Merkezinde",
            subtitle: "İstanbul Dağıtım Merkezi",
            description: "Yurtiçi kurye aktarım merkezi.",
            location: "İstanbul",
            timestamp: "Planlanan",
            operatorName: "TR Operasyon",
            badgeCode: "TR MERKEZ",
          },
          {
            stage: "OUT_FOR_DELIVERY",
            title: "Kuryede",
            subtitle: "Adrese Teslimat",
            description: "Dağıtım aşaması.",
            location: city,
            timestamp: "Planlanan",
            operatorName: "Kurye",
            badgeCode: "KURYEDE",
          },
          {
            stage: "DELIVERED",
            title: "Teslim Edildi",
            subtitle: "Teslimat",
            description: "Siparişiniz teslim edildi.",
            location: city,
            timestamp: "Planlanan",
            operatorName: "Alıcı",
            badgeCode: "TESLİM",
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
    <div className="fixed inset-0 z-50 flex justify-end bg-[#563C49]/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white text-[#563C49] h-full flex flex-col shadow-2xl">
        {/* Başlık */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-[#563C49]/10">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#563C49]" />
            <h3 className="text-lg font-medium text-[#563C49]">
              {step === "CART" && `Sepetim (${items.length})`}
              {step === "CHECKOUT" && "Teslimat & Güvenli Ödeme"}
              {step === "SUCCESS" && "Siparişiniz Alındı"}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setStep("CART");
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-[#563C49]/[0.06] hover:bg-[#563C49]/15 flex items-center justify-center text-[#563C49] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 5000₺ ve üzeri ücretsiz kargo barı */}
        {step !== "SUCCESS" && (
          <div className="px-6 py-3 bg-[#F9F8F6] border-b border-[#563C49]/10">
            <div className="text-xs text-[#563C49] mb-1.5">
              {remainingForFreeShipping === 0 ? (
                <span className="font-medium text-[#438E44]">
                  ✓ 5000₺ ve üzeri ücretsiz kargo hakkı kazandınız!
                </span>
              ) : (
                <span>
                  Ücretsiz kargo için sepetinize{" "}
                  <strong>{formatTL(remainingForFreeShipping)}</strong> daha ürün ekleyin.
                </span>
              )}
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#563C49]/10 overflow-hidden">
              <div
                className="h-full bg-[#563C49] transition-all duration-300"
                style={{ width: `${Math.min(100, (subtotalTry / 5000) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* İçerik */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {step === "CART" && (
            <>
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="w-10 h-10 text-[#563C49]/30 mx-auto mb-3" />
                  <h4 className="text-base font-medium text-[#563C49]">
                    Sepetiniz şu an boş
                  </h4>
                  <p className="text-xs text-[#563C49]/65 mt-1">
                    Favori markalarınızı ve Advent takvimlerini keşfetmeye başlayın.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    const unitPrice = item.product.priceTry + item.variant.priceDiffTry;
                    return (
                      <div
                        key={item.product.id + item.variant.id}
                        className="p-3.5 rounded-[16px] border border-[#563C49]/10 bg-white flex gap-3.5"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-20 h-20 rounded-[12px] object-cover bg-[#F9F8F6]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] uppercase tracking-wider text-[#563C49]/65">
                              {item.product.brand}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                onRemoveItem(item.product.id, item.variant.id)
                              }
                              className="text-[#563C49]/40 hover:text-[#EB001B] cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <h4 className="text-sm font-medium text-[#563C49] truncate">
                            {item.product.name}
                          </h4>
                          <div className="text-xs text-[#563C49]/65 mt-0.5">
                            {item.variant.name}
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="inline-flex items-center rounded-[30px] border border-[#563C49]/15 px-1">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateQuantity(item.product.id, item.variant.id, -1)
                                }
                                className="p-1.5 text-[#563C49]/70 hover:text-[#563C49] cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2.5 text-xs font-medium">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateQuantity(item.product.id, item.variant.id, 1)
                                }
                                className="p-1.5 text-[#563C49]/70 hover:text-[#563C49] cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-sm font-medium text-[#563C49]">
                              {formatTL(unitPrice * item.quantity)}
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
              <div>
                <label className="block text-xs font-medium text-[#563C49] mb-1">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-[30px] border border-[#563C49]/20 text-sm focus:outline-none focus:border-[#563C49]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#563C49] mb-1">
                    Telefon
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-[30px] border border-[#563C49]/20 text-sm focus:outline-none focus:border-[#563C49]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#563C49] mb-1">
                    T.C. Kimlik No (Gümrük İçin)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    minLength={11}
                    value={tcIdentity}
                    onChange={(e) => setTcIdentity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-[30px] border border-[#563C49]/20 text-sm focus:outline-none focus:border-[#563C49]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#563C49] mb-1">
                  E-Posta
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-[30px] border border-[#563C49]/20 text-sm focus:outline-none focus:border-[#563C49]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#563C49] mb-1">
                  Teslimat Adresi (İl / İlçe)
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-[30px] border border-[#563C49]/20 text-sm focus:outline-none focus:border-[#563C49]"
                />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-medium text-[#563C49] mb-2">
                  Ödeme Yöntemi
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentProvider("IYZICO")}
                    className={`p-3 rounded-[16px] border text-left transition cursor-pointer ${
                      paymentProvider === "IYZICO"
                        ? "border-[#563C49] bg-[#563C49]/[0.06]"
                        : "border-[#563C49]/15"
                    }`}
                  >
                    <div className="text-xs font-medium text-[#563C49]">
                      iyzico Güvencesi
                    </div>
                    <div className="text-[11px] text-[#563C49]/65 mt-0.5">
                      Kredi / Banka Kartı
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentProvider("PAYTR")}
                    className={`p-3 rounded-[16px] border text-left transition cursor-pointer ${
                      paymentProvider === "PAYTR"
                        ? "border-[#563C49] bg-[#563C49]/[0.06]"
                        : "border-[#563C49]/15"
                    }`}
                  >
                    <div className="text-xs font-medium text-[#563C49]">
                      PayTR / G Pay
                    </div>
                    <div className="text-[11px] text-[#563C49]/65 mt-0.5">
                      3D Secure Hızlı Ödeme
                    </div>
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === "SUCCESS" && createdOrder && (
            <div className="p-6 rounded-[20px] bg-[#F9F8F6] border border-[#563C49]/10 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#438E44] text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-medium text-[#563C49]">
                  Teşekkürler, Siparişiniz Alındı!
                </h4>
                <p className="text-xs text-[#563C49]/70 mt-1">
                  Sipariş Numaranız: <strong>#{createdOrder.orderNumber}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep("CART");
                  onClose();
                }}
                className="w-full py-3 rounded-[30px] bg-[#563C49] hover:bg-[#9F8291] text-white font-medium text-sm transition cursor-pointer"
              >
                Canlı Sipariş Takibini Görüntüle
              </button>
            </div>
          )}
        </div>

        {/* Alt Toplam */}
        {items.length > 0 && step !== "SUCCESS" && (
          <div className="p-6 bg-[#F9F8F6] border-t border-[#563C49]/10 space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#563C49]/75">
                <span>Ara Toplam</span>
                <span>{formatTL(pricing.subtotalTry)}</span>
              </div>
              <div className="flex justify-between text-[#563C49]/75">
                <span>Kargo</span>
                <span>
                  {pricing.euLogisticsFeeTry === 0
                    ? "Ücretsiz"
                    : formatTL(pricing.euLogisticsFeeTry)}
                </span>
              </div>
              <div className="flex justify-between text-[#438E44]">
                <span>Gümrük & İthalat Vergisi</span>
                <span>Fiyata Dahil (0TL)</span>
              </div>
              <div className="flex justify-between text-base font-medium text-[#563C49] pt-2 border-t border-[#563C49]/10">
                <span>Toplam</span>
                <span>{formatTL(pricing.totalTry)}</span>
              </div>
            </div>

            {step === "CART" ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setStep("CHECKOUT")}
                  className="w-full py-3.5 rounded-[30px] bg-[#563C49] hover:bg-[#9F8291] text-white font-medium text-sm transition cursor-pointer"
                >
                  ÖDEMEYE GEÇ
                </button>
                <button
                  type="button"
                  onClick={() => setStep("CHECKOUT")}
                  className="w-full py-3 rounded-[30px] bg-black hover:bg-neutral-800 text-white font-medium text-sm transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>G Pay ile Satın Al</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("CART")}
                  className="px-5 py-3 rounded-[30px] border border-[#563C49]/20 text-xs font-medium text-[#563C49] cursor-pointer"
                >
                  Geri
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isProcessing}
                  className="flex-1 py-3 rounded-[30px] bg-[#563C49] hover:bg-[#9F8291] text-white font-medium text-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  {isProcessing
                    ? "İşleniyor..."
                    : `${formatTL(pricing.totalTry)} Öde`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
