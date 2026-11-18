"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CUSTOM_REQUESTS,
  Product,
  OrderRecord,
  OrderStageStatus,
  CustomSourcingRequestItem,
} from "@/lib/mock-data";
import AdminControlCenter from "@/components/AdminControlCenter";

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_ORDERS);
  const [customRequests] = useState<CustomSourcingRequestItem[]>(
    INITIAL_CUSTOM_REQUESTS
  );

  const handleUpdateOrderStage = (
    orderNumber: string,
    newStage: OrderStageStatus
  ) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.orderNumber === orderNumber
          ? { ...ord, currentStage: newStage }
          : ord
      )
    );
  };

  const handleSyncEuropeanStock = () => {
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        stockCount: p.stockCount + 2,
      }))
    );
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#563C49] flex flex-col">
      {/* Üst Bar */}
      <header className="bg-white border-b border-[#563C49]/10 py-4 px-4 sm:px-8">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#563C49] flex items-center justify-center text-white font-semibold text-base">
              A
            </div>
            <div className="leading-none">
              <span className="block text-[20px] font-bold tracking-[0.18em] text-[#563C49]">
                ADEN
              </span>
              <span className="block text-[10px] font-medium tracking-[0.22em] text-[#9F8291] uppercase mt-0.5">
                ADMIN & LOJİSTİK YÖNETİMİ
              </span>
            </div>
          </div>

          <Link
            href="/"
            className="px-4 py-2 rounded-[30px] bg-[#563C49]/[0.06] hover:bg-[#563C49]/15 text-[#563C49] text-xs font-medium flex items-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Mağaza Vitrinine Dön</span>
            <ShoppingBag className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-8 flex-1">
        <AdminControlCenter
          orders={orders}
          products={products}
          customRequests={customRequests}
          onUpdateOrderStage={handleUpdateOrderStage}
          onSyncEuropeanStock={handleSyncEuropeanStock}
        />
      </main>
    </div>
  );
}
