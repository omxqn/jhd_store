"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import styles from "./admin.module.css";

const NAV = [
    { href: "/admin", icon: "📊", label: "Dashboard" },
    { href: "/admin/products", icon: "🛍️", label: "Products" },
    { href: "/admin/orders", icon: "📦", label: "Orders" },
    { href: "/admin/users", icon: "👥", label: "Users", superOnly: true },
    { href: "/admin/vouchers", icon: "🎟️", label: "Vouchers" },
    { href: "/admin/categories", icon: "🗂️", label: "Categories" },
    { href: "/admin/necklines", icon: "👔", label: "Necklines" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { authUser, clearAuth, verifyAuth } = useStore();
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        const check = async () => {
            await verifyAuth();
            setVerifying(false);
        };
        check();
    }, []);

    useEffect(() => {
        if (!verifying) {
            if (authUser && authUser.role !== "admin" && authUser.role !== "super_admin") {
                toast.error("Admin access required");
                router.replace("/");
            } else if (!authUser) {
                toast.error("Please sign in");
                router.replace("/login");
            }
        }
    }, [authUser, verifying]);

    if (verifying) return <div style={{ background: "#0c0c0c", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--admin-primary)", fontSize: "1.5rem" }}>⌛ Verifying Identity…</div>;

    if (!authUser || (authUser.role !== "admin" && authUser.role !== "super_admin")) return null;

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        clearAuth();
        router.push("/login");
    };

    return (
        <div className={styles.adminLayout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                {/* Logo */}
                <div className={styles.logoArea}>
                    <div style={{ display: "flex", alignItems: "center", gap: ".625rem", marginBottom: ".5rem" }}>
                        <div className={styles.logoIcon}>ج</div>
                        <span className={styles.logoText}>Admin Panel</span>
                    </div>
                    <p style={{ fontSize: ".7rem", color: "var(--admin-text-muted)" }}>{authUser.role === 'super_admin' ? 'Super Admin Mode' : 'Jihad Store Management'}</p>
                </div>

                {/* Nav */}
                <nav className={styles.nav}>
                    {NAV.map(n => {
                        if (n.superOnly && authUser.role !== "super_admin") return null;
                        const isExact = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
                        return (
                            <Link key={n.href} href={n.href} className={`${styles.navLink} ${isExact ? styles.navLinkActive : ""}`}>
                                <span>{n.icon}</span>{n.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className={styles.sidebarFooter}>
                    <div style={{ fontSize: ".8rem", color: "var(--admin-text)", marginBottom: ".75rem", fontWeight: 500 }}>
                        <span style={{ color: "var(--admin-primary)", marginRight: 6 }}>●</span> {authUser.name.split(' ')[0]}
                    </div>
                    <button onClick={handleLogout} className={styles.adminBtnSecondary} style={{ width: "100%", padding: ".5rem", borderRadius: ".5rem", fontSize: ".8rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        🚪 Sign Out
                    </button>
                    <Link href="/" style={{ display: "block", textAlign: "center", marginTop: ".75rem", fontSize: ".75rem", color: "var(--admin-text-muted)", textDecoration: "none" }}>
                        ← Back to store
                    </Link>
                </div>
            </aside>

            {/* Main */}
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
