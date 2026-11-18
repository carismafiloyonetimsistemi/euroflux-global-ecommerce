"use client";

import React, { useState } from "react";
import {
  RefreshCw,
  CheckCircle2,
  Printer,
  QrCode,
} from "lucide-react";
import {
  ORDER_STAGE_META,
  OrderRecord,
  OrderStageStatus,
  Product,
  CustomSourcingRequestItem,
  formatTL,
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
  const [printedLabelOrder, setPrintedLabelOrder] = useState<OrderRecord | null>(null);

  const handleSync = () => {
    onSyncEuropeanStock();
    setSyncMessage("Avrupa mağaza ve depo stokları başarıyla güncellendi.");
    setTimeout(() => setSyncMessage(null), 4000);
  };

  return (
    <div className="bg-white rounded-[24px] border border-[#563C49]/10 p-6 md:p-10 shadow-sm text-[#563C49]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#563C49]/10">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#563C49]/60">
            Mağaza & Lojistik Yönetimi
          </span>
          <h2 className="text-2xl font-medium text-[#563C49] mt-0.5">
            Sipariş, Kargo Aşaması ve Stok Yönetim Paneli
          </h2>
        </div>

        <button
          type="button"
          onClick={handleSync}
          className="px-5 py-2.5 rounded-[30px] bg-[#563C49] hover:bg-[#9F8291] text-white text-xs font-medium flex items-center gap-2 transition cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Avrupa Stoklarını Güncelle
        </button>
      </div>

      {syncMessage && (
        <div className="mt-4 p-3.5 rounded-[16px] bg-[#438E44]/10 text-[#438E44] text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {syncMessage}
        </div>
      )}

      {/* Sekmeler */}
      <div className="flex flex-wrap gap-2 py-5 border-b border-[#563C49]/10">
        <button
          type="button"
          onClick={() => setActiveTab("ORDERS")}
          className={`px-5 py-2 rounded-[30px] text-xs font-medium transition cursor-pointer ${
            activeTab === "ORDERS"
              ? "bg-[#563C49] text-white"
              : "bg-[#563C49]/[0.06] text-[#563C49]"
          }`}
        >
          Siparişler & Kargo Durumu ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("INVENTORY")}
          className={`px-5 py-2 rounded-[30px] text-xs font-medium transition cursor-pointer ${
            activeTab === "INVENTORY"
              ? "bg-[#563C49] text-white"
              : "bg-[#563C49]/[0.06] text-[#563C49]"
          }`}
        >
          Ürün & Stok Listesi ({products.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("SOURCING")}
          className={`px-5 py-2 rounded-[30px] text-xs font-medium transition cursor-pointer ${
            activeTab === "SOURCING"
              ? "bg-[#563C49] text-white"
              : "bg-[#563C49]/[0.06] text-[#563C49]"
          }`}
        >
          Özel Ürün Talepleri ({customRequests.length})
        </button>
      </div>

      <div className="pt-6">
        {activeTab === "ORDERS" && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-[20px] border border-[#563C49]/10 bg-[#F9F8F6] space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-base font-medium text-[#563C49]">
                        #{order.orderNumber}
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full bg-white border border-[#563C49]/10">
                        {order.customerName} ({order.customerCity})
                      </span>
                    </div>
                    <div className="text-xs text-[#563C49]/70 mt-1">
                      {order.items.map((i) => `${i.brand} - ${i.name}`).join(", ")} •{" "}
                      <strong>{formatTL(order.pricing.totalTry)}</strong>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={order.currentStage}
                      onChange={(e) =>
                        onUpdateOrderStage(
                          order.orderNumber,
                          e.target.value as OrderStageStatus
                        )
                      }
                      className="px-4 py-2 rounded-[30px] border border-[#563C49]/20 bg-white text-xs font-medium text-[#563C49]"
                    >
                      {ORDER_STAGE_META.map((st) => (
                        <option key={st.stage} value={st.stage}>
                          0{st.stepNumber} - {st.shortLabel}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setPrintedLabelOrder(order)}
                      className="px-4 py-2 rounded-[30px] bg-[#563C49] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Kargo Etiketi
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "INVENTORY" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#563C49]/10 text-[#563C49]/60">
                  <th className="py-3 px-3">Marka & Ürün</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3">Durum</th>
                  <th className="py-3 px-3">Stok</th>
                  <th className="py-3 px-3">Fiyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#563C49]/10">
                {products.map((prd) => (
                  <tr key={prd.id}>
                    <td className="py-3 px-3">
                      <div className="font-medium text-[#563C49]">{prd.name}</div>
                      <div className="text-[#563C49]/60">{prd.brand}</div>
                    </td>
                    <td className="py-3 px-3">{prd.category}</td>
                    <td className="py-3 px-3">
                      {prd.isPreOrder ? "Ön Sipariş" : "Hemen Teslim"}
                    </td>
                    <td className="py-3 px-3">{prd.stockCount} Adet</td>
                    <td className="py-3 px-3 font-medium">
                      {formatTL(prd.priceTry)}
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
                className="p-4 rounded-[16px] border border-[#563C49]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="text-sm font-medium text-[#563C49]">
                    {req.brandAndProduct}
                  </div>
                  <div className="text-xs text-[#563C49]/65 mt-0.5">
                    {req.customerName} • {req.country} • {req.status}
                  </div>
                </div>
                <div className="text-sm font-medium text-[#563C49]">
                  {formatTL(req.quotedTotalTry)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {printedLabelOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#563C49]/50 p-4">
          <div className="bg-white text-[#563C49] rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-[#563C49]/20">
            <div className="flex items-center justify-between border-b border-[#563C49]/15 pb-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-[#563C49]/70">
                  AVRUPADAN KARGOM • ULUSLARARASI TRANSFER
                </div>
                <div className="text-lg font-medium">
                  #{printedLabelOrder.orderNumber}
                </div>
              </div>
              <QrCode className="w-10 h-10 text-[#563C49]" />
            </div>
            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#563C49]/65">Alıcı:</span>
                <span className="font-medium">{printedLabelOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#563C49]/65">Şehir:</span>
                <span>{printedLabelOrder.customerCity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#563C49]/65">Çıkış Merkezi:</span>
                <span>{printedLabelOrder.originHub}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPrintedLabelOrder(null)}
              className="mt-2 w-full py-2.5 rounded-[30px] bg-[#563C49] text-white text-xs font-medium cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
