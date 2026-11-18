"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Plane,
  ShieldCheck,
  Warehouse,
  FileCheck2,
  Truck,
  PackageCheck,
  Search,
  MapPin,
  Clock,
} from "lucide-react";
import {
  ORDER_STAGE_META,
  OrderRecord,
  OrderStageStatus,
  formatTL,
} from "@/lib/mock-data";

interface LiveOrderTrackerProps {
  orders: OrderRecord[];
  selectedOrder: OrderRecord;
  onSelectOrder: (order: OrderRecord) => void;
  onSimulateStageChange?: (orderNumber: string, stage: OrderStageStatus) => void;
}

const STAGE_ICONS: Record<OrderStageStatus, React.ReactNode> = {
  ORDER_CONFIRMED: <FileCheck2 className="w-4 h-4" />,
  EU_WAREHOUSE: <Warehouse className="w-4 h-4" />,
  EXPORT_CUSTOMS: <ShieldCheck className="w-4 h-4" />,
  IN_FLIGHT_TRANSIT: <Plane className="w-4 h-4" />,
  TR_CUSTOMS_HUB: <MapPin className="w-4 h-4" />,
  OUT_FOR_DELIVERY: <Truck className="w-4 h-4" />,
  DELIVERED: <PackageCheck className="w-4 h-4" />,
};

