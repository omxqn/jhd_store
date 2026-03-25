"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

type Ticket = {
    id: number;
    user_name: string;
    user_email: string;
    target: "product" | "order" | "general" | "other";
    label: string;
    subject: string;
    status: "open" | "closed" | "awaiting";
    admin_reply_count: number;
    created_at: string;
    updated_at: string;
};

export default function AdminSupportPage() {
    const { lang, t, isRTL } = useLanguage();
    const { token } = useStore();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const fetchTickets = async () => {
            setLoading(true);

            // Safety timeout: 10s
            const timeout = setTimeout(() => {
                if (loading) setLoading(false);
            }, 10000);

            try {
                const url = filter === "all" ? "/api/admin/support" : `/api/admin/support?status=${filter}`;
                const res = await fetch(url, { 
                    headers: token ? { "Authorization": `Bearer ${token}` } : {} 
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.tickets) setTickets(data.tickets);
                } else if (res.status !== 401) {
                    toast.error(lang === 'ar' ? "فشل تحميل التذاكر" : "Failed to load tickets");
                }
            } catch { 
                // Silent retry or layout redirect
            } finally { 
                clearTimeout(timeout);
                setLoading(false); 
            }
        };
        fetchTickets();
    }, [token, filter]);

    return (
        <div style={{ paddingBottom: "4rem" }}>
            <style jsx>{`
                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 3.5rem;
                }
                .ticket-meta {
                    display: flex;
                    gap: 2.5rem;
                    color: var(--admin-text-muted);
                    font-size: 1.5rem;
                    font-weight: 500;
                }
                @media (max-width: 900px) {
                    .admin-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 2rem;
                    }
                    .ticket-meta {
                        flex-direction: column;
                        gap: 0.75rem;
                    }
                }
            `}</style>
            <div className="admin-header" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    <h1 style={{ fontSize: "3.125rem", fontFamily: "var(--ff-serif)", margin: "0 0 0.75rem 0", color: "var(--admin-text)" }}>{lang === 'ar' ? "مكتب الدعم" : "Support Desk"}</h1>
                    <p style={{ color: "var(--admin-text-muted)", fontSize: "1.56rem", margin: 0 }}>{lang === 'ar' ? "إدارة استفسارات المتجر وحالات التذاكر." : "Manage boutique inquiries and status."}</p>
                </div>
                <select style={{ padding: "0.9rem 1.9rem", fontSize: "1.375rem", borderRadius: "14px", border: "1px solid var(--admin-border)", background: "var(--admin-surface)", color: "var(--admin-text)", cursor: "pointer", textAlign: isRTL ? 'right' : 'left' }} value={filter} onChange={e => setFilter(e.target.value)}>
                    <option value="all">{lang === 'ar' ? "جميع التذاكر" : "All Tickets"}</option>
                    <option value="open">{lang === 'ar' ? "التذاكر المفتوحة" : "Open Tickets"}</option>
                    <option value="closed">{lang === 'ar' ? "التذاكر المغلقة" : "Closed Tickets"}</option>
                </select>
            </div>

            {loading ? (
                <div style={{ padding: "6rem", textAlign: "center", color: "var(--admin-text-muted)", fontSize: "1.875rem" }}>{lang === 'ar' ? "جاري تحميل قائمة الدعم..." : "Loading support queue..."}</div>
            ) : tickets.length === 0 ? (
                <div style={{ padding: "8rem", textAlign: "center", background: "var(--admin-surface)", borderRadius: "24px", border: "2px dashed var(--admin-border)" }}>
                    <div style={{ fontSize: "5rem", opacity: 0.5, marginBottom: "2rem" }}>📥</div>
                    <div style={{ fontWeight: 600, color: "var(--admin-text)", marginBottom: "0.75rem", fontSize: "2.5rem" }}>{lang === 'ar' ? "البريد الوارد فارغ" : "The inbox is clear"}</div>
                    <div style={{ color: "var(--admin-text-muted)", fontSize: "1.375rem" }}>{lang === 'ar' ? "لا توجد تذاكر تطابق هذا الفلتر." : "No tickets matching this filter."}</div>
                </div>
            ) : (
                <div style={{ display: "grid", gap: "1rem" }}>
                    {tickets.map(t => (
                        <Link key={t.id} href={`/admin/support/${t.id}`} style={{ textDecoration: "none" }}>
                            <div style={{ background: "var(--admin-surface)", border: "1px solid var(--admin-border)", borderRadius: "12px", padding: "1.25rem", cursor: "pointer", transition: "all 0.2s", textAlign: isRTL ? 'right' : 'left' }}
                                 onMouseOver={e => e.currentTarget.style.borderColor="var(--admin-primary)"}
                                 onMouseOut={e => e.currentTarget.style.borderColor="var(--admin-border)"}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                    <h3 style={{ margin: 0, fontSize: "1.875rem", color: "var(--admin-text)", fontFamily: "var(--ff-serif)" }}>
                                        #{t.id} — {t.subject}
                                    </h3>
                                    {t.status === "awaiting" ? (
                                        <span style={{ background: "rgba(198, 40, 101, 0.1)", color: "var(--admin-primary)", padding: "10px 25px", borderRadius: "99px", fontSize: "1.125rem", fontWeight: 700, textTransform: "uppercase", display: "flex", alignItems: "center", gap: "10px", flexDirection: isRTL ? 'row-reverse' : 'row' }}><span style={{ width: 10, height: 10, background: "var(--admin-primary)", borderRadius: "50%" }}></span> {lang === 'ar' ? "بانتظار رد العميل" : "AWAITING CUSTOMER REPLY"}</span>
                                    ) : t.status === "open" ? (
                                        t.admin_reply_count > 0 ? (
                                            <span style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "10px 25px", borderRadius: "99px", fontSize: "1.125rem", fontWeight: 700, textTransform: "uppercase", display: "flex", alignItems: "center", gap: "10px", flexDirection: isRTL ? 'row-reverse' : 'row' }}><span style={{ width: 10, height: 10, background: "#10b981", borderRadius: "50%" }}></span> {lang === 'ar' ? "بانتظار رد المسؤول" : "AWAITING ADMIN REPLY"}</span>
                                        ) : (
                                            <span style={{ background: "rgba(0, 0, 0, 0.05)", color: "var(--admin-text-muted)", padding: "10px 25px", borderRadius: "99px", fontSize: "1.125rem", fontWeight: 700, textTransform: "uppercase", display: "flex", alignItems: "center", gap: "10px", flexDirection: isRTL ? 'row-reverse' : 'row' }}><span style={{ width: 10, height: 10, background: "var(--admin-text-muted)", borderRadius: "50%" }}></span> {lang === 'ar' ? "قيد المراجعة" : "UNDER REVIEW"}</span>
                                        )
                                    ) : (
                                        <span style={{ background: "rgba(107, 114, 128, 0.1)", color: "var(--admin-text-muted)", padding: "10px 25px", borderRadius: "99px", fontSize: "1.125rem", fontWeight: 700, textTransform: "uppercase" }}>{lang === 'ar' ? "مغلقة" : "Closed"}</span>
                                    )}
                                </div>
                                <div className="ticket-meta" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                    <span>{lang === 'ar' ? "من:" : "From:"} {t.user_name}</span>
                                    <span>•</span>
                                    <span style={{ textTransform: "capitalize" }}>
                                        {lang === 'ar' ? (t.target === 'product' ? "منتج" : t.target === 'order' ? "طلب" : t.target === 'general' ? "استفسار عام" : "آخر") : t.target}
                                        {t.label ? ` — ${t.label}` : ""}
                                    </span>
                                    <span>•</span>
                                    <span>{t.updated_at ? new Date(t.updated_at).toLocaleDateString(lang === 'ar' ? "ar-SA" : "en-GB") : "—"}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
