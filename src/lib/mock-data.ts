export type SupplyStatus = "EXPRESS_READY_EU" | "BOUTIQUE_PREORDER" | "LIMITED_DROP";

export type OrderStageStatus =
  | "ORDER_CONFIRMED"
  | "EU_WAREHOUSE"
  | "EXPORT_CUSTOMS"
  | "IN_FLIGHT_TRANSIT"
  | "TR_CUSTOMS_HUB"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

export interface ProductVariant {
  id: string;
  type: "Renk" | "Boyut" | "Set";
  name: string;
  hexColor?: string;
  priceDiffTry: number;
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  brand: string;
  category:
    | "Advent Takvimi"
    | "Setler"
    | "Makyaj"
    | "Bakım"
    | "Parfüm"
    | "Hemen Teslim";
  originCountry: "Fransa" | "İngiltere" | "Almanya" | "ABD";
  originFlag: string;
  originCity: string;
  sourceStore: string;
  supplyStatus: SupplyStatus;
  supplyBadgeText: string;
  estimatedDeliveryDays: string;
  basePriceEur: number;
  priceTry: number;
  oldPriceTry?: number;
  badgeType?: "YENİ" | "İNDİRİM" | "HEMEN TESLİM";
  isPreOrder: boolean;
  customsIncluded: boolean;
  authenticityBatch: string;
  rating: number;
  reviewCount: number;
  stockCount: number;
  isTrending?: boolean;
  isTikTokViral?: boolean;
  description: string;
  deliveryNotes: string[];
  contentsList?: string[];
  highlights: string[];
  image: string;
  secondaryImage?: string;
  variants: ProductVariant[];
}

export interface TrackingStageLog {
  stage: OrderStageStatus;
  title: string;
  subtitle: string;
  description: string;
  location: string;
  timestamp: string;
  operatorName: string;
  badgeCode: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCity: string;
  tcIdentityMasked: string;
  currentStage: OrderStageStatus;
  createdAt: string;
  guaranteedDeliveryDate: string;
  etgbDeclarationNo: string;
  airWaybillNo: string;
  originHub: string;
  batchVerified: boolean;
  receiptHash: string;
  pricing: {
    subtotalTry: number;
    euLogisticsFeeTry: number;
    customsTaxTry: number;
    vipInsuranceTry: number;
    totalTry: number;
  };
  items: {
    productId: string;
    name: string;
    brand: string;
    variant: string;
    quantity: number;
    unitPriceTry: number;
    batchCode: string;
    image: string;
  }[];
  timeline: TrackingStageLog[];
}

export interface CustomSourcingRequestItem {
  id: string;
  customerName: string;
  brandAndProduct: string;
  sourceUrl: string;
  country: string;
  requestedAt: string;
  estimatedEur: number;
  quotedTotalTry: number;
  status: "TEKLİF HAZIRLANIYOR" | "MÜŞTERİ ONAYINDA" | "AVRUPA DEPO TEDARİĞİNDE";
}

export const ORDER_STAGE_META: {
  stage: OrderStageStatus;
  stepNumber: number;
  shortLabel: string;
  hubTag: string;
}[] = [
  {
    stage: "ORDER_CONFIRMED",
    stepNumber: 1,
    shortLabel: "Sipariş Onaylandı",
    hubTag: "Mağaza Tedarik Kaydı",
  },
  {
    stage: "EU_WAREHOUSE",
    stepNumber: 2,
    shortLabel: "Avrupa Deposunda",
    hubTag: "Kalite & Paketleme",
  },
  {
    stage: "EXPORT_CUSTOMS",
    stepNumber: 3,
    shortLabel: "Gümrük İşleminde",
    hubTag: "Avrupa Çıkış Onayı",
  },
  {
    stage: "IN_FLIGHT_TRANSIT",
    stepNumber: 4,
    shortLabel: "Uçuşta / Transit",
    hubTag: "Hava Kargo Transferi",
  },
  {
    stage: "TR_CUSTOMS_HUB",
    stepNumber: 5,
    shortLabel: "Türkiye Transfer Merkezinde",
    hubTag: "İstanbul Dağıtım Merkezi",
  },
  {
    stage: "OUT_FOR_DELIVERY",
    stepNumber: 6,
    shortLabel: "Kuryede",
    hubTag: "Adrese Teslimat",
  },
  {
    stage: "DELIVERED",
    stepNumber: 7,
    shortLabel: "Teslim Edildi",
    hubTag: "Mutlu Teslimat",
  },
];

