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
  category: "Makyaj & Dudak" | "Cilt Bakımı" | "Advent Calendar" | "Niş Parfüm" | "Saç & Vücut";
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
  customsIncluded: boolean;
  authenticityBatch: string;
  rating: number;
  reviewCount: number;
  stockCount: number;
  isTrending?: boolean;
  isTikTokViral?: boolean;
  description: string;
  highlights: string[];
  image: string;
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
  telemetry?: {
    flightNo?: string;
    batchCode?: string;
    etgbNo?: string;
    tempSensor?: string;
    customsStatus?: string;
    courierHub?: string;
  };
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
    shortLabel: "Sipariş & Fatura Onayı",
    hubTag: "Finans & ETGB Kaydı",
  },
  {
    stage: "EU_WAREHOUSE",
    stepNumber: 2,
    shortLabel: "Avrupa Deposunda",
    hubTag: "Berlin / Paris Hub",
  },
  {
    stage: "EXPORT_CUSTOMS",
    stepNumber: 3,
    shortLabel: "Gümrük İşleminde (AB)",
    hubTag: "FRA / BER İhracat",
  },
  {
    stage: "IN_FLIGHT_TRANSIT",
    stepNumber: 4,
    shortLabel: "Uçuşta / Transit",
    hubTag: "Hava Kargo (AWB)",
  },
  {
    stage: "TR_CUSTOMS_HUB",
    stepNumber: 5,
    shortLabel: "Türkiye Transfer Merkezinde",
    hubTag: "İST Havalimanı ETGB",
  },
  {
    stage: "OUT_FOR_DELIVERY",
    stepNumber: 6,
    shortLabel: "VIP Kuryede",
    hubTag: "Son Mil Dağıtım",
  },
  {
    stage: "DELIVERED",
    stepNumber: 7,
    shortLabel: "Teslim Edildi",
    hubTag: "İmzalı Teslimat",
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prd-rhode-01",
    slug: "rhode-peptide-lip-tint-set",
    sku: "EU-RHD-8841",
    name: "Peptide Lip Tint & Pocket Blush Collector Duo",
    brand: "Rhode Skin",
    category: "Makyaj & Dudak",
    originCountry: "İngiltere",
    originFlag: "🇬🇧",
    originCity: "Londra",
    sourceStore: "Rhode UK Official London Flagship",
    supplyStatus: "EXPRESS_READY_EU",
    supplyBadgeText: "Berlin Deposunda Hazır • 4-5 Günde Teslim",
    estimatedDeliveryDays: "4-5 İş Günü",
    basePriceEur: 64,
    priceTry: 3150,
    oldPriceTry: 3650,
    customsIncluded: true,
    authenticityBatch: "RHD-2026-UK914",
    rating: 4.98,
    reviewCount: 412,
    stockCount: 14,
    isTrending: true,
    isTikTokViral: true,
    description:
      "Türkiye'de resmi satışı bulunmayan Hailey Bieber Rhode koleksiyonunun en çok aranan Peptide Lip Tint ve Pocket Blush ikilisi. Londra resmi mağaza faturalı, %100 orijinallik ve soğuk zincir korumalı Avrupa depo çıkışlı.",
    highlights: [
      "Londra Resmi Mağaza Fişi & Batch Kodu Doğrulamalı",
      "%100 Gümrük Vergisi & ETGB Beyanı Fiyata Dahil",
      "Berlin Lojistik Merkezinden Eksiksiz Kargo Sigortalı Çıkış",
    ],
    image:
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=85",
    variants: [
      { id: "v-rhd-1", type: "Renk", name: "Toast + Piggy", hexColor: "#B36A5E", priceDiffTry: 0, stock: 8 },
      { id: "v-rhd-2", type: "Renk", name: "Raspberry Jelly + Juice Box", hexColor: "#8E2949", priceDiffTry: 150, stock: 4 },
      { id: "v-rhd-3", type: "Renk", name: "Espresso + Toasted Teddy", hexColor: "#5C3A2E", priceDiffTry: 0, stock: 2 },
    ],
  },
  {
    id: "prd-spacenk-02",
    slug: "spacenk-luxury-beauty-advent-calendar",
    sku: "EU-SNK-2026",
    name: "Space NK London 25-Days Luxury Beauty Advent Calendar",
    brand: "Space NK",
    category: "Advent Calendar",
    originCountry: "İngiltere",
    originFlag: "🇬🇧",
    originCity: "Londra",
    sourceStore: "Space NK Covent Garden London",
    supplyStatus: "LIMITED_DROP",
    supplyBadgeText: "Sınırlı Kontenjan • Gümrük Garantili VIP Kargo",
    estimatedDeliveryDays: "5-7 İş Günü",
    basePriceEur: 280,
    priceTry: 12950,
    oldPriceTry: 15400,
    customsIncluded: true,
    authenticityBatch: "SNK-ADV-UK008",
    rating: 5.0,
    reviewCount: 189,
    stockCount: 5,
    isTrending: true,
    description:
      "Charlotte Tilbury, Rare Beauty, Augustinus Bader ve Drunk Elephant dahil 35 adet tam boy lüks ürünü barındıran ikonik Londra Advent Calendar. Gümrükte takılma riski olmadan kurumsal ETGB ithalat rejimiyle kapınıza teslim.",
    highlights: [
      "Özel Kurumsal Gümrükleme (30€ Bireysel Sınıra Takılmaz)",
      "VIP Darbe Korumalı Kutu & Dijital Mağaza Faturası",
      "Süresi Geçerse %15 İade Garantili Teslimat SLA Sözleşmesi",
    ],
    image:
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=85",
    variants: [
      { id: "v-snk-1", type: "Set", name: "2026 Tam Boy Koleksiyon (35 Ürün)", priceDiffTry: 0, stock: 5 },
      { id: "v-snk-2", type: "Set", name: "Hediye Paketi + VIP Sigortalı Sandık", priceDiffTry: 450, stock: 3 },
    ],
  },
  {
    id: "prd-plouise-03",
    slug: "plouise-bad-bitch-energy-lip-duo-palette",
    sku: "EU-PLS-4190",
    name: "P.Louise Lip Oil & Signature Eyeshadow Vault",
    brand: "P.Louise",
    category: "Makyaj & Dudak",
    originCountry: "İngiltere",
    originFlag: "🇬🇧",
    originCity: "Manchester",
    sourceStore: "P.Louise Empire Studios UK",
    supplyStatus: "EXPRESS_READY_EU",
    supplyBadgeText: "Avrupa Deposunda • 4 Günde Teslim",
    estimatedDeliveryDays: "4-6 İş Günü",
    basePriceEur: 52,
    priceTry: 2490,
    oldPriceTry: 2850,
    customsIncluded: true,
    authenticityBatch: "PLS-UK-7721",
    rating: 4.94,
    reviewCount: 276,
    stockCount: 19,
    isTikTokViral: true,
    description:
      "Sosyal medyada viral olan P.Louise Bakım Yağı & Dudak Parlatıcısı ve ultra pigmentli far paleti seti. İngiltere merkez stüdyosundan doğrudan Berlin aktarma merkezimize ulaşmış hazır stok.",
    highlights: [
      "48 Saat İçinde Hava Kargo Uçuşuna Teslim",
      "Orijinal Hologramlı Kutu & Batch Doğrulama",
      "Ek Vergi veya Kurye Ücreti Yok",
    ],
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=85",
    variants: [
      { id: "v-pls-1", type: "Renk", name: "Birthday Cake & Rose Glow", hexColor: "#F2A6B3", priceDiffTry: 0, stock: 11 },
      { id: "v-pls-2", type: "Renk", name: "Cherry Bomb & Gold Drip", hexColor: "#B81D3B", priceDiffTry: 100, stock: 8 },
    ],
  },
  {
    id: "prd-rare-04",
    slug: "rare-beauty-soft-pinch-luminous-blush-paris-edition",
    sku: "EU-RAR-5023",
    name: "Soft Pinch Luminous Powder Blush (Sephora Paris Edition)",
    brand: "Rare Beauty",
    category: "Makyaj & Dudak",
    originCountry: "Fransa",
    originFlag: "🇫🇷",
    originCity: "Paris",
    sourceStore: "Sephora Champs-Élysées Paris",
    supplyStatus: "EXPRESS_READY_EU",
    supplyBadgeText: "Paris Deposunda Hazır • 3-5 Günde Teslim",
    estimatedDeliveryDays: "3-5 İş Günü",
    basePriceEur: 44,
    priceTry: 2180,
    oldPriceTry: 2450,
    customsIncluded: true,
    authenticityBatch: "SEP-FR-3019",
    rating: 4.97,
    reviewCount: 534,
    stockCount: 22,
    isTrending: true,
    description:
      "Sephora Fransa Champs-Élysées mağazasından tedarik edilen, Türkiye stoklarında tükenen özel seri ışıltılı allık. Kırılmaya karşı çift katmanlı hava yastıklı ambalajla gönderilir.",
    highlights: [
      "Sephora Paris Fatura Karekodu ile Doğrulama",
      "Kırılmaya Karşı %100 Anında Yenisiyle Değişim Garantisi",
      "İstanbul Havalimanı Hızlı ETGB Çıkışı",
    ],
    image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=85",
    variants: [
      { id: "v-rar-1", type: "Renk", name: "Cheer (Warm Pink)", hexColor: "#E88B8C", priceDiffTry: 0, stock: 12 },
      { id: "v-rar-2", type: "Renk", name: "Hope (Nude Mauve)", hexColor: "#C57B7C", priceDiffTry: 0, stock: 6 },
      { id: "v-rar-3", type: "Renk", name: "Love (Terracotta)", hexColor: "#B75849", priceDiffTry: 80, stock: 4 },
    ],
  },
  {
    id: "prd-bader-05",
    slug: "augustinus-bader-the-rich-cream-berlin-pharmacy",
    sku: "EU-ABD-9910",
    name: "The Rich Cream TFC8® Cellular Renewal (50ml)",
    brand: "Augustinus Bader",
    category: "Cilt Bakımı",
    originCountry: "Almanya",
    originFlag: "🇩🇪",
    originCity: "Berlin",
    sourceStore: "KaDeWe Berlin Luxury Beauty Hall",
    supplyStatus: "EXPRESS_READY_EU",
    supplyBadgeText: "Berlin Merkez Depo • Aynı Gün Uçuş Çıkışlı",
    estimatedDeliveryDays: "3-4 İş Günü",
    basePriceEur: 175,
    priceTry: 7850,
    oldPriceTry: 9200,
    customsIncluded: true,
    authenticityBatch: "ABD-DE-6481",
    rating: 4.99,
    reviewCount: 148,
    stockCount: 9,
    description:
      "Almanya'nın dünyaca ünlü KaDeWe Berlin lüks kozmetik departmanından doğrudan tedarik edilen TFC8® patentli hücre yenileyici krem. Isı yalıtımlı termal kargo paketiyle uçuşa verilir.",
    highlights: [
      "Termal Sensörlü Soğuk Zincir Hava Kargo (15°C - 22°C)",
      "KaDeWe Berlin Orijinal Seri Numarası Sertifikalı",
      "Gümrük & KDV Tamamı Ödenmiş Net Fiyat",
    ],
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=85",
    variants: [
      { id: "v-abd-1", type: "Boyut", name: "30ml Travel Luxury", priceDiffTry: -2100, stock: 5 },
      { id: "v-abd-2", type: "Boyut", name: "50ml Full Size", priceDiffTry: 0, stock: 4 },
    ],
  },
  {
    id: "prd-byredo-06",
    slug: "byredo-mojave-ghost-absolu-de-parfum-paris",
    sku: "EU-BYR-7312",
    name: "Mojave Ghost Absolu de Parfum Collector Edition",
    brand: "Byredo",
    category: "Niş Parfüm",
    originCountry: "Fransa",
    originFlag: "🇫🇷",
    originCity: "Paris",
    sourceStore: "Le Bon Marché Rive Gauche Paris",
    supplyStatus: "BOUTIQUE_PREORDER",
    supplyBadgeText: "Paris Butik Tedarik • 6-8 Günde Teslim",
    estimatedDeliveryDays: "6-8 İş Günü",
    basePriceEur: 210,
    priceTry: 9490,
    oldPriceTry: 10800,
    customsIncluded: true,
    authenticityBatch: "BYR-PAR-5590",
    rating: 4.96,
    reviewCount: 94,
    stockCount: 7,
    isTrending: true,
    description:
      "Paris Le Bon Marché niş parfümeri reyonundan isminize özel faturalandırılan yeni Mojave Ghost Absolu konsantrasyonu. IATA tehlikeli madde (DG) lisanslı özel hava kargo konteyneriyle yasal ve güvenli ithalat.",
    highlights: [
      "IATA Lisanslı Parfüm/Kozmetik Hava Taşımacılığı",
      "Le Bon Marché Paris Hediye Kutusu ve Niş Tester Seti Hediye",
      "Adım Adım Canlı Gümrük & Uçuş Takip Paneli",
    ],
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85",
    variants: [
      { id: "v-byr-1", type: "Boyut", name: "50ml Absolu de Parfum", priceDiffTry: 0, stock: 5 },
      { id: "v-byr-2", type: "Boyut", name: "100ml Absolu Collector", priceDiffTry: 3200, stock: 2 },
    ],
  },
  {
    id: "prd-summerfridays-07",
    slug: "summer-fridays-lip-butter-balm-vault",
    sku: "EU-SMF-1129",
    name: "The Lip Butter Balm Complete Vault (4x Tam Boy)",
    brand: "Summer Fridays",
    category: "Makyaj & Dudak",
    originCountry: "İngiltere",
    originFlag: "🇬🇧",
    originCity: "Londra",
    sourceStore: "Cult Beauty UK Warehouse",
    supplyStatus: "EXPRESS_READY_EU",
    supplyBadgeText: "Avrupa Deposunda Hazır • 4-5 Günde Teslim",
    estimatedDeliveryDays: "4-5 İş Günü",
    basePriceEur: 74,
    priceTry: 3490,
    oldPriceTry: 3990,
    customsIncluded: true,
    authenticityBatch: "SMF-CB-4410",
    rating: 4.95,
    reviewCount: 318,
    stockCount: 16,
    isTikTokViral: true,
    description:
      "Vanilla Beige, Pink Sugar, Cherry ve Iced Coffee tonlarının dördünü tek kutuda sunan sınırlı üretim Cult Beauty UK koleksiyon seti.",
    highlights: [
      "4 Tam Boy Ürün Tek Koleksiyon Kutusunda",
      "Cult Beauty UK Orijinal Lot Numarası Kontrolü",
      "Gümrük Vergisi & Sigorta Dahil Net Ödeme",
    ],
    image:
      "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?auto=format&fit=crop&w=900&q=85",
    variants: [
      { id: "v-smf-1", type: "Set", name: "4'lü Tam Boy Vault Seti", priceDiffTry: 0, stock: 16 },
    ],
  },
  {
    id: "prd-gisou-08",
    slug: "gisou-honey-infused-hair-perfume-amsterdam-edition",
    sku: "EU-GSU-6084",
    name: "Honey Infused Hair Perfume & Lip Oil Duo (Mirsalehi Bee Garden)",
    brand: "Gisou",
    category: "Saç & Vücut",
    originCountry: "Almanya",
    originFlag: "🇩🇪",
    originCity: "Berlin",
    sourceStore: "Gisou EU Official Distribution Hub",
    supplyStatus: "EXPRESS_READY_EU",
    supplyBadgeText: "Berlin Deposunda Hazır • 3-5 Günde Teslim",
    estimatedDeliveryDays: "3-5 İş Günü",
    basePriceEur: 68,
    priceTry: 3250,
    oldPriceTry: 3690,
    customsIncluded: true,
    authenticityBatch: "GSU-EU-8920",
    rating: 4.93,
    reviewCount: 205,
    stockCount: 13,
    description:
      "Negin Mirsalehi'nin ikonik Gisou saç parfümü ve ballı dudak bakım yağı ikilisi. Avrupa resmi dağıtım merkezinden doğrudan Berlin depomuza giriş yapmış taze üretim batch.",
    highlights: [
      "Mirsalehi Arı Bahçesi Orijinal Hologramlı Kutu",
      "Berlin Hub'dan 24 Saat İçinde Hava Kargo Çıkışı",
      "Şeffaf Aşama Aşama Canlı Kargo Takibi",
    ],
    image:
      "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=900&q=85",
    variants: [
      { id: "v-gsu-1", type: "Renk", name: "Wild Rose & Honey Gold", hexColor: "#E5A93C", priceDiffTry: 0, stock: 9 },
      { id: "v-gsu-2", type: "Renk", name: "Watermelon Sugar & Lavender", hexColor: "#E36B7A", priceDiffTry: 120, stock: 4 },
    ],
  },
];

