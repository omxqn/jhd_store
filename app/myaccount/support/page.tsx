"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

type Ticket = {
    id: number;
    target: "product" | "order" | "general" | "other";
    label: string;
    subject: string;
    status: string;
    admin_reply_count: number;
    created_at: string;
    updated_at: string;
};

export default function SupportPage() {
    const { authUser, token } = useStore();
    const { lang, t, isRTL } = useLanguage();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [target, setTarget] = useState("general");
    const [label, setLabel] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const fetchTickets = async () => {
        setLoading(true);

        // Safety timeout
        const timeout = setTimeout(() => {
            if (loading) setLoading(false);
        }, 8000);

        try {
            const res = await fetch("/api/support", {
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

    useEffect(() => {
        fetchTickets();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { setIsLoading } = useStore.getState();
        setIsLoading(true);
        setCreating(true);
        try {
            const res = await fetch("/api/support", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ target, label, subject, message })
            });
            if (res.ok) {
                toast.success(lang === 'ar' ? "تم فتح تذكرة الدعم" : "Support ticket opened");
                setTarget("general"); setLabel(""); setSubject(""); setMessage("");
                fetchTickets();
            } else {
                const data = await res.json();
                toast.error(data.error || (lang === 'ar' ? "فشل إنشاء التذكرة" : "Failed to create ticket"));
            }
        } finally {
            setCreating(false);
            setIsLoading(false);
            setIsModalOpen(false); // Close modal on success
        }
    };

    const TicketForm = () => (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.5rem", textAlign: isRTL ? 'right' : 'left' }}>
            <h2 style={{ fontSize: "1.75rem", borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginBottom: "1.25rem", marginTop: 0, fontFamily: "var(--ff-serif)" }}>{lang === 'ar' ? "فتح تذكرة جديدة" : "Open New Ticket"}</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                    <label style={{ display: "block", fontSize: "1.5rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>{lang === 'ar' ? "الموضوع / الهدف" : "Topic / Target"}</label>
                    <select className="formSelect" value={target} onChange={e => { setTarget(e.target.value); setLabel(""); }} required style={{ fontSize: "1rem" }}>
                        <option value="general">{lang === 'ar' ? "استفسار عام" : "General Inquiry"}</option>
                        <option value="order">{lang === 'ar' ? "مشكلة طلب" : "Order Issue"}</option>
                        <option value="product">{lang === 'ar' ? "سؤال منتج" : "Product Question"}</option>
                        <option value="other">{lang === 'ar' ? "آخر" : "Other"}</option>
                    </select>
                </div>

                {(target === "order" || target === "product") && (
                    <div>
                        <label style={{ display: "block", fontSize: "1.5rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>{target === "order" ? (lang === 'ar' ? "رقم الطلب" : "Order ID") : (lang === 'ar' ? "اسم المنتج أو الرقم" : "Product Name or ID")}</label>
                        <input className="formInput" placeholder={target === "order" ? (lang === 'ar' ? "مثال: 1045" : "e.g. 1045") : (lang === 'ar' ? "مثال: ثوب ملكي" : "e.g. Royal Thobe")} value={label} onChange={e => setLabel(e.target.value)} required style={{ fontSize: "1.2rem" }} />
                    </div>
                )}

                <div>
                    <label style={{ display: "block", fontSize: "1.5rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>{lang === 'ar' ? "الموضوع" : "Subject"}</label>
                    <input className="formInput" placeholder={lang === 'ar' ? "وصف مختصر للمشكلة" : "Brief description of the issue"} value={subject} onChange={e => setSubject(e.target.value)} required style={{ fontSize: "1.2rem" }} />
                </div>

                <div>
                    <label style={{ display: "block", fontSize: "1.5rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>{lang === 'ar' ? "الرسالة" : "Message"}</label>
                    <textarea className="formInput" placeholder={lang === 'ar' ? "الرجاء تقديم التفاصيل..." : "Please provide details..."} style={{ height: "120px", resize: "vertical", fontSize: "1.2rem" }} value={message} onChange={e => setMessage(e.target.value)} required />
                </div>

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    {isModalOpen && (
                        <button type="button" className="btn btnGhost" onClick={() => setIsModalOpen(false)} style={{ width: "100%", justifyContent: "center" }}>
                            {lang === 'ar' ? "إلغاء" : "Cancel"}
                        </button>
                    )}
                    <button type="submit" className="btn btnPrimary" disabled={creating} style={{ width: "100%", justifyContent: "center" }}>
                        {creating ? (lang === 'ar' ? "جاري الإرسال..." : "Submitting...") : (lang === 'ar' ? "إرسال التذكرة" : "Submit Ticket")}
                    </button>
                </div>
            </form>
        </div>
    );

    const statusBadge = (ticket: Ticket) => {
        const { status, admin_reply_count } = ticket;
        if (status === "awaiting") return <span style={{ background: "rgba(198, 40, 101, 0.1)", color: "var(--primary)", padding: "6px 16px", borderRadius: "99px", fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "8px" }}><span style={{ width: 8, height: 8, background: "var(--primary)", borderRadius: "50%" }}></span> {lang === 'ar' ? "بانتظار ردك" : "AWAITING YOUR REPLY"}</span>;
        if (status === "open") {
            if (admin_reply_count > 0) {
                return <span style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--success)", padding: "6px 16px", borderRadius: "99px", fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "8px" }}><span style={{ width: 8, height: 8, background: "var(--success)", borderRadius: "50%" }}></span> {lang === 'ar' ? "بانتظار رد الإدارة" : "AWAITING ADMIN REPLY"}</span>;
            } else {
                return <span style={{ background: "rgba(0, 0, 0, 0.05)", color: "var(--text-muted)", padding: "6px 16px", borderRadius: "99px", fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "8px" }}><span style={{ width: 8, height: 8, background: "var(--text-muted)", borderRadius: "50%" }}></span> {lang === 'ar' ? "قيد المراجعة" : "UNDER REVIEW"}</span>;
            }
        }
        return <span style={{ background: "rgba(107, 114, 128, 0.1)", color: "var(--text-muted)", padding: "6px 16px", borderRadius: "99px", fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "8px" }}>{lang === 'ar' ? "مغلقة" : "CLOSED"}</span>;
    };
    return (
        <div style={{ padding: "4rem 0", background: "var(--bg)", minHeight: "100vh" }}>
            <style jsx>{`
                .support-grid {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) 350px;
                    gap: 2rem;
                    align-items: start;
                }
                .support-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .sidebar-form {
                    display: block;
                }
                .mobile-add-btn {
                    display: none;
                }
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(8px);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    opacity: 0;
                    pointer-events: none;
                    transition: all 0.3s ease;
                }
                .modal-overlay.open {
                    opacity: 1;
                    pointer-events: auto;
                }
                .modal-content {
                    width: 100%;
                    max-width: 500px;
                    transform: translateY(20px);
                    transition: all 0.3s ease;
                }
                .modal-overlay.open .modal-content {
                    transform: translateY(0);
                }
                @media (max-width: 900px) {
                    .support-grid {
                        grid-template-columns: 1fr;
                    }
                    .support-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1.5rem;
                    }
                    .sidebar-form {
                        display: none;
                    }
                    .mobile-add-btn {
                        display: inline-flex;
                    }
                }
            `}</style>

            <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`} onClick={() => setIsModalOpen(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <TicketForm />
                </div>
            </div>

            <div className="container" style={{ maxWidth: "1000px" }}>
                <div className="support-header">
                    <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
                        <h1 style={{ fontSize: "2.5rem", fontFamily: "var(--ff-serif)", margin: "0 0 0.5rem 0" }}>{t('account.support_tickets')}</h1>
                        <p style={{ color: "var(--text-muted)", fontSize: "1.7rem", margin: 0 }}>{lang === 'ar' ? "تواصل مع فريق العناية بالبوتيك للحصول على المساعدة." : "Reach out to our boutique care team for assistance."}</p>
                    </div>
                    <Link href="/myaccount" className="btn btnOutline" style={{ fontSize: "1.3rem", padding: "0.75rem 1.5rem" }}>{isRTL ? "لوحة التحكم ←" : "← Dashboard"}</Link>
                </div>

                <div className="support-grid">

                    {/* Ticket List */}
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                            <h2 style={{ fontSize: "1.75rem", fontFamily: "var(--ff-serif)", margin: 0, textAlign: isRTL ? 'right' : 'left' }}>{lang === 'ar' ? "محادثاتك" : "Your Conversations"}</h2>
                            <button className="btn btnPrimary mobile-add-btn" onClick={() => setIsModalOpen(true)} style={{ fontSize: "1.2rem", padding: "0.5rem 1rem" }}>
                                {lang === 'ar' ? "+ تذكرة جديدة" : "+ New Ticket"}
                            </button>
                        </div>
                        {loading ? (
                            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "1.1rem" }}>{t('common.loading')}</div>
                        ) : tickets.length === 0 ? (
                            <div style={{ padding: "3rem", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "12px" }}>
                                <div style={{ fontSize: "3.5rem", opacity: 0.5, marginBottom: "1rem" }}>💬</div>
                                <h3 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{lang === 'ar' ? "لا توجد تذاكر دعم" : "No Support Tickets"}</h3>
                                <p style={{ color: "var(--text-muted)", fontSize: "1.5rem" }}>{lang === 'ar' ? "لم تفتحي أي طلبات دعم بعد." : "You haven't opened any support requests yet."}</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {tickets.map(t => (
                                    <Link key={t.id} href={`/myaccount/support/${t.id}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
                                        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.25rem", transition: "all 0.2s", cursor: "pointer" }}
                                            onMouseOver={e => e.currentTarget.style.borderColor = "var(--primary)"}
                                            onMouseOut={e => e.currentTarget.style.borderColor = "var(--border)"}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                                <h3 style={{ margin: 0, fontSize: "1.5rem", fontFamily: "var(--ff-serif)" }}>{t.subject}</h3>
                                                {statusBadge(t)}
                                            </div>
                                            <div style={{ display: "flex", gap: "1rem", color: "var(--text-muted)", fontSize: "1.2rem", fontWeight: 600 }}>
                                                <span>#{t.id}</span>
                                                <span>•</span>
                                                <span style={{ textTransform: "capitalize" }}>{t.target === 'general' ? (lang === 'ar' ? "استفسار عام" : "General Inquiry") : t.target === 'order' ? (lang === 'ar' ? "مشكلة طلب" : "Order Issue") : t.target === 'product' ? (lang === 'ar' ? "سؤال منتج" : "Product Question") : (lang === 'ar' ? "آخر" : "Other")} {t.label ? `— ${t.label}` : ""}</span>
                                                <span>•</span>
                                                <span>{t.updated_at ? new Date(t.updated_at).toLocaleDateString(lang === 'ar' ? "ar-SA" : "en-US") : "—"}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* New Ticket Form (Sidebar) */}
                    <div className="sidebar-form">
                        <TicketForm />
                    </div>

                </div>
            </div>
        </div>
    );
}
