"use client";

import React, { useState } from "react";
import {
  Package,
  Plane,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  QrCode,
  Users,
  TrendingUp,
  Printer,
  ArrowUpRight,
  Globe,
} from "lucide-react";
import {
  ORDER_STAGE_META,
  OrderRecord,
  OrderStageStatus,
  Product,
  CustomSourcingRequestItem,
} from "@/lib/mock-data";

interface AdminControlCenterProps {
  orders: OrderRecord[];
  products: Product[];
  customRequests: CustomSourcingRequestItem[];
  onUpdateOrderStage: (
    orderNumber: string,
    newStage: OrderStageStatus,
    note?: string
  ) => void;
  onSyncEuropeanStock: () => void;
}

export default function AdminControlCenter({
  orders,
  products,
  customRequests,
  onUpdateOrderStage,
  onSyncEuropeanStock,
}: AdminControlCenterProps) {
  const [activeTab, setActiveTab] = useState<"ORDERS" | "INVENTORY" | "SOURCING">("ORDERS");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [operatorNotes, setOperatorNotes] = useState<Record<string, string>>({});
  const [printedLabelOrder, setPrintedLabelOrder] = useState<OrderRecord | null>(null);

  const totalRevenue = orders.reduce((acc, o) => acc + o.pricing.totalTry, 0);

  const handleSync = () => {
    onSyncEuropeanStock();
    setSyncMessage(
      "Sephora Paris, Space NK London ve KaDeWe Berlin depo API stokları senkronize edildi (+24 yeni batch doğrulandı)."
    );
    setTimeout(() => setSyncMessage(null), 5000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Üst Yönetim Başlığı */}
      <div className="bg-slate-950 text-white p-6 md:p-8 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold mb-2">
            LOJİSTİK, ETGB GÜMRÜK & CRM YÖNETİM PANELİ (ADMIN)
          </div>
          <h2 className="text-2xl font-extrabold">
            EuroFlux Global Operasyon & Tedarik Kontrol Merkezi
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Buradan siparişlerin aşamalarını değiştirdiğinizde üstteki Müşteri Canlı Takip Paneli anında senkronize güncellenir.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSync}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Avrupa Depo Stoklarını Senkronize Et
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="mx-6 mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {syncMessage}
        </div>
      )}

      {/* KPI Metrik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-slate-50 border-b border-slate-200">
        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>AKTİF ULUSLARARASI SEVKİYAT</span>
            <Plane className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {orders.length} Kargo
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            %100 SLA Süresi İçinde İlerliyor
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>TOPLAM DDP GÜMRÜKLÜ CİRO</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {totalRevenue.toLocaleString("tr-TR")} ₺
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            ETGB Vergileri Dahil Net Tahsilat
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>AVRUPA HUB HAZIR STOK</span>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {products.reduce((acc, p) => acc + p.stockCount, 0)} Adet
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Berlin, Paris ve Londra Depoları
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="text-xs text-slate-500 font-semibold flex items-center justify-between">
            <span>ÖZEL TEDARİK (CONCIERGE) TALEBİ</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {customRequests.length} Talep
          </div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1">
            Ortalama Teklif Süresi: 18 Dakika
          </div>
        </div>
      </div>

      {/* Sekmeler */}
      <div className="px-6 pt-4 border-b border-slate-200 flex flex-wrap gap-2 bg-white">
        <button
          type="button"
          onClick={() => setActiveTab("ORDERS")}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === "ORDERS"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Sipariş & Canlı Kargo Aşama Yönetimi ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("INVENTORY")}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === "INVENTORY"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Avrupa Depo Stok & Batch Kodu Kontrolü ({products.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("SOURCING")}
          className={`px-4 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === "SOURCING"
              ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          Müşteri Özel Ürün İstekleri / CRM ({customRequests.length})
        </button>
      </div>

      {/* Sekme İçeriği */}
      <div className="p-6">
        {activeTab === "ORDERS" && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:border-slate-300 transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-base font-extrabold text-slate-900">
                        #{order.orderNumber}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800">
                        {order.customerName} ({order.customerCity})
                      </span>
                      <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                        {order.etgbDeclarationNo}
                      </span>
                      <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800">
                        AWB: {order.airWaybillNo}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1.5">
                      Ürünler:{" "}
                      {order.items
                        .map((i) => `${i.brand} - ${i.name} (${i.variant})`)
                        .join(" • ")}{" "}
                      | Toplam:{" "}
                      <strong className="text-slate-900">
                        {order.pricing.totalTry.toLocaleString("tr-TR")} ₺
                      </strong>
                    </div>
                  </div>

                  {/* Aşama Değiştirme ve Kargo Etiketi */}
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={order.currentStage}
                      onChange={(e) =>
                        onUpdateOrderStage(
                          order.orderNumber,
                          e.target.value as OrderStageStatus,
                          operatorNotes[order.orderNumber]
                        )
                      }
                      className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                    >
                      {ORDER_STAGE_META.map((st) => (
                        <option key={st.stage} value={st.stage}>
                          0{st.stepNumber} - {st.shortLabel} ({st.hubTag})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setPrintedLabelOrder(order)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      ETGB & AWB Barkod Etiketi
                    </button>
                  </div>
                </div>

                {/* Hızlı Aşama Güncelleme Butonları */}
                <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {ORDER_STAGE_META.map((st) => {
                      const active = order.currentStage === st.stage;
                      return (
                        <button
                          key={st.stage}
                          type="button"
                          onClick={() =>
                            onUpdateOrderStage(
                              order.orderNumber,
                              st.stage,
                              operatorNotes[order.orderNumber]
                            )
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            active
                              ? "bg-indigo-600 text-white"
                              : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-400"
                          }`}
                        >
                          {st.shortLabel}
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="text"
                    placeholder="Operatör log notu ekle (Örn: Uçuş TK-1724 yüklendi)..."
                    value={operatorNotes[order.orderNumber] || ""}
                    onChange={(e) =>
                      setOperatorNotes((prev) => ({
                        ...prev,
                        [order.orderNumber]: e.target.value,
                      }))
                    }
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs w-full sm:w-64"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "INVENTORY" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase">
                  <th className="py-3 px-3">SKU & Batch Kodu</th>
                  <th className="py-3 px-3">Marka & Ürün</th>
                  <th className="py-3 px-3">Avrupa Tedarik Noktası</th>
                  <th className="py-3 px-3">Tedarik Modu</th>
                  <th className="py-3 px-3">Depo Stok</th>
                  <th className="py-3 px-3">DDP Satış Fiyatı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {products.map((prd) => (
                  <tr key={prd.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono">
                      <div className="font-bold text-slate-900">{prd.sku}</div>
                      <div className="text-emerald-600">{prd.authenticityBatch}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{prd.brand}</div>
                      <div className="text-slate-600">{prd.name}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold">
                        {prd.originFlag} {prd.originCity}
                      </span>
                      <div className="text-slate-500">{prd.sourceStore}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                        {prd.supplyStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {prd.stockCount} Adet
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {prd.priceTry.toLocaleString("tr-TR")} ₺
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "SOURCING" && (
          <div className="space-y-3">
            {customRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600">
                      #{req.id}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {req.brandAndProduct}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                      {req.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                    <span>Müşteri: {req.customerName}</span>
                    <span>Ülke/Hat: {req.country}</span>
                    <span>Talep: {req.requestedAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-500">
                      Mağaza Fiyatı: €{req.estimatedEur}
                    </div>
                    <div className="text-sm font-extrabold text-slate-900">
                      Gümrük Dahil Teklif: {req.quotedTotalTry.toLocaleString("tr-TR")} ₺
                    </div>
                  </div>
                  <a
                    href={req.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kargo & ETGB Barkod Etiketi Modalı */}
      {printedLabelOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-slate-900">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider">
                  EUROFLUX GLOBAL AIR CARGO • DDP / ETGB
                </div>
                <div className="text-lg font-black font-mono">
                  AWB: {printedLabelOrder.airWaybillNo}
                </div>
              </div>
              <QrCode className="w-12 h-12 text-slate-900" />
            </div>

            <div className="py-4 space-y-2 text-xs border-b border-slate-300">
              <div className="flex justify-between">
                <span className="font-bold">SİPARİŞ NO:</span>
                <span className="font-mono font-bold">#{printedLabelOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">ETGB BEYAN NO:</span>
                <span className="font-mono font-bold">{printedLabelOrder.etgbDeclarationNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">ÇIKIŞ DEPOSU:</span>
                <span>{printedLabelOrder.originHub}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">ALICI & ŞEHİR:</span>
                <span>
                  {printedLabelOrder.customerName} ({printedLabelOrder.customerCity})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">GÜMRÜK REJİMİ:</span>
                <span className="text-emerald-700 font-bold">
                  VERGİSİ ÖDENMİŞ (DDP - EK ÜCRET YOK)
                </span>
              </div>
            </div>

            <div className="py-3 text-xs">
              <div className="font-bold mb-1">PAKET İÇERİĞİ & BATCH KODLARI:</div>
              {printedLabelOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between font-mono text-[11px]">
                  <span>
                    {it.quantity}x {it.brand} ({it.variant})
                  </span>
                  <span>BATCH: {it.batchCode}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPrintedLabelOrder(null)}
              className="mt-4 w-full py-3 rounded-xl bg-slate-950 text-white font-bold text-xs cursor-pointer"
            >
              Etiket Önizlemesini Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