// Format price exactly like avrupadankargom.com: "35,000TL"
export function formatTL(amount: number): string {
  return `${amount.toLocaleString("en-US")}TL`;
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prd-armani-01",
    slug: "armani-advent-calendar-2",
    sku: "AVK-ARM-2026",
    name: "Armani Advent Calendar",
    brand: "Armani",
    category: "Advent Takvimi",
    originCountry: "Fransa",
    originFlag: "🇫🇷",
    originCity: "Paris",
    sourceStore: "Giorgio Armani Beauty Paris Boutique",
    supplyStatus: "BOUTIQUE_PREORDER",
    supplyBadgeText: "Ön Sipariş • Avrupa Özel Tedarik",
    estimatedDeliveryDays: "7-12 İş Günü",
    basePriceEur: 690,
    priceTry: 35000,
    badgeType: "YENİ",
    isPreOrder: true,
    customsIncluded: true,
    authenticityBatch: "ARM-2026-FR01",
    rating: 5.0,
    reviewCount: 64,
    stockCount: 6,
    isTrending: true,
    description:
      "Giorgio Armani Beauty'nin ikonik kırmızı ve gümüş detaylı lüks yılbaşı takvimi. İçerisinde Sì Eau de Parfum, Lip Power rujlar, Luminous Silk aydınlatıcılar ve Eyes to Kill maskara dahil 24 adet tam boy ve seyahat boyu ikonik Armani güzellik sırrı yer alır.",
    deliveryNotes: [
      "*Ürün siparişiniz üzerine Avrupa resmi mağazasından tedarik edilecektir.",
      "*Markanın gönderimine bağlı olarak teslimat süresi değişkenlik göstermektedir (Ortalama 7-12 iş günü).",
      "*Gümrük ve kargo süreçlerinin tamamı fiyata dahildir, kapıda ek ücret çıkmaz.",
      "*Detaylı bilgi için bizimle iletişime geçebilirsiniz.",
    ],
    contentsList: [
      "Sì Eau de Parfum (Tam Boy & Mini Boy)",
      "Lip Power Longwear Vivid Lip Color (#104, #400)",
      "Luminous Silk Glow Blush & Fluid Sheer",
      "Prisma Glass Lip Gloss & Eye Tint",
      "Eyes to Kill Classico Mascara & Crema Nera Eye Cream",
    ],
    highlights: [
      "Avrupa Resmi Mağaza Faturalı Orijinal Ürün",
      "Gümrük & İthalat İşlemleri Tarafımızca Tamamlanır",
      "Canlı Sipariş Takip Paneli ile Aşama Aşama İzleme",
    ],
    image:
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1100&q=85",
    secondaryImage:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1100&q=85",
    variants: [
      {
        id: "v-arm-1",
        type: "Set",
        name: "24 Günlük Tam Koleksiyon Kutusu",
        priceDiffTry: 0,
        stock: 6,
      },
    ],
  },
  {
    id: "prd-spacenk-02",
    slug: "space-nk-beauty-advent-calendar",
    sku: "AVK-SNK-2026",
    name: "Space NK Beauty Advent Calendar",
    brand: "Space NK",
    category: "Advent Takvimi",
    originCountry: "İngiltere",
    originFlag: "🇬🇧",
    originCity: "Londra",
    sourceStore: "Space NK London Flagship",
    supplyStatus: "LIMITED_DROP",
    supplyBadgeText: "Ön Sipariş • Sınırlı Stok",
    estimatedDeliveryDays: "7-10 İş Günü",
    basePriceEur: 620,
    priceTry: 32000,
    oldPriceTry: 35000,
    badgeType: "İNDİRİM",
    isPreOrder: true,
    customsIncluded: true,
    authenticityBatch: "SNK-2026-UK08",
    rating: 4.99,
    reviewCount: 118,
    stockCount: 5,
    isTrending: true,
    description:
      "Londra'nın en prestijli güzellik takvimi Space NK Beauty Advent Calendar. Rare Beauty, Charlotte Tilbury, Summer Fridays, Augustinus Bader ve Olaplex dahil 35 adet ikonik ürünü tek bir koleksiyon kutusunda sunar.",
    deliveryNotes: [
      "*Ürün siparişiniz üzerine Londra Space NK mağazasından tedarik edilecektir.",
      "*Markanın gönderimine bağlı olarak teslimat süresi değişkenlik göstermektedir.",
      "*Detaylı bilgi için iletişime geçiniz.",
    ],
    contentsList: [
      "Rare Beauty Soft Pinch Tinted Lip Oil (Tam Boy)",
      "Summer Fridays Lip Butter Balm (Tam Boy)",
      "Charlotte Tilbury Pillow Talk Highlighter",
      "Augustinus Bader The Rich Cream (15ml)",
    ],
    highlights: [
      "35 Adet Lüks Kozmetik (23 Tam Boy)",
      "Gümrük Garantili Kapıya Teslim",
      "Orijinal Londra Mağaza Faturası",
    ],
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1100&q=85",
    variants: [
      {
        id: "v-snk-1",
        type: "Set",
        name: "25 Günlük Lüks Koleksiyon (35 Ürün)",
        priceDiffTry: 0,
        stock: 5,
      },
    ],
  },
  {
    id: "prd-rituals-03",
    slug: "rituals-premium-advent-calendar",
    sku: "AVK-RIT-2026",
    name: "Rituals Premium Advent Calendar",
    brand: "Rituals",
    category: "Advent Takvimi",
    originCountry: "Almanya",
    originFlag: "🇩🇪",
    originCity: "Berlin",
    sourceStore: "Rituals Berlin Kurfürstendamm",
    supplyStatus: "BOUTIQUE_PREORDER",
    supplyBadgeText: "Ön Sipariş",
    estimatedDeliveryDays: "6-9 İş Günü",
    basePriceEur: 340,
    priceTry: 18500,
    oldPriceTry: 21000,
    badgeType: "İNDİRİM",
    isPreOrder: true,
    customsIncluded: true,
    authenticityBatch: "RIT-2026-DE14",
    rating: 4.96,
    reviewCount: 82,
    stockCount: 8,
    description:
      "LED ışıklandırmalı yılbaşı köyü tasarımlı Rituals Premium Advent Calendar. Tam boy mumlar, duş köpükleri ve Private Collection ev parfümleri içerir.",
    deliveryNotes: [
      "*Ürün siparişiniz üzerine tedarik edilecektir.",
      "*Markanın gönderimine bağlı olarak teslimat süresi değişkenlik göstermektedir.",
      "*Detaylı bilgi için iletişime geçiniz.",
    ],
    highlights: [
      "24 Adet Lüks Ev & Vücut Bakım Ürünü",
      "Gümrük Dahil Güvenli Teslimat",
    ],
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1100&q=85",
    variants: [
      {
        id: "v-rit-1",
        type: "Set",
        name: "Premium Deluxe Village Set",
        priceDiffTry: 0,
        stock: 8,
      },
    ],
  },
  {
    id: "prd-liberty-04",
    slug: "liberty-london-beauty-advent-calendar",
    sku: "AVK-LIB-2026",
    name: "Liberty London Beauty Advent Calendar",
    brand: "Liberty London",
    category: "Advent Takvimi",
    originCountry: "İngiltere",
    originFlag: "🇬🇧",
    originCity: "Londra",
    sourceStore: "Liberty Regent Street London",
    supplyStatus: "BOUTIQUE_PREORDER",
    supplyBadgeText: "Ön Sipariş",
    estimatedDeliveryDays: "7-12 İş Günü",
    basePriceEur: 590,
    priceTry: 31500,
    badgeType: "YENİ",
    isPreOrder: true,
    customsIncluded: true,
    authenticityBatch: "LIB-2026-UK92",
    rating: 4.98,
    reviewCount: 47,
    stockCount: 4,
    description:
      "Liberty London'ın tarihi Tudor binası illüstrasyonlu, La Mer, Byredo, Le Labo ve Sunday Riley içeren dünyaca ünlü koleksiyon takvimi.",
    deliveryNotes: [
      "*Ürün siparişiniz üzerine tedarik edilecektir.",
      "*Markanın gönderimine bağlı olarak teslimat süresi değişkenlik göstermektedir.",
      "*Detaylı bilgi için iletişime geçiniz.",
    ],
    highlights: ["28 Adet Niş Parfüm & Cilt Bakımı", "Londra Mağaza Çıkışlı"],
    image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1100&q=85",
    variants: [
      {
        id: "v-lib-1",
        type: "Set",
        name: "Liberty 2026 Collector Box",
        priceDiffTry: 0,
        stock: 4,
      },
    ],
  },
  {
    id: "prd-mancera-05",
    slug: "mancera-instant-crush-edp",
    sku: "AVK-MNC-120",
    name: "Mancera Instant Crush Eau de Parfum",
    brand: "Mancera",
    category: "Parfüm",
    originCountry: "Fransa",
    originFlag: "🇫🇷",
    originCity: "Paris",
    sourceStore: "Mancera Paris Place Vendôme",
    supplyStatus: "EXPRESS_READY_EU",
    supplyBadgeText: "Hemen Teslim • Stokta",
    estimatedDeliveryDays: "3-5 İş Günü",
    basePriceEur: 145,
    priceTry: 7000,
    oldPriceTry: 8000,
    badgeType: "İNDİRİM",
    isPreOrder: false,
    customsIncluded: true,
    authenticityBatch: "MNC-PAR-884",
    rating: 4.97,
    reviewCount: 154,
    stockCount: 12,
    isTrending: true,
    description:
      "Safran, Sicilya mandalinası, Fas gülü ve Madagaskar vanilyasının büyüleyici uyumu. Paris butik çıkışlı %100 orijinal Mancera Instant Crush.",
    deliveryNotes: [
      "*Avrupa depomuzda hazır stoktadır, 3-5 iş günü içinde teslim edilir.",
      "*Orijinal koruma kılıfı ve batch kodu ile gönderilir.",
    ],
    highlights: ["120ml Tam Boy EDP", "Hemen Teslim Hazır Stok"],
    image:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1100&q=85",
    variants: [
      { id: "v-mnc-1", type: "Boyut", name: "120 ml EDP", priceDiffTry: 0, stock: 12 },
    ],
  },
  {
    id: "prd-rhode-06",
    slug: "rhode-peptide-lip-tint-pocket-blush-set",
    sku: "AVK-RHD-402",
    name: "Rhode Peptide Lip Tint & Pocket Blush Duo",
    brand: "Rhode",
    category: "Hemen Teslim",
    originCountry: "İngiltere",
    originFlag: "🇬🇧",
    originCity: "Londra",
    sourceStore: "Rhode UK Official Store",
    supplyStatus: "EXPRESS_READY_EU",
    supplyBadgeText: "Hemen Teslim • 3-4 İş Günü",
    estimatedDeliveryDays: "3-4 İş Günü",
    basePriceEur: 68,
    priceTry: 3450,
    oldPriceTry: 3900,
    badgeType: "HEMEN TESLİM",
    isPreOrder: false,
    customsIncluded: true,
    authenticityBatch: "RHD-UK-914",
    rating: 4.99,
    reviewCount: 312,
    stockCount: 18,
    isTikTokViral: true,
    description:
      "Hailey Bieber Rhode koleksiyonunun en çok sevilen Peptide Lip Tint ve Pocket Blush ikilisi. Hemen teslim hazır stok avantajıyla.",
    deliveryNotes: [
      "*Hemen teslim stoklarımızdadır, aynı gün kargo hazırlığına alınır.",
      "*%100 orijinal Rhode UK faturalıdır.",
    ],
    highlights: ["Hemen Teslim Stok", "Orijinal Batch Garantili"],
    image:
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1100&q=85",
    variants: [
      {
        id: "v-rhd-1",
        type: "Renk",
        name: "Toast + Piggy",
        hexColor: "#B36A5E",
        priceDiffTry: 0,
        stock: 10,
      },
      {
        id: "v-rhd-2",
        type: "Renk",
        name: "Raspberry Jelly + Juice Box",
        hexColor: "#8E2949",
        priceDiffTry: 0,
        stock: 5,
      },
      {
        id: "v-rhd-3",
        type: "Renk",
        name: "Espresso + Freckle",
        hexColor: "#5C3A2E",
        priceDiffTry: 0,
        stock: 3,
      },
    ],
  },
  {
    id: "prd-patrickta-07",
    slug: "patrick-ta-major-headlines-double-take-blush",
    sku: "AVK-PTA-109",
    name: "Patrick Ta Major Headlines Crème & Powder Blush Duo",
    brand: "Patrick Ta",
    category: "Makyaj",
    originCountry: "İngiltere",
    originFlag: "🇬🇧",
    originCity: "Londra",
    sourceStore: "Cult Beauty UK",
    supplyStatus: "EXPRESS_READY_EU",
    supplyBadgeText: "Hemen Teslim",
    estimatedDeliveryDays: "3-5 İş Günü",
    basePriceEur: 58,
    priceTry: 2950,
    badgeType: "YENİ",
    isPreOrder: false,
    customsIncluded: true,
    authenticityBatch: "PTA-UK-510",
    rating: 4.98,
    reviewCount: 194,
    stockCount: 14,
    isTikTokViral: true,
    description:
      "Krem ve toz dokuyu tek kompakt kutuda buluşturan Patrick Ta Major Headlines ikili allık. Yoğun pigment ve ıslak bitiş.",
    deliveryNotes: [
      "*Hemen teslim kategorisindedir.",
      "*Kırılmaya karşı özel koruma ambalajıyla gönderilir.",
    ],
    highlights: ["Krem + Toz İkili Formül", "Orijinal Cult Beauty Tedarik"],
    image:
      "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?auto=format&fit=crop&w=1100&q=85",
    variants: [
      {
        id: "v-pta-1",
        type: "Renk",
        name: "She's That Girl (Soft Pink)",
        hexColor: "#E88B9C",
        priceDiffTry: 0,
        stock: 8,
      },
      {
        id: "v-pta-2",
        type: "Renk",
        name: "Not Too Much (Soft Rose)",
        hexColor: "#C57B7C",
        priceDiffTry: 0,
        stock: 6,
      },
    ],
  },
  {
    id: "prd-sheglam-08",
    slug: "sheglam-full-collection-advent-box",
    sku: "AVK-SHG-772",
    name: "Sheglam Harry Potter & Glamour Vault Set",
    brand: "Sheglam",
    category: "Setler",
    originCountry: "Almanya",
    originFlag: "🇩🇪",
    originCity: "Berlin",
    sourceStore: "Sheglam EU Official Hub",
    supplyStatus: "EXPRESS_READY_EU",
    supplyBadgeText: "Hemen Teslim",
    estimatedDeliveryDays: "4-6 İş Günü",
    basePriceEur: 95,
    priceTry: 4800,
    oldPriceTry: 5500,
    badgeType: "İNDİRİM",
    isPreOrder: false,
    customsIncluded: true,
    authenticityBatch: "SHG-EU-339",
    rating: 4.95,
    reviewCount: 229,
    stockCount: 11,
    description:
      "Sosyal medyada viral olan Sheglam özel koleksiyon kutusu. Likit allıklar, kontürler ve dudak yağlarının tam seti.",
    deliveryNotes: [
      "*Avrupa depomuzdan hızlı gönderim.",
      "*Ek gümrük ücreti yansımaz.",
    ],
    highlights: ["Tam Koleksiyon Kutusu", "Gümrük Dahil Net Fiyat"],
    image:
      "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=1100&q=85",
    variants: [
      { id: "v-shg-1", type: "Set", name: "Tam Boy Koleksiyon Kutusu", priceDiffTry: 0, stock: 11 },
    ],
  },
];

