"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ShoppingBag,
  Search,
  Eye,
  Plus,
  Minus,
  Share2,
  MessageCircleQuestion,
  MapPin,
  Lock,
  ArrowUp,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  Flame,
  Play,
  Heart,
  ShieldCheck,
} from "lucide-react";
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CUSTOM_REQUESTS,
  INITIAL_SOCIAL_REELS,
  INITIAL_PAYMENT_SETTINGS,
  BRAND_SHOWCASE,
  CUSTOMER_REVIEWS,
  Product,
  ProductVariant,
  OrderRecord,
  OrderStageStatus,
  CustomSourcingRequestItem,
  SocialReelItem,
  PaymentSettingsConfig,
  formatTL,
} from "@/lib/mock-data";
import LiveOrderTracker from "@/components/LiveOrderTracker";
import SmartCartDrawer, { CartItem } from "@/components/SmartCartDrawer";
import AdminControlCenter from "@/components/AdminControlCenter";

export default function AdenRoseGoldBoutique() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord>(INITIAL_ORDERS[0]);
  const [customRequests] = useState<CustomSourcingRequestItem[]>(
    INITIAL_CUSTOM_REQUESTS
  );
  const [socialReels, setSocialReels] = useState<SocialReelItem[]>(
    INITIAL_SOCIAL_REELS
  );
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettingsConfig>(
    INITIAL_PAYMENT_SETTINGS
  );

  // Aktif Görünüm (Müşteri arayüzünde hiçbir yerde Admin butonu bulunmaz; yalnızca /admin URL'siyle açılır)
  const [activeView, setActiveView] = useState<
    "PRODUCT_DETAIL" | "HOMEPAGE" | "ORDER_TRACKING" | "ADMIN"
  >("PRODUCT_DETAIL");

  const [activeProduct, setActiveProduct] = useState<Product>(INITIAL_PRODUCTS[0]);
  const [pdpQuantity, setPdpQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [playingReelId, setPlayingReelId] = useState<string | null>(null);

  // LocalStorage senkronizasyonu (Admin'den ürün/video/ödeme/sipariş aşaması değiştirildiğinde kalıcı olsun)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedProducts = localStorage.getItem("aden_products_v1");
        if (savedProducts) setProducts(JSON.parse(savedProducts));

        const savedOrders = localStorage.getItem("aden_orders_v1");
        if (savedOrders) {
          const parsedOrders = JSON.parse(savedOrders);
          setOrders(parsedOrders);
          if (parsedOrders[0]) setSelectedOrder(parsedOrders[0]);
        }

        const savedReels = localStorage.getItem("aden_reels_v1");
        if (savedReels) setSocialReels(JSON.parse(savedReels));

        const savedPayments = localStorage.getItem("aden_payments_v1");
        if (savedPayments) setPaymentSettings(JSON.parse(savedPayments));
      } catch {
        // ignore storage errors
      }

      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      if (
        path === "/admin" ||
        params.get("view") === "admin" ||
        window.location.hash === "#admin"
      ) {
        setActiveView("ADMIN");
      } else if (params.get("view") === "tracking") {
        setActiveView("ORDER_TRACKING");
      }
      const slugParam =
        params.get("product") ||
        (path.startsWith("/products/") ? path.replace("/products/", "") : null);
      if (slugParam) {
        const found = INITIAL_PRODUCTS.find((p) => p.slug === slugParam);
        if (found) {
          setActiveProduct(found);
          setActiveView("PRODUCT_DETAIL");
        }
      }
    }
  }, []);

  // Ana Sayfa Sekmeli Ürün Karuseli
  const [homeCarouselTab, setHomeCarouselTab] = useState<
    "NEW" | "EXPRESS" | "BEST"
  >("NEW");

  // Arama & Kategori Filtresi
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("TÜMÜ");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("TÜMÜ");

  // Sepet State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Bülten State
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Bildirim Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openProductDetail = (product: Product) => {
    setActiveProduct(product);
    setPdpQuantity(1);
    setActiveImageIndex(0);
    setActiveView("PRODUCT_DETAIL");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleAddToCart = (product: Product, qty: number = 1) => {
    const chosenVariant: ProductVariant = product.variants[0];
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id && item.variant.id === chosenVariant.id
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qty,
        };
        return updated;
      }
      return [...prev, { product, variant: chosenVariant, quantity: qty }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (
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

  const handleRemoveCartItem = (productId: string, variantId: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === productId && item.variant.id === variantId)
      )
    );
  };

  // Admin: Sipariş Aşaması ve Hareket Açıklaması Güncelleme
  const handleUpdateOrderStage = (
    orderNumber: string,
    newStage: OrderStageStatus,
    note?: string
  ) => {
    setOrders((prev) => {
      const next = prev.map((ord) => {
        if (ord.orderNumber !== orderNumber) return ord;
        const updatedTimeline = ord.timeline.map((log) => {
          if (log.stage === newStage) {
            return {
              ...log,
              description: note ? `${note}` : log.description,
              timestamp: "Şimdi Güncellendi",
            };
          }
          return log;
        });
        const updated = {
          ...ord,
          currentStage: newStage,
          timeline: updatedTimeline,
        };
        if (selectedOrder.orderNumber === orderNumber) {
          setSelectedOrder(updated);
        }
        return updated;
      });
      localStorage.setItem("aden_orders_v1", JSON.stringify(next));
      return next;
    });
  };

  // Admin: Ürün Ekle / Sil
  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => {
      const next = [newProduct, ...prev];
      localStorage.setItem("aden_products_v1", JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== productId);
      localStorage.setItem("aden_products_v1", JSON.stringify(next));
      return next;
    });
  };

  // Admin: Reels / TikTok Ekle / Sil
  const handleAddSocialReel = (newReel: SocialReelItem) => {
    setSocialReels((prev) => {
      const next = [newReel, ...prev];
      localStorage.setItem("aden_reels_v1", JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteSocialReel = (reelId: string) => {
    setSocialReels((prev) => {
      const next = prev.filter((r) => r.id !== reelId);
      localStorage.setItem("aden_reels_v1", JSON.stringify(next));
      return next;
    });
  };

  // Admin: Ödeme Yöntemleri Güncelle
  const handleUpdatePaymentSettings = (newSettings: PaymentSettingsConfig) => {
    setPaymentSettings(newSettings);
    localStorage.setItem("aden_payments_v1", JSON.stringify(newSettings));
  };

  const handleSyncEuropeanStock = () => {
    setProducts((prev) => {
      const next = prev.map((p) => ({
        ...p,
        stockCount: p.stockCount + 2,
      }));
      localStorage.setItem("aden_products_v1", JSON.stringify(next));
      return next;
    });
  };

  // Filtrelenmiş Ürünler
  const tabbedProducts = useMemo(() => {
    let list = products;
    if (selectedCategory !== "TÜMÜ") {
      list = list.filter((p) => p.category === selectedCategory);
    }
    if (selectedBrandFilter !== "TÜMÜ") {
      list = list.filter((p) => p.brand === selectedBrandFilter);
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (homeCarouselTab === "EXPRESS") {
      return list.filter((p) => !p.isPreOrder);
    }
    if (homeCarouselTab === "BEST") {
      return list.filter(
        (p) => p.isTrending || p.isTikTokViral || p.priceTry >= 7000
      );
    }
    return list;
  }, [
    products,
    homeCarouselTab,
    selectedCategory,
    selectedBrandFilter,
    searchQuery,
  ]);

  const relatedProducts = useMemo(() => {
    return products.filter((p) => p.id !== activeProduct.id).slice(0, 4);
  }, [products, activeProduct]);

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  const navItems = [
    { label: "Advent Takvimi", category: "Advent Takvimi" },
    { label: "Setler", category: "Setler" },
    { label: "Makyaj", category: "Makyaj" },
    { label: "Bakım", category: "Bakım" },
    { label: "Parfüm", category: "Parfüm" },
    { label: "Hemen Teslim", category: "Hemen Teslim" },
  ];

  const productImages = activeProduct.secondaryImage
    ? [activeProduct.image, activeProduct.secondaryImage]
    : [activeProduct.image];

  const spaceNkProduct =
    products.find((p) => p.slug === "space-nk-beauty-advent-calendar") ||
    products[1] ||
    products[0];

  // =========================================================================
  // EĞER KULLANICI /admin ADRESİNE GİTTİYSE YALNIZCA YÖNETİCİ PANELİNİ GÖSTER
  // =========================================================================
  if (activeView === "ADMIN") {
    return (
      <div className="min-h-screen bg-[#FFF9FA] text-[#3B1E28] py-8 px-4 sm:px-8">
        <div className="max-w-[1440px] mx-auto">
          <AdminControlCenter
            orders={orders}
            products={products}
            customRequests={customRequests}
            socialReels={socialReels}
            paymentSettings={paymentSettings}
            onUpdateOrderStage={handleUpdateOrderStage}
            onSyncEuropeanStock={handleSyncEuropeanStock}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onAddSocialReel={handleAddSocialReel}
            onDeleteSocialReel={handleDeleteSocialReel}
            onUpdatePaymentSettings={handleUpdatePaymentSettings}
            onBackToStorefront={() => setActiveView("HOMEPAGE")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9FA] text-[#3B1E28] flex flex-col pb-24">
      {/* 1. ÜST ZARİF DUYURU ŞERİDİ (Gül Kurusu / Rose Gold Gradient) */}
      <div className="bg-gradient-to-r from-[#8E3A53] via-[#B85D79] to-[#8E3A53] text-white text-center py-2.5 px-4 text-xs sm:text-[13px] tracking-wide font-medium">
        ✨ 5000₺ ve üzeri siparişlerde ücretsiz VIP kargo •{" "}
        {paymentSettings.installmentBannerText}
      </div>

      {/* 2. PARİSİENNE BUTİK HEADER (Ortalanmış Serif Logo & İpek Pembe Dokunuşlar) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#B85D79]/15">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-4 flex items-center justify-between gap-4">
          {/* Sol: Marka Logosu (ADEN) */}
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("TÜMÜ");
              setSelectedBrandFilter("TÜMÜ");
              setActiveView("HOMEPAGE");
            }}
            className="flex items-center gap-3 text-left cursor-pointer shrink-0 group"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#B85D79] to-[#8E3A53] flex items-center justify-center text-white font-serif-editorial italic text-2xl shadow-sm shadow-[#B85D79]/25">
              A
            </div>
            <div className="leading-none">
              <span className="block font-serif-editorial text-[26px] font-semibold tracking-[0.22em] text-[#3B1E28]">
                ADEN
              </span>
              <span className="block text-[9px] font-medium tracking-[0.28em] text-[#B85D79] uppercase mt-0.5">
                PARIS • LONDON • ISTANBUL
              </span>
            </div>
          </button>

          {/* Orta: Zarif Butik Navigasyon (Admin Butonu Kesinlikle Yok!) */}
          <nav className="hidden lg:flex items-center gap-7 text-[13.5px] font-medium text-[#3B1E28]">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("TÜMÜ");
                setSelectedBrandFilter("TÜMÜ");
                setActiveView("HOMEPAGE");
              }}
              className={`hover:text-[#B85D79] transition cursor-pointer ${
                activeView === "HOMEPAGE" && selectedCategory === "TÜMÜ"
                  ? "text-[#B85D79] font-semibold"
                  : ""
              }`}
            >
              Koleksiyon Vitrini
            </button>

            <button
              type="button"
              onClick={() => openProductDetail(products[0])}
              className={`hover:text-[#B85D79] transition cursor-pointer ${
                activeView === "PRODUCT_DETAIL" &&
                activeProduct.id === products[0]?.id
                  ? "text-[#B85D79] font-semibold"
                  : ""
              }`}
            >
              2026 Advent Takvimi
            </button>

            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setSelectedCategory(item.category);
                  setSelectedBrandFilter("TÜMÜ");
                  setActiveView("HOMEPAGE");
                }}
                className={`hover:text-[#B85D79] transition cursor-pointer ${
                  activeView === "HOMEPAGE" && selectedCategory === item.category
                    ? "text-[#B85D79] font-semibold"
                    : ""
                }`}
              >
                {item.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setActiveView("ORDER_TRACKING")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                activeView === "ORDER_TRACKING"
                  ? "bg-[#B85D79] text-white shadow-xs"
                  : "bg-[#FCEEF2] text-[#B85D79] hover:bg-[#B85D79]/20"
              }`}
            >
              Sipariş & Kargo Takibi
            </button>
          </nav>

          {/* Sağ: Arama & Alışveriş Çantası */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              title="Ürün Ara"
              className="w-10 h-10 rounded-full bg-[#FCEEF2] hover:bg-[#B85D79]/20 flex items-center justify-center text-[#3B1E28] transition cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#B85D79]" />
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              title="Alışveriş Çantam"
              className="px-4 h-10 rounded-full bg-[#3B1E28] hover:bg-[#B85D79] flex items-center gap-2 text-white transition cursor-pointer shadow-xs"
            >
              <ShoppingBag className="w-4 h-4 text-[#FCEEF2]" />
              <span className="text-xs font-semibold">{totalCartCount}</span>
            </button>
          </div>
        </div>

        {/* Mobil Hızlı Geçiş Barı (Admin Butonu Yok) */}
        <div className="flex lg:hidden items-center gap-2 overflow-x-auto px-4 py-2.5 border-t border-[#B85D79]/10 text-xs whitespace-nowrap bg-[#FFF9FA]">
          <button
            type="button"
            onClick={() => setActiveView("HOMEPAGE")}
            className={`px-4 py-1.5 rounded-full font-medium cursor-pointer ${
              activeView === "HOMEPAGE"
                ? "bg-[#B85D79] text-white"
                : "bg-[#FCEEF2] text-[#3B1E28]"
            }`}
          >
            Vitrin & Videolar
          </button>
          <button
            type="button"
            onClick={() => openProductDetail(products[0])}
            className={`px-4 py-1.5 rounded-full font-medium cursor-pointer ${
              activeView === "PRODUCT_DETAIL"
                ? "bg-[#B85D79] text-white"
                : "bg-[#FCEEF2] text-[#3B1E28]"
            }`}
          >
            Armani Advent Calendar
          </button>
          <button
            type="button"
            onClick={() => setActiveView("ORDER_TRACKING")}
            className={`px-4 py-1.5 rounded-full font-medium cursor-pointer ${
              activeView === "ORDER_TRACKING"
                ? "bg-[#B85D79] text-white"
                : "bg-[#FCEEF2] text-[#3B1E28]"
            }`}
          >
            Kargo Takibi
          </button>
        </div>

        {/* Açılır Arama Çubuğu */}
        {searchOpen && (
          <div className="max-w-xl mx-auto px-4 pb-3 pt-1">
            <div className="relative">
              <Search className="w-4 h-4 text-[#B85D79] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeView !== "HOMEPAGE") setActiveView("HOMEPAGE");
                }}
                placeholder="Marka, Advent takvimi veya ürün ara..."
                className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#FFF9FA] border border-[#B85D79]/30 text-sm text-[#3B1E28] focus:outline-none focus:border-[#B85D79]"
              />
            </div>
          </div>
        )}
      </header>

      {/* Bildirim Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-5 py-3 rounded-full bg-[#B85D79] text-white text-xs font-medium shadow-lg">
          {toastMessage}
        </div>
      )}

      {/* ======================================================================= */}
      {/* GÖRÜNÜM 1: ÜRÜN DETAY SAYFASI (FEMİNEN ROSE GOLD & BLUSH ŞABLONU)       */}
      {/* ======================================================================= */}
      {activeView === "PRODUCT_DETAIL" && (
        <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 space-y-16">
          {/* Üst Yol */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#3B1E28]/65">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveView("HOMEPAGE")}
                className="hover:text-[#B85D79] cursor-pointer"
              >
                ADEN Butik
              </button>
              <span>/</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(activeProduct.category);
                  setActiveView("HOMEPAGE");
                }}
                className="hover:text-[#B85D79] cursor-pointer"
              >
                {activeProduct.category}
              </button>
              <span>/</span>
              <span className="text-[#B85D79] font-semibold">
                {activeProduct.name}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActiveView("HOMEPAGE")}
              className="text-xs font-semibold text-[#B85D79] hover:underline underline-offset-4 cursor-pointer"
            >
              Ana Vitrin & Instagram Reels Videolarını Gör &rarr;
            </button>
          </div>

          {/* 2 Sütunlu Özel ADEN Ürün Şablonu */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Sol: Yumuşak Pudra Çerçeveli Galeri */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative rounded-[32px] overflow-hidden bg-white border border-[#B85D79]/15 shadow-sm aspect-square sm:aspect-[4/3]">
                <img
                  src={productImages[activeImageIndex] || activeProduct.image}
                  alt={activeProduct.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />

                <div className="absolute top-5 left-5">
                  <span className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[#3B1E28] text-xs font-medium shadow-2xs">
                    {activeProduct.originFlag} {activeProduct.originCity} Butik Tedarik
                  </span>
                </div>

                {activeProduct.badgeType && (
                  <span
                    className={`absolute top-5 right-5 px-4 py-1.5 rounded-full text-xs font-semibold text-white shadow-xs ${
                      activeProduct.badgeType === "İNDİRİM"
                        ? "bg-[#D9385A]"
                        : "bg-[#B85D79]"
                    }`}
                  >
                    {activeProduct.badgeType}
                  </span>
                )}
              </div>

              {productImages.length > 1 && (
                <div className="flex gap-3">
                  {productImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-20 h-20 rounded-[18px] overflow-hidden border-2 transition cursor-pointer ${
                        activeImageIndex === idx
                          ? "border-[#B85D79]"
                          : "border-transparent opacity-65 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sağ: Feminen Rose-Blush Ürün Kartı */}
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <div className="rounded-[28px] border border-[#B85D79]/20 bg-white p-6 sm:p-8 shadow-md shadow-[#B85D79]/5 space-y-5">
                {/* Marka & Orijinallik Rozeti */}
                <div className="flex items-center justify-between">
                  <span className="inline-block px-3.5 py-1 rounded-full bg-[#FCEEF2] text-[#B85D79] text-xs font-semibold tracking-wider uppercase">
                    {activeProduct.brand}
                  </span>
                  <span className="text-xs text-[#2E7D5B] font-medium flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    %100 Orijinal & Gümrük Dahil
                  </span>
                </div>

                {/* Serif Editorial Ürün Başlığı */}
                <h1 className="font-serif-editorial text-[32px] sm:text-[40px] font-semibold leading-[1.15] text-[#3B1E28]">
                  {activeProduct.name}
                </h1>

                {/* Fiyat Alanı */}
                <div className="flex items-baseline gap-3 pb-4 border-b border-[#B85D79]/15">
                  {activeProduct.oldPriceTry ? (
                    <>
                      <span className="text-base text-[#3B1E28]/45 line-through">
                        {formatTL(activeProduct.oldPriceTry)}
                      </span>
                      <span className="text-2xl font-bold text-[#D9385A]">
                        {formatTL(activeProduct.priceTry)}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-[#3B1E28]">
                      {formatTL(activeProduct.priceTry)}
                    </span>
                  )}
                </div>

                {/* Pembe Yumuşak Kutu İçinde Tedarik & Teslimat Notları */}
                <div className="p-4 rounded-[18px] bg-[#FFF9FA] border border-[#B85D79]/15 space-y-2 text-[13.5px] leading-[1.6] text-[#3B1E28]">
                  {activeProduct.deliveryNotes.map((note, idx) => (
                    <p key={idx}>{note}</p>
                  ))}
                </div>

                {/* Adet & Gül Kurusu Ana Satın Alma Butonu */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="inline-flex items-center justify-between rounded-full border border-[#B85D79]/30 bg-[#FFF9FA] h-[48px] px-3.5 min-w-[114px]">
                    <button
                      type="button"
                      onClick={() => setPdpQuantity(Math.max(1, pdpQuantity - 1))}
                      className="p-1 text-[#3B1E28]/70 hover:text-[#B85D79] cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-semibold text-[#3B1E28]">
                      {pdpQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPdpQuantity(pdpQuantity + 1)}
                      className="p-1 text-[#3B1E28]/70 hover:text-[#B85D79] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(activeProduct, pdpQuantity)}
                    className="flex-1 h-[48px] rounded-full bg-gradient-to-r from-[#B85D79] to-[#9E4763] hover:from-[#A14A66] hover:to-[#873952] text-white font-semibold text-[14px] tracking-wider uppercase transition cursor-pointer shadow-md shadow-[#B85D79]/25"
                  >
                    {activeProduct.isPreOrder ? "ÖN SİPARİŞ VER" : "ÇANTAYA EKLE"}
                  </button>
                </div>

                {/* Admin Panelinden Açılıp Kapatılabilen G Pay / Hızlı Ödeme Butonu */}
                {paymentSettings.googlePayEnabled && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(activeProduct, pdpQuantity)}
                      className="w-full h-[46px] rounded-full bg-[#3B1E28] hover:bg-[#261118] text-white font-medium text-[14px] flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <span>G Pay ile Hızlı Satın Al</span>
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(activeProduct, pdpQuantity)}
                        className="text-[11px] uppercase underline underline-offset-4 text-[#B85D79] hover:text-[#3B1E28] cursor-pointer font-medium"
                      >
                        DİĞER ÖDEME SEÇENEKLERİ (İYZİCO / PAYTR / HAVALE)
                      </button>
                    </div>
                  </div>
                )}

                {/* Durum Kutusu */}
                <div className="rounded-[14px] border border-[#B85D79]/20 bg-[#FCEEF2]/50 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        activeProduct.isPreOrder
                          ? "bg-[#C89D7C] ring-4 ring-[#C89D7C]/25"
                          : "bg-[#2E7D5B] ring-4 ring-[#2E7D5B]/25"
                      }`}
                    />
                    <span className="text-[13.5px] font-medium text-[#3B1E28]">
                      {activeProduct.isPreOrder
                        ? "Ön Sipariş • Avrupa Butik Tedarik"
                        : "Hemen Teslim • Hazır Stok"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveView("ORDER_TRACKING")}
                    className="text-xs text-[#B85D79] font-medium hover:underline underline-offset-4 cursor-pointer"
                  >
                    Canlı Kargo Takibi
                  </button>
                </div>

                {/* Ürün Açıklaması & Kutu İçeriği */}
                <div className="pt-2 border-t border-[#B85D79]/15 space-y-2 text-xs text-[#3B1E28]/80 leading-relaxed">
                  <p>{activeProduct.description}</p>
                  {activeProduct.contentsList && (
                    <ul className="list-disc pl-4 space-y-1 pt-1 text-[#3B1E28]/75">
                      {activeProduct.contentsList.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Paylaş & Soru Sor */}
                <div className="pt-2 flex items-center gap-5 text-xs text-[#3B1E28]/80 font-medium">
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${window.location.origin}/products/${activeProduct.slug}`;
                      navigator.clipboard?.writeText(url);
                      triggerToast("Ürün linki kopyalandı! Instagram hikayenize ekleyebilirsiniz.");
                    }}
                    className="inline-flex items-center gap-1.5 hover:text-[#B85D79] cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-[#B85D79]" />
                    <span>Paylaş</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      triggerToast(
                        "ADEN Güzellik Danışmanımız sorularınız için hazır."
                      )
                    }
                    className="inline-flex items-center gap-1.5 hover:text-[#B85D79] cursor-pointer"
                  >
                    <MessageCircleQuestion className="w-4 h-4 text-[#B85D79]" />
                    <span>Soru sor</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* INSTAGRAM & TIKTOK VİDEOLARI ("Akışında gördün, burada buldun.") */}
          <SocialReelsSection
            reels={socialReels}
            products={products}
            playingReelId={playingReelId}
            onTogglePlay={(id) =>
              setPlayingReelId(playingReelId === id ? null : id)
            }
            onSelectProduct={openProductDetail}
          />

          {/* Sizin İçin Öneriler */}
          <section className="space-y-8 pt-4">
            <div className="text-center">
              <span className="text-xs uppercase tracking-[0.2em] text-[#B85D79] font-semibold">
                ADEN CURATED SELECTION
              </span>
              <h2 className="font-serif-editorial text-[34px] sm:text-[44px] font-semibold text-[#3B1E28] mt-1">
                Sizin İçin Seçtiklerimiz
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((prd) => (
                <ProductCard
                  key={prd.id}
                  product={prd}
                  onOpenDetail={() => openProductDetail(prd)}
                  onAddToCart={() => handleAddToCart(prd, 1)}
                />
              ))}
            </div>
          </section>

          {/* Değer Önerisi */}
          <section className="rounded-[28px] border border-[#B85D79]/20 p-8 sm:p-10 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center space-y-2.5">
                <div className="w-12 h-12 rounded-full bg-[#FCEEF2] flex items-center justify-center text-[#B85D79]">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-serif-editorial text-xl font-semibold text-[#3B1E28]">
                  Paris & Londra&apos;dan Kapınıza
                </h3>
                <p className="text-xs text-[#3B1E28]/70 max-w-xs">
                  Türkiye&apos;de bulunmayan en seçkin kozmetik ve Advent koleksiyonları bir arada.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-2.5">
                <div className="w-12 h-12 rounded-full bg-[#FCEEF2] flex items-center justify-center text-[#B85D79]">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="font-serif-editorial text-xl font-semibold text-[#3B1E28]">
                  Sıfır Gümrük Sürprizi
                </h3>
                <p className="text-xs text-[#3B1E28]/70 max-w-xs">
                  Tüm gümrük ve ithalat süreçleri ADEN tarafından tamamlanır, ek ücret ödemezsiniz.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-2.5">
                <div className="w-12 h-12 rounded-full bg-[#FCEEF2] flex items-center justify-center text-[#B85D79]">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-serif-editorial text-xl font-semibold text-[#3B1E28]">
                  3D Secure & G Pay Güvencesi
                </h3>
                <p className="text-xs text-[#3B1E28]/70 max-w-xs">
                  iyzico, PayTR ve Google Pay altyapısıyla %100 korumalı alışveriş.
                </p>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ======================================================================= */}
      {/* GÖRÜNÜM 2: ANA SAYFA VİTRİNİ (PARİSİENNE ROSE GOLD EDITORIAL)           */}
      {/* ======================================================================= */}
      {activeView === "HOMEPAGE" && (
        <main className="space-y-16 sm:space-y-20">
          {/* 1. Feminen Editorial Hero Banner */}
          <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-6">
            <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-r from-[#3B1E28] via-[#6D2E46] to-[#B85D79] text-white min-h-[440px] sm:min-h-[520px] flex items-center shadow-xl shadow-[#B85D79]/15">
              <img
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=85"
                alt="ADEN Luxury Beauty"
                className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#3B1E28]/90 via-[#3B1E28]/55 to-transparent" />

              <div className="relative z-10 p-8 sm:p-14 lg:p-20 max-w-2xl space-y-5">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FCEEF2]/20 backdrop-blur-md text-xs font-medium tracking-wider text-[#FCEEF2] border border-white/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  ADEN 2026 HOLIDAY & ADVENT EDITION
                </span>
                <h1 className="font-serif-editorial text-[40px] sm:text-[60px] font-semibold leading-[1.1]">
                  Avrupa&apos;nın En Arzulanan Güzellik Sırları
                </h1>
                <p className="text-white/85 text-sm sm:text-base leading-relaxed">
                  Armani, Space NK, Rhode ve Patrick Ta... Instagram ve TikTok&apos;ta hayran kaldığınız ikonik koleksiyonlar, gümrük garantisi ve canlı kargo takibiyle kapınızda.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => openProductDetail(products[0])}
                    className="px-7 py-3.5 rounded-full bg-[#FCEEF2] text-[#3B1E28] hover:bg-white font-semibold text-sm transition cursor-pointer shadow-md"
                  >
                    Armani Takvimini İncele
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView("ORDER_TRACKING")}
                    className="px-6 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/30 font-medium text-sm transition cursor-pointer"
                  >
                    Canlı Sipariş Takibi
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 2. INSTAGRAM REELS & TIKTOK VİDEO KARUSELİ ("Akışında gördün, burada buldun.") */}
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
            <SocialReelsSection
              reels={socialReels}
              products={products}
              playingReelId={playingReelId}
              onTogglePlay={(id) =>
                setPlayingReelId(playingReelId === id ? null : id)
              }
              onSelectProduct={openProductDetail}
            />
          </div>

          {/* 3. Yeni Favorilerini Keşfet (Rose-Blush Sekmeli Ürün Vitrini) */}
          <section
            id="product-tabs-section"
            className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 space-y-8"
          >
            <div className="text-center space-y-2">
              <span className="text-xs uppercase tracking-[0.22em] text-[#B85D79] font-semibold">
                PARİS & LONDRA SEÇKİSİ
              </span>
              <h2 className="font-serif-editorial text-[36px] sm:text-[46px] font-semibold text-[#3B1E28]">
                Yeni Favorilerini Keşfet
              </h2>
            </div>

            {/* Feminen Pill Tab Bar */}
            <div className="max-w-xl mx-auto rounded-full border border-[#B85D79]/20 p-1.5 flex items-center justify-center gap-2 bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => setHomeCarouselTab("NEW")}
                className={`flex-1 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  homeCarouselTab === "NEW"
                    ? "bg-[#B85D79] text-white shadow-xs"
                    : "text-[#3B1E28] hover:bg-[#FCEEF2]"
                }`}
              >
                Yeni Gelenler
              </button>
              <button
                type="button"
                onClick={() => setHomeCarouselTab("EXPRESS")}
                className={`flex-1 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  homeCarouselTab === "EXPRESS"
                    ? "bg-[#B85D79] text-white shadow-xs"
                    : "text-[#3B1E28] hover:bg-[#FCEEF2]"
                }`}
              >
                Hemen Teslim
              </button>
              <button
                type="button"
                onClick={() => setHomeCarouselTab("BEST")}
                className={`flex-1 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  homeCarouselTab === "BEST"
                    ? "bg-[#B85D79] text-white shadow-xs"
                    : "text-[#3B1E28] hover:bg-[#FCEEF2]"
                }`}
              >
                Çok Satanlar
              </button>
            </div>

            {/* Ürün Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {tabbedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetail={() => openProductDetail(product)}
                  onAddToCart={() => handleAddToCart(product, 1)}
                />
              ))}
            </div>
          </section>

          {/* 4. Favori Markanı Keşfet */}
          <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#B85D79] font-semibold">
                  ICONIC BRANDS
                </span>
                <h2 className="font-serif-editorial text-[34px] sm:text-[42px] font-semibold text-[#3B1E28]">
                  Favori Markanı Keşfet
                </h2>
              </div>
              {selectedBrandFilter !== "TÜMÜ" && (
                <button
                  type="button"
                  onClick={() => setSelectedBrandFilter("TÜMÜ")}
                  className="text-xs font-semibold underline underline-offset-4 text-[#B85D79] cursor-pointer"
                >
                  Tüm Markaları Göster ({selectedBrandFilter})
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {BRAND_SHOWCASE.map((brand) => (
                <div
                  key={brand.name}
                  onClick={() => {
                    setSelectedBrandFilter(brand.filterBrand);
                    const el = document.getElementById("product-tabs-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="group relative rounded-[26px] overflow-hidden aspect-[4/3] p-7 flex flex-col justify-between cursor-pointer border border-[#B85D79]/20 bg-[#3B1E28]"
                >
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3B1E28]/85 via-[#3B1E28]/30 to-transparent" />
                  <div className="relative z-10">
                    <span className="text-[11px] uppercase tracking-widest text-[#FCEEF2]">
                      {brand.subtitle}
                    </span>
                    <h3 className="font-serif-editorial text-3xl font-semibold text-white mt-1">
                      {brand.name}
                    </h3>
                  </div>

                  <div className="relative z-10">
                    <span className="inline-block px-5 py-2.5 rounded-full bg-white/95 text-[#3B1E28] text-xs font-semibold group-hover:bg-[#B85D79] group-hover:text-white transition">
                      Koleksiyonu Keşfet
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Sınırlı Süre Geçerli Fırsat */}
          <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
            <div className="rounded-[28px] bg-gradient-to-r from-[#FCEEF2] via-[#FFF0F4] to-[#FCEEF2] border border-[#B85D79]/20 p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-2 text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D9385A]">
                  <Flame className="w-4 h-4" />
                  Sınırlı Kontenjan • 2026 Advent Ön Sipariş
                </div>
                <h3 className="font-serif-editorial text-[32px] sm:text-[40px] font-semibold text-[#3B1E28]">
                  Güzellik Dolu Bu Fırsatı Kaçırma!
                </h3>
                <p className="text-sm text-[#3B1E28]/75 max-w-lg">
                  Space NK ve Armani Advent Takvimlerinde Londra ve Paris mağaza kontenjanları kapanmadan siparişinizi oluşturun.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {[
                  { val: "04", label: "Gün" },
                  { val: "11", label: "Saat" },
                  { val: "42", label: "Dakika" },
                  { val: "19", label: "Saniye" },
                ].map((t) => (
                  <div
                    key={t.label}
                    className="w-16 sm:w-20 py-3 rounded-[18px] bg-white border border-[#B85D79]/20 text-center shadow-2xs"
                  >
                    <div className="text-xl sm:text-2xl font-bold text-[#B85D79]">
                      {t.val}
                    </div>
                    <div className="text-[11px] text-[#3B1E28]/65">{t.label}</div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => openProductDetail(spaceNkProduct)}
                className="px-7 py-3.5 rounded-full bg-[#B85D79] hover:bg-[#A14A66] text-white text-sm font-semibold transition cursor-pointer shadow-md shadow-[#B85D79]/20"
              >
                Fırsatı Keşfet
              </button>
            </div>
          </section>

          {/* 6. Sizden Düşünceler */}
          <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 space-y-8">
            <div className="text-center">
              <span className="text-xs uppercase tracking-[0.2em] text-[#B85D79] font-semibold">
                HAPPY LOVERS OF ADEN
              </span>
              <h2 className="font-serif-editorial text-[34px] sm:text-[42px] font-semibold text-[#3B1E28]">
                Sizden Düşünceler
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {CUSTOMER_REVIEWS.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-[22px] border border-[#B85D79]/15 p-6 bg-white flex flex-col justify-between space-y-4 shadow-2xs"
                >
                  <div className="space-y-3">
                    <div className="text-[#C89D7C] text-sm tracking-widest">
                      ★★★★★
                    </div>
                    <h4 className="text-base font-semibold text-[#3B1E28]">
                      {rev.title}
                    </h4>
                    <p className="text-xs text-[#3B1E28]/75 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#B85D79]/10 flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#3B1E28] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D5B]" />
                      {rev.author}
                    </span>
                    <span className="text-[#B85D79] truncate max-w-[130px]">
                      {rev.productName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* ======================================================================= */}
      {/* GÖRÜNÜM 3: CANLI SİPARİŞ TAKİP SAYFASI                                  */}
      {/* ======================================================================= */}
      {activeView === "ORDER_TRACKING" && (
        <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-10 space-y-8">
          <LiveOrderTracker
            orders={orders}
            selectedOrder={selectedOrder}
            onSelectOrder={setSelectedOrder}
          />
        </main>
      )}

      {/* ======================================================================= */}
      {/* STICKY BOTTOM ADD-TO-CART BAR                                           */}
      {/* ======================================================================= */}
      {activeView === "PRODUCT_DETAIL" && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#B85D79]/20 shadow-lg py-3 px-4 sm:px-8">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={() =>
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }
                className="w-10 h-10 rounded-full border border-[#B85D79]/25 flex items-center justify-center text-[#B85D79] hover:bg-[#FCEEF2] cursor-pointer"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <img
                src={activeProduct.image}
                alt={activeProduct.name}
                className="w-12 h-12 rounded-[12px] object-cover border border-[#B85D79]/15 hidden sm:block"
              />
              <div>
                <div className="text-sm font-semibold text-[#3B1E28]">
                  {activeProduct.name}
                </div>
                <div className="text-xs text-[#B85D79] font-semibold">
                  {formatTL(activeProduct.priceTry)}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAddToCart(activeProduct, pdpQuantity)}
              className="px-7 h-[42px] rounded-full bg-[#B85D79] hover:bg-[#A14A66] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition cursor-pointer shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {activeProduct.isPreOrder ? "Ön Sipariş Ver" : "Çantaya Ekle"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* FOOTER (Bordo-Gül Kurusu #3B1E28 — Admin Linki Yok, Müşteriye Özel)     */}
      {/* ======================================================================= */}
      <footer className="bg-[#3B1E28] text-white mt-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-14 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-white/15">
            <div className="lg:col-span-6 space-y-4">
              <div className="font-serif-editorial text-3xl font-semibold tracking-widest">
                ADEN
              </div>
              <p className="text-sm text-white/75 max-w-md">
                Yeni gelen Advent takvimleri, sınırlı sayıda üretilen Paris & Londra koleksiyonları ve hemen teslim ürünlerden ilk siz haberdar olun.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setNewsletterSubscribed(true);
                  setNewsletterEmail("");
                }}
                className="max-w-md flex items-center rounded-full border border-white/35 p-1.5 bg-white/5"
              >
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="E-posta adresiniz"
                  className="flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder:text-white/60 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#FCEEF2] text-[#3B1E28] text-xs font-semibold flex items-center gap-1 hover:bg-white transition cursor-pointer"
                >
                  <span>Kaydol</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {newsletterSubscribed && (
                <p className="text-xs text-emerald-300">
                  ✓ ADEN VIP bültenine başarıyla kaydoldunuz!
                </p>
              )}
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div className="space-y-3">
                <h4 className="font-semibold text-[#FCEEF2]">Koleksiyonlar</h4>
                <ul className="space-y-2 text-white/75 text-xs">
                  {navItems.map((n) => (
                    <li key={n.label}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory(n.category);
                          setActiveView("HOMEPAGE");
                        }}
                        className="hover:text-white cursor-pointer"
                      >
                        {n.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-[#FCEEF2]">Müşteri Hizmetleri</h4>
                <ul className="space-y-2 text-white/75 text-xs">
                  <li>
                    <button
                      type="button"
                      onClick={() => setActiveView("ORDER_TRACKING")}
                      className="hover:text-white cursor-pointer"
                    >
                      Canlı Sipariş & Kargo Takibi
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setSearchOpen(true)}
                      className="hover:text-white cursor-pointer"
                    >
                      Ürün Arama
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-[#FCEEF2]">ADEN Güvencesi</h4>
                <p className="text-xs text-white/75 leading-relaxed">
                  Avrupa ve Amerika&apos;daki resmi mağazalardan orijinal faturalı tedarik, şeffaf kargo takibi ve gümrük garantili teslimat.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/70">
            <div>© 2026, ADEN Global Beauty. Tüm hakları saklıdır.</div>
            <div className="flex flex-wrap items-center gap-2">
              {["iyzico", "PayTR", "Google Pay", "Apple Pay", "Visa", "Mastercard"].map(
                (pm) => (
                  <span
                    key={pm}
                    className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px]"
                  >
                    {pm}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Sepet Çekmecesi */}
      <SmartCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        paymentSettings={paymentSettings}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
        onOrderCreated={(newOrder) => {
          setOrders((prev) => {
            const next = [newOrder, ...prev];
            localStorage.setItem("aden_orders_v1", JSON.stringify(next));
            return next;
          });
          setSelectedOrder(newOrder);
          setActiveView("ORDER_TRACKING");
        }}
      />
    </div>
  );
}

/* ============================================================================
 * INSTAGRAM REELS & TIKTOK VİDEO VİTRİNİ ("Akışında gördün, burada buldun.")
 * ============================================================================ */
function SocialReelsSection({
  reels,
  products,
  playingReelId,
  onTogglePlay,
  onSelectProduct,
}: {
  reels: SocialReelItem[];
  products: Product[];
  playingReelId: string | null;
  onTogglePlay: (id: string) => void;
  onSelectProduct: (product: Product) => void;
}) {
  return (
    <section className="space-y-8">
      <div className="text-center space-y-1.5">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FCEEF2] text-[#B85D79] text-xs font-semibold">
          <Play className="w-3 h-3 fill-[#B85D79]" />
          INSTAGRAM REELS & TIKTOK KEŞİFLERİ
        </span>
        <h2 className="font-serif-editorial text-[34px] sm:text-[44px] font-semibold text-[#3B1E28]">
          Akışında Gördün, Burada Buldun.
        </h2>
        <p className="text-xs sm:text-sm text-[#3B1E28]/70">
          Videolardaki ürünleri tek tıkla inceleyin ve ön siparişinizi oluşturun
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {reels.map((reel) => {
          const linkedProduct =
            products.find((p) => p.slug === reel.linkedProductSlug) ||
            products[0];
          const isPlaying = playingReelId === reel.id;

          return (
            <div
              key={reel.id}
              className="group relative rounded-[26px] overflow-hidden aspect-[9/14] bg-[#3B1E28] border border-[#B85D79]/20 shadow-md flex flex-col justify-between"
            >
              {isPlaying ? (
                <video
                  src={reel.videoUrl}
                  poster={reel.posterImage}
                  autoPlay
                  loop
                  muted
                  playsInline
                  onClick={() => onTogglePlay(reel.id)}
                  className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                />
              ) : (
                <img
                  src={reel.posterImage}
                  alt={reel.title}
                  onClick={() => onTogglePlay(reel.id)}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-pointer"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-[#3B1E28]/95 via-transparent to-[#3B1E28]/40 pointer-events-none" />

              {/* Üst Rozet */}
              <div className="relative z-10 p-4 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-semibold">
                  {reel.platform === "INSTAGRAM" ? "IG Reels" : "TikTok"} •{" "}
                  {reel.creatorHandle}
                </span>
                <span className="text-[11px] text-white/90 font-medium">
                  {reel.viewsText}
                </span>
              </div>

              {/* Orta Oynat Butonu */}
              {!isPlaying && (
                <button
                  type="button"
                  onClick={() => onTogglePlay(reel.id)}
                  className="relative z-10 w-14 h-14 rounded-full bg-white/25 backdrop-blur-md border border-white/50 text-white flex items-center justify-center mx-auto hover:scale-110 transition cursor-pointer"
                >
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                </button>
              )}

              {/* Alt Ürün Bağlantı Kartı */}
              <div className="relative z-10 p-4 space-y-3">
                <p className="text-xs font-medium text-white line-clamp-2">
                  {reel.title}
                </p>

                {linkedProduct && (
                  <div
                    onClick={() => onSelectProduct(linkedProduct)}
                    className="p-2.5 rounded-[16px] bg-white/95 backdrop-blur-md text-[#3B1E28] flex items-center gap-2.5 cursor-pointer hover:bg-white transition shadow-sm"
                  >
                    <img
                      src={linkedProduct.image}
                      alt={linkedProduct.name}
                      className="w-11 h-11 rounded-[10px] object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-semibold text-[#B85D79] uppercase">
                        {linkedProduct.brand}
                      </div>
                      <div className="text-xs font-semibold truncate">
                        {linkedProduct.name}
                      </div>
                      <div className="text-[11px] font-bold text-[#3B1E28]">
                        {formatTL(linkedProduct.priceTry)}
                      </div>
                    </div>
                    <span className="px-3 py-1.5 rounded-full bg-[#B85D79] text-white text-[10px] font-semibold shrink-0">
                      İncele
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================================
 * FEMİNEN ROSE-BLUSH ÜRÜN KARTI BİLEŞENİ
 * ============================================================================ */
function ProductCard({
  product,
  onOpenDetail,
  onAddToCart,
}: {
  product: Product;
  onOpenDetail: () => void;
  onAddToCart: () => void;
}) {
  return (
    <div className="group rounded-[22px] border border-[#B85D79]/15 bg-white overflow-hidden flex flex-col transition hover:shadow-lg hover:shadow-[#B85D79]/10">
      <div
        onClick={onOpenDetail}
        className="relative aspect-square bg-[#FCEEF2]/50 overflow-hidden cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {product.badgeType && (
          <span
            className={`absolute top-3.5 right-3.5 px-3 py-1 rounded-full text-[11px] font-semibold text-white shadow-2xs ${
              product.badgeType === "İNDİRİM"
                ? "bg-[#D9385A]"
                : "bg-[#B85D79]"
            }`}
          >
            {product.badgeType}
          </span>
        )}

        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-center gap-2 opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300"
        >
          <button
            type="button"
            onClick={onOpenDetail}
            className="px-3.5 py-2 rounded-full bg-white text-[#3B1E28] hover:bg-[#FCEEF2] text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#B85D79]" />
            <span>İncele</span>
          </button>

          <button
            type="button"
            onClick={onAddToCart}
            className="px-4 py-2 rounded-full bg-[#B85D79] hover:bg-[#A14A66] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{product.isPreOrder ? "Ön Sipariş" : "Çantaya Ekle"}</span>
          </button>
        </div>
      </div>

      <div className="p-4.5 flex-1 flex flex-col justify-between space-y-2 text-left">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-[#B85D79] font-semibold">
            {product.brand}
          </div>
          <h3
            onClick={onOpenDetail}
            className="text-[15px] font-medium text-[#3B1E28] group-hover:text-[#B85D79] cursor-pointer mt-0.5 line-clamp-2 transition"
          >
            {product.name}
          </h3>
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-baseline gap-2 text-[15px] font-bold">
            {product.oldPriceTry ? (
              <>
                <span className="text-[#3B1E28]/45 line-through font-normal text-xs">
                  {formatTL(product.oldPriceTry)}
                </span>
                <span className="text-[#D9385A]">
                  {formatTL(product.priceTry)}
                </span>
              </>
            ) : (
              <span className="text-[#3B1E28]">
                {formatTL(product.priceTry)}
              </span>
            )}
          </div>

          {product.variants.some((v) => v.hexColor) && (
            <div className="flex items-center gap-1.5 pt-0.5">
              {product.variants.map(
                (v) =>
                  v.hexColor && (
                    <span
                      key={v.id}
                      title={v.name}
                      style={{ backgroundColor: v.hexColor }}
                      className="w-4 h-4 rounded-full border border-[#B85D79]/30"
                    />
                  )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
