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
  Sparkles,
  ThermometerSnowflake,
  QrCode,
  Clock,
  MapPin,
  UserCheck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import {
  ORDER_STAGE_META,
  OrderRecord,
  OrderStageStatus,
} from "@/lib/mock-data";

interface LiveOrderTrackerProps {
  orders: OrderRecord[];
  selectedOrder: OrderRecord;
  onSelectOrder: (order: OrderRecord) => void;
  onSimulateStageChange?: (orderNumber: string, stage: OrderStageStatus) => void;
}

const STAGE_ICONS: Record<OrderStageStatus, React.ReactNode> = {
  ORDER_CONFIRMED: <FileCheck2 className="w-5 h-5" />,
  EU_WAREHOUSE: <Warehouse className="w-5 h-5" />,
  EXPORT_CUSTOMS: <ShieldCheck className="w-5 h-5" />,
  IN_FLIGHT_TRANSIT: <Plane className="w-5 h-5" />,
  TR_CUSTOMS_HUB: <QrCode className="w-5 h-5" />,
  OUT_FOR_DELIVERY: <Truck className="w-5 h-5" />,
  DELIVERED: <PackageCheck className="w-5 h-5" />,
};

export default function LiveOrderTracker({
  orders,
  selectedOrder,
  onSelectOrder,
  onSimulateStageChange,
}: LiveOrderTrackerProps) {
  const [query, setQuery] = useState(selectedOrder.orderNumber);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const currentStageIndex = ORDER_STAGE_META.findIndex(
    (s) => s.stage === selectedOrder.currentStage
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = query.trim().toUpperCase();
    const match = orders.find(
      (o) =>
        o.orderNumber.toUpperCase() === cleaned ||
        o.etgbDeclarationNo.toUpperCase() === cleaned ||
        o.airWaybillNo.toUpperCase() === cleaned
    );
    if (match) {
      onSelectOrder(match);
      setSearchError(null);
    } else {
      setSearchError(
        `"${query}" koduna ait aktif sevkiyat bulunamadı. Örnek kodlardan birini seçebilirsiniz: EU-90482, EU-88310, EU-77105`
      );
    }
  };

  return (
    <div className="bg-slate-950 text-white rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden">
      {/* Üst Başlık ve Hızlı Sorgulama Barı */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 p-6 md:p-8 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              CANLI TELEMETRİ & ETGB GÜMRÜK TAKİP SİSTEMİ
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Şeffaf Uluslararası Sipariş & Uçuş Radarı
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Avrupa depomuzdaki barkod okumasından uçağın kargo kabini sıcaklığına ve İstanbul Havalimanı ETGB gümrük beyannamesine kadar her adımı canlı izleyin.
            </p>
          </div>

          {/* Arama Formu */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 min-w-[320px] lg:min-w-[420px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Sipariş No (EU-90482) veya ETGB / AWB Kodu..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-400"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              Sorgula <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Hızlı Örnek Sipariş Seçici Hapları */}
        <div className="mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium mr-1">
            Canlı Örnek Sevkiyatlar:
          </span>
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
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                  active
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <span>#{ord.orderNumber}</span>
                <span className="opacity-75">({ord.customerName})</span>
              </button>
            );
          })}
        </div>

        {searchError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs">
            {searchError}
          </div>
        )}
      </div>

      {/* Üst Özet Telemetri Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-slate-900/60 border-b border-slate-800/80">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>SİPARİŞ & ALICI</span>
            <span className="text-emerald-400 font-semibold">DDP Garantili</span>
          </div>
          <div className="text-lg font-bold text-white mt-1">
            #{selectedOrder.orderNumber} • {selectedOrder.customerName}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            {selectedOrder.customerCity} (TC: {selectedOrder.tcIdentityMasked})
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>HAVA KARGO KONŞİMENTO (AWB)</span>
            <Plane className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-lg font-bold text-sky-300 mt-1 font-mono">
            {selectedOrder.airWaybillNo}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Çıkış: {selectedOrder.originHub}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>RESMİ GÜMRÜK BEYANNAMESİ</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-300 mt-1 font-mono">
            {selectedOrder.etgbDeclarationNo}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Vergiler Peşin Ödendi • Gümrükte Takılmaz
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>TESLİMAT SLA GARANTİSİ</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-amber-300 mt-1">
            {selectedOrder.guaranteedDeliveryDate}
          </div>
          <button
            type="button"
            onClick={() => setShowReceiptModal(!showReceiptModal)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold mt-1 inline-flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Avrupa Mağaza Faturası & Batch Kanıtını Gör
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Orijinal Mağaza Fişi & Batch Doğrulama Kanıt Kutusu (Açılır/Kapanır) */}
      {showReceiptModal && (
        <div className="mx-6 mt-6 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border border-emerald-500/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                Dijital Orijinallik & Avrupa Mağaza Fişi Doğrulaması
              </div>
              <h4 className="text-base font-bold text-white mt-1">
                Fatura Hash Kodu: <span className="font-mono text-emerald-300">{selectedOrder.receiptHash}</span>
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Bu siparişteki her ürün, Avrupa resmi mağazasından (Sephora EU / Space NK / KaDeWe) satın alınmış olup Berlin/Paris depomuzda optik barkod okuyucu ve termal kamera ile kontrol edilmiştir.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs"
                >
                  <div className="text-slate-400">{item.brand}</div>
                  <div className="font-mono font-bold text-emerald-400">
                    Batch: {item.batchCode}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7 Aşamalı Görsel İlerleme Çubuğu (Stepper) */}
      <div className="p-6 md:p-8 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Canlı Lojistik Akış Şeması (Aşama {currentStageIndex + 1} / {ORDER_STAGE_META.length})
          </h3>
          <span className="text-xs text-slate-400">
            Simülasyon için aşağıdaki aşamalardan herhangi birine tıklayabilirsiniz
          </span>
        </div>

        {/* Yatay Görsel İlerleme Çubuğu */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
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
                className={`group text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  isCurrent
                    ? "bg-indigo-600/25 border-indigo-400 shadow-lg shadow-indigo-500/20"
                    : isPast
                    ? "bg-emerald-950/30 border-emerald-500/40 hover:border-emerald-400"
                    : "bg-slate-900/60 border-slate-800 opacity-65 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                      isCurrent
                        ? "bg-indigo-500 text-white animate-pulse"
                        : isPast
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      STAGE_ICONS[meta.stage]
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      isCurrent
                        ? "bg-indigo-500 text-white"
                        : isPast
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    0{meta.stepNumber}
                  </span>
                </div>

                <div className="text-xs font-bold text-white leading-snug">
                  {meta.shortLabel}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {meta.hubTag}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Alt Bölüm: Detaylı Zaman Çizelgesi (Sol) + Sipariş İçeriği & Vergi Şeffaflığı (Sağ) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-8">
        {/* Sol 7 Sütun: Adım Adım Lojistik Logları */}
        <div className="lg:col-span-7 space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-2">
            Gümrük, Depo ve Uçuş Operasyon Kayıtları (Audit Log)
          </h4>

          <div className="space-y-3">
            {selectedOrder.timeline.map((log, index) => {
              const stageIdx = ORDER_STAGE_META.findIndex(
                (s) => s.stage === log.stage
              );
              const isCompleted = stageIdx < currentStageIndex;
              const isActive = stageIdx === currentStageIndex;

              return (
                <div
                  key={log.stage + index}
                  className={`p-4 rounded-2xl border transition ${
                    isActive
                      ? "bg-indigo-950/50 border-indigo-400/70 shadow-lg"
                      : isCompleted
                      ? "bg-slate-900/90 border-slate-800"
                      : "bg-slate-900/30 border-slate-800/50 opacity-60"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isActive
                            ? "bg-indigo-400 animate-ping"
                            : isCompleted
                            ? "bg-emerald-400"
                            : "bg-slate-600"
                        }`}
                      />
                      <span className="font-bold text-sm text-white">
                        {log.title}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {log.badgeCode}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {log.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-indigo-200 font-medium mt-1">
                    {log.subtitle}
                  </p>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {log.description}
                  </p>

                  {/* Telemetri ve Operatör Etiketleri */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {log.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      {log.operatorName}
                    </span>
                    {log.telemetry?.tempSensor && (
                      <span className="inline-flex items-center gap-1 text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded-md">
                        <ThermometerSnowflake className="w-3.5 h-3.5" />
                        {log.telemetry.tempSensor}
                      </span>
                    )}
                    {log.telemetry?.batchCode && (
                      <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md font-mono">
                        Batch: {log.telemetry.batchCode}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sağ 5 Sütun: Paket İçeriği ve Şeffaf Maliyet Tablosu */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">
              Paketteki Doğrulanmış Ürünler
            </h4>
            <div className="space-y-3">
              {selectedOrder.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-700"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-indigo-400">
                      {item.brand}
                    </div>
                    <div className="text-sm font-semibold text-white truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Varyant: {item.variant} • Adet: {item.quantity}
                    </div>
                    <div className="text-[11px] font-mono text-emerald-400 mt-1">
                      ✓ Batch Kodu: {item.batchCode}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-white whitespace-nowrap">
                    {item.unitPriceTry.toLocaleString("tr-TR")} ₺
                  </div>
                </div>
              ))}
            </div>

            {/* Şeffaf Gümrük & Lojistik Fiyat Kırılımı */}
            <div className="mt-5 pt-4 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Avrupa Mağaza Ürün Ara Toplamı</span>
                <span>{selectedOrder.pricing.subtotalTry.toLocaleString("tr-TR")} ₺</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Berlin/Paris Hava Kargo Lojistik</span>
                <span>{selectedOrder.pricing.euLogisticsFeeTry.toLocaleString("tr-TR")} ₺</span>
              </div>
              <div className="flex justify-between text-emerald-300 font-medium">
                <span>Peşin Ödenmiş ETGB Gümrük Vergisi (%100 Garantili)</span>
                <span>{selectedOrder.pricing.customsTaxTry.toLocaleString("tr-TR")} ₺</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Soğuk Zincir & Kırılmazlık Sigortası</span>
                <span>{selectedOrder.pricing.vipInsuranceTry.toLocaleString("tr-TR")} ₺</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                <span>Kapıya Teslim Net Toplam (Ek Masraf Yok)</span>
                <span>{selectedOrder.pricing.totalTry.toLocaleString("tr-TR")} ₺</span>
              </div>
            </div>
          </div>

          {/* Müşteri Güvence Kartı */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-sm font-bold text-white">
                  Sıfır Gümrük Riski & SLA Para İade Garantisi
                </h5>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Standart yurt dışı alışveriş sitelerinin aksine, siparişiniz bireysel posta gümrüğünde takılmaz. Kurumsal ETGB ithalatımızla vergisi peşin ödenir. Taahhüt edilen tarihte teslim edilmeyen siparişlerde anında %15 gecikme tazminatı kartınıza iade edilir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