export const BRAND_SHOWCASE = [
  {
    name: "ARMANI BEAUTY",
    subtitle: "2026 Advent & Lüks Makyaj",
    bgColor: "#7A1C24",
    textColor: "#FFFFFF",
    filterBrand: "Armani",
    image:
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "SPACE NK LONDON",
    subtitle: "İkonik İngiliz Güzellik Kutuları",
    bgColor: "#563C49",
    textColor: "#FFFFFF",
    filterBrand: "Space NK",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "RHODE SKIN",
    subtitle: "Peptide Lip Tint & Blush",
    bgColor: "#E8DCD8",
    textColor: "#563C49",
    filterBrand: "Rhode",
    image:
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "PATRICK TA",
    subtitle: "Major Headlines Koleksiyonu",
    bgColor: "#F5C6D6",
    textColor: "#563C49",
    filterBrand: "Patrick Ta",
    image:
      "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "MANCERA PARIS",
    subtitle: "Fransız Niş Parfümeri",
    bgColor: "#F4EFEA",
    textColor: "#563C49",
    filterBrand: "Mancera",
    image:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "SHEGLAM",
    subtitle: "Viral Koleksiyon Setleri",
    bgColor: "#F7D6E0",
    textColor: "#563C49",
    filterBrand: "Sheglam",
    image:
      "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=700&q=80",
  },
];

