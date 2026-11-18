"use client";

import React, { useState, useMemo } from "react";
import {
  ShoppingBag,
  Plane,
  ShieldCheck,
  Sparkles,
  Search,
  SlidersHorizontal,
  Star,
  CheckCircle2,
  Clock,
  Globe,
  ArrowRight,
  Layers,
  Award,
  Send,
  LayoutDashboard,
  Radio,
  BadgeCheck,
  TrendingUp,
} from "lucide-react";
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CUSTOM_REQUESTS,
  Product,
  ProductVariant,
  OrderRecord,
  OrderStageStatus,
  CustomSourcingRequestItem,
} from "@/lib/mock-data";
import LiveOrderTracker from "@/components/LiveOrderTracker";
import SmartCartDrawer, { CartItem } from "@/components/SmartCartDrawer";
import AdminControlCenter from "@/components/AdminControlCenter";

export default function EuroFluxEcommercePlatform() {
  // Ürünler, Siparişler ve Özel Tedarik Talepleri State'leri
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord>(INITIAL_ORDERS[0]);
  const [customRequests, setCustomRequests] = useState<CustomSourcingRequestItem[]>(
    INITIAL_CUSTOM_REQUESTS
  );

  // Sepet State'leri
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: INITIAL_PRODUCTS[0],
      variant: INITIAL_PRODUCTS[0].variants[0],
      quantity: 1,
    },
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Ürün Kartı Varyant Seçimleri
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(
    () => {
      const map: Record<string, string> = {};
      INITIAL_PRODUCTS.forEach((p) => {
        if (p.variants[0]) map[p.id] = p.variants[0].id;
      });
      return map;
    }
  );

  // Gelişmiş Arama ve Filtreleme State'leri
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("TÜMÜ");
  const [selectedBrand, setSelectedBrand] = useState<string>("TÜMÜ");
  const [selectedOrigin, setSelectedOrigin] = useState<string>("TÜMÜ");
  const [selectedSupplyStatus, setSelectedSupplyStatus] = useState<string>("TÜMÜ");
  const [maxPrice, setMaxPrice] = useState<number>(15000);
  const [onlyViral, setOnlyViral] = useState<boolean>(false);

  // Avrupa Özel Ürün İstek (Concierge Link) Formu
  const [conciergeCustomer, setConciergeCustomer] = useState("");
  const [conciergeBrandProduct, setConciergeBrandProduct] = useState("");
  const [conciergeUrl, setConciergeUrl] = useState("");
  const [conciergeCountry, setConciergeCountry] = useState("Fransa 🇫🇷 (Sephora Paris)");
  const [conciergeEur, setConciergeEur] = useState("85");
  const [conciergeSuccess, setConciergeSuccess] = useState(false);

  // Aktif Görünüm Sekmesi (Vitrin, Canlı Takip, Admin)
  const [activeSection, setActiveSection] = useState<
    "STOREFRONT" | "LIVE_TRACKING" | "ADMIN_PANEL"
  >("STOREFRONT");

  const categories = [
    "TÜMÜ",
    "Makyaj & Dudak",
    "Cilt Bakımı",
    "Advent Calendar",
    "Niş Parfüm",
    "Saç & Vücut",
  ];

  const brands = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.brand)));
    return ["TÜMÜ", ...unique];
  }, [products]);

  const origins = ["TÜMÜ", "İngiltere", "Fransa", "Almanya"];

  // Anlık Filtrelenmiş Ürünler
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sourceStore.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.authenticityBatch.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "TÜMÜ" || product.category === selectedCategory;
      const matchesBrand =
        selectedBrand === "TÜMÜ" || product.brand === selectedBrand;
      const matchesOrigin =
        selectedOrigin === "TÜMÜ" || product.originCountry === selectedOrigin;
      const matchesSupply =
        selectedSupplyStatus === "TÜMÜ" ||
        product.supplyStatus === selectedSupplyStatus;
      const matchesPrice = product.priceTry <= maxPrice;
      const matchesViral = !onlyViral || product.isTikTokViral || product.isTrending;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesBrand &&
        matchesOrigin &&
        matchesSupply &&
        matchesPrice &&
        matchesViral
      );
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedOrigin,
    selectedSupplyStatus,
    maxPrice,
    onlyViral,
  ]);

  // Sepete Ekleme
  const handleAddToCart = (product: Product) => {
    const varId = selectedVariants[product.id] || product.variants[0].id;
    const chosenVariant =
      product.variants.find((v) => v.id === varId) || product.variants[0];

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id && item.variant.id === chosenVariant.id
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      return [...prev, { product, variant: chosenVariant, quantity: 1 }];
    });

    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (
    productId: string,
    variantId: string,
    delta: number
  ) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.variant.id === variantId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string, variantId: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === productId && item.variant.id === variantId)
      )
    );
  };

  // Sipariş Aşaması Güncelleme (Hem Takip Panelinden Hem Admin Panelinden)
  const handleUpdateOrderStage = (
    orderNumber: string,
    newStage: OrderStageStatus,
    operatorNote?: string
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.orderNumber !== orderNumber) return ord;
        const updatedTimeline = ord.timeline.map((log) => {
          if (log.stage === newStage && operatorNote) {
            return {
              ...log,
              description: `${log.description} [Operatör Notu: ${operatorNote}]`,
              timestamp: "Şimdi Güncellendi",
            };
          }
          return log;
        });
        const updatedOrder = {
          ...ord,
          currentStage: newStage,
          timeline: updatedTimeline,
        };
        if (selectedOrder.orderNumber === orderNumber) {
          setSelectedOrder(updatedOrder);
        }
        return updatedOrder;
      })
    );
  };

  // Avrupa Depo Stok Senkronizasyonu
  const handleSyncEuropeanStock = () => {
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        stockCount: p.stockCount + 3,
      }))
    );
  };

  // Özel Tedarik Formu Gönderimi
  const handleConciergeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eurVal = Number(conciergeEur) || 80;
    const quotedTry = Math.round(eurVal * 48.5);
    const newReq: CustomSourcingRequestItem = {
      id: `REQ-${Math.floor(500 + Math.random() * 499)}`,
      customerName: conciergeCustomer || "Misafir Müşteri",
      brandAndProduct: conciergeBrandProduct,
      sourceUrl: conciergeUrl || "https://www.sephora.fr",
      country: conciergeCountry,
      requestedAt: "Az Önce",
      estimatedEur: eurVal,
      quotedTotalTry: quotedTry,
      status: "MÜŞTERİ ONAYINDA",
    };
    setCustomRequests((prev) => [newReq, ...prev]);
    setConciergeSuccess(true);
    setConciergeBrandProduct("");
    setConciergeUrl("");
    setTimeout(() => setConciergeSuccess(false), 5000);
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Üst Canlı Güven ve Gümrük Garantisi Duyuru Barı */}
      <div className="bg-slate-950 text-white text-xs py-2.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              GÜMRÜK & VERGİ GARANTİSİ (DDP)
            </span>
            <span className="text-slate-300">
              Berlin, Paris ve Londra depolarımızdan <strong>4-6 iş gününde</strong> ek gümrük masrafı olmadan kapınıza teslim!
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>SON UÇUŞ: TK-1724 (BER -&gt; IST) AKTİF</span>
            <span>•</span>
            <span>ORİJİNAL MAĞAZA FATURALI & BATCH DOĞRULAMALI</span>
          </div>
        </div>
      </div>

      {/* Ana Navigasyon Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          {/* Marka Logosu */}
          <div
            onClick={() => setActiveSection("STOREFRONT")}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-lg shadow-slate-950/20">
              <Plane className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-950">
                  EUROFLUX
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-600 text-white">
                  GLOBAL DIRECT
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Avrupa & Amerika Orijinal Niş Kozmetik ve Şeffaf Lojistik Üssü
              </p>
            </div>
          </div>

          {/* Orta Modül Geçiş Sekmeleri */}
          <nav className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveSection("STOREFRONT")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSection === "STOREFRONT"
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Avrupa Koleksiyonu & Vitrin
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("LIVE_TRACKING")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSection === "LIVE_TRACKING"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              Canlı Sipariş & Uçuş Radarı
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("ADMIN_PANEL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeSection === "ADMIN_PANEL"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Admin & Lojistik Paneli
            </button>
          </nav>

          {/* Sağ Aksiyonlar: Hızlı Sipariş Sorgu + Akıllı Sepet */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2.5 transition cursor-pointer shadow-lg shadow-slate-950/15"
            >
              <ShoppingBag className="w-4 h-4 text-indigo-400" />
              <span>Sepet & Vergi Özeti</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-extrabold">
                {totalCartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Ana İçerik Alanı */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-14">
        {/* 1. HERO & GÜVEN MİMARİSİ (Her zaman veya Vitrinde göster) */}
        {activeSection === "STOREFRONT" && (
          <section className="relative rounded-3xl bg-slate-950 text-white overflow-hidden border border-slate-800 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 lg:p-12 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
                  <BadgeCheck className="w-4 h-4 text-emerald-400" />
                  SEPHORA PARIS • SPACE NK LONDON • KADEWE BERLIN RESMİ FATURALI TEDARİK
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  Avrupa’nın Niş Kozmetik & Lüks Koleksiyonları,{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-300">
                    Sıfır Gümrük Riskiyle
                  </span>{" "}
                  Kapınızda.
                </h1>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                  Standart yurt dışı kargo sitelerindeki <strong>&ldquo;haftalarca hazırlıkta bekleme&rdquo;</strong>,{" "}
                  <strong>&ldquo;gümrükte takılma&rdquo;</strong> ve <strong>&ldquo;muhatap bulamama&rdquo;</strong> sorunlarını tamamen bitirdik. Berlin ve Paris lojistik merkezlerimizdeki hazır stokları, peşin ödenmiş ETGB gümrük beyannamesi ve canlı uçuş telemetrisiyle 4-6 iş gününde teslim ediyoruz.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="#catalog-section"
                    className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                  >
                    Hazır Avrupa Stoklarını Keşfet
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setActiveSection("LIVE_TRACKING")}
                    className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm transition flex items-center gap-2 cursor-pointer"
                  >
                    <Radio className="w-4 h-4 text-emerald-400" />
                    Canlı Sipariş & Uçuş Radarını Test Et
                  </button>
                </div>

                {/* 3 Kritik Güven Garantisi Rozeti */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800/90">
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                    <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      %100 Gümrük Garantisi
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Vergiler sepette peşin ödenir (DDP). Kapıda 1 TL dahi ek masraf çıkmaz.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                    <div className="text-sky-400 font-bold text-xs flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      Batch & Fatura Kanıtı
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Her ürünün Avrupa mağaza fişi ve kutu batch kodu panelinize yüklenir.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                    <div className="text-amber-400 font-bold text-xs flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      4-6 Gün SLA Sözleşmesi
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Taahhüt edilen sürede gelmezse anında %15 gecikme iadesi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sağ Canlı Telemetri Önizleme Kartı */}
              <div className="lg:col-span-5">
                <div className="p-5 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[11px] text-emerald-400 font-bold uppercase">
                        CANLI SEVKİYAT ÖNİZLEMESİ
                      </span>
                      <h3 className="text-base font-extrabold text-white">
                        #{selectedOrder.orderNumber} • {selectedOrder.customerName}
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold">
                      {selectedOrder.airWaybillNo}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {selectedOrder.timeline.slice(0, 4).map((log, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-start gap-3"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white truncate">
                            {log.title}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center justify-between mt-0.5">
                            <span>{log.location}</span>
                            <span className="font-mono text-emerald-400">
                              {log.badgeCode}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveSection("LIVE_TRACKING")}
                    className="w-full py-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition cursor-pointer"
                  >
                    7 Aşamalı Tam Takip Paneline Git →
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 2. CANLI SİPARİŞ TAKİP PANELİ (Hem kendi sekmesinde hem de vitrin altında erişilebilir) */}
        {(activeSection === "LIVE_TRACKING" || activeSection === "STOREFRONT") && (
          <section id="tracking-section" className="space-y-4">
            <LiveOrderTracker
              orders={orders}
              selectedOrder={selectedOrder}
              onSelectOrder={setSelectedOrder}
              onSimulateStageChange={(orderNo, stage) =>
                handleUpdateOrderStage(orderNo, stage)
              }
            />
          </section>
        )}

        {/* 3. GELİŞMİŞ ARAMA, FİLTRELEME VE ÜRÜN KATALOĞU */}
        {activeSection === "STOREFRONT" && (
          <section id="catalog-section" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600">
                  <Layers className="w-4 h-4" />
                  Avrupa Depo & Butik Tedarik Kataloğu
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1">
                  Gümrük Vergisi Dahil Orijinal Koleksiyonlar
                </h2>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Toplam <strong>{filteredProducts.length}</strong> doğrulanmış Avrupa ürünü listeleniyor
              </div>
            </div>

            {/* Gelişmiş Anlık Filtreleme Barı */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Arama Kutusu */}
                <div className="md:col-span-4 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Marka, ürün, mağaza (Sephora, Rhode) veya Batch ara..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-indigo-600"
                  />
                </div>

                {/* Marka Filtresi */}
                <div className="md:col-span-2">
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white"
                  >
                    {brands.map((b) => (
                      <option key={b} value={b}>
                        Marka: {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Çıkış Ülkesi Filtresi */}
                <div className="md:col-span-2">
                  <select
                    value={selectedOrigin}
                    onChange={(e) => setSelectedOrigin(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white"
                  >
                    {origins.map((orig) => (
                      <option key={orig} value={orig}>
                        Ülke: {orig}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tedarik Hızı Filtresi */}
                <div className="md:col-span-2">
                  <select
                    value={selectedSupplyStatus}
                    onChange={(e) => setSelectedSupplyStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white"
                  >
                    <option value="TÜMÜ">Tedarik: Tümü</option>
                    <option value="EXPRESS_READY_EU">Avrupa Depoda Hazır (3-5 Gün)</option>
                    <option value="LIMITED_DROP">Sınırlı Advent / Drop</option>
                    <option value="BOUTIQUE_PREORDER">Paris Butik Sipariş</option>
                  </select>
                </div>

                {/* Viral / Trend Filtresi */}
                <div className="md:col-span-2 flex items-center">
                  <button
                    type="button"
                    onClick={() => setOnlyViral(!onlyViral)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      onlyViral
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    TikTok / IG Viral
                  </button>
                </div>
              </div>

              {/* Kategori Hapları ve Fiyat Aralığı Slider'ı */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        selectedCategory === cat
                          ? "bg-slate-950 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600 whitespace-nowrap">
                    Maks. Fiyat: {maxPrice.toLocaleString("tr-TR")} ₺
                  </span>
                  <input
                    type="range"
                    min={2000}
                    max={15000}
                    step={250}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-36 accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Ürün Grid Listesi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const chosenVarId =
                  selectedVariants[product.id] || product.variants[0]?.id;
                const activeVariant: ProductVariant =
                  product.variants.find((v) => v.id === chosenVarId) ||
                  product.variants[0];
                const finalPrice =
                  product.priceTry + (activeVariant?.priceDiffTry || 0);

                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-3xl border border-slate-200 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
                  >
                    {/* Ürün Görseli ve Üst Rozetler */}
                    <div className="relative h-64 bg-slate-100 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-950/90 backdrop-blur-md text-white text-[11px] font-bold">
                          {product.originFlag} {product.originCity} Çıkışlı
                        </span>
                        {product.isTikTokViral && (
                          <span className="px-2.5 py-1 rounded-xl bg-rose-600 text-white text-[10px] font-extrabold uppercase">
                            Viral Hit
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-[11px] font-bold text-slate-900 flex items-center justify-between">
                          <span className="flex items-center gap-1 text-emerald-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            {product.estimatedDeliveryDays}
                          </span>
                          <span className="font-mono text-slate-500">
                            {product.authenticityBatch}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ürün Detayları */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-indigo-600 uppercase tracking-wider">
                            {product.brand}
                          </span>
                          <span className="flex items-center gap-1 font-bold text-amber-600">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {product.rating} ({product.reviewCount})
                          </span>
                        </div>

                        <h3 className="text-base font-extrabold text-slate-950 mt-1 line-clamp-2">
                          {product.name}
                        </h3>

                        <p className="text-[11px] text-slate-500 mt-1">
                          Kaynak: <strong className="text-slate-700">{product.sourceStore}</strong>
                        </p>

                        {/* Varyant Seçici (Renk / Boyut) */}
                        <div className="mt-3">
                          <div className="text-[11px] font-bold text-slate-600 mb-1.5">
                            {activeVariant?.type}:{" "}
                            <span className="text-slate-900">{activeVariant?.name}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {product.variants.map((v) => {
                              const isSelected = v.id === activeVariant?.id;
                              return (
                                <button
                                  key={v.id}
                                  type="button"
                                  onClick={() =>
                                    setSelectedVariants((prev) => ({
                                      ...prev,
                                      [product.id]: v.id,
                                    }))
                                  }
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                                    isSelected
                                      ? "border-slate-950 bg-slate-950 text-white"
                                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-400"
                                  }`}
                                >
                                  {v.hexColor && (
                                    <span
                                      className="w-2.5 h-2.5 rounded-full border border-white/40"
                                      style={{ backgroundColor: v.hexColor }}
                                    />
                                  )}
                                  <span className="truncate max-w-[130px]">{v.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Fiyat, Gümrük Rozeti ve Sepete Ekle */}
                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <div className="text-xl font-black text-slate-950">
                              {finalPrice.toLocaleString("tr-TR")} ₺
                            </div>
                            <div className="text-[11px] text-emerald-700 font-bold">
                              ✓ Gümrük & Vergi Dahil (€{product.basePriceEur})
                            </div>
                          </div>
                          {product.oldPriceTry && (
                            <span className="text-xs text-slate-400 line-through font-semibold">
                              {product.oldPriceTry.toLocaleString("tr-TR")} ₺
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          className="w-full py-3 rounded-2xl bg-slate-950 hover:bg-indigo-600 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Gümrük Garantili Sepete Ekle
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 4. AVRUPA'DAN ÖZEL ÜRÜN TEDARİK (CONCIERGE LINK) MODÜLÜ */}
        {activeSection === "STOREFRONT" && (
          <section className="rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-900 text-white p-6 sm:p-10 border border-indigo-500/30 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
                  <Globe className="w-3.5 h-3.5" />
                  PERSONAL SHOPPER & CONCIERGE (ÖZEL TEDARİK)
                </div>
                <h3 className="text-2xl sm:text-3xl font-black">
                  Katalogda Bulamadığınız Bir Avrupa / Amerika Ürünü mü Var?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Sephora Fransa, Space NK Londra, Cult Beauty veya resmi marka sitesindeki ürünün linkini yapıştırın. Berlin/Paris satın alma ekibimiz gümrük vergisi, hava kargo ve sigorta dahil <strong>her şey içinde net TL fiyatını</strong> hesaplayıp hesabınıza tanımlasın.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                    <div className="font-bold text-emerald-400">30€ Sınırına Takılmaz</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Ticari/Kurumsal ithalat konsolidasyonumuzla yüksek tutarlı setler güvenle gelir.
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                    <div className="font-bold text-sky-400">Mağaza Fişi Garantisi</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Ürününüz satın alındığı an kasadaki orijinal fiş fotoğrafı size iletilir.
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <form
                  onSubmit={handleConciergeSubmit}
                  className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3.5"
                >
                  <h4 className="text-sm font-bold text-white">
                    Anında Gümrük Dahil Özel Tedarik Teklifi Alın
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Adınız Soyadınız"
                      value={conciergeCustomer}
                      onChange={(e) => setConciergeCustomer(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                    <select
                      value={conciergeCountry}
                      onChange={(e) => setConciergeCountry(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-semibold"
                    >
                      <option>Fransa 🇫🇷 (Sephora Paris)</option>
                      <option>İngiltere 🇬🇧 (Space NK / Cult Beauty)</option>
                      <option>Almanya 🇩🇪 (KaDeWe / Douglas)</option>
                      <option>ABD 🇺🇸 (Sephora USA -&gt; Berlin Transit)</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Marka ve Ürün Adı (Örn: Charlotte Tilbury Pillow Talk Vault)"
                    value={conciergeBrandProduct}
                    onChange={(e) => setConciergeBrandProduct(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="url"
                      placeholder="Ürün Linki (Opsiyonel)"
                      value={conciergeUrl}
                      onChange={(e) => setConciergeUrl(e.target.value)}
                      className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                    <input
                      type="number"
                      placeholder="Etiket Fiyatı (€)"
                      value={conciergeEur}
                      onChange={(e) => setConciergeEur(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Özel Tedarik Talebi Oluştur (Admin Paneline Düşer)
                  </button>

                  {conciergeSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold">
                      ✓ Talebiniz oluşturuldu! Admin & Lojistik Panelindeki &ldquo;Müşteri Özel Ürün İstekleri&rdquo; sekmesine eklendi.
                    </div>
                  )}
                </form>
              </div>
            </div>
          </section>
        )}

        {/* 5. YÖNETİM PANELİ (ADMIN DASHBOARD) */}
        {(activeSection === "ADMIN_PANEL" || activeSection === "STOREFRONT") && (
          <section id="admin-section">
            <AdminControlCenter
              orders={orders}
              products={products}
              customRequests={customRequests}
              onUpdateOrderStage={handleUpdateOrderStage}
              onSyncEuropeanStock={handleSyncEuropeanStock}
            />
          </section>
        )}
      </main>

      {/* Alt Bilgi (Footer) */}
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
              EF
            </div>
            <div>
              <div className="font-bold text-white">
                EUROFLUX GLOBAL E-COMMERCE & DDP LOGISTICS ARCHITECTURE
              </div>
              <div className="text-[11px] text-slate-500">
                Berlin Hub • Paris Hub • London Hub • İstanbul Havalimanı ETGB Transfer Merkezi
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-500">
            iyzico & PayTR 3D Secure Korumalı Ödeme • %100 Orijinal Batch Garantisi
          </div>
        </div>
      </footer>

      {/* Akıllı Sepet & Şeffaf Vergi Çekmecesi */}
      <SmartCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCartItems([])}
        onOrderCreated={(newOrder) => {
          setOrders((prev) => [newOrder, ...prev]);
          setSelectedOrder(newOrder);
        }}
      />
    </div>
  );
}
