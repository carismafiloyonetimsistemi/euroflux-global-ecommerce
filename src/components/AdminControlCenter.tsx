"use client";

import React, { useState } from "react";
import {
  RefreshCw,
  CheckCircle2,
  Printer,
  QrCode,
  Plus,
  Trash2,
  CreditCard,
  Video,
  Package,
  Link2,
  Copy,
} from "lucide-react";
import {
  ORDER_STAGE_META,
  OrderRecord,
  OrderStageStatus,
  Product,
  CustomSourcingRequestItem,
  SocialReelItem,
  PaymentSettingsConfig,
  formatTL,
} from "@/lib/mock-data";

interface AdminControlCenterProps {
  orders: OrderRecord[];
  products: Product[];
  customRequests: CustomSourcingRequestItem[];
  socialReels: SocialReelItem[];
  paymentSettings: PaymentSettingsConfig;
  onUpdateOrderStage: (
    orderNumber: string,
    newStage: OrderStageStatus,
    note?: string
  ) => void;
  onSyncEuropeanStock: () => void;
  onAddProduct: (newProduct: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onAddSocialReel: (newReel: SocialReelItem) => void;
  onDeleteSocialReel: (reelId: string) => void;
  onUpdatePaymentSettings: (newSettings: PaymentSettingsConfig) => void;
  onBackToStorefront?: () => void;
}

export default function AdminControlCenter({
  orders,
  products,
  customRequests,
  socialReels,
  paymentSettings,
  onUpdateOrderStage,
  onSyncEuropeanStock,
  onAddProduct,
  onDeleteProduct,
  onAddSocialReel,
  onDeleteSocialReel,
  onUpdatePaymentSettings,
  onBackToStorefront,
}: AdminControlCenterProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "PRODUCTS" | "ORDERS" | "REELS" | "PAYMENTS" | "SOURCING"
  >("PRODUCTS");
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [printedLabelOrder, setPrintedLabelOrder] = useState<OrderRecord | null>(null);
  const [stageNotes, setStageNotes] = useState<Record<string, string>>({});

  // Yeni Ürün Ekleme Formu State'leri
  const [prdName, setPrdName] = useState("");
  const [prdBrand, setPrdBrand] = useState("");
  const [prdCategory, setPrdCategory] = useState<Product["category"]>("Advent Takvimi");
  const [prdPriceTry, setPrdPriceTry] = useState("15000");
  const [prdOldPriceTry, setPrdOldPriceTry] = useState("");
  const [prdIsPreOrder, setPrdIsPreOrder] = useState(true);
  const [prdBadge, setPrdBadge] = useState<"YENİ" | "İNDİRİM" | "HEMEN TESLİM">("YENİ");
  const [prdOrigin, setPrdOrigin] = useState<"Fransa" | "İngiltere" | "Almanya" | "ABD">("Fransa");
  const [prdImage, setPrdImage] = useState(
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1100&q=85"
  );
  const [prdDesc, setPrdDesc] = useState(
    "Avrupa resmi mağazasından siparişinize özel faturalı ve gümrük garantili orijinal koleksiyon ürünü."
  );
  const [prdStock, setPrdStock] = useState("10");

  // Yeni Instagram / TikTok Videosu Ekleme State'leri
  const [reelTitle, setReelTitle] = useState("");
  const [reelPlatform, setReelPlatform] = useState<"INSTAGRAM" | "TIKTOK">("INSTAGRAM");
  const [reelHandle, setReelHandle] = useState("@aden.global");
  const [reelVideoUrl, setReelVideoUrl] = useState(
    "https://assets.mixkit.co/videos/preview/mixkit-woman-applying-makeup-in-front-of-a-mirror-39773-large.mp4"
  );
  const [reelPoster, setReelPoster] = useState(
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=85"
  );
  const [reelProductSlug, setReelProductSlug] = useState(
    products[0]?.slug || "armani-advent-calendar-2"
  );

  const showNotice = (msg: string) => {
    setSyncMessage(msg);
    setTimeout(() => setSyncMessage(null), 4500);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const slug =
      prdName
        .toLowerCase()
        .replace(/[^a-z0-9ğüşıöç]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      Math.floor(10 + Math.random() * 89);

    const newProduct: Product = {
      id: `prd-${Date.now()}`,
      slug,
      sku: `ADN-${Math.floor(1000 + Math.random() * 8999)}`,
      name: prdName,
      brand: prdBrand || "ADEN Exclusive",
      category: prdCategory,
      originCountry: prdOrigin,
      originFlag:
        prdOrigin === "Fransa"
          ? "🇫🇷"
          : prdOrigin === "İngiltere"
          ? "🇬🇧"
          : prdOrigin === "Almanya"
          ? "🇩🇪"
          : "🇺🇸",
      originCity:
        prdOrigin === "Fransa"
          ? "Paris"
          : prdOrigin === "İngiltere"
          ? "Londra"
          : prdOrigin === "Almanya"
          ? "Berlin"
          : "New York",
      sourceStore: `${prdBrand || "ADEN"} Official Boutique`,
      supplyStatus: prdIsPreOrder ? "BOUTIQUE_PREORDER" : "EXPRESS_READY_EU",
      supplyBadgeText: prdIsPreOrder ? "Ön Sipariş" : "Hemen Teslim",
      estimatedDeliveryDays: prdIsPreOrder ? "7-12 İş Günü" : "3-5 İş Günü",
      basePriceEur: Math.round(Number(prdPriceTry) / 50),
      priceTry: Number(prdPriceTry) || 5000,
      oldPriceTry: prdOldPriceTry ? Number(prdOldPriceTry) : undefined,
      badgeType: prdBadge,
      isPreOrder: prdIsPreOrder,
      customsIncluded: true,
      authenticityBatch: `ADN-2026-${Math.floor(100 + Math.random() * 899)}`,
      rating: 5.0,
      reviewCount: 12,
      stockCount: Number(prdStock) || 10,
      isTrending: true,
      description: prdDesc,
      deliveryNotes: prdIsPreOrder
        ? [
            "*Ürün siparişiniz üzerine tedarik edilecektir.",
            "*Markanın gönderimine bağlı olarak teslimat süresi değişkenlik göstermektedir.",
            "*Detaylı bilgi için iletişime geçiniz.",
          ]
        : [
            "*Hemen teslim stoklarımızdadır, 3-5 iş günü içinde teslim edilir.",
            "*Gümrük ve kargo süreçleri fiyata dahildir.",
          ],
      highlights: [
        "Avrupa Resmi Mağaza Faturalı",
        "Gümrük Dahil Kapıya Teslim",
      ],
      image: prdImage,
      variants: [
        {
          id: `var-${Date.now()}`,
          type: "Set",
          name: "Standart Orijinal Boy",
          priceDiffTry: 0,
          stock: Number(prdStock) || 10,
        },
      ],
    };

    onAddProduct(newProduct);
    setPrdName("");
    setPrdBrand("");
    showNotice(
      `"${newProduct.name}" mağazaya eklendi! Instagram Hikaye Linki: /products/${newProduct.slug}`
    );
  };

  const handleCreateReel = (e: React.FormEvent) => {
    e.preventDefault();
    const newReel: SocialReelItem = {
      id: `reel-${Date.now()}`,
      title: reelTitle || "Yeni Güzellik Keşfi ✨",
      creatorHandle: reelHandle || "@aden.global",
      platform: reelPlatform,
      viewsText: "Yeni Video",
      videoUrl: reelVideoUrl,
      posterImage: reelPoster,
      linkedProductSlug: reelProductSlug,
    };
    onAddSocialReel(newReel);
    setReelTitle("");
    showNotice(
      "Yeni Instagram/TikTok videosu vitrindeki 'Akışında gördün, burada buldun' bölümüne eklendi!"
    );
  };

  return (
    <div className="bg-white rounded-[28px] border border-[#B85D79]/20 p-6 md:p-10 shadow-sm text-[#3B1E28]">
      {!isAuthenticated ? (
        <div className="max-w-md mx-auto py-12 text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#B85D79] to-[#8E3A53] text-white font-serif-editorial italic text-3xl flex items-center justify-center mx-auto shadow-md">
            A
          </div>
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#B85D79] font-semibold">
              ADEN GLOBAL BEAUTY
            </span>
            <h2 className="font-serif-editorial text-3xl font-semibold text-[#3B1E28] mt-1">
              Mağaza Sahibi (Admin) Girişi
            </h2>
            <p className="text-xs text-[#3B1E28]/70 mt-1">
              Bu ekran yalnızca mağaza sahibi ve operasyon yetkilisi içindir. Müşteriler bu sayfayı göremez.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (
                adminPassword.trim().toLowerCase() === "aden2026" ||
                adminPassword.trim() === "1234"
              ) {
                setIsAuthenticated(true);
                setAuthError(false);
              } else {
                setAuthError(true);
              }
            }}
            className="space-y-3 text-left"
          >
            <div>
              <label className="block text-xs font-semibold text-[#3B1E28] mb-1">
                Yönetici Şifresi (Demo Şifre: <code className="text-[#B85D79]">aden2026</code>)
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Şifrenizi girin (aden2026)"
                className="w-full px-4 py-3 rounded-full bg-[#FFF9FA] border border-[#B85D79]/30 text-sm focus:outline-none focus:border-[#B85D79]"
              />
            </div>

            {authError && (
              <p className="text-xs text-[#D9385A] font-medium">
                Hatalı şifre! Demo giriş için: aden2026 yazabilirsiniz.
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-[#B85D79] hover:bg-[#A14A66] text-white font-semibold text-sm transition cursor-pointer shadow-md"
            >
              Yönetim Paneline Giriş Yap
            </button>
          </form>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setIsAuthenticated(true);
              }}
              className="text-xs text-[#B85D79] underline underline-offset-4 cursor-pointer"
            >
              Tek Tıkla Hızlı Demo Girişi Yap &rarr;
            </button>
          </div>
        </div>
      ) : (
        <>
      {/* Üst Başlık */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#563C49]/10">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#563C49]/[0.06] text-xs font-medium text-[#563C49] mb-2">
            Gizli Yönetici Paneli (/admin) • Müşterilere Görünmez
          </span>
          <h2 className="text-2xl sm:text-3xl font-medium text-[#563C49]">
            ADEN Mağaza, Ürün, Video & Ödeme Yönetim Merkezi
          </h2>
          <p className="text-xs text-[#563C49]/70 mt-1">
            Buradan yeni ürün ekleyebilir, Instagram/TikTok videolarını ürünlere bağlayabilir, G Pay / iyzico / PayTR ödeme yöntemlerini açıp kapatabilir ve sipariş aşamalarını yönetebilirsiniz.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {onBackToStorefront && (
            <button
              type="button"
              onClick={onBackToStorefront}
              className="px-5 py-2.5 rounded-[30px] border border-[#563C49]/20 hover:bg-[#563C49]/[0.06] text-[#563C49] text-xs font-medium transition cursor-pointer"
            >
              &larr; Müşteri Vitrinine Dön
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onSyncEuropeanStock();
              showNotice("Avrupa mağaza ve depo stokları başarıyla güncellendi.");
            }}
            className="px-5 py-2.5 rounded-[30px] bg-[#563C49] hover:bg-[#9F8291] text-white text-xs font-medium flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Stokları Senkronize Et
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="mt-4 p-4 rounded-[16px] bg-[#438E44]/10 text-[#438E44] text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Sekme Menüsü */}
      <div className="flex flex-wrap gap-2 py-5 border-b border-[#563C49]/10">
        <button
          type="button"
          onClick={() => setActiveTab("PRODUCTS")}
          className={`px-5 py-2.5 rounded-[30px] text-xs font-medium flex items-center gap-2 transition cursor-pointer ${
            activeTab === "PRODUCTS"
              ? "bg-[#563C49] text-white"
              : "bg-[#563C49]/[0.06] text-[#563C49] hover:bg-[#563C49]/12"
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          1. Ürün Ekle & Yönet ({products.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("REELS")}
          className={`px-5 py-2.5 rounded-[30px] text-xs font-medium flex items-center gap-2 transition cursor-pointer ${
            activeTab === "REELS"
              ? "bg-[#563C49] text-white"
              : "bg-[#563C49]/[0.06] text-[#563C49] hover:bg-[#563C49]/12"
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          2. Instagram & TikTok Videoları ({socialReels.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PAYMENTS")}
          className={`px-5 py-2.5 rounded-[30px] text-xs font-medium flex items-center gap-2 transition cursor-pointer ${
            activeTab === "PAYMENTS"
              ? "bg-[#563C49] text-white"
              : "bg-[#563C49]/[0.06] text-[#563C49] hover:bg-[#563C49]/12"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          3. Ödeme Yöntemleri (G Pay / iyzico / PayTR)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ORDERS")}
          className={`px-5 py-2.5 rounded-[30px] text-xs font-medium flex items-center gap-2 transition cursor-pointer ${
            activeTab === "ORDERS"
              ? "bg-[#563C49] text-white"
              : "bg-[#563C49]/[0.06] text-[#563C49] hover:bg-[#563C49]/12"
          }`}
        >
          4. Siparişler & Kargo Durumu ({orders.length})
        </button>
      </div>

      {/* ===================================================================== */}
      {/* SEKME 1: ÜRÜN EKLEME & ÜRÜN LİSTESİ (INSTAGRAM LİNK KOPYALAMALI)      */}
      {/* ===================================================================== */}
      {activeTab === "PRODUCTS" && (
        <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sol: Yeni Ürün Ekleme Formu */}
          <div className="lg:col-span-5">
            <form
              onSubmit={handleCreateProduct}
              className="p-6 rounded-[20px] bg-[#F9F8F6] border border-[#563C49]/10 space-y-4"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-[#563C49]/10">
                <Plus className="w-4 h-4 text-[#563C49]" />
                <h3 className="text-base font-medium text-[#563C49]">
                  Yeni Ürün Ekle
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Marka Adı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Charlotte Tilbury"
                    value={prdBrand}
                    onChange={(e) => setPrdBrand(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-[14px] bg-white border border-[#563C49]/20 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Kategori *
                  </label>
                  <select
                    value={prdCategory}
                    onChange={(e) =>
                      setPrdCategory(e.target.value as Product["category"])
                    }
                    className="w-full px-3.5 py-2 rounded-[14px] bg-white border border-[#563C49]/20 text-xs"
                  >
                    <option value="Advent Takvimi">Advent Takvimi</option>
                    <option value="Setler">Setler</option>
                    <option value="Makyaj">Makyaj</option>
                    <option value="Bakım">Bakım</option>
                    <option value="Parfüm">Parfüm</option>
                    <option value="Hemen Teslim">Hemen Teslim</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Ürün Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Charlotte Tilbury Pillow Talk Advent Calendar"
                  value={prdName}
                  onChange={(e) => setPrdName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-[14px] bg-white border border-[#563C49]/20 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Satış Fiyatı (TL) *
                  </label>
                  <input
                    type="number"
                    required
                    value={prdPriceTry}
                    onChange={(e) => setPrdPriceTry(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-[14px] bg-white border border-[#563C49]/20 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Eski Fiyat (İndirimse)
                  </label>
                  <input
                    type="number"
                    placeholder="Örn: 18000"
                    value={prdOldPriceTry}
                    onChange={(e) => setPrdOldPriceTry(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-[14px] bg-white border border-[#563C49]/20 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Stok Adedi
                  </label>
                  <input
                    type="number"
                    value={prdStock}
                    onChange={(e) => setPrdStock(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-[14px] bg-white border border-[#563C49]/20 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Satış Tipi (Buton Yazısı)
                  </label>
                  <select
                    value={prdIsPreOrder ? "PREORDER" : "EXPRESS"}
                    onChange={(e) =>
                      setPrdIsPreOrder(e.target.value === "PREORDER")
                    }
                    className="w-full px-3.5 py-2 rounded-[14px] bg-white border border-[#563C49]/20 text-xs"
                  >
                    <option value="PREORDER">Ön Sipariş (Avrupa Tedarik)</option>
                    <option value="EXPRESS">Hemen Teslim (Hazır Stok)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Köşe Rozeti
                  </label>
                  <select
                    value={prdBadge}
                    onChange={(e) =>
                      setPrdBadge(
                        e.target.value as "YENİ" | "İNDİRİM" | "HEMEN TESLİM"
                      )
                    }
                    className="w-full px-3.5 py-2 rounded-[14px] bg-white border border-[#563C49]/20 text-xs"
                  >
                    <option value="YENİ">YENİ (Yeşil)</option>
                    <option value="İNDİRİM">İNDİRİM (Mercan)</option>
                    <option value="HEMEN TESLİM">HEMEN TESLİM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Ürün Görsel Linki (URL) *
                </label>
                <input
                  type="url"
                  required
                  value={prdImage}
                  onChange={(e) => setPrdImage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-[14px] bg-white border border-[#563C49]/20 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Ürün Açıklaması
                </label>
                <textarea
                  rows={3}
                  value={prdDesc}
                  onChange={(e) => setPrdDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-[14px] bg-white border border-[#563C49]/20 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-[30px] bg-[#563C49] hover:bg-[#9F8291] text-white text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Ürünü Mağazaya Ekle
              </button>
            </form>
          </div>

          {/* Sağ: Mevcut Ürünler ve Instagram Hikaye Linkleri */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-[#563C49]">
                Mağazadaki Aktif Ürünler ({products.length})
              </h3>
              <span className="text-xs text-[#563C49]/60">
                Instagram Hikayeye koymak için &ldquo;Hikaye Linkini Kopyala&rdquo;ya tıklayın
              </span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {products.map((prd) => (
                <div
                  key={prd.id}
                  className="p-4 rounded-[16px] border border-[#563C49]/10 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={prd.image}
                      alt={prd.name}
                      className="w-14 h-14 rounded-[12px] object-cover bg-[#F9F8F6] border border-[#563C49]/10"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] uppercase tracking-wider text-[#563C49]/60">
                          {prd.brand}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#563C49]/[0.06]">
                          {prd.isPreOrder ? "Ön Sipariş" : "Hemen Teslim"}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-[#563C49]">
                        {prd.name}
                      </div>
                      <div className="text-xs text-[#563C49]/65 mt-0.5">
                        Fiyat: <strong>{formatTL(prd.priceTry)}</strong> • Stok:{" "}
                        {prd.stockCount} Adet
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}/products/${prd.slug}`;
                        navigator.clipboard?.writeText(url);
                        showNotice(`Instagram Hikaye Linki Kopyalandı: ${url}`);
                      }}
                      className="px-3.5 py-2 rounded-[30px] bg-[#563C49]/[0.06] hover:bg-[#563C49]/15 text-[#563C49] text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Hikaye Linki</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteProduct(prd.id)}
                      title="Ürünü Sil"
                      className="p-2 rounded-full text-[#563C49]/50 hover:text-[#EB001B] hover:bg-[#EB001B]/10 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SEKME 2: INSTAGRAM REELS & TIKTOK VİDEOLARI YÖNETİMİ                  */}
      {/* ===================================================================== */}
      {activeTab === "REELS" && (
        <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <form
              onSubmit={handleCreateReel}
              className="p-6 rounded-[20px] bg-[#F9F8F6] border border-[#563C49]/10 space-y-4"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-[#563C49]/10">
                <Video className="w-4 h-4 text-[#563C49]" />
                <h3 className="text-base font-medium text-[#563C49]">
                  Yeni Instagram Reels / TikTok Videosu Ekle
                </h3>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Video Başlığı / Açıklaması *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Armani Advent Calendar Kutu Açılımı ✨"
                  value={reelTitle}
                  onChange={(e) => setReelTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-[14px] bg-white border border-[#563C49]/20 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Platform
                  </label>
                  <select
                    value={reelPlatform}
                    onChange={(e) =>
                      setReelPlatform(e.target.value as "INSTAGRAM" | "TIKTOK")
                    }
                    className="w-full px-3.5 py-2 rounded-[14px] bg-white border border-[#563C49]/20 text-xs"
                  >
                    <option value="INSTAGRAM">Instagram Reels</option>
                    <option value="TIKTOK">TikTok</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Hesap Adı
                  </label>
                  <input
                    type="text"
                    value={reelHandle}
                    onChange={(e) => setReelHandle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-[14px] bg-white border border-[#563C49]/20 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Videodaki Ürün (&ldquo;Ürünü İncele&rdquo; Butonu Nereye Gitsin?) *
                </label>
                <select
                  value={reelProductSlug}
                  onChange={(e) => setReelProductSlug(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-[14px] bg-white border border-[#563C49]/20 text-xs"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.brand} — {p.name} ({formatTL(p.priceTry)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  MP4 Video Linki
                </label>
                <input
                  type="url"
                  required
                  value={reelVideoUrl}
                  onChange={(e) => setReelVideoUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-[14px] bg-white border border-[#563C49]/20 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Kapak Görseli (Poster URL)
                </label>
                <input
                  type="url"
                  required
                  value={reelPoster}
                  onChange={(e) => setReelPoster(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-[14px] bg-white border border-[#563C49]/20 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-[30px] bg-[#563C49] hover:bg-[#9F8291] text-white text-xs font-medium transition cursor-pointer"
              >
                Videoyu Vitrine Ekle
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-base font-medium text-[#563C49]">
              Vitrindeki Aktif Reels & TikTok Videoları ({socialReels.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {socialReels.map((reel) => {
                const linkedPrd = products.find(
                  (p) => p.slug === reel.linkedProductSlug
                );
                return (
                  <div
                    key={reel.id}
                    className="p-4 rounded-[16px] border border-[#563C49]/10 bg-white flex gap-3.5 items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={reel.posterImage}
                        alt={reel.title}
                        className="w-14 h-20 rounded-[10px] object-cover bg-[#F9F8F6]"
                      />
                      <div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#563C49]/[0.06] font-medium">
                          {reel.platform} • {reel.creatorHandle}
                        </span>
                        <div className="text-xs font-medium text-[#563C49] mt-1">
                          {reel.title}
                        </div>
                        <div className="text-[11px] text-[#563C49]/65 mt-0.5 flex items-center gap-1">
                          <Link2 className="w-3 h-3" />
                          <span>{linkedPrd?.name || reel.linkedProductSlug}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteSocialReel(reel.id)}
                      className="p-2 text-[#563C49]/40 hover:text-[#EB001B] cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SEKME 3: ÖDEME YÖNTEMLERİ & SANAL POS AYARLARI (G PAY, IYZICO, PAYTR) */}
      {/* ===================================================================== */}
      {activeTab === "PAYMENTS" && (
        <div className="pt-6 space-y-6">
          <div className="p-5 rounded-[20px] bg-[#F9F8F6] border border-[#563C49]/10">
            <h3 className="text-base font-medium text-[#563C49]">
              Ödeme Yöntemleri Nasıl Belirlenir ve Çalışır?
            </h3>
            <p className="text-xs text-[#563C49]/75 mt-1 leading-relaxed">
              Aşağıdaki şalterlerden hangi ödeme yöntemlerini aktif ederseniz, ürün detay sayfasındaki{" "}
              <strong>&ldquo;G Pay ile Satın Al&rdquo;</strong> hızlı ödeme butonu ve sepet ödeme adımındaki seçenekler anında ona göre güncellenir. Gerçek tahsilat için kendi <strong>iyzico</strong> veya <strong>PayTR</strong> sanal POS anahtarlarınızı ya da banka <strong>IBAN</strong> bilginizi aşağıya girebilirsiniz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Google Pay & Apple Pay (Hızlı Tek Tık Ödeme) */}
            <div className="p-5 rounded-[20px] border border-[#563C49]/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-[#563C49]">
                    Google Pay (G Pay) Hızlı Satın Alma Butonu
                  </h4>
                  <p className="text-xs text-[#563C49]/65">
                    Ürün sayfasında siyah &ldquo;G Pay ile Satın Al&rdquo; butonunu gösterir
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={paymentSettings.googlePayEnabled}
                  onChange={(e) => {
                    onUpdatePaymentSettings({
                      ...paymentSettings,
                      googlePayEnabled: e.target.checked,
                    });
                    showNotice("Google Pay (G Pay) durumu güncellendi.");
                  }}
                  className="w-5 h-5 accent-[#563C49] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#563C49]/10">
                <div>
                  <h4 className="text-sm font-medium text-[#563C49]">
                    Apple Pay Desteği
                  </h4>
                  <p className="text-xs text-[#563C49]/65">
                    iPhone / Safari kullanıcılarına Apple Pay seçeneği sunar
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={paymentSettings.applePayEnabled}
                  onChange={(e) => {
                    onUpdatePaymentSettings({
                      ...paymentSettings,
                      applePayEnabled: e.target.checked,
                    });
                    showNotice("Apple Pay durumu güncellendi.");
                  }}
                  className="w-5 h-5 accent-[#563C49] cursor-pointer"
                />
              </div>
            </div>

            {/* 2. iyzico Sanal POS */}
            <div className="p-5 rounded-[20px] border border-[#563C49]/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-[#563C49]">
                    iyzico Kredi / Banka Kartı (3D Secure)
                  </h4>
                  <p className="text-xs text-[#563C49]/65">
                    Türkiye&apos;deki tüm kartlardan taksitli veya tek çekim ödeme alır
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={paymentSettings.iyzicoEnabled}
                  onChange={(e) =>
                    onUpdatePaymentSettings({
                      ...paymentSettings,
                      iyzicoEnabled: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-[#563C49] cursor-pointer"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <input
                  type="text"
                  value={paymentSettings.iyzicoApiKey}
                  onChange={(e) =>
                    onUpdatePaymentSettings({
                      ...paymentSettings,
                      iyzicoApiKey: e.target.value,
                    })
                  }
                  placeholder="iyzico API Key"
                  className="px-3 py-2 rounded-[12px] bg-[#F9F8F6] border border-[#563C49]/15 text-xs font-mono"
                />
                <input
                  type="password"
                  value={paymentSettings.iyzicoSecretKey}
                  onChange={(e) =>
                    onUpdatePaymentSettings({
                      ...paymentSettings,
                      iyzicoSecretKey: e.target.value,
                    })
                  }
                  placeholder="iyzico Secret Key"
                  className="px-3 py-2 rounded-[12px] bg-[#F9F8F6] border border-[#563C49]/15 text-xs font-mono"
                />
              </div>
            </div>

            {/* 3. PayTR Sanal POS */}
            <div className="p-5 rounded-[20px] border border-[#563C49]/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-[#563C49]">
                    PayTR Sanal POS Entegrasyonu
                  </h4>
                  <p className="text-xs text-[#563C49]/65">
                    Alternatif Türk sanal POS altyapısı
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={paymentSettings.paytrEnabled}
                  onChange={(e) =>
                    onUpdatePaymentSettings({
                      ...paymentSettings,
                      paytrEnabled: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-[#563C49] cursor-pointer"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={paymentSettings.paytrMerchantId}
                  onChange={(e) =>
                    onUpdatePaymentSettings({
                      ...paymentSettings,
                      paytrMerchantId: e.target.value,
                    })
                  }
                  placeholder="PayTR Mağaza No (Merchant ID)"
                  className="w-full px-3 py-2 rounded-[12px] bg-[#F9F8F6] border border-[#563C49]/15 text-xs font-mono"
                />
              </div>
            </div>

            {/* 4. Havale / EFT (IBAN) ile Ödeme */}
            <div className="p-5 rounded-[20px] border border-[#563C49]/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-[#563C49]">
                    Havale / FAST (IBAN ile Ödeme)
                  </h4>
                  <p className="text-xs text-[#563C49]/65">
                    Sanal POS kullanmadan doğrudan banka hesabınıza ödeme alma
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={paymentSettings.bankTransferEnabled}
                  onChange={(e) =>
                    onUpdatePaymentSettings({
                      ...paymentSettings,
                      bankTransferEnabled: e.target.checked,
                    })
                  }
                  className="w-5 h-5 accent-[#563C49] cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={paymentSettings.bankAccountName}
                  onChange={(e) =>
                    onUpdatePaymentSettings({
                      ...paymentSettings,
                      bankAccountName: e.target.value,
                    })
                  }
                  placeholder="Alıcı Ad Soyad / Şirket Ünvanı"
                  className="w-full px-3 py-2 rounded-[12px] bg-[#F9F8F6] border border-[#563C49]/15 text-xs"
                />
                <input
                  type="text"
                  value={paymentSettings.bankIban}
                  onChange={(e) =>
                    onUpdatePaymentSettings({
                      ...paymentSettings,
                      bankIban: e.target.value,
                    })
                  }
                  placeholder="TR00 0000 ..."
                  className="w-full px-3 py-2 rounded-[12px] bg-[#F9F8F6] border border-[#563C49]/15 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              showNotice(
                "Ödeme yöntemi ayarlarınız kaydedildi ve mağaza ödeme ekranına uygulandı!"
              )
            }
            className="px-7 py-3 rounded-[30px] bg-[#563C49] hover:bg-[#9F8291] text-white text-xs font-medium cursor-pointer"
          >
            Ödeme Ayarlarını Kaydet
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SEKME 4: SİPARİŞLER & KARGO AŞAMASI YÖNETİMİ                          */}
      {/* ===================================================================== */}
      {activeTab === "ORDERS" && (
        <div className="pt-6 space-y-5">
          <div className="p-4 rounded-[18px] bg-[#FCEEF2] border border-[#B85D79]/20 text-xs text-[#3B1E28]">
            <strong>Sipariş Hareketleri Nasıl Güncellenir?</strong> Aşağıdaki her siparişin altındaki <strong>1&apos;den 7&apos;ye kadar olan aşama butonlarından birine</strong> tıkladığınızda (veya açılır listeden seçtiğinizde) müşterinin gördüğü <strong>Canlı Kargo Takip</strong> sayfasındaki ilerleme çubuğu ve hareket dökümü anında o aşamaya geçer. İsterseniz hareket açıklaması da ekleyebilirsiniz.
          </div>

          {orders.map((order) => (
            <div
              key={order.id}
              className="p-5 rounded-[22px] border border-[#B85D79]/20 bg-white shadow-2xs space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-base font-bold text-[#3B1E28]">
                      #{order.orderNumber}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-[#FCEEF2] text-[#B85D79] font-semibold">
                      {order.customerName} ({order.customerCity})
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-[#2E7D5B]/10 text-[#2E7D5B] font-medium">
                      Aktif Aşama:{" "}
                      {
                        ORDER_STAGE_META.find(
                          (s) => s.stage === order.currentStage
                        )?.shortLabel
                      }
                    </span>
                  </div>
                  <div className="text-xs text-[#3B1E28]/70 mt-1.5">
                    Ürün:{" "}
                    {order.items.map((i) => `${i.brand} - ${i.name}`).join(", ")} •{" "}
                    Toplam: <strong>{formatTL(order.pricing.totalTry)}</strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={order.currentStage}
                    onChange={(e) => {
                      const nextStage = e.target.value as OrderStageStatus;
                      onUpdateOrderStage(
                        order.orderNumber,
                        nextStage,
                        stageNotes[order.orderNumber]
                      );
                      showNotice(
                        `#${order.orderNumber} siparişi "${
                          ORDER_STAGE_META.find((s) => s.stage === nextStage)
                            ?.shortLabel
                        }" aşamasına geçirildi!`
                      );
                    }}
                    className="px-4 py-2 rounded-full border border-[#B85D79]/30 bg-[#FFF9FA] text-xs font-semibold text-[#3B1E28]"
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
                    className="px-4 py-2 rounded-full bg-[#3B1E28] hover:bg-[#B85D79] text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Kargo Etiketi
                  </button>
                </div>
              </div>

              {/* 7 Aşamalı Tek Tıkla Durum Değiştirme Barı + Özel Not */}
              <div className="pt-3 border-t border-[#B85D79]/10 space-y-3">
                <div className="text-[11px] font-semibold text-[#3B1E28]/70">
                  Hızlı Aşama Değiştir (Tıkladığınız an müşterinin ekranında güncellenir):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ORDER_STAGE_META.map((st) => {
                    const isCurrent = order.currentStage === st.stage;
                    return (
                      <button
                        key={st.stage}
                        type="button"
                        onClick={() => {
                          onUpdateOrderStage(
                            order.orderNumber,
                            st.stage,
                            stageNotes[order.orderNumber]
                          );
                          showNotice(
                            `#${order.orderNumber} siparişi "${st.shortLabel}" aşamasına güncellendi!`
                          );
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                          isCurrent
                            ? "bg-[#B85D79] text-white shadow-xs"
                            : "bg-[#FFF9FA] border border-[#B85D79]/20 text-[#3B1E28] hover:bg-[#FCEEF2]"
                        }`}
                      >
                        0{st.stepNumber}. {st.shortLabel}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Müşterinin göreceği kargo hareket açıklaması ekle (Örn: Paketiniz Paris uçağına yüklendi)..."
                    value={stageNotes[order.orderNumber] || ""}
                    onChange={(e) =>
                      setStageNotes((prev) => ({
                        ...prev,
                        [order.orderNumber]: e.target.value,
                      }))
                    }
                    className="flex-1 px-4 py-2 rounded-full bg-[#FFF9FA] border border-[#B85D79]/25 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!stageNotes[order.orderNumber]) return;
                      onUpdateOrderStage(
                        order.orderNumber,
                        order.currentStage,
                        stageNotes[order.orderNumber]
                      );
                      showNotice(
                        `#${order.orderNumber} siparişine yeni hareket açıklaması eklendi!`
                      );
                      setStageNotes((prev) => ({
                        ...prev,
                        [order.orderNumber]: "",
                      }));
                    }}
                    className="px-5 py-2 rounded-full bg-[#B85D79] hover:bg-[#A14A66] text-white text-xs font-semibold cursor-pointer"
                  >
                    Hareket Notunu Kaydet
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "SOURCING" && (
        <div className="pt-6 space-y-3">
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

      {printedLabelOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#563C49]/50 p-4">
          <div className="bg-white text-[#563C49] rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-[#563C49]/20">
            <div className="flex items-center justify-between border-b border-[#563C49]/15 pb-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-[#563C49]/70">
                  ADEN GLOBAL • ULUSLARARASI TRANSFER
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
        </>
      )}
    </div>
  );
}