export const CUSTOMER_REVIEWS = [
  {
    id: "rev-1",
    title: "Armani Advent Takvimim sorunsuz ulaştı",
    comment:
      "Avrupa'dan gelirken gümrükte takılır mı diye endişelenmiştim ama sipariş takip ekranından her adımı izledim. Kutusu bile ezilmeden 8 günde teslim edildi.",
    author: "Ceren B.",
    productName: "Armani Advent Calendar",
  },
  {
    id: "rev-2",
    title: "Yüksek hız ve şeffaf takip",
    comment:
      "Hemen teslim kategorisinden aldığım Rhode Lip Tint ve Patrick Ta allık 3 gün içinde elimdeydi. Orijinal mağaza fişinin paylaşılması güven veriyor.",
    author: "Deniz K.",
    productName: "Rhode Peptide Lip Tint Duo",
  },
  {
    id: "rev-3",
    title: "Set seçeneklerini çok sevdim",
    comment:
      "Türkiye'de bulamadığım Space NK Advent Calendar ve Mancera parfümü tek sepette hiçbir ek gümrük ücreti ödemeden teslim aldım.",
    author: "Selin Y.",
    productName: "Space NK Beauty Advent Calendar",
  },
  {
    id: "rev-4",
    title: "Özel paketleme harika",
    comment:
      "Kırılacak ürünler için o kadar özenli bir paketleme yapmışlar ki Paris'ten İstanbul'a sanki mağazadan kendim almışım gibi tertemiz geldi.",
    author: "Elif M.",
    productName: "Mancera Instant Crush EDP",
  },
];

