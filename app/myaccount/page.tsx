"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import styles from "./page.module.css";
import { useLanguage } from "@/context/LanguageContext";

const DASHBOARD_TILES = [
    { href: "/myaccount/profile", label: "Manage Profile", desc: "Maintain your address, phone, and store account details", icon: "👤" },
    { href: "/myaccount/my-orders", label: "My Orders", desc: "Track your bespoke items and order history", icon: "📦" },
    { href: "/myaccount/wishlist", label: "Wishlist", desc: "View and manage your curated desired items", icon: "♥" },
    { href: "/myaccount/notifications", label: "Notifications", desc: "Stay updated on your order status and news", icon: "🔔" },
    { href: "/myaccount/support", label: "Support Tickets", desc: "Reach out to store services for assistance", icon: "💬" },
    { href: "/admin", label: "Admin Panel", desc: "Manage store products, orders, and site data", icon: "⚙️", adminOnly: true }
];

export default function AccountPage() {
    const { authUser, setAuthUser } = useStore();
    const { lang, t, isRTL } = useLanguage();
    
    const tiles = [
        { href: "/myaccount/profile", label: t('account.profile' as any) || "Manage Profile", desc: lang === 'ar' ? "صيانة العنوان والهاتف وتفاصيل الحساب" : "Maintain your address, phone, and store account details", icon: "👤" },
        { href: "/myaccount/my-orders", label: t('account.my_orders'), desc: lang === 'ar' ? "تتبع القطع الخاصة بك وسجل الطلبات" : "Track your bespoke items and order history", icon: "📦" },
        { href: "/myaccount/wishlist", label: t('nav.most_selling'), desc: lang === 'ar' ? "عرض وإدارة العناصر المفضلة المنسقة" : "View and manage your curated desired items", icon: "♥" },
        { href: "/myaccount/notifications", label: t('account.notifications'), desc: lang === 'ar' ? "ابق على اطلاع بحالة طلبك والأخبار" : "Stay updated on your order status and news", icon: "🔔" },
        { href: "/myaccount/support", label: t('account.support_tickets'), desc: lang === 'ar' ? "تواصل مع خدمات المتجر للمساعدة" : "Reach out to store services for assistance", icon: "💬" },
        { href: "/admin", label: lang === 'ar' ? "لوحة التحكم" : "Admin Panel", desc: lang === 'ar' ? "إدارة المنتجات والطلبات وبيانات الموقع" : "Manage store products, orders, and site data", icon: "⚙️", adminOnly: true }
    ];

    const handleLogout = () => {
        setAuthUser(null);
        window.location.href = "/";
    };

    if (!authUser) {
        return (
            <div className={styles.page}>
                <div className="container" style={{ textAlign: "center", paddingBlock: "8rem" }}>
                    <div className={styles.cardIcon}>👤</div>
                    <h2 className={styles.welcome}>{lang === 'ar' ? "مطلوب تسجيل الدخول" : "Authentication Required"}</h2>
                    <p className={styles.cardDesc} style={{ marginBottom: "2rem" }}>{lang === 'ar' ? "الرجاء تسجيل الدخول لعرض لوحة حساب المتجر الخاص بك." : "Please sign in to view your store account dashboard."}</p>
                    <Link href="/login" className="btn btnPrimary btnLg">{lang === 'ar' ? "تسجيل الدخول للحساب" : "Sign In to Account"}</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.welcome}>
                        {lang === 'ar' ? "أهلاً بك مجدداً، " : "Welcome Back, "} <span>{authUser.name.split(' ')[0]}</span>
                    </h1>
                    <p className={styles.subtext}>{lang === 'ar' ? "مركزك الشخصي في المتجر" : "Your Store Personal Hub"} • {authUser.email}</p>
                </div>

                <div className={styles.grid}>
                    {tiles.map(tile => {
                        if (tile.adminOnly && authUser.role !== 'admin') return null;
                        return (
                            <Link key={tile.href} href={tile.href} className={styles.navCard}>
                                <div className={styles.cardIcon}>{tile.icon}</div>
                                <div>
                                    <h3 className={styles.cardTitle}>{tile.label}</h3>
                                    <p className={styles.cardDesc}>{tile.desc}</p>
                                </div>
                                <div className={styles.cardArrow}>
                                    {lang === 'ar' ? "فتح" : "Open"} {tile.label} <span>{isRTL ? "←" : "→"}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div style={{ textAlign: "center" }}>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        {t('common.sign_out')}
                    </button>
                </div>
            </div>
        </div>
    );
}