export default function LiveOrderTracker({
  orders,
  selectedOrder,
  onSelectOrder,
  onSimulateStageChange,
}: LiveOrderTrackerProps) {
  const [query, setQuery] = useState(selectedOrder.orderNumber);
  const [searchError, setSearchError] = useState<string | null>(null);

  const currentStageIndex = ORDER_STAGE_META.findIndex(
    (s) => s.stage === selectedOrder.currentStage
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = query.trim().toUpperCase();
    const match = orders.find(
      (o) => o.orderNumber.toUpperCase() === cleaned
    );
    if (match) {
      onSelectOrder(match);
      setSearchError(null);
    } else {
      setSearchError(
        `"${query}" numaralı sipariş bulunamadı. Örnek kodlar: AVK-90482 veya AVK-88310`
      );
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-[#563C49]/10 p-6 md:p-10 shadow-sm text-[#563C49]">
      {/* Başlık ve Arama */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-[#563C49]/10">
        <div>
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#563C49]/[0.06] text-[#563C49] text-xs font-medium mb-3">
            <span className="w-2 h-2 rounded-full bg-[#438E44]" />
            Canlı Kargo & Tedarik Takibi
          </span>
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-[#563C49]">
            Siparişinizin Avrupa&apos;dan Kapınıza Yolculuğu
          </h2>
          <p className="text-sm text-[#563C49]/70 mt-1">
            Avrupa mağaza tedariğinden uçuşa ve Türkiye dağıtım merkezine kadar siparişinizin hangi aşamada olduğunu anlık takip edin.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 min-w-[300px] lg:min-w-[400px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#563C49]/50 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Sipariş No (Örn: AVK-90482)"
              className="w-full pl-11 pr-4 py-3 rounded-[30px] bg-[#F9F8F6] border border-[#563C49]/15 text-sm text-[#563C49] placeholder:text-[#563C49]/45 focus:outline-none focus:border-[#563C49]"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-[30px] bg-[#563C49] hover:bg-[#9F8291] text-white font-medium text-sm transition cursor-pointer"
          >
            Sorgula
          </button>
        </form>
      </div>

      {/* Örnek Sipariş Seçici */}
      <div className="flex flex-wrap items-center gap-2 py-4 border-b border-[#563C49]/10">
        <span className="text-xs text-[#563C49]/60 mr-1">Örnek Siparişler:</span>
        {orders.map((ord) => {
          const active = ord.orderNumber === selectedOrder.orderNumber;
          return (
            <button
              key={ord.id}
              type="button"
              onClick={() => {
                onSelectOrder(ord);
                setQuery(ord.orderNumber);
                setSearchError(null);
              }}
              className={`px-4 py-1.5 rounded-[30px] text-xs font-medium transition cursor-pointer ${
                active
                  ? "bg-[#563C49] text-white"
                  : "bg-[#563C49]/[0.06] text-[#563C49] hover:bg-[#563C49]/12"
              }`}
            >
              #{ord.orderNumber} — {ord.items[0]?.name}
            </button>
          );
        })}
      </div>

      {searchError && (
        <div className="mt-4 p-3.5 rounded-2xl bg-[#EB001B]/10 text-[#EB001B] text-xs font-medium">
          {searchError}
        </div>
      )}

      {/* Aşama İlerleme Çubuğu (7 Aşama) */}
      <div className="py-8 border-b border-[#563C49]/10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-[#563C49]/70">
            Mevcut Durum: <strong className="text-[#563C49]">{ORDER_STAGE_META[currentStageIndex]?.shortLabel}</strong>
          </span>
          <span className="text-xs text-[#563C49]/55">
            (Aşamaları test etmek için kutulara tıklayabilirsiniz)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {ORDER_STAGE_META.map((meta, index) => {
            const isPast = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;

            return (
              <button
                key={meta.stage}
                type="button"
                onClick={() =>
                  onSimulateStageChange?.(selectedOrder.orderNumber, meta.stage)
                }
                className={`text-left p-3.5 rounded-[16px] border transition cursor-pointer ${
                  isCurrent
                    ? "bg-[#563C49] text-white border-[#563C49] shadow-md"
                    : isPast
                    ? "bg-[#F9F8F6] text-[#563C49] border-[#563C49]/20"
                    : "bg-white text-[#563C49]/50 border-[#563C49]/10 hover:border-[#563C49]/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCurrent
                        ? "bg-white/20 text-white"
                        : isPast
                        ? "bg-[#438E44]/15 text-[#438E44]"
                        : "bg-[#563C49]/[0.06] text-[#563C49]/50"
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : STAGE_ICONS[meta.stage]}
                  </div>
                  <span className="text-[11px] opacity-75">0{meta.stepNumber}</span>
                </div>
                <div className="text-xs font-medium leading-snug">
                  {meta.shortLabel}
                </div>
                <div
                  className={`text-[11px] mt-0.5 ${
                    isCurrent ? "text-white/75" : "text-[#563C49]/55"
                  }`}
                >
                  {meta.hubTag}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Alt Detaylar: Zaman Çizelgesi ve Sipariş Özeti */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
        <div className="lg:col-span-7 space-y-3">
          <h4 className="text-sm font-medium text-[#563C49] mb-3">
            Adım Adım Kargo Hareketleri
          </h4>
          {selectedOrder.timeline.map((log, index) => {
            const stageIdx = ORDER_STAGE_META.findIndex(
              (s) => s.stage === log.stage
            );
            const isCompleted = stageIdx < currentStageIndex;
            const isActive = stageIdx === currentStageIndex;

            return (
              <div
                key={log.stage + index}
                className={`p-4 rounded-[16px] border transition ${
                  isActive
                    ? "bg-[#F9F8F6] border-[#563C49]/40"
                    : isCompleted
                    ? "bg-white border-[#563C49]/10"
                    : "bg-white/60 border-[#563C49]/5 opacity-55"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isActive
                          ? "bg-[#E0B252]"
                          : isCompleted
                          ? "bg-[#438E44]"
                          : "bg-[#563C49]/25"
                      }`}
                    />
                    <span className="text-sm font-medium text-[#563C49]">
                      {log.title}
                    </span>
                  </div>
                  <span className="text-xs text-[#563C49]/60">{log.timestamp}</span>
                </div>
                <p className="text-xs text-[#563C49]/75 mt-1.5 leading-relaxed">
                  {log.description}
                </p>
                <div className="mt-2 flex items-center gap-4 text-[11px] text-[#563C49]/60">
                  <span>Konum: {log.location}</span>
                  <span>•</span>
                  <span>{log.operatorName}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-[20px] bg-[#F9F8F6] border border-[#563C49]/10 space-y-4">
            <div className="flex items-center justify-between border-b border-[#563C49]/10 pb-3">
              <div>
                <div className="text-xs text-[#563C49]/60">Sipariş Özeti</div>
                <div className="text-base font-medium text-[#563C49]">
                  #{selectedOrder.orderNumber} • {selectedOrder.customerName}
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#438E44]/15 text-[#438E44] text-xs font-medium">
                Gümrük Dahil
              </span>
            </div>

            {selectedOrder.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3.5">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-[12px] object-cover border border-[#563C49]/10"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[#563C49]/65 uppercase">
                    {item.brand}
                  </div>
                  <div className="text-sm font-medium text-[#563C49] truncate">
                    {item.name}
                  </div>
                  <div className="text-xs text-[#563C49]/60">
                    {item.variant} • {item.quantity} Adet
                  </div>
                </div>
                <div className="text-sm font-medium text-[#563C49]">
                  {formatTL(item.unitPriceTry)}
                </div>
              </div>
            ))}

            <div className="pt-3 border-t border-[#563C49]/10 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#563C49]/75">
                <span>Çıkış Merkezi</span>
                <span>{selectedOrder.originHub}</span>
              </div>
              <div className="flex justify-between text-[#563C49]/75">
                <span>Tahmini Teslimat</span>
                <span className="flex items-center gap-1 font-medium text-[#563C49]">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedOrder.guaranteedDeliveryDate}
                </span>
              </div>
              <div className="flex justify-between text-[#563C49]/75">
                <span>Kargo & Gümrük Vergisi</span>
                <span className="text-[#438E44] font-medium">Ücretsiz / Fiyata Dahil</span>
              </div>
              <div className="flex justify-between text-base font-medium text-[#563C49] pt-2 border-t border-[#563C49]/10">
                <span>Toplam Ödenen</span>
                <span>{formatTL(selectedOrder.pricing.totalTry)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