export const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: "ord-1",
    orderNumber: "EU-90482",
    customerName: "Selin Yılmaz",
    customerEmail: "selin.yilmaz@example.com",
    customerPhone: "+90 532 418 92 10",
    customerCity: "İstanbul / Beşiktaş",
    tcIdentityMasked: "248*****914",
    currentStage: "IN_FLIGHT_TRANSIT",
    createdAt: "16 Kasım 2026, 14:20",
    guaranteedDeliveryDate: "21 Kasım 2026 (SLA Garantili)",
    etgbDeclarationNo: "ETGB-2026-IST-884920",
    airWaybillNo: "LH-8492-BER-IST",
    originHub: "Berlin Brandenburg Lojistik Merkezi (DE)",
    batchVerified: true,
    receiptHash: "SEP-UK-INV-9948120",
    pricing: {
      subtotalTry: 5640,
      euLogisticsFeeTry: 320,
      customsTaxTry: 890,
      vipInsuranceTry: 140,
      totalTry: 6990,
    },
    items: [
      {
        productId: "prd-rhode-01",
        name: "Peptide Lip Tint & Pocket Blush Collector Duo",
        brand: "Rhode Skin",
        variant: "Toast + Piggy",
        quantity: 1,
        unitPriceTry: 3150,
        batchCode: "RHD-2026-UK914",
        image:
          "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80",
      },
      {
        productId: "prd-plouise-03",
        name: "P.Louise Lip Oil & Signature Eyeshadow Vault",
        brand: "P.Louise",
        variant: "Birthday Cake & Rose Glow",
        quantity: 1,
        unitPriceTry: 2490,
        batchCode: "PLS-UK-7721",
        image:
          "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80",
      },
    ],
    timeline: [
      {
        stage: "ORDER_CONFIRMED",
        title: "Sipariş, Ödeme ve ETGB Ön Beyanı Onaylandı",
        subtitle: "İyzico 3D Secure & Gümrük Vergisi Koruması Aktif",
        description:
          "Siparişiniz onaylandı. Gümrük vergisi ve lojistik bedelleri sabitlenerek kur farkı ve ek vergi koruması altına alındı.",
        location: "İstanbul / Dijital Gümrük Entegrasyonu",
        timestamp: "16 Kasım 2026 • 14:22",
        operatorName: "Sistem Otomasyonu (IYZ-3DS)",
        badgeCode: "FIN-OK",
        telemetry: {
          etgbNo: "ETGB-2026-IST-884920",
          customsStatus: "Gümrük Vergisi Peşin Ödendi (DDP)",
        },
      },
      {
        stage: "EU_WAREHOUSE",
        title: "Avrupa Deposunda (Berlin Hub) Kalite & Batch Doğrulama",
        subtitle: "Orijinal Mağaza Faturası ve Barkod Eşleşmesi Tamamlandı",
        description:
          "Ürünleriniz Berlin Brandenburg Lojistik Merkezimizde darbe emici termal pakete alındı. Rhode UK ve P.Louise orijinal batch kodları optik okuyucuyla doğrulandı.",
        location: "Berlin Brandenburg Hub, Almanya 🇩🇪",
        timestamp: "17 Kasım 2026 • 11:05",
        operatorName: "Kıdemli Depo Denetçisi: Lukas Meyer",
        badgeCode: "BATCH-VERIFIED",
        telemetry: {
          batchCode: "RHD-2026-UK914 / PLS-UK-7721",
          tempSensor: "18.4°C (İdeal Kozmetik Saklama Koşulu)",
        },
      },
      {
        stage: "EXPORT_CUSTOMS",
        title: "Avrupa İhracat Gümrük İşleminde (Zollamt Berlin)",
        subtitle: "AB Çıkış Manifestosu & Elektronik Konşimento Onaylandı",
        description:
          "Alman gümrük idaresi (Zoll) ihracat beyannamesi onaylandı. Paketiniz hava kargo güvenlik taramasından (X-Ray & IATA) sorunsuz geçti.",
        location: "BER Cargo Terminal, Schönefeld / Almanya 🇩🇪",
        timestamp: "18 Kasım 2026 • 09:40",
        operatorName: "Gümrük Müşaviri: Klaus V.",
        badgeCode: "EU-EXPORT-CLEARED",
        telemetry: {
          customsStatus: "MRN-26DE4910284910E2 Onaylı",
          etgbNo: "ETGB-2026-IST-884920",
        },
      },
      {
        stage: "IN_FLIGHT_TRANSIT",
        title: "Uçuşta / Transit Hava Kargo (Berlin BER -> İstanbul IST)",
        subtitle: "Turkish Cargo / Lufthansa Ortak Kargo Uçuşu (TK-1724)",
        description:
          "Kargonuz BER Havalimanından kalkan TK-1724 sefer sayılı uçakla İstanbul Havalimanı Kargo Terminaline doğru uçuş halindedir.",
        location: "Hava Sahası • Uçuş Kodu: TK-1724 (AWB: LH-8492-BER-IST)",
        timestamp: "18 Kasım 2026 • 19:15",
        operatorName: "Hava Kargo Operasyon Masası",
        badgeCode: "AIR-TRANSIT",
        telemetry: {
          flightNo: "TK-1724 (BER -> IST)",
          tempSensor: "17.9°C Basınçlı Kargo Kabini",
        },
      },
      {
        stage: "TR_CUSTOMS_HUB",
        title: "Türkiye Transfer Merkezinde (İST Havalimanı ETGB Gümrük)",
        subtitle: "Hızlı Elektronik Ticaret Gümrük Beyannamesi Çıkışı",
        description:
          "Uçak inişinin ardından ön beyanı yapılmış ETGB dosyanızla beklemeden gümrük çekimi tamamlanıp yurtiçi VIP dağıtım aracına aktarılacak.",
        location: "İstanbul Havalimanı (IST) Gümrük & Transfer Merkezi 🇹🇷",
        timestamp: "Beklenen: 19 Kasım 2026 • 09:00",
        operatorName: "TR Gümrük Operasyon: Murat K.",
        badgeCode: "TR-HUB",
        telemetry: {
          etgbNo: "ETGB-2026-IST-884920",
          customsStatus: "Ön Beyan Hazır - Ek Vergi Çıkmaz",
        },
      },
      {
        stage: "OUT_FOR_DELIVERY",
        title: "VIP Kuryede (Dağıtımda)",
        subtitle: "Randevulu & Kod Doğrulamalı Teslimat",
        description:
          "İstanbul içi özel kurye ekibimiz paketinizi adresinize teslim etmek üzere yola çıkacak. SMS ile canlı kurye haritası paylaşılır.",
        location: "Beşiktaş Dağıtım Şubesi, İstanbul 🇹🇷",
        timestamp: "Planlanan: 20 Kasım 2026",
        operatorName: "VIP Kurye Ekibi",
        badgeCode: "LAST-MILE",
        telemetry: {
          courierHub: "EuroFlux VIP Express / Yurtiçi Özel Hat",
        },
      },
      {
        stage: "DELIVERED",
        title: "Teslim Edildi",
        subtitle: "İmzalı & Orijinallik Sertifikalı Teslimat",
        description:
          "Siparişiniz hasarsız ve eksiksiz olarak teslim edildiğinde dijital garanti belgeniz aktifleşir.",
        location: "İstanbul / Beşiktaş",
        timestamp: "Garanti Tarihi: 21 Kasım 2026",
        operatorName: "Müşteri Teslimat Onayı",
        badgeCode: "SLA-DONE",
      },
    ],
  },
  {
    id: "ord-2",
    orderNumber: "EU-88310",
    customerName: "Zeynep Kaya",
    customerEmail: "zeynep.kaya@example.com",
    customerPhone: "+90 544 812 33 19",
    customerCity: "Ankara / Çankaya",
    tcIdentityMasked: "419*****102",
    currentStage: "TR_CUSTOMS_HUB",
    createdAt: "14 Kasım 2026, 10:15",
    guaranteedDeliveryDate: "19 Kasım 2026 (SLA Garantili)",
    etgbDeclarationNo: "ETGB-2026-IST-773190",
    airWaybillNo: "AF-3319-CDG-IST",
    originHub: "Paris Charles de Gaulle Hub (FR)",
    batchVerified: true,
    receiptHash: "SEP-FR-INV-441028",
    pricing: {
      subtotalTry: 12950,
      euLogisticsFeeTry: 450,
      customsTaxTry: 1450,
      vipInsuranceTry: 250,
      totalTry: 15100,
    },
    items: [
      {
        productId: "prd-spacenk-02",
        name: "Space NK London 25-Days Luxury Beauty Advent Calendar",
        brand: "Space NK",
        variant: "2026 Tam Boy Koleksiyon (35 Ürün)",
        quantity: 1,
        unitPriceTry: 12950,
        batchCode: "SNK-ADV-UK008",
        image:
          "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80",
      },
    ],
    timeline: [
      {
        stage: "ORDER_CONFIRMED",
        title: "Sipariş & Kurumsal İthalat Dosyası Açıldı",
        subtitle: "30€ Bireysel Gümrük Sınırına Takılmayan Kurumsal ETGB/B2C Rejimi",
        description:
          "Space NK Advent Calendar siparişiniz kurumsal ithalat garantisiyle onaylandı.",
        location: "İstanbul / Merkez",
        timestamp: "14 Kasım 2026 • 10:16",
        operatorName: "Sistem Otomasyonu",
        badgeCode: "FIN-OK",
      },
      {
        stage: "EU_WAREHOUSE",
        title: "Avrupa Deposunda (Paris Hub) VIP Sandıklama",
        subtitle: "35 Ürünlük Takvim Tek Tek Kontrol Edildi",
        description:
          "Londra'dan Paris aktarma merkezimize ulaşan Advent Calendar, darbe sensörlü koruma kutusuna yerleştirildi.",
        location: "Paris CDG Logistics Hub, Fransa 🇫🇷",
        timestamp: "15 Kasım 2026 • 15:30",
        operatorName: "Depo Sorumlusu: Claire D.",
        badgeCode: "BATCH-VERIFIED",
        telemetry: {
          batchCode: "SNK-ADV-UK008",
          tempSensor: "19.0°C",
        },
      },
      {
        stage: "EXPORT_CUSTOMS",
        title: "Fransa İhracat Gümrük Çıkışı Tamamlandı",
        subtitle: "Roissy-CDG Gümrük Onayı",
        description: "İhracat beyannamesi onaylanarak Air France Cargo uçağına yüklendi.",
        location: "Paris Charles de Gaulle (CDG) 🇫🇷",
        timestamp: "16 Kasım 2026 • 18:10",
        operatorName: "Douane Française Desk",
        badgeCode: "EU-EXPORT-CLEARED",
      },
      {
        stage: "IN_FLIGHT_TRANSIT",
        title: "Uçuş Tamamlandı (Paris CDG -> İstanbul IST)",
        subtitle: "Air France Cargo AF-1390",
        description: "Kargonuz İstanbul Havalimanı Kargo Terminaline indi.",
        location: "İstanbul Havalimanı (IST)",
        timestamp: "17 Kasım 2026 • 23:45",
        operatorName: "Hava Kargo Masası",
        badgeCode: "AIR-TRANSIT",
        telemetry: {
          flightNo: "AF-1390 (CDG -> IST)",
        },
      },
      {
        stage: "TR_CUSTOMS_HUB",
        title: "Türkiye Transfer Merkezinde (Gümrük Çekimi Tamamlandı)",
        subtitle: "ETGB Onaylandı • Ankara Ana Transfer Aracına Aktarılıyor",
        description:
          "Gümrük verginiz tarafımızca ödendiği için paketiniz hiçbir ek ücrete tabi olmadan gümrükten çıktı ve Ankara VIP dağıtım hattına yönlendirildi.",
        location: "İstanbul Havalimanı -> Ankara Transfer Merkezi 🇹🇷",
        timestamp: "18 Kasım 2026 • 14:10",
        operatorName: "Gümrük Uzmanı: Murat K.",
        badgeCode: "TR-HUB-CLEARED",
        telemetry: {
          etgbNo: "ETGB-2026-IST-773190",
          customsStatus: "Gümrük Çıkışı Tamamlandı (0 TL Ek Masraf)",
        },
      },
      {
        stage: "OUT_FOR_DELIVERY",
        title: "VIP Kuryede",
        subtitle: "Ankara Çankaya Dağıtım",
        description: "Yarın sabah kurye dağıtımına çıkarılacaktır.",
        location: "Ankara / Çankaya",
        timestamp: "Planlanan: 19 Kasım 2026 • 10:30",
        operatorName: "Ankara VIP Kurye",
        badgeCode: "LAST-MILE",
      },
      {
        stage: "DELIVERED",
        title: "Teslim Edildi",
        subtitle: "Teslimat Bekleniyor",
        description: "Teslimat sonrası imzalı makbuz burada görüntülenecektir.",
        location: "Ankara / Çankaya",
        timestamp: "Planlanan: 19 Kasım 2026",
        operatorName: "Müşteri Onayı",
        badgeCode: "SLA-DONE",
      },
    ],
  },
  {
    id: "ord-3",
    orderNumber: "EU-77105",
    customerName: "Mert Demir",
    customerEmail: "mert.demir@example.com",
    customerPhone: "+90 533 901 44 82",
    customerCity: "İzmir / Karşıyaka",
    tcIdentityMasked: "182*****650",
    currentStage: "EU_WAREHOUSE",
    createdAt: "18 Kasım 2026, 09:10",
    guaranteedDeliveryDate: "24 Kasım 2026 (SLA Garantili)",
    etgbDeclarationNo: "ETGB-2026-IST-912045",
    airWaybillNo: "LH-9921-BER-IST",
    originHub: "Berlin Brandenburg Lojistik Merkezi (DE)",
    batchVerified: true,
    receiptHash: "KADEWE-DE-883920",
    pricing: {
      subtotalTry: 7850,
      euLogisticsFeeTry: 290,
      customsTaxTry: 960,
      vipInsuranceTry: 150,
      totalTry: 9250,
    },
    items: [
      {
        productId: "prd-bader-05",
        name: "The Rich Cream TFC8® Cellular Renewal (50ml)",
        brand: "Augustinus Bader",
        variant: "50ml Full Size",
        quantity: 1,
        unitPriceTry: 7850,
        batchCode: "ABD-DE-6481",
        image:
          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
      },
    ],
    timeline: [
      {
        stage: "ORDER_CONFIRMED",
        title: "Sipariş & Ödeme Onaylandı",
        subtitle: "PayTR Taksitli Ödeme & Gümrük Garantisi",
        description: "Siparişiniz onaylandı ve Berlin merkez depomuza iş emri iletildi.",
        location: "İzmir / Dijital Kayıt",
        timestamp: "18 Kasım 2026 • 09:11",
        operatorName: "PayTR Güvenli Ödeme",
        badgeCode: "FIN-OK",
      },
      {
        stage: "EU_WAREHOUSE",
        title: "Avrupa Deposunda (Berlin Hub) Termal Paketleme",
        subtitle: "KaDeWe Berlin Seri Numarası & Soğuk Zincir Hazırlığı",
        description:
          "Augustinus Bader The Rich Cream ürününüzün seri numarası (ABD-DE-6481) doğrulandı ve yarın sabahki Lufthansa Cargo uçuşu için termal koruma kutusuna alındı.",
        location: "Berlin Brandenburg Hub, Almanya 🇩🇪",
        timestamp: "18 Kasım 2026 • 16:40",
        operatorName: "Kalite Kontrol: Hannah S.",
        badgeCode: "BATCH-VERIFIED",
        telemetry: {
          batchCode: "ABD-DE-6481",
          tempSensor: "17.2°C Termal Kutu",
        },
      },
      {
        stage: "EXPORT_CUSTOMS",
        title: "Gümrük İşleminde (AB Çıkış)",
        subtitle: "Elektronik İhracat Manifestosu Hazırlanıyor",
        description: "Uçuş öncesi Alman gümrük çıkış onayı bekleniyor.",
        location: "Berlin BER Cargo",
        timestamp: "Planlanan: 19 Kasım 2026",
        operatorName: "Zollamt Berlin",
        badgeCode: "EU-EXPORT",
      },
      {
        stage: "IN_FLIGHT_TRANSIT",
        title: "Uçuşta / Transit",
        subtitle: "Berlin -> İstanbul Hava Kargo",
        description: "Uçuş aşamasına geçtiğinde AWB takip numaranız aktifleşecektir.",
        location: "Hava Kargo",
        timestamp: "Planlanan: 20 Kasım 2026",
        operatorName: "Lufthansa Cargo",
        badgeCode: "AIR-TRANSIT",
      },
      {
        stage: "TR_CUSTOMS_HUB",
        title: "Türkiye Transfer Merkezinde",
        subtitle: "İstanbul Havalimanı ETGB Çıkışı",
        description: "Gümrük çekimi ve İzmir transfer hattı.",
        location: "İstanbul -> İzmir",
        timestamp: "Planlanan: 21 Kasım 2026",
        operatorName: "TR Gümrük Masası",
        badgeCode: "TR-HUB",
      },
      {
        stage: "OUT_FOR_DELIVERY",
        title: "Kuryede",
        subtitle: "İzmir Karşıyaka Dağıtım",
        description: "Adresinize özel kurye teslimatı.",
        location: "İzmir / Karşıyaka",
        timestamp: "Planlanan: 23 Kasım 2026",
        operatorName: "VIP Kurye",
        badgeCode: "LAST-MILE",
      },
      {
        stage: "DELIVERED",
        title: "Teslim Edildi",
        subtitle: "Garantili Teslimat",
        description: "İmzalı teslimat onayı.",
        location: "İzmir / Karşıyaka",
        timestamp: "Garanti Tarihi: 24 Kasım 2026",
        operatorName: "Müşteri Onayı",
        badgeCode: "SLA-DONE",
      },
    ],
  },
];