export const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: "ord-1",
    orderNumber: "AVK-90482",
    customerName: "Ceren Bulut",
    customerEmail: "ceren.bulut@example.com",
    customerPhone: "+90 532 418 92 10",
    customerCity: "İstanbul / Nişantaşı",
    tcIdentityMasked: "248*****914",
    currentStage: "IN_FLIGHT_TRANSIT",
    createdAt: "15 Kasım 2026",
    guaranteedDeliveryDate: "22 Kasım 2026",
    etgbDeclarationNo: "ETGB-2026-884920",
    airWaybillNo: "TK-1724-PAR-IST",
    originHub: "Paris Lojistik Merkezi (Fransa)",
    batchVerified: true,
    receiptHash: "ARMANI-FR-INV-99481",
    pricing: {
      subtotalTry: 35000,
      euLogisticsFeeTry: 0,
      customsTaxTry: 0,
      vipInsuranceTry: 0,
      totalTry: 35000,
    },
    items: [
      {
        productId: "prd-armani-01",
        name: "Armani Advent Calendar",
        brand: "Armani",
        variant: "24 Günlük Tam Koleksiyon Kutusu",
        quantity: 1,
        unitPriceTry: 35000,
        batchCode: "ARM-2026-FR01",
        image:
          "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80",
      },
    ],
    timeline: [
      {
        stage: "ORDER_CONFIRMED",
        title: "Siparişiniz Onaylandı & Avrupa Mağaza Tedariği Başladı",
        subtitle: "Giorgio Armani Paris Butik Sipariş Kaydı",
        description:
          "Siparişiniz onaylandı ve ek gümrük vergisi çıkmaması adına tüm ithalat işlemleri tarafımızca üstlenildi.",
        location: "Paris, Fransa",
        timestamp: "15 Kasım 2026 • 14:20",
        operatorName: "Avrupadan Kargom Tedarik Ekibi",
        badgeCode: "ONAYLANDI",
      },
      {
        stage: "EU_WAREHOUSE",
        title: "Avrupa Deposunda (Kalite Kontrol & Darbe Korumalı Paketleme)",
        subtitle: "24 Çekmeceli Takvim Kontrol Edildi",
        description:
          "Ürününüz Paris transfer merkezimize ulaştı, orijinallik kontrolü yapıldı ve özel koruma kutusuna alındı.",
        location: "Paris Transfer Merkezi",
        timestamp: "16 Kasım 2026 • 16:10",
        operatorName: "Depo Sorumlusu: Claire D.",
        badgeCode: "AVRUPA DEPO",
      },
      {
        stage: "EXPORT_CUSTOMS",
        title: "Avrupa Çıkış Gümrük İşlemleri Tamamlandı",
        subtitle: "Havalimanı Çıkış Onayı",
        description:
          "Paketiniz Fransa gümrük çıkış işlemlerini sorunsuz tamamladı ve uçuşa teslim edildi.",
        location: "Paris Charles de Gaulle (CDG)",
        timestamp: "17 Kasım 2026 • 11:30",
        operatorName: "Gümrük Operasyon Ekibi",
        badgeCode: "GÜMRÜK ONAY",
      },
      {
        stage: "IN_FLIGHT_TRANSIT",
        title: "Uçuşta / Türkiye'ye Transfer Halinde",
        subtitle: "Paris -> İstanbul Hava Kargo",
        description:
          "Siparişiniz hava kargo uçuşuyla İstanbul Transfer Merkezine doğru yoldadır.",
        location: "Paris -> İstanbul Uçuş Hattı",
        timestamp: "18 Kasım 2026 • 19:00",
        operatorName: "Hava Kargo Masası",
        badgeCode: "UÇUŞTA",
      },
      {
        stage: "TR_CUSTOMS_HUB",
        title: "Türkiye Transfer Merkezinde",
        subtitle: "İstanbul Dağıtım Merkezine Aktarım",
        description:
          "Uçak inişinin ardından gümrük çekimi tamamlanarak yurtiçi kurye şubesine yönlendirilecek.",
        location: "İstanbul Transfer Merkezi",
        timestamp: "Planlanan: 19 Kasım 2026",
        operatorName: "Türkiye Operasyon",
        badgeCode: "TR MERKEZ",
      },
      {
        stage: "OUT_FOR_DELIVERY",
        title: "Kuryede (Dağıtımda)",
        subtitle: "Adresinize Teslimat İçin Yola Çıkacak",
        description: "Kurye dağıtımda olduğunda SMS ile bilgilendirileceksiniz.",
        location: "İstanbul / Nişantaşı",
        timestamp: "Planlanan: 21 Kasım 2026",
        operatorName: "Yurtiçi Kurye",
        badgeCode: "KURYEDE",
      },
      {
        stage: "DELIVERED",
        title: "Teslim Edildi",
        subtitle: "İmzalı Teslimat",
        description: "Siparişiniz adresinize teslim edildi.",
        location: "İstanbul / Nişantaşı",
        timestamp: "Hedef: 22 Kasım 2026",
        operatorName: "Alıcı Onayı",
        badgeCode: "TESLİM",
      },
    ],
  },
  {
    id: "ord-2",
    orderNumber: "AVK-88310",
    customerName: "Zeynep Kaya",
    customerEmail: "zeynep.kaya@example.com",
    customerPhone: "+90 544 812 33 19",
    customerCity: "Ankara / Çankaya",
    tcIdentityMasked: "419*****102",
    currentStage: "TR_CUSTOMS_HUB",
    createdAt: "13 Kasım 2026",
    guaranteedDeliveryDate: "19 Kasım 2026",
    etgbDeclarationNo: "ETGB-2026-773190",
    airWaybillNo: "BA-402-LHR-IST",
    originHub: "Londra Lojistik Merkezi (İngiltere)",
    batchVerified: true,
    receiptHash: "SPACENK-UK-INV-4410",
    pricing: {
      subtotalTry: 32000,
      euLogisticsFeeTry: 0,
      customsTaxTry: 0,
      vipInsuranceTry: 0,
      totalTry: 32000,
    },
    items: [
      {
        productId: "prd-spacenk-02",
        name: "Space NK Beauty Advent Calendar",
        brand: "Space NK",
        variant: "25 Günlük Lüks Koleksiyon (35 Ürün)",
        quantity: 1,
        unitPriceTry: 32000,
        batchCode: "SNK-2026-UK08",
        image:
          "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80",
      },
    ],
    timeline: [
      {
        stage: "ORDER_CONFIRMED",
        title: "Siparişiniz Onaylandı",
        subtitle: "Space NK London Tedariği",
        description: "Siparişiniz Londra ekibimiz tarafından işleme alındı.",
        location: "Londra, İngiltere",
        timestamp: "13 Kasım 2026",
        operatorName: "Londra Tedarik Ekibi",
        badgeCode: "ONAYLANDI",
      },
      {
        stage: "EU_WAREHOUSE",
        title: "Avrupa Deposunda",
        subtitle: "Kalite Kontrol Tamamlandı",
        description: "Londra depomuzda paketleme tamamlandı.",
        location: "Londra Hub",
        timestamp: "14 Kasım 2026",
        operatorName: "Depo Ekibi",
        badgeCode: "AVRUPA DEPO",
      },
      {
        stage: "EXPORT_CUSTOMS",
        title: "Gümrük İşleminde (İngiltere Çıkış)",
        subtitle: "Çıkış Onaylandı",
        description: "Heathrow kargo terminalinden çıkış yapıldı.",
        location: "Londra Heathrow",
        timestamp: "15 Kasım 2026",
        operatorName: "Gümrük Ekibi",
        badgeCode: "GÜMRÜK ONAY",
      },
      {
        stage: "IN_FLIGHT_TRANSIT",
        title: "Uçuş Tamamlandı",
        subtitle: "Londra -> İstanbul",
        description: "Paketiniz İstanbul Havalimanına ulaştı.",
        location: "İstanbul",
        timestamp: "17 Kasım 2026",
        operatorName: "Hava Kargo",
        badgeCode: "UÇUŞTA",
      },
      {
        stage: "TR_CUSTOMS_HUB",
        title: "Türkiye Transfer Merkezinde",
        subtitle: "Gümrük Çıkışı Yapıldı • Ankara Aracına Aktarılıyor",
        description:
          "Gümrük işlemleri ek ücret çıkmadan tamamlandı, Ankara Çankaya şubesine sevk ediliyor.",
        location: "İstanbul -> Ankara Transfer",
        timestamp: "18 Kasım 2026 • 15:20",
        operatorName: "Türkiye Operasyon",
        badgeCode: "TR MERKEZ",
      },
      {
        stage: "OUT_FOR_DELIVERY",
        title: "Kuryede",
        subtitle: "Yarın Dağıtıma Çıkacak",
        description: "Ankara Çankaya kurye dağıtımı.",
        location: "Ankara / Çankaya",
        timestamp: "Planlanan: 19 Kasım 2026",
        operatorName: "Kurye",
        badgeCode: "KURYEDE",
      },
      {
        stage: "DELIVERED",
        title: "Teslim Edildi",
        subtitle: "Teslimat Bekleniyor",
        description: "Teslim edildiğinde güncellenecektir.",
        location: "Ankara / Çankaya",
        timestamp: "19 Kasım 2026",
        operatorName: "Alıcı",
        badgeCode: "TESLİM",
      },
    ],
  },
];

