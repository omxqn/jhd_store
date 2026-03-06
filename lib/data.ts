// =====================================================
// MOCK DATA — Jihad Store
// =====================================================

export type Country = {
    code: string;
    name: string;
    flag: string;
    currency: string;
    symbol: string;
    rate: number; // relative to OMR
};

export const COUNTRIES: Country[] = [
    { code: "OM", name: "Oman", flag: "🇴🇲", currency: "OMR", symbol: "ر.ع", rate: 1 },
    { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", currency: "SAR", symbol: "ر.س", rate: 9.73 },
    { code: "AE", name: "UAE", flag: "🇦🇪", currency: "AED", symbol: "د.إ", rate: 9.7 },
    { code: "KW", name: "Kuwait", flag: "🇰🇼", currency: "KWD", symbol: "د.ك", rate: 0.81 },
    { code: "BH", name: "Bahrain", flag: "🇧🇭", currency: "BHD", symbol: "د.ب", rate: 0.99 },
    { code: "QA", name: "Qatar", flag: "🇶🇦", currency: "QAR", symbol: "ر.ق", rate: 9.63 },
];

export type Badge = "sale" | "norefund" | "oos" | "new";

export type Product = {
    id: string;
    name: string;
    category: string;
    price: number; // in OMR
    oldPrice?: number;
    images: string[];
    badges: Badge[];
    rating: number;
    reviews: number;
    sold: number;
    availability: "available" | "out-of-stock" | "coming-soon";
    description: string;
    details: string;
    fabricTypes: string[];
    necklineShapes: { name: string; image: string }[];
    stitchPrice: number;
    accessories: { name: string; price: number }[];
    shippingNote: string;
    mostSelling?: boolean;
    specs: { label: string; value: string }[];
};

export const PRODUCTS: Product[] = [
    {
        id: "001",
        name: "Royal Embroidered Thobe",
        category: "Thobes",
        price: 28.5,
        oldPrice: 38,
        images: [
            "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80",
            "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80",
        ],
        badges: ["sale"],
        rating: 4.8,
        reviews: 124,
        sold: 890,
        availability: "available",
        description: "Crafted from premium Egyptian cotton with intricate hand-embroidered collar details. Perfect for formal occasions and Eid celebrations.",
        details: "This exclusive thobe features a tailored fit with reinforced stitching for durability. The collar embroidery uses gold thread imported from Egypt.",
        fabricTypes: ["Egyptian Cotton", "Premium Linen", "Silk Blend", "Polyester"],
        necklineShapes: [
            { name: "Classic Round", image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=70" },
            { name: "Mandarin Collar", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&q=70" },
            { name: "V-Neck", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&q=70" },
            { name: "Stand Collar", image: "https://images.unsplash.com/photo-1581803118522-7b72a50f7e9f?w=200&q=70" },
            { name: "Wide Neck", image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=200&q=70" },
            { name: "Nehru Collar", image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=200&q=70" },
        ],
        stitchPrice: 4.5,
        accessories: [
            { name: "None", price: 0 },
            { name: "Embroidered Belt", price: 3.5 },
            { name: "Cufflinks (Gold)", price: 4.0 },
            { name: "Cufflinks (Silver)", price: 2.5 },
            { name: "Breast Pocket Handkerchief", price: 1.0 },
            { name: "Traditional Cap", price: 2.0 },
        ],
        shippingNote: "Free shipping on orders above 10 OMR",
        mostSelling: true,
        specs: [
            { label: "Material", value: "Egyptian Cotton 100%" },
            { label: "Care", value: "Dry clean only" },
            { label: "Origin", value: "Made in Oman" },
            { label: "Sizes", value: "XS – 3XL" },
        ],
    },
    {
        id: "002",
        name: "Classic White Kandura",
        category: "Thobes",
        price: 22.0,
        images: [
            "https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?w=600&q=80",
        ],
        badges: ["new"],
        rating: 4.6,
        reviews: 87,
        sold: 540,
        availability: "available",
        description: "A timeless white kandura with a modern slim fit. Made from breathable fabric perfect for the GCC climate.",
        details: "Features a hidden button placket and premium quality fabric that stays crisp throughout the day.",
        fabricTypes: ["Egyptian Cotton", "Linen Mix", "Polyester Cotton"],
        necklineShapes: [
            { name: "Classic Round", image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=70" },
            { name: "Mandarin Collar", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&q=70" },
            { name: "V-Neck", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&q=70" },
        ],
        stitchPrice: 3.5,
        accessories: [
            { name: "None", price: 0 },
            { name: "Embroidered Belt", price: 3.5 },
            { name: "Traditional Cap", price: 2.0 },
            { name: "Cufflinks (Gold)", price: 4.0 },
        ],
        shippingNote: "Ships within 2-3 business days",
        mostSelling: true,
        specs: [
            { label: "Material", value: "Linen Mix 60/40" },
            { label: "Care", value: "Machine wash cold" },
            { label: "Origin", value: "Made in UAE" },
            { label: "Sizes", value: "S – 4XL" },
        ],
    },
    {
        id: "003",
        name: "Premium Abaya — Midnight Blue",
        category: "Abayas",
        price: 35.0,
        oldPrice: 45.0,
        images: [
            "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80",
        ],
        badges: ["sale", "norefund"],
        rating: 4.9,
        reviews: 211,
        sold: 1250,
        availability: "available",
        description: "Elegant midnight blue abaya with subtle shimmer thread. A statement piece for formal events.",
        details: "The fabric drapes beautifully and is wrinkle-resistant. Silver embroidery detailing along the cuffs.",
        fabricTypes: ["Nida Fabric", "Crepe", "Chiffon", "Velvet"],
        necklineShapes: [
            { name: "Classic Round", image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=70" },
            { name: "V-Neck", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&q=70" },
            { name: "Wide Neck", image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=200&q=70" },
        ],
        stitchPrice: 5.0,
        accessories: [
            { name: "None", price: 0 },
            { name: "Matching Hijab", price: 5.0 },
            { name: "Crystal Brooch", price: 3.0 },
            { name: "Belt (Embroidered)", price: 4.5 },
            { name: "Cuffs (Lace)", price: 2.5 },
        ],
        shippingNote: "Express delivery available",
        mostSelling: true,
        specs: [
            { label: "Material", value: "Nida + Chiffon" },
            { label: "Care", value: "Dry clean recommended" },
            { label: "Origin", value: "Made in Saudi Arabia" },
            { label: "Sizes", value: "XS – 2XL" },
        ],
    },
    {
        id: "004",
        name: "Floral Embroidery Abaya",
        category: "Abayas",
        price: 42.0,
        images: [
            "https://images.unsplash.com/photo-1603400521630-9f2de124b33b?w=600&q=80",
        ],
        badges: [],
        rating: 4.7,
        reviews: 95,
        sold: 320,
        availability: "available",
        description: "A breathtaking abaya adorned with floral embroidery on crepe fabric, ideal for special occasions.",
        details: "Hand-crafted embroidery with premium thread. Available in custom color on request.",
        fabricTypes: ["Crepe", "Chiffon", "Nida Fabric"],
        necklineShapes: [
            { name: "Classic Round", image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=70" },
            { name: "Wide Neck", image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=200&q=70" },
        ],
        stitchPrice: 5.0,
        accessories: [
            { name: "None", price: 0 },
            { name: "Matching Hijab", price: 5.0 },
            { name: "Crystal Brooch", price: 3.0 },
            { name: "Belt (Embroidered)", price: 4.5 },
        ],
        shippingNote: "Ships within 3-5 business days",
        specs: [
            { label: "Material", value: "Crepe 100%" },
            { label: "Care", value: "Dry clean only" },
            { label: "Origin", value: "Made in Egypt" },
            { label: "Sizes", value: "XS – 3XL" },
        ],
    },
    {
        id: "005",
        name: "Sport Thobe — Slim Fit",
        category: "Thobes",
        price: 18.5,
        images: [
            "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
        ],
        badges: ["new"],
        rating: 4.4,
        reviews: 62,
        sold: 280,
        availability: "available",
        description: "Modern sport thobe with wrinkle-free fabric and 4-way stretch technology for active lifestyles.",
        details: "Perfect for daily wear, prayers, and casual outings. Machine washable and quick-dry.",
        fabricTypes: ["Polyester Blend", "Micro-fiber", "Cotton Stretch"],
        necklineShapes: [
            { name: "Classic Round", image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=70" },
            { name: "Mandarin Collar", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&q=70" },
        ],
        stitchPrice: 3.0,
        accessories: [
            { name: "None", price: 0 },
            { name: "Traditional Cap", price: 2.0 },
            { name: "Cufflinks (Silver)", price: 2.5 },
        ],
        shippingNote: "Free standard shipping",
        mostSelling: true,
        specs: [
            { label: "Material", value: "Polyester 80% / Cotton 20%" },
            { label: "Care", value: "Machine wash 30°C" },
            { label: "Origin", value: "Made in Turkey" },
            { label: "Sizes", value: "S – 3XL" },
        ],
    },
    {
        id: "006",
        name: "Kids Thobe — Celebration",
        category: "Kids",
        price: 12.0,
        images: [
            "https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?w=600&q=80",
        ],
        badges: [],
        rating: 4.9,
        reviews: 148,
        sold: 760,
        availability: "available",
        description: "Adorable Eid thobe for boys with soft comfortable fabric and easy-care properties.",
        details: "Perfect for special occasions. Soft lining for sensitive skin.",
        fabricTypes: ["Egyptian Cotton", "Polyester Blend"],
        necklineShapes: [
            { name: "Classic Round", image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=70" },
            { name: "Mandarin Collar", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&q=70" },
        ],
        stitchPrice: 2.5,
        accessories: [
            { name: "None", price: 0 },
            { name: "Traditional Cap", price: 1.5 },
            { name: "Belt (Kids)", price: 1.0 },
        ],
        shippingNote: "Ships within 2 business days",
        mostSelling: true,
        specs: [
            { label: "Material", value: "Egyptian Cotton 100%" },
            { label: "Care", value: "Machine wash 30°C" },
            { label: "Origin", value: "Made in Oman" },
            { label: "Sizes", value: "2Y – 14Y" },
        ],
    },
    {
        id: "007",
        name: "Luxury Bisht — Gold Trim",
        category: "Bishts",
        price: 85.0,
        images: [
            "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&q=80",
        ],
        badges: ["norefund"],
        rating: 5.0,
        reviews: 34,
        sold: 112,
        availability: "available",
        description: "An exquisite bisht with hand-stitched gold trim. The symbol of prestige in GCC culture.",
        details: "Each bisht is made-to-order by master craftsmen. Sadu-inspired weave pattern.",
        fabricTypes: ["Wool Blend", "Premium Cashmere"],
        necklineShapes: [
            { name: "Classic Round", image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=70" },
        ],
        stitchPrice: 15.0,
        accessories: [
            { name: "None", price: 0 },
            { name: "Gold Agal", price: 12.0 },
            { name: "Silver Agal", price: 8.0 },
        ],
        shippingNote: "Custom made — 7 to 14 days delivery",
        specs: [
            { label: "Material", value: "Wool Blend 70/30" },
            { label: "Care", value: "Dry clean only" },
            { label: "Origin", value: "Made in Kuwait" },
            { label: "Sizes", value: "S – 3XL (Custom)" },
        ],
    },
    {
        id: "008",
        name: "Kids Abaya — Rose Pink",
        category: "Kids",
        price: 14.0,
        images: [
            "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&q=80",
        ],
        badges: ["oos"],
        rating: 4.5,
        reviews: 55,
        sold: 190,
        availability: "out-of-stock",
        description: "Soft rose pink abaya for girls with delicate lace trim. Ideal for Eid and family celebrations.",
        details: "Ultra-soft fabric gentle on children's skin. Comes with matching scrunchie.",
        fabricTypes: ["Nida Fabric", "Cotton Blend"],
        necklineShapes: [
            { name: "Classic Round", image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&q=70" },
            { name: "Wide Neck", image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=200&q=70" },
        ],
        stitchPrice: 2.0,
        accessories: [
            { name: "None", price: 0 },
            { name: "Matching Hijab", price: 5.0 },
            { name: "Lace Headband", price: 1.5 },
        ],
        shippingNote: "Currently out of stock",
        specs: [
            { label: "Material", value: "Nida + Lace" },
            { label: "Care", value: "Machine wash cold" },
            { label: "Origin", value: "Made in UAE" },
            { label: "Sizes", value: "2Y – 16Y" },
        ],
    },
];

export const CATEGORIES = ["Thobes", "Abayas", "Bishts", "Kids"];

export const VOUCHERS: Record<string, number> = {
    "OMAN2024": 5.0,
    "SAVE10": 10.0,
    "WELCOME": 3.0,
    "EID25": 25.0,
};

export type OrderStatus = "paid" | "processing" | "shipped" | "delivered";

export type OrderItem = {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    fabricType: string;
    neckline: string;
    stitch: boolean;
    accessories: string[];
    stitchPrice: number;
};

export type Order = {
    id: string;
    date: string;
    status: OrderStatus;
    items: OrderItem[];
    subtotal: number;
    discount: number;
    total: number;
    address: string;
    city: string;
    phone: string;
    name: string;
    email: string;
};

export const MOCK_ORDERS: Order[] = [
    {
        id: "10241",
        date: "2026-02-20",
        status: "delivered",
        items: [
            { productId: "001", name: "Royal Embroidered Thobe", price: 28.5, quantity: 1, fabricType: "Egyptian Cotton", neckline: "Classic Round", stitch: true, accessories: ["Embroidered Belt"], stitchPrice: 4.5 },
            { productId: "006", name: "Kids Thobe — Celebration", price: 12.0, quantity: 2, fabricType: "Egyptian Cotton", neckline: "Classic Round", stitch: false, accessories: ["None"], stitchPrice: 0 },
        ],
        subtotal: 52.5,
        discount: 0,
        total: 52.5,
        address: "Al-Khuwair Street, Villa 12",
        city: "Muscat",
        phone: "+968 9123 4567",
        name: "Mohammed Al-Rashidi",
        email: "mohammed@example.com",
    },
    {
        id: "10242",
        date: "2026-03-01",
        status: "shipped",
        items: [
            { productId: "003", name: "Premium Abaya — Midnight Blue", price: 35.0, quantity: 1, fabricType: "Nida Fabric", neckline: "Wide Neck", stitch: true, accessories: ["Matching Hijab", "Crystal Brooch"], stitchPrice: 5.0 },
        ],
        subtotal: 40.0,
        discount: 5.0,
        total: 35.0,
        address: "Bausher, Block 5, House 33",
        city: "Muscat",
        phone: "+968 9876 5432",
        name: "Fatima Al-Balushi",
        email: "fatima@example.com",
    },
    {
        id: "10243",
        date: "2026-03-04",
        status: "processing",
        items: [
            { productId: "007", name: "Luxury Bisht — Gold Trim", price: 85.0, quantity: 1, fabricType: "Wool Blend", neckline: "Classic Round", stitch: true, accessories: ["Gold Agal"], stitchPrice: 15.0 },
        ],
        subtotal: 100.0,
        discount: 10.0,
        total: 90.0,
        address: "Al-Seeb, Villa 7",
        city: "Muscat",
        phone: "+968 9555 1234",
        name: "Abdullah Al-Hinai",
        email: "abdullah@example.com",
    },
];

export const NOTIFICATIONS = [
    { id: "n1", type: "order", orderId: "10241", message: "Your Order #10241 has been received", date: "2026-02-28", read: true },
    { id: "n2", type: "order", orderId: "10241", message: "Your Order #10241 has been shipped", date: "2026-02-25", read: true },
    { id: "n3", type: "order", orderId: "10241", message: "Your Order #10241 is being processed", date: "2026-02-22", read: true },
    { id: "n4", type: "order", orderId: "10241", message: "Your Order #10241 has been paid", date: "2026-02-20", read: true },
    { id: "n5", type: "order", orderId: "10242", message: "Your Order #10242 has been shipped", date: "2026-03-02", read: false },
    { id: "n6", type: "order", orderId: "10242", message: "Your Order #10242 is being processed", date: "2026-03-01", read: true },
    { id: "n7", type: "order", orderId: "10242", message: "Your Order #10242 has been paid", date: "2026-03-01", read: true },
    { id: "n8", type: "order", orderId: "10243", message: "Your Order #10243 is being processed", date: "2026-03-04", read: false },
    { id: "n9", type: "order", orderId: "10243", message: "Your Order #10243 has been paid", date: "2026-03-04", read: false },
    { id: "n10", type: "announcement", orderId: null, message: "🎉 Eid Al-Fitr Collection is now live! Shop the finest thobes and abayas.", date: "2026-03-01", read: false },
    { id: "n11", type: "announcement", orderId: null, message: "🚚 Free shipping on all orders above 10 OMR this weekend only!", date: "2026-02-28", read: true },
];
