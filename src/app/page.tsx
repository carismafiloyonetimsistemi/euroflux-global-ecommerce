"use client";

import React, { useState, useMemo } from "react";
import {
  ShoppingBag,
  Search,
  User,
  Eye,
  Plus,
  Minus,
  Share2,
  MessageCircleQuestion,
  MapPin,
  Lock,
  ArrowUp,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Truck,
  Sparkles,
  Flame,
} from "lucide-react";
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CUSTOM_REQUESTS,
  BRAND_SHOWCASE,
  CUSTOMER_REVIEWS,
  Product,
  ProductVariant,
  OrderRecord,
  OrderStageStatus,
  CustomSourcingRequestItem,
  formatTL,
} from "@/lib/mock-data";
import LiveOrderTracker from "@/components/LiveOrderTracker";
import SmartCartDrawer, { CartItem } from "@/components/SmartCartDrawer";
import AdminControlCenter from "@/components/AdminControlCenter";

export default function AdenBeautyPlatform() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord>(INITIAL_ORDERS[0]);
  const [customRequests] = useState<CustomSourcingRequestItem[]>(
    INITIAL_CUSTOM_REQUESTS
  );

  // Aktif Görünüm: İlk açılışta veya ürün seçildiğinde birebir Armani Advent Calendar Ürün Detay Sayfası veya Ana Vitrin
  // Kullanıcının özellikle belirttiği /products/armani-advent-calendar-2 deneyimini hem doğrudan üstte hem vitrinle sunalım
  const [activeView, setActiveView] = useState<
    "PRODUCT_DETAIL" | "HOMEPAGE" | "ORDER_TRACKING" | "ADMIN"
  >("PRODUCT_DETAIL");

  const [activeProduct, setActiveProduct] = useState<Product>(INITIAL_PRODUCTS[0]);
  const [pdpQuantity, setPdpQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Ana Sayfa Sekmeli Ürün Karuseli ("Yeni Gelenler", "Hemen Teslim Ürünler", "Çok Satanlar")
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

  // Paylaş / Soru Sor bildirimi
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Ürüne Tıklayıp Ürün Detay Sayfasını Açma
  const openProductDetail = (product: Product) => {
    setActiveProduct(product);
    setPdpQuantity(1);
    setActiveImageIndex(0);
    setActiveView("PRODUCT_DETAIL");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Sepete Ekleme
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

  const handleUpdateOrderStage = (
    orderNumber: string,
    newStage: OrderStageStatus
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.orderNumber !== orderNumber) return ord;
        const updated = { ...ord, currentStage: newStage };
        if (selectedOrder.orderNumber === orderNumber) {
          setSelectedOrder(updated);
        }
        return updated;
      })
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

  // Ana Sayfa Sekme Ürünleri
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
      return list.filter((p) => p.isTrending || p.isTikTokViral || p.priceTry >= 7000);
    }
    return list;
  }, [products, homeCarouselTab, selectedCategory, selectedBrandFilter, searchQuery]);

  // Ürün Detay Sayfasındaki "Sizin için öneriler" (4 ürün)
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
    products[1];

  return (
    <div className="min-h-screen bg-white text-[#563C49] flex flex-col pb-24">
      {/* 1. ÜST DUYURU BARI (Birebir #563C49 Deep Plum, 40px) */}
      <div className="bg-[#563C49] text-white text-center py-2.5 px-4 text-xs sm:text-[14px] font-normal">
        5000₺ ve üzeri siparişlerde ücretsiz kargo
      </div>

      {/* 2. FLOATING PILL HEADER (Yuvarlak Beyaz Hap Tasarımı) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md py-3.5 px-4 sm:px-8 lg:px-12 border-b border-[#563C49]/[0.08]">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          {/* Sol Logo: ADEN */}
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("TÜMÜ");
              setSelectedBrandFilter("TÜMÜ");
              setActiveView("HOMEPAGE");
            }}
            className="flex items-center gap-2.5 text-left cursor-pointer shrink-0"
          >
            <div className="w-10 h-10 rounded-full bg-[#563C49] flex items-center justify-center text-white font-semibold text-base tracking-wider">
              A
            </div>
            <div className="leading-none">
              <span className="block text-[20px] font-bold tracking-[0.18em] text-[#563C49]">
                ADEN
              </span>
              <span className="block text-[10px] font-medium tracking-[0.22em] text-[#9F8291] uppercase mt-0.5">
                GLOBAL BEAUTY
              </span>
            </div>
          </button>

          {/* Orta Menü Linkleri */}
          <nav className="hidden lg:flex items-center gap-6 text-[14px] text-[#563C49]">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("TÜMÜ");
                setSelectedBrandFilter("TÜMÜ");
                setActiveView("HOMEPAGE");
              }}
              className={`hover:text-[#9F8291] transition cursor-pointer ${
                activeView === "HOMEPAGE" && selectedCategory === "TÜMÜ"
                  ? "font-semibold underline underline-offset-8"
                  : ""
              }`}
            >
              Ana Sayfa
            </button>

            <button
              type="button"
              onClick={() => openProductDetail(INITIAL_PRODUCTS[0])}
              className={`hover:text-[#9F8291] transition cursor-pointer ${
                activeView === "PRODUCT_DETAIL" &&
                activeProduct.slug === "armani-advent-calendar-2"
                  ? "font-semibold underline underline-offset-8"
                  : ""
              }`}
            >
              Armani Advent Calendar
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
                className={`hover:text-[#9F8291] transition cursor-pointer ${
                  activeView === "HOMEPAGE" && selectedCategory === item.category
                    ? "font-semibold underline underline-offset-8"
                    : ""
                }`}
              >
                {item.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setActiveView("ORDER_TRACKING")}
              className={`px-3.5 py-1.5 rounded-[30px] text-xs font-medium transition cursor-pointer ${
                activeView === "ORDER_TRACKING"
                  ? "bg-[#563C49] text-white"
                  : "bg-[#563C49]/[0.06] text-[#563C49] hover:bg-[#563C49]/12"
              }`}
            >
              Sipariş Takibi
            </button>

            <button
              type="button"
              onClick={() => setActiveView("ADMIN")}
              className={`px-3.5 py-1.5 rounded-[30px] text-xs font-medium transition cursor-pointer ${
                activeView === "ADMIN"
                  ? "bg-[#563C49] text-white"
                  : "border border-[#563C49]/25 text-[#563C49] hover:bg-[#563C49]/[0.06]"
              }`}
            >
              Admin Paneli
            </button>
          </nav>

          {/* Sağ İkonlar: Arama, Admin Butonu, Sepet */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              title="Ürün Ara"
              className="w-10 h-10 rounded-full hover:bg-[#563C49]/[0.06] flex items-center justify-center text-[#563C49] transition cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveView("ADMIN")}
              title="Admin Yönetim Paneli"
              className={`px-3.5 h-10 rounded-[30px] flex items-center gap-1.5 text-xs font-medium transition cursor-pointer ${
                activeView === "ADMIN"
                  ? "bg-[#563C49] text-white"
                  : "bg-[#563C49]/[0.06] hover:bg-[#563C49]/12 text-[#563C49]"
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              title="Sepetim"
              className="relative px-4 h-10 rounded-[30px] bg-[#563C49]/[0.06] hover:bg-[#563C49]/12 flex items-center gap-2 text-[#563C49] transition cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-medium">{totalCartCount}</span>
            </button>
          </div>
        </div>

        {/* Mobil Hızlı Menü */}
        <div className="flex lg:hidden items-center gap-2 overflow-x-auto pt-3 mt-3 border-t border-[#563C49]/[0.06] text-xs whitespace-nowrap">
          <button
            type="button"
            onClick={() => setActiveView("HOMEPAGE")}
            className={`px-3.5 py-1.5 rounded-[30px] cursor-pointer ${
              activeView === "HOMEPAGE"
                ? "bg-[#563C49] text-white"
                : "bg-[#563C49]/[0.06] text-[#563C49]"
            }`}
          >
            Ana Sayfa
          </button>
          <button
            type="button"
            onClick={() => openProductDetail(INITIAL_PRODUCTS[0])}
            className={`px-3.5 py-1.5 rounded-[30px] cursor-pointer ${
              activeView === "PRODUCT_DETAIL"
                ? "bg-[#563C49] text-white"
                : "bg-[#563C49]/[0.06] text-[#563C49]"
            }`}
          >
            Armani Advent Calendar
          </button>
          <button
            type="button"
            onClick={() => setActiveView("ORDER_TRACKING")}
            className={`px-3.5 py-1.5 rounded-[30px] cursor-pointer ${
              activeView === "ORDER_TRACKING"
                ? "bg-[#563C49] text-white"
                : "bg-[#563C49]/[0.06] text-[#563C49]"
            }`}
          >
            Canlı Kargo Takibi
          </button>
          <button
            type="button"
            onClick={() => setActiveView("ADMIN")}
            className={`px-3.5 py-1.5 rounded-[30px] cursor-pointer ${
              activeView === "ADMIN"
                ? "bg-[#563C49] text-white"
                : "bg-[#563C49]/[0.06] text-[#563C49]"
            }`}
          >
            Yönetim
          </button>
        </div>

        {/* Açılır Arama Çubuğu */}
        {searchOpen && (
          <div className="max-w-xl mx-auto pt-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#563C49]/50 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeView !== "HOMEPAGE") setActiveView("HOMEPAGE");
                }}
                placeholder="Armani, Space NK, Rhode, Patrick Ta veya ürün ara..."
                className="w-full pl-11 pr-4 py-2.5 rounded-[30px] bg-[#F9F8F6] border border-[#563C49]/15 text-sm text-[#563C49] focus:outline-none focus:border-[#563C49]"
              />
            </div>
          </div>
        )}
      </header>

      {/* Bildirim Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-5 py-3 rounded-[30px] bg-[#563C49] text-white text-xs font-medium shadow-lg">
          {toastMessage}
        </div>
      )}

      {/* ======================================================================= */}
      {/* GÖRÜNÜM 1: ÜRÜN DETAY SAYFASI (/products/armani-advent-calendar-2 BİREBİR) */}
      {/* ======================================================================= */}
      {activeView === "PRODUCT_DETAIL" && (
        <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 space-y-16">
          {/* Üst Yol (Breadcrumb) */}
          <div className="flex items-center justify-between text-xs text-[#563C49]/65">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveView("HOMEPAGE")}
                className="hover:text-[#563C49] cursor-pointer"
              >
                Ana Sayfa
              </button>
              <span>/</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(activeProduct.category);
                  setActiveView("HOMEPAGE");
                }}
                className="hover:text-[#563C49] cursor-pointer"
              >
                {activeProduct.category}
              </button>
              <span>/</span>
              <span className="text-[#563C49] font-medium">
                {activeProduct.name}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActiveView("HOMEPAGE")}
              className="text-xs font-medium underline underline-offset-4 hover:text-[#9F8291] cursor-pointer"
            >
              Tüm Koleksiyonu & Ana Vitrin&apos;i Gör &rarr;
            </button>
          </div>

          {/* 2 Sütunlu Asimetrik Ürün Detay Düzeni (%65 Sol Görsel / %35 Sağ Bilgi Kartı) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-[35px] items-start">
            {/* Sol Sütun (65% -> 7/12 veya 8/12): Büyük Yuvarlatılmış Ürün Görseli (30px radius) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative rounded-[20px] sm:rounded-[30px] overflow-hidden bg-[#F9F8F6] border border-[#563C49]/[0.08] aspect-square sm:aspect-[4/3]">
                <img
                  src={productImages[activeImageIndex] || activeProduct.image}
                  alt={activeProduct.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />

                {activeProduct.badgeType && (
                  <span
                    className={`absolute top-5 right-5 px-3.5 py-1 rounded-full text-xs font-medium text-white ${
                      activeProduct.badgeType === "İNDİRİM"
                        ? "bg-[#FC5732]"
                        : "bg-[#438E44]"
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
                      className={`w-20 h-20 rounded-[16px] overflow-hidden border-2 transition cursor-pointer ${
                        activeImageIndex === idx
                          ? "border-[#563C49]"
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

            {/* Sağ Sütun (35% -> 5/12): Sticky Ürün Bilgi Kartı (20px radius, 1px rgba(86,60,73,0.08) border) */}
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <div className="rounded-[20px] border border-[#563C49]/[0.08] bg-white p-5 sm:p-[22px] space-y-5">
                {/* Marka Pill Badge */}
                <div>
                  <span className="inline-block px-3 py-1 rounded-[6px] bg-[#563C49]/[0.06] text-[#563C49] text-xs font-medium">
                    {activeProduct.brand}
                  </span>
                </div>

                {/* Ürün Başlığı (34px DM Sans Medium #563C49) */}
                <h1 className="text-[28px] sm:text-[34px] font-medium leading-[1.2] text-[#563C49]">
                  {activeProduct.name}
                </h1>

                {/* Fiyat Formatı: 35,000TL */}
                <div className="flex items-baseline gap-3 pb-4 border-b border-[#563C49]/[0.08]">
                  {activeProduct.oldPriceTry ? (
                    <>
                      <span className="text-base text-[#563C49]/60 line-through">
                        {formatTL(activeProduct.oldPriceTry)}
                      </span>
                      <span className="text-xl font-medium text-[#EB001B]">
                        {formatTL(activeProduct.priceTry)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xl font-medium text-[#563C49]">
                      {formatTL(activeProduct.priceTry)}
                    </span>
                  )}
                </div>

                {/* Tedarik ve Teslimat Bilgilendirme Satırları (*Ürün siparişiniz üzerine...) */}
                <div className="space-y-2.5 text-[14px] leading-[1.6] text-[#563C49]">
                  {activeProduct.deliveryNotes.map((note, idx) => (
                    <p key={idx}>{note}</p>
                  ))}
                </div>

                {/* Adet Seçici & ÖN SİPARİŞ / SEPETE EKLE Hap Butonu */}
                <div className="flex items-center gap-3 pt-1">
                  {/* Pill Adet Seçici */}
                  <div className="inline-flex items-center justify-between rounded-[30px] border border-[#563C49]/20 h-[44px] px-3 min-w-[110px]">
                    <button
                      type="button"
                      onClick={() => setPdpQuantity(Math.max(1, pdpQuantity - 1))}
                      className="p-1 text-[#563C49]/70 hover:text-[#563C49] cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-medium text-[#563C49]">
                      {pdpQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPdpQuantity(pdpQuantity + 1)}
                      className="p-1 text-[#563C49]/70 hover:text-[#563C49] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Ana Aksiyon Butonu (#563C49 Deep Plum, 30px radius, 44px yükseklik) */}
                  <button
                    type="button"
                    onClick={() => handleAddToCart(activeProduct, pdpQuantity)}
                    className="flex-1 h-[44px] rounded-[30px] bg-[#563C49] hover:bg-[#9F8291] text-white font-medium text-[15px] tracking-wide uppercase transition cursor-pointer"
                  >
                    {activeProduct.isPreOrder ? "ÖN SİPARİŞ" : "SEPETE EKLE"}
                  </button>
                </div>

                {/* Express Checkout: G Pay ile Satın Al (Siyah Hap Buton) */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(activeProduct, pdpQuantity)}
                    className="w-full h-[44px] rounded-[30px] bg-black hover:bg-neutral-800 text-white font-medium text-[15px] flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>G Pay ile Satın Al</span>
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(activeProduct, pdpQuantity)}
                      className="text-[12px] uppercase underline underline-offset-4 text-[#563C49]/80 hover:text-[#563C49] cursor-pointer"
                    >
                      DİĞER ÖDEME SEÇENEKLERİ
                    </button>
                  </div>
                </div>

                {/* Ön Sipariş / Hemen Teslim Durum Kutusu (Warm Gold Dot #E0B252) */}
                <div className="rounded-[10px] border border-[#563C49]/[0.08] px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        activeProduct.isPreOrder
                          ? "bg-[#E0B252] ring-4 ring-[#E0B252]/20"
                          : "bg-[#438E44] ring-4 ring-[#438E44]/20"
                      }`}
                    />
                    <span className="text-[14px] text-[#563C49]">
                      {activeProduct.isPreOrder ? "Ön Sipariş" : "Hemen Teslim"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveView("ORDER_TRACKING")}
                    className="text-xs text-[#563C49]/70 hover:text-[#563C49] underline underline-offset-4 cursor-pointer"
                  >
                    Kargo Süreci Nasıl İşler?
                  </button>
                </div>

                {/* Ürün Açıklaması & Kutu İçeriği Özeti */}
                <div className="pt-2 border-t border-[#563C49]/[0.08] space-y-2 text-xs text-[#563C49]/80 leading-relaxed">
                  <p>{activeProduct.description}</p>
                  {activeProduct.contentsList && (
                    <ul className="list-disc pl-4 space-y-1 pt-1 text-[#563C49]/75">
                      {activeProduct.contentsList.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Alt Paylaş & Soru Sor Satırı */}
                <div className="pt-2 flex items-center gap-5 text-xs text-[#563C49]">
                  <button
                    type="button"
                    onClick={() =>
                      triggerToast("Ürün bağlantısı panoya kopyalandı!")
                    }
                    className="inline-flex items-center gap-1.5 hover:text-[#9F8291] cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Paylaş</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      triggerToast(
                        "Müşteri temsilcimiz ürünle ilgili sorularınız için hazır."
                      )
                    }
                    className="inline-flex items-center gap-1.5 hover:text-[#9F8291] cursor-pointer"
                  >
                    <MessageCircleQuestion className="w-4 h-4" />
                    <span>Soru sor</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sizin İçin Öneriler (4 Sütunlu İlgili Ürünler) */}
          <section className="space-y-8 pt-6">
            <h2 className="text-[32px] sm:text-[40px] font-medium text-center text-[#563C49]">
              Sizin için öneriler
            </h2>

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

          {/* Değer Önerisi Kutusu: Dünyadan Güzellik Keşifleri & Güvenli Ödeme */}
          <section className="rounded-[20px] border border-[#563C49]/[0.08] p-8 sm:p-10 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
              <div className="flex flex-col items-center space-y-2.5">
                <div className="w-12 h-12 rounded-full bg-[#563C49]/[0.06] flex items-center justify-center text-[#563C49]">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-medium text-[#563C49]">
                  Dünyadan Güzellik Keşifleri
                </h3>
                <p className="text-sm text-[#563C49]/70 max-w-sm">
                  Sevilen markalar ve merak ettiğiniz ürünler bir arada.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-2.5">
                <div className="w-12 h-12 rounded-full bg-[#563C49]/[0.06] flex items-center justify-center text-[#563C49]">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-medium text-[#563C49]">
                  Güvenli Ödeme
                </h3>
                <p className="text-sm text-[#563C49]/70 max-w-sm">
                  Ödeme işlemleriniz güvenle gerçekleştirilir.
                </p>
              </div>
            </div>
          </section>

          {/* Ürün Sayfasının Altında Şeffaf Kargo Takip Önizlemesi */}
          <section className="space-y-4">
            <LiveOrderTracker
              orders={orders}
              selectedOrder={selectedOrder}
              onSelectOrder={setSelectedOrder}
              onSimulateStageChange={handleUpdateOrderStage}
            />
          </section>
        </main>
      )}

      {/* ======================================================================= */}
      {/* GÖRÜNÜM 2: ANA SAYFA VİTRİNİ (avrupadankargom.com Ana Sayfa Akışı)       */}
      {/* ======================================================================= */}
      {activeView === "HOMEPAGE" && (
        <main className="space-y-16 sm:space-y-20">
          {/* 1. Tam Genişlik Editorial Hero Banner */}
          <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-6">
            <div className="relative rounded-[24px] sm:rounded-[30px] overflow-hidden bg-[#563C49] text-white min-h-[420px] sm:min-h-[520px] flex items-center">
              <img
                src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1600&q=85"
                alt="Advent Calendar 2026"
                className="absolute inset-0 w-full h-full object-cover opacity-55"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#563C49]/90 via-[#563C49]/60 to-transparent" />

              <div className="relative z-10 p-8 sm:p-14 lg:p-20 max-w-2xl space-y-5">
                <span className="inline-block px-4 py-1.5 rounded-[30px] bg-white/15 backdrop-blur-md text-xs font-medium tracking-wide">
                  2026 YILBAŞI & ADVENT KOLEKSİYONU
                </span>
                <h1 className="text-[36px] sm:text-[54px] font-medium leading-[1.15]">
                  Her çekmecede bir güzellik sırrı
                </h1>
                <p className="text-white/85 text-sm sm:text-base leading-relaxed">
                  Armani, Space NK, Liberty London ve Rituals Advent Takvimleri ile her gün yeni bir güzellik sürprizini keşfedin.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => openProductDetail(INITIAL_PRODUCTS[0])}
                    className="px-7 py-3.5 rounded-[30px] bg-white text-[#563C49] hover:bg-[#F9F8F6] font-medium text-sm transition cursor-pointer"
                  >
                    Takvimi Keşfet
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView("ORDER_TRACKING")}
                    className="px-6 py-3.5 rounded-[30px] bg-white/15 hover:bg-white/25 text-white border border-white/30 font-medium text-sm transition cursor-pointer"
                  >
                    Canlı Sipariş Takibi
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Favori Markanı Keşfet (Brand Discovery Grid) */}
          <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-[32px] sm:text-[40px] font-medium text-[#563C49]">
                  Favori markanı keşfet
                </h2>
                <p className="text-sm text-[#563C49]/70 mt-1">
                  Dünyaca ünlü kozmetik ve niş parfüm markalarının Avrupa koleksiyonları
                </p>
              </div>
              {selectedBrandFilter !== "TÜMÜ" && (
                <button
                  type="button"
                  onClick={() => setSelectedBrandFilter("TÜMÜ")}
                  className="text-xs font-medium underline underline-offset-4 text-[#563C49] cursor-pointer"
                >
                  Marka Filtresini Temizle ({selectedBrandFilter})
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
                  style={{ backgroundColor: brand.bgColor }}
                  className="group relative rounded-[20px] overflow-hidden aspect-[4/3] p-6 flex flex-col justify-between cursor-pointer border border-[#563C49]/[0.08]"
                >
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="relative z-10">
                    <span
                      style={{ color: brand.textColor }}
                      className="text-xs uppercase tracking-widest opacity-80"
                    >
                      {brand.subtitle}
                    </span>
                    <h3
                      style={{ color: brand.textColor }}
                      className="text-2xl font-medium mt-1"
                    >
                      {brand.name}
                    </h3>
                  </div>

                  <div className="relative z-10">
                    <span className="inline-block px-5 py-2.5 rounded-[30px] bg-white text-[#563C49] text-xs font-medium shadow-xs group-hover:bg-[#563C49] group-hover:text-white transition">
                      Ürünleri Keşfet
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Yeni Favorilerini Keşfet (Hap Sekmeli Ürün Vitrini) */}
          <section
            id="product-tabs-section"
            className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-[32px] sm:text-[40px] font-medium text-[#563C49]">
                Yeni favorilerini keşfet
              </h2>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("TÜMÜ");
                  setSelectedBrandFilter("TÜMÜ");
                  setHomeCarouselTab("NEW");
                }}
                className="text-sm underline underline-offset-4 text-[#563C49]/75 hover:text-[#563C49] cursor-pointer"
              >
                Tüm ürünleri görüntüle
              </button>
            </div>

            {/* Pill Tab Bar (Yeni Gelenler | Hemen Teslim Ürünler | Çok Satanlar) */}
            <div className="max-w-3xl mx-auto rounded-full border border-[#563C49]/[0.08] p-2 flex items-center justify-between gap-2 bg-white">
              <button
                type="button"
                onClick={() =>
                  setHomeCarouselTab(
                    homeCarouselTab === "NEW" ? "BEST" : "NEW"
                  )
                }
                className="w-10 h-10 rounded-full border border-[#563C49]/10 flex items-center justify-center text-[#563C49] hover:bg-[#563C49]/[0.06] shrink-0 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setHomeCarouselTab("NEW")}
                  className={`px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition cursor-pointer ${
                    homeCarouselTab === "NEW"
                      ? "bg-[#563C49] text-white"
                      : "bg-[#F4F2F3] text-[#563C49] hover:bg-[#563C49]/15"
                  }`}
                >
                  Yeni Gelenler
                </button>
                <button
                  type="button"
                  onClick={() => setHomeCarouselTab("EXPRESS")}
                  className={`px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition cursor-pointer ${
                    homeCarouselTab === "EXPRESS"
                      ? "bg-[#563C49] text-white"
                      : "bg-[#F4F2F3] text-[#563C49] hover:bg-[#563C49]/15"
                  }`}
                >
                  Hemen Teslim Ürünler
                </button>
                <button
                  type="button"
                  onClick={() => setHomeCarouselTab("BEST")}
                  className={`px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition cursor-pointer ${
                    homeCarouselTab === "BEST"
                      ? "bg-[#563C49] text-white"
                      : "bg-[#F4F2F3] text-[#563C49] hover:bg-[#563C49]/15"
                  }`}
                >
                  Çok Satanlar
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  setHomeCarouselTab(
                    homeCarouselTab === "NEW" ? "EXPRESS" : "NEW"
                  )
                }
                className="w-10 h-10 rounded-full border border-[#563C49]/10 flex items-center justify-center text-[#563C49] hover:bg-[#563C49]/[0.06] shrink-0 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Ürün Kartları Grid (4 Sütun) */}
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

          {/* 4. Sınırlı Süre Geçerli Fırsat Banner'ı */}
          <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
            <div className="rounded-[24px] bg-[#F9F8F6] border border-[#563C49]/[0.08] p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-3 text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#FC5732]">
                  <Flame className="w-4 h-4" />
                  Sınırlı süre geçerli fırsat
                </div>
                <h3 className="text-[28px] sm:text-[36px] font-medium text-[#563C49]">
                  Güzellik dolu bu fırsatı kaçırma!
                </h3>
                <p className="text-sm text-[#563C49]/70 max-w-lg">
                  Space NK ve Armani 2026 Advent Takvimlerinde ön sipariş kontenjanı dolmadan yerinizi ayırtın.
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
                    className="w-16 sm:w-20 py-3 rounded-[16px] bg-white border border-[#563C49]/10 text-center"
                  >
                    <div className="text-xl sm:text-2xl font-medium text-[#563C49]">
                      {t.val}
                    </div>
                    <div className="text-[11px] text-[#563C49]/60">{t.label}</div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => openProductDetail(spaceNkProduct)}
                className="px-7 py-3.5 rounded-[30px] bg-[#563C49] hover:bg-[#9F8291] text-white text-sm font-medium transition cursor-pointer"
              >
                Fırsatı keşfet
              </button>
            </div>
          </section>

          {/* 5. Ana Sayfada Gömülü Öne Çıkan Ürün Spotlight (Space NK Beauty Advent Calendar) */}
          <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-[24px] bg-[#F9F8F6] p-6 sm:p-10 border border-[#563C49]/[0.08]">
              <div className="lg:col-span-7">
                <div className="rounded-[24px] overflow-hidden aspect-[4/3] bg-white">
                  <img
                    src={spaceNkProduct.image}
                    alt={spaceNkProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="lg:col-span-5 space-y-5 bg-white p-6 sm:p-8 rounded-[20px] border border-[#563C49]/[0.08]">
                <span className="inline-block px-3 py-1 rounded-[6px] bg-[#563C49]/[0.06] text-[#563C49] text-xs font-medium">
                  {spaceNkProduct.brand}
                </span>
                <h3 className="text-2xl sm:text-3xl font-medium text-[#563C49]">
                  {spaceNkProduct.name}
                </h3>
                <div className="flex items-baseline gap-3 pb-4 border-b border-[#563C49]/[0.08]">
                  <span className="text-base text-[#563C49]/60 line-through">
                    35,000TL
                  </span>
                  <span className="text-xl font-medium text-[#EB001B]">
                    32,000TL
                  </span>
                </div>
                <div className="space-y-2 text-sm text-[#563C49]">
                  {spaceNkProduct.deliveryNotes.map((n, i) => (
                    <p key={i}>{n}</p>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(spaceNkProduct, 1)}
                    className="flex-1 h-[44px] rounded-[30px] bg-[#563C49] hover:bg-[#9F8291] text-white text-sm font-medium uppercase cursor-pointer"
                  >
                    ÖN SİPARİŞ
                  </button>
                  <button
                    type="button"
                    onClick={() => openProductDetail(spaceNkProduct)}
                    className="px-5 h-[44px] rounded-[30px] border border-[#563C49]/20 text-xs font-medium text-[#563C49] hover:bg-[#563C49]/[0.06] cursor-pointer"
                  >
                    Detaylı İncele
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Sizden Düşünceler (Müşteri Yorumları Karuseli) */}
          <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 space-y-8">
            <h2 className="text-[32px] sm:text-[40px] font-medium text-center text-[#563C49]">
              Sizden Düşünceler
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {CUSTOMER_REVIEWS.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-[16px] border border-[#563C49]/[0.08] p-6 bg-white flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="text-[#E0B252] text-sm tracking-widest">
                      ★★★★★
                    </div>
                    <h4 className="text-base font-medium text-[#563C49]">
                      {rev.title}
                    </h4>
                    <p className="text-xs text-[#563C49]/75 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#563C49]/[0.06] flex items-center justify-between text-xs">
                    <span className="font-medium text-[#563C49] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#438E44]" />
                      {rev.author}
                    </span>
                    <span className="text-[#563C49]/55 truncate max-w-[130px]">
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
            onSimulateStageChange={handleUpdateOrderStage}
          />
        </main>
      )}

      {/* ======================================================================= */}
      {/* GÖRÜNÜM 4: YÖNETİM PANELİ (ADMIN)                                       */}
      {/* ======================================================================= */}
      {activeView === "ADMIN" && (
        <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-10 space-y-8">
          <AdminControlCenter
            orders={orders}
            products={products}
            customRequests={customRequests}
            onUpdateOrderStage={handleUpdateOrderStage}
            onSyncEuropeanStock={handleSyncEuropeanStock}
          />
        </main>
      )}

      {/* ======================================================================= */}
      {/* STICKY BOTTOM ADD-TO-CART BAR (Sayfa altında sabit Armani / Ürün Barı)  */}
      {/* ======================================================================= */}
      {activeView === "PRODUCT_DETAIL" && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#563C49]/10 shadow-lg py-3 px-4 sm:px-8">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={() =>
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }
                className="w-10 h-10 rounded-full border border-[#563C49]/15 flex items-center justify-center text-[#563C49] hover:bg-[#563C49]/[0.06] cursor-pointer"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <img
                src={activeProduct.image}
                alt={activeProduct.name}
                className="w-12 h-12 rounded-[10px] object-cover border border-[#563C49]/10 hidden sm:block"
              />
              <div>
                <div className="text-sm font-medium text-[#563C49]">
                  {activeProduct.name}
                </div>
                <div className="text-xs text-[#563C49]/75">
                  {formatTL(activeProduct.priceTry)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleAddToCart(activeProduct, pdpQuantity)}
                className="px-7 h-[42px] rounded-[30px] bg-[#563C49] hover:bg-[#9F8291] text-white text-xs sm:text-sm font-medium flex items-center gap-2 transition cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {activeProduct.isPreOrder ? "Ön Sipariş" : "Sepete Ekle"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* FOOTER (#563C49 Deep Plum, Bültene Kaydol & Ödeme İkonları)             */}
      {/* ======================================================================= */}
      <footer className="bg-[#563C49] text-white mt-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-14 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-white/15">
            {/* Sol: Bültene Kaydol */}
            <div className="lg:col-span-6 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-medium">
                Bültene Kaydol
              </h2>
              <p className="text-sm text-white/75 max-w-md">
                Yeni gelen Advent takvimleri, sınırlı sayıda üretilen koleksiyonlar ve hemen teslim ürünlerden ilk siz haberdar olun.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setNewsletterSubscribed(true);
                  setNewsletterEmail("");
                }}
                className="max-w-md flex items-center rounded-[30px] border border-white/40 p-1.5"
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
                  className="px-5 py-2 rounded-[30px] bg-white text-[#563C49] text-xs font-medium flex items-center gap-1 hover:bg-[#F9F8F6] transition cursor-pointer"
                >
                  <span>Kaydol</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {newsletterSubscribed && (
                <p className="text-xs text-emerald-300">
                  ✓ Bültenimize başarıyla kaydoldunuz!
                </p>
              )}
            </div>

            {/* Sağ: Destek & Hakkımızda */}
            <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div className="space-y-3">
                <h4 className="font-medium text-white">Kategoriler</h4>
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
                <h4 className="font-medium text-white">Destek</h4>
                <ul className="space-y-2 text-white/75 text-xs">
                  <li>
                    <button
                      type="button"
                      onClick={() => setActiveView("ORDER_TRACKING")}
                      className="hover:text-white cursor-pointer"
                    >
                      Canlı Sipariş Takibi
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setSearchOpen(true)}
                      className="hover:text-white cursor-pointer"
                    >
                      Arama
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setActiveView("ADMIN")}
                      className="hover:text-white cursor-pointer"
                    >
                      Yönetim Paneli
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-white">Hakkımızda</h4>
                <p className="text-xs text-white/75 leading-relaxed">
                  Avrupa ve Amerika&apos;daki sevilen kozmetik markalarını şeffaf kargo takibi ve güvenli ödeme ile kapınıza getiriyoruz.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/70">
            <div>© 2026, ADEN Global Beauty. Tüm hakları saklıdır.</div>
            <div className="flex flex-wrap items-center gap-2">
              {["Visa", "Mastercard", "Apple Pay", "Google Pay", "Amex"].map(
                (pm) => (
                  <span
                    key={pm}
                    className="px-3 py-1 rounded-[6px] bg-white/10 text-white text-[11px]"
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
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
        onOrderCreated={(newOrder) => {
          setOrders((prev) => [newOrder, ...prev]);
          setSelectedOrder(newOrder);
          setActiveView("ORDER_TRACKING");
        }}
      />
    </div>
  );
}

/* ============================================================================
 * ÜRÜN KARTI BİLEŞENİ (avrupadankargom.com hdt-card-product stili)
 * - 10px border-radius, 1px rgba(86,60,73,0.08) kenarlık
 * - Sağ üstte YENİ (#438E44) veya İNDİRİM (#FC5732) hap rozet
 * - Görsel üzerinde Hızlı Bakış & Ön Sipariş / Sepete Ekle hap butonları
 * - Sol hizalı marka, ürün adı, virgüllü TL fiyatı ve renk noktaları
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
    <div className="group rounded-[10px] border border-[#563C49]/[0.08] bg-white overflow-hidden flex flex-col transition hover:shadow-md">
      {/* Görsel Alanı */}
      <div
        onClick={onOpenDetail}
        className="relative aspect-square bg-[#F9F8F6] overflow-hidden cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Sağ Üst Rozet */}
        {product.badgeType && (
          <span
            className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-white ${
              product.badgeType === "İNDİRİM"
                ? "bg-[#FC5732]"
                : "bg-[#438E44]"
            }`}
          >
            {product.badgeType}
          </span>
        )}

        {/* Hover Aksiyon Hap Butonları (Hızlı Bakış + Ön Sipariş / Sepete Ekle) */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2 opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300"
        >
          <button
            type="button"
            onClick={onOpenDetail}
            className="px-3.5 py-2 rounded-[30px] bg-white text-[#563C49] hover:bg-[#F9F8F6] text-xs font-medium flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Hızlı Bakış</span>
          </button>

          <button
            type="button"
            onClick={onAddToCart}
            className="px-4 py-2 rounded-[30px] bg-[#563C49]/90 hover:bg-[#563C49] text-white text-xs font-medium flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{product.isPreOrder ? "Ön Sipariş" : "Sepete Ekle"}</span>
          </button>
        </div>
      </div>

      {/* Alt Bilgi Alanı */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2 text-left">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-[#563C49]/70">
            {product.brand}
          </div>
          <h3
            onClick={onOpenDetail}
            className="text-[14px] sm:text-[15px] font-normal text-[#563C49] group-hover:underline underline-offset-4 cursor-pointer mt-0.5 line-clamp-2"
          >
            {product.name}
          </h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2 text-[14px] sm:text-[15px] font-medium">
            {product.oldPriceTry ? (
              <>
                <span className="text-[#563C49]/60 line-through font-normal text-xs">
                  {formatTL(product.oldPriceTry)}
                </span>
                <span className="text-[#EB001B]">
                  {formatTL(product.priceTry)}
                </span>
              </>
            ) : (
              <span className="text-[#563C49]">
                {formatTL(product.priceTry)}
              </span>
            )}
          </div>

          {/* Renk Swatch Noktaları (Varsa) */}
          {product.variants.some((v) => v.hexColor) && (
            <div className="flex items-center gap-1.5 pt-0.5">
              {product.variants.map(
                (v) =>
                  v.hexColor && (
                    <span
                      key={v.id}
                      title={v.name}
                      style={{ backgroundColor: v.hexColor }}
                      className="w-4 h-4 rounded-full border border-[#563C49]/25"
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
