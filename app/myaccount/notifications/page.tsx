"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import Link from "next/link";
import toast from "react-hot-toast";
import styles from "./page.module.css";

type Notification = {
    id: number;
    type: "order" | "announcement";
    message: string;
    order_id: number | null;
    read: number;
    created_at: string;
};

export default function NotificationsPage() {
    const { authUser } = useStore();
    const [notifs, setNotifs] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifs = () => {
        fetch("/api/notifications")
            .then(r => r.json())
            .then(d => setNotifs(d.notifications || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!authUser) { setLoading(false); return; }
        fetchNotifs();
    }, [authUser]);

    const markAllRead = async () => {
        await fetch("/api/notifications", { method: "PATCH" });
        setNotifs(n => n.map(x => ({ ...x, read: 1 })));
        window.dispatchEvent(new Event("notif-update"));
        toast.success("Curated list marked as read");
    };

    const markOneRead = async (id: number) => {
        await fetch("/api/notifications", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        setNotifs(n => n.map(x => x.id === id ? { ...x, read: 1 } : x));
        window.dispatchEvent(new Event("notif-update"));
    };

    const unread = notifs.filter(n => !n.read).length;

    if (!authUser) return (
        <div className={styles.page}>
            <div className="container" style={{ textAlign: "center", paddingBlock: "8rem" }}>
                <div className={styles.emptyIcon}>👤</div>
                <h2 className={styles.title} style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>Boutique Access Required</h2>
                <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Please sign in to view your bespoke notifications.</p>
                <Link href="/login" className="btn btnPrimary">Sign In ○</Link>
            </div>
        </div>
    );

    return (
        <div className={styles.page}>
            <div className="container" style={{ maxWidth: 800 }}>
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        Notifications {unread > 0 && <span>• {unread} New</span>}
                    </h1>
                    {unread > 0 && (
                        <button className="btn btnGhost btnSm" onClick={markAllRead} style={{ color: "var(--primary)", fontWeight: 700 }}>
                            Clear Unread ○
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className={styles.emptyState}>
                        <div style={{ fontSize: "2rem", marginBottom: "1rem", animation: "spin 2s linear infinite" }}>⌛</div>
                        <p className={styles.meta}>Refreshing your feed...</p>
                        <style>{`@keyframes spin { from {transform:rotate(0deg)} to {transform:rotate(360deg)} }`}</style>
                    </div>
                ) : notifs.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🔔</div>
                        <h2 className={styles.title} style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>All quiet</h2>
                        <p style={{ color: "var(--text-muted)" }}>We'll notify you here about your orders and boutique updates.</p>
                    </div>
                ) : (
                    <div className={styles.feed}>
                        {notifs.map(notif => (
                            <div
                                key={notif.id}
                                onClick={() => { if (!notif.read) markOneRead(notif.id); }}
                                className={`${styles.notif} ${!notif.read ? styles.notifUnread : ""}`}
                            >
                                <div className={`${styles.iconBox} ${notif.type === "order" ? styles.iconBoxOrder : styles.iconBoxPromo}`}>
                                    {notif.type === "order" ? "💼" : "✧"}
                                </div>

                                <div className={styles.content}>
                                    <p className={styles.message}>{notif.message}</p>
                                    <div className={styles.meta}>
                                        <span>{new Date(notif.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                                        {notif.order_id && (
                                            <Link href={`/myaccount/order-detail?id=${notif.order_id}`}
                                                className={styles.viewLink}
                                                onClick={e => e.stopPropagation()}>
                                                Trace Order →
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {!notif.read && <div className={styles.unreadDot} />}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
