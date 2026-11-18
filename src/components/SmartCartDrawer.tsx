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
  Copy,
} from "lucide-react";
import {
  Product,
  ProductVariant,
  calculateTransparentPricing,
  OrderRecord,
  PaymentSettingsConfig,
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
  paymentSettings: PaymentSettingsConfig;
  onUpdateQuantity: (productId: string, variantId: string, delta: number) => void;
  onRemoveItem: (productId: string, variantId: string) => void;
  onClearCart: () => void;
  onOrderCreated: (newOrder: OrderRecord) => void;
}

export default function SmartCartDrawer({
  isOpen,
  onClose,
  items,
  paymentSettings,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderCreated,
}: SmartCartDrawerProps) {
  const [step, setStep] = useState<"CART" | "CHECKOUT" | "SUCCESS">("CART");
  const [paymentMethod, setPaymentMethod] = useState<
    "IYZICO" | "PAYTR" | "GPAY" | "IBAN"
  >("IYZICO");
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
          provider: paymentMethod,
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
        orderNumber: data.orderNumber
          ? data.orderNumber.replace("EU-", "ADN-")
          : `ADN-${Math.floor(10000 + Math.random() * 89999)}`,
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
        originHub: "Paris / Londra Lojistik Merkezi",
        batchVerified: true,
        receiptHash: `ADN-INV-${Math.floor(10000 + Math.random() * 89999)}`,
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
            subtitle: `${paymentMethod} Güvenli Ödeme`,
            description: "Siparişiniz alındı ve Avrupa tedarik ekibimize iletildi.",
            location: city,
            timestamp: "Şimdi",
            operatorName: "ADEN Global",
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
    <div className="fixed inset-0 z-50 flex justify-end bg-[#3B1E28]/45 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#FFF9FA] text-[#3B1E28] h-full flex flex-col shadow-2xl">
        {/* Başlık */}
        <div className="px-6 py-5 bg-white flex items-center justify-between border-b border-[#B85D79]/15">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#B85D79]" />
            <h3 className="text-xl font-serif-editorial font-semibold text-[#3B1E28]">
              {step === "CART" && `Alışveriş Çantam (${items.length})`}
              {step === "CHECKOUT" && "Teslimat & Güvenli Ödeme"}
              {step === "SUCCESS" && "Siparişiniz Onaylandı"}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setStep("CART");
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-[#FCEEF2] hover:bg-[#B85D79]/20 flex items-center justify-center text-[#3B1E28] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 5000₺ ve üzeri ücretsiz kargo barı */}
        {step !== "SUCCESS" && (
          <div className="px-6 py-3 bg-[#FCEEF2] border-b border-[#B85D79]/15">
            <div className="text-xs text-[#3B1E28] mb-1.5">
              {remainingForFreeShipping === 0 ? (
                <span className="font-semibold text-[#2E7D5B]">
                  ✓ 5000₺ ve üzeri ücretsiz VIP kargo hakkı kazandınız!
                </span>
              ) : (
                <span>
                  Ücretsiz kargo için çantanıza{" "}
                  <strong>{formatTL(remainingForFreeShipping)}</strong> daha ürün ekleyin.
                </span>
              )}
            </div>
            <div className="w-full h-1.5 rounded-full bg-white overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#B85D79] to-[#D48C9E] transition-all duration-300"
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
                  <ShoppingBag className="w-10 h-10 text-[#B85D79]/35 mx-auto mb-3" />
                  <h4 className="text-lg font-serif-editorial font-semibold text-[#3B1E28]">
                    Alışveriş çantanız şu an boş
                  </h4>
                  <p className="text-xs text-[#3B1E28]/65 mt-1">
                    Paris ve Londra&apos;nın en seçkin güzellik koleksiyonlarını keşfetmeye başlayın.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    const unitPrice = item.product.priceTry + item.variant.priceDiffTry;
                    return (
                      <div
                        key={item.product.id + item.variant.id}
                        className="p-3.5 rounded-[20px] border border-[#B85D79]/15 bg-white flex gap-3.5 shadow-2xs"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-20 h-20 rounded-[14px] object-cover bg-[#FCEEF2]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] uppercase tracking-wider text-[#B85D79] font-semibold">
                              {item.product.brand}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                onRemoveItem(item.product.id, item.variant.id)
                              }
                              className="text-[#3B1E28]/40 hover:text-[#D9385A] cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <h4 className="text-sm font-medium text-[#3B1E28] truncate">
                            {item.product.name}
                          </h4>
                          <div className="text-xs text-[#3B1E28]/65 mt-0.5">
                            {item.variant.name}
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="inline-flex items-center rounded-full border border-[#B85D79]/25 bg-[#FFF9FA] px-1">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateQuantity(item.product.id, item.variant.id, -1)
                                }
                                className="p-1.5 text-[#3B1E28]/70 hover:text-[#3B1E28] cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2.5 text-xs font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateQuantity(item.product.id, item.variant.id, 1)
                                }
                                className="p-1.5 text-[#3B1E28]/70 hover:text-[#3B1E28] cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-sm font-semibold text-[#3B1E28]">
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
                <label className="block text-xs font-medium text-[#3B1E28] mb-1">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-white border border-[#B85D79]/25 text-sm focus:outline-none focus:border-[#B85D79]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#3B1E28] mb-1">
                    Telefon (Kargo SMS)
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-full bg-white border border-[#B85D79]/25 text-sm focus:outline-none focus:border-[#B85D79]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#3B1E28] mb-1">
                    T.C. Kimlik No (Gümrük)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    minLength={11}
                    value={tcIdentity}
                    onChange={(e) => setTcIdentity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-full bg-white border border-[#B85D79]/25 text-sm focus:outline-none focus:border-[#B85D79]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#3B1E28] mb-1">
                  E-Posta
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-white border border-[#B85D79]/25 text-sm focus:outline-none focus:border-[#B85D79]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#3B1E28] mb-1">
                  Teslimat Adresi (İl / İlçe)
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-white border border-[#B85D79]/25 text-sm focus:outline-none focus:border-[#B85D79]"
                />
              </div>

              {/* Admin Panelinden Yönetilen Aktif Ödeme Yöntemleri */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-[#3B1E28] mb-2">
                  Ödeme Yöntemi Seçin
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {paymentSettings.iyzicoEnabled && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("IYZICO")}
                      className={`p-3 rounded-[16px] border text-left transition cursor-pointer ${
                        paymentMethod === "IYZICO"
                          ? "border-[#B85D79] bg-[#FCEEF2]"
                          : "border-[#B85D79]/20 bg-white"
                      }`}
                    >
                      <div className="text-xs font-semibold text-[#3B1E28]">
                        iyzico Kredi Kartı
                      </div>
                      <div className="text-[11px] text-[#3B1E28]/65 mt-0.5">
                        3D Secure & Taksit
                      </div>
                    </button>
                  )}

                  {paymentSettings.paytrEnabled && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("PAYTR")}
                      className={`p-3 rounded-[16px] border text-left transition cursor-pointer ${
                        paymentMethod === "PAYTR"
                          ? "border-[#B85D79] bg-[#FCEEF2]"
                          : "border-[#B85D79]/20 bg-white"
                      }`}
                    >
                      <div className="text-xs font-semibold text-[#3B1E28]">
                        PayTR Kart Ödeme
                      </div>
                      <div className="text-[11px] text-[#3B1E28]/65 mt-0.5">
                        Hızlı 3D Onay
                      </div>
                    </button>
                  )}

                  {paymentSettings.googlePayEnabled && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("GPAY")}
                      className={`p-3 rounded-[16px] border text-left transition cursor-pointer ${
                        paymentMethod === "GPAY"
                          ? "border-[#B85D79] bg-[#FCEEF2]"
                          : "border-[#B85D79]/20 bg-white"
                      }`}
                    >
                      <div className="text-xs font-semibold text-[#3B1E28]">
                        G Pay / Apple Pay
                      </div>
                      <div className="text-[11px] text-[#3B1E28]/65 mt-0.5">
                        Tek Tık Dijital Cüzdan
                      </div>
                    </button>
                  )}

                  {paymentSettings.bankTransferEnabled && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("IBAN")}
                      className={`p-3 rounded-[16px] border text-left transition cursor-pointer ${
                        paymentMethod === "IBAN"
                          ? "border-[#B85D79] bg-[#FCEEF2]"
                          : "border-[#B85D79]/20 bg-white"
                      }`}
                    >
                      <div className="text-xs font-semibold text-[#3B1E28]">
                        Havale / FAST (IBAN)
                      </div>
                      <div className="text-[11px] text-[#3B1E28]/65 mt-0.5">
                        Banka Hesabına Transfer
                      </div>
                    </button>
                  )}
                </div>

                {paymentMethod === "IBAN" && (
                  <div className="mt-3 p-3.5 rounded-[16px] bg-white border border-[#B85D79]/25 text-xs space-y-1">
                    <div className="font-semibold text-[#B85D79]">
                      Banka Havale / FAST Bilgileri:
                    </div>
                    <div className="text-[#3B1E28]">
                      Alıcı: <strong>{paymentSettings.bankAccountName}</strong>
                    </div>
                    <div className="font-mono text-[#3B1E28] flex items-center justify-between">
                      <span>{paymentSettings.bankIban}</span>
                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard?.writeText(paymentSettings.bankIban)
                        }
                        className="text-[#B85D79] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" /> Kopyala
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          )}

          {step === "SUCCESS" && createdOrder && (
            <div className="p-6 rounded-[24px] bg-white border border-[#B85D79]/20 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#2E7D5B] text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-serif-editorial font-semibold text-[#3B1E28]">
                  Teşekkürler, Siparişiniz Alındı!
                </h4>
                <p className="text-xs text-[#3B1E28]/70 mt-1">
                  Sipariş Takip Kodunuz: <strong>#{createdOrder.orderNumber}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep("CART");
                  onClose();
                }}
                className="w-full py-3.5 rounded-full bg-[#B85D79] hover:bg-[#A14A66] text-white font-medium text-sm transition cursor-pointer"
              >
                Canlı Sipariş Takibini Görüntüle
              </button>
            </div>
          )}
        </div>

        {/* Alt Toplam */}
        {items.length > 0 && step !== "SUCCESS" && (
          <div className="p-6 bg-white border-t border-[#B85D79]/15 space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#3B1E28]/75">
                <span>Ara Toplam</span>
                <span>{formatTL(pricing.subtotalTry)}</span>
              </div>
              <div className="flex justify-between text-[#3B1E28]/75">
                <span>Kargo</span>
                <span>
                  {pricing.euLogisticsFeeTry === 0
                    ? "Ücretsiz"
                    : formatTL(pricing.euLogisticsFeeTry)}
                </span>
              </div>
              <div className="flex justify-between text-[#2E7D5B] font-medium">
                <span>Gümrük & İthalat Vergisi</span>
                <span>Fiyata Dahil (0TL)</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-[#3B1E28] pt-2 border-t border-[#B85D79]/15">
                <span>Toplam</span>
                <span>{formatTL(pricing.totalTry)}</span>
              </div>
            </div>

            {step === "CART" ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setStep("CHECKOUT")}
                  className="w-full py-3.5 rounded-full bg-[#B85D79] hover:bg-[#A14A66] text-white font-semibold text-sm transition cursor-pointer shadow-md shadow-[#B85D79]/20"
                >
                  GÜVENLİ ÖDEMEYE GEÇ
                </button>
                {paymentSettings.googlePayEnabled && (
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("GPAY");
                      setStep("CHECKOUT");
                    }}
                    className="w-full py-3 rounded-full bg-[#3B1E28] hover:bg-[#261118] text-white font-medium text-sm transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>G Pay ile Hızlı Satın Al</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("CART")}
                  className="px-5 py-3 rounded-full border border-[#B85D79]/25 text-xs font-medium text-[#3B1E28] cursor-pointer"
                >
                  Geri
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isProcessing}
                  className="flex-1 py-3 rounded-full bg-[#B85D79] hover:bg-[#A14A66] text-white font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  {isProcessing
                    ? "Onaylanıyor..."
                    : `${formatTL(pricing.totalTry)} Siparişi Tamamla`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