export const INITIAL_CUSTOM_REQUESTS: CustomSourcingRequestItem[] = [
  {
    id: "REQ-409",
    customerName: "Ece Soylu",
    brandAndProduct: "Charlotte Tilbury Treasure Chest of Love 12-Door Advent Calendar",
    sourceUrl: "https://www.charlottetilbury.com",
    country: "İngiltere 🇬🇧",
    requestedAt: "2 saat önce",
    estimatedEur: 215,
    quotedTotalTry: 12500,
    status: "MÜŞTERİ ONAYINDA",
  },
];

// 5000₺ ve üzeri ücretsiz kargo + Her şey dahil net fiyat hesaplama
export function calculateTransparentPricing(subtotalTry: number) {
  if (subtotalTry <= 0) {
    return {
      subtotalTry: 0,
      euLogisticsFeeTry: 0,
      customsTaxTry: 0,
      vipInsuranceTry: 0,
      totalTry: 0,
      freeShippingUnlocked: false,
    };
  }
  const freeShippingUnlocked = subtotalTry >= 5000;
  const euLogisticsFeeTry = freeShippingUnlocked ? 0 : 250;
  // Ürün fiyatlarına gümrük dahildir, bilgilendirme amaçlı 0 ek ücret gösterilir
  const customsTaxTry = 0;
  const vipInsuranceTry = 0;

  return {
    subtotalTry,
    euLogisticsFeeTry,
    customsTaxTry,
    vipInsuranceTry,
    totalTry: subtotalTry + euLogisticsFeeTry,
    freeShippingUnlocked,
  };
}