export const INITIAL_CUSTOM_REQUESTS: CustomSourcingRequestItem[] = [
  {
    id: "REQ-409",
    customerName: "Ece Soylu",
    brandAndProduct: "Sephora Favorites Holiday Must Haves Set (USA Exclusive)",
    sourceUrl: "https://www.sephora.com/product/holiday-must-haves",
    country: "ABD 🇺🇸 -> Berlin Transit",
    requestedAt: "2 saat önce",
    estimatedEur: 95,
    quotedTotalTry: 4650,
    status: "MÜŞTERİ ONAYINDA",
  },
  {
    id: "REQ-410",
    customerName: "Burak Aydın",
    brandAndProduct: "Maison Francis Kurkdjian Baccarat Rouge 540 Extrait (70ml)",
    sourceUrl: "https://www.franciskurkdjian.com/int-en/p/baccarat-rouge-540",
    country: "Fransa 🇫🇷 (Paris Boutique)",
    requestedAt: "5 saat önce",
    estimatedEur: 355,
    quotedTotalTry: 16400,
    status: "AVRUPA DEPO TEDARİĞİNDE",
  },
];

// Şeffaf Gümrük, Lojistik ve Sigorta Hesaplama Yardımcı Fonksiyonu
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
  // Avrupa Hava Kargo Lojistik Bedeli (5.000 TL üzeri ücretsiz)
  const euLogisticsFeeTry = freeShippingUnlocked ? 0 : 290;
  // Kurumsal ETGB Gümrük & İthalat Hizmet Kalemi (Şeffaf gösterim - müşteriye sürpriz çıkmaz)
  const customsTaxTry = Math.round(subtotalTry * 0.12);
  // Soğuk Zincir & Kırılmazlık Sigortası
  const vipInsuranceTry = 120;

  return {
    subtotalTry,
    euLogisticsFeeTry,
    customsTaxTry,
    vipInsuranceTry,
    totalTry: subtotalTry + euLogisticsFeeTry + customsTaxTry + vipInsuranceTry,
    freeShippingUnlocked,
  };
}
