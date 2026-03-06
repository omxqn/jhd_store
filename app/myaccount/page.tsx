"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import styles from "./page.module.css";

const DASHBOARD_TILES = [
    { href: "/myaccount/profile", label: "Manage Profile", desc: "Maintain your address, phone, and boutique account details", icon: "👤" },
    { href: "/myaccount/my-orders", label: "My Orders", desc: "Track your bespoke items and order history", icon: "📦" },
    { href: "/myaccount/wishlist", label: "Wishlist", desc: "View and manage your curated desired items", icon: "♥" },
    { href: "/myaccount/notifications", label: "Notifications", desc: "Stay updated on your order status and news", icon: "🔔" },
    { href: "/admin", label: "Admin Panel", desc: "Manage boutique products, orders, and site data", icon: "⚙️", adminOnly: true }
];

export default function AccountPage() {
    const { authUser, setAuthUser } = useStore();

    const handleLogout = () => {
        setAuthUser(null);
        window.location.href = "/";
    };

    if (!authUser) {
        return (
            <div className={styles.page}>
                <div className="container" style={{ textAlign: "center", paddingBlock: "8rem" }}>
                    <div className={styles.cardIcon}>👤</div>
                    <h2 className={styles.welcome}>Authentication Required</h2>
                    <p className={styles.cardDesc} style={{ marginBottom: "2rem" }}>Please sign in to view your boutique account dashboard.</p>
                    <Link href="/login" className="btn btnPrimary btnLg">Sign In to Account</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.welcome}>
                        Welcome Back, <span>{authUser.name.split(' ')[0]}</span>
                    </h1>
                    <p className={styles.subtext}>Your Boutique Personal Hub • {authUser.email}</p>
                </div>

                <div className={styles.grid}>
                    {DASHBOARD_TILES.map(tile => {
                        if (tile.adminOnly && authUser.role !== 'admin') return null;
                        return (
                            <Link key={tile.href} href={tile.href} className={styles.navCard}>
                                <div className={styles.cardIcon}>{tile.icon}</div>
                                <div>
                                    <h3 className={styles.cardTitle}>{tile.label}</h3>
                                    <p className={styles.cardDesc}>{tile.desc}</p>
                                </div>
                                <div className={styles.cardArrow}>
                                    Open {tile.label} <span>→</span>
                                </div>
                            </Link>
                        );
                    })}

                </div>

                <div style={{ textAlign: "center" }}>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        Sign Out of Boutique Account
                    </button>
                </div>
            </div>
        </div>
    );
}
