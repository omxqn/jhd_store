"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

export default function TicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { token, authUser } = useStore();
    const { lang, t, isRTL } = useLanguage();
    const id = params.id as string;

    const [ticket, setTicket] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const replyTextRef = useRef("");

    useEffect(() => {
        replyTextRef.current = replyText;
    }, [replyText]);

    const fetchTicket = async (isBackground = false) => {
        if (isNaN(Number(id))) {
            router.push("/myaccount/support");
            return;
        }
        if (!token) {
            if (!isBackground) setLoading(false);
            return;
        }

        if (!isBackground) setLoading(true);

        // Safety timeout to prevent infinite Loading... state
        const timeout = setTimeout(() => {
            if (loading && !isBackground) setLoading(false);
        }, 8000);

        try {
            const res = await fetch(`/api/support/${id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Only update if critical data changed to prevent ALL React re-renders during polling
                setTicket((prev: any) => {
                    if (!prev) return data.ticket;
                    if (prev.status !== data.ticket?.status) return data.ticket;
                    return prev;
                });
                setMessages((prev: any[]) => {
                    const newMsgs = data.messages || [];
                    if (prev.length !== newMsgs.length) return newMsgs;
                    const prevIds = prev.map(m => m.id).join(',');
                    const newIds = newMsgs.map((m: any) => m.id).join(',');
                    if (prevIds !== newIds) return newMsgs;
                    return prev; // Totally bail out if IDs match
                });
            } else {
                const data = await res.json().catch(() => ({}));
                // Only toast if it's NOT an unauthorized error (layout handles that)
                if (res.status !== 401 && !isBackground) {
                    toast.error(data.error || "Failed to load ticket");
                }
                if (res.status === 404 || res.status === 401) {
                    router.push("/myaccount/support");
                }
            }
        } catch (err) {
            console.error("Support detail fetch error:", err);
        } finally {
            clearTimeout(timeout);
            if (!isBackground) setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket();
        // Auto-refresh every 3 seconds
        const interval = setInterval(() => {
            if (!replyTextRef.current.trim()) fetchTicket(true);
        }, 3000);
        return () => clearInterval(interval);
    }, [id, token]);

    const prevMsgCountRef = useRef(0);
    const isFirstLoad = useRef(true);
    useEffect(() => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            
            if (isFirstLoad.current && messages.length > 0) {
                // Aggressive instant scroll on first load
                container.style.scrollBehavior = "auto";
                container.scrollTop = container.scrollHeight;
                
                // Fallback timeout to ensure DOM painted
                setTimeout(() => {
                    if (scrollContainerRef.current) {
                        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
                    }
                }, 100);
                
                isFirstLoad.current = false;
                prevMsgCountRef.current = messages.length;
            } else if (messages.length > prevMsgCountRef.current && !isFirstLoad.current) {
                // Smooth scroll for subsequent new messages
                container.style.scrollBehavior = "smooth";
                container.scrollTop = container.scrollHeight;
                prevMsgCountRef.current = messages.length;
            }
        }
    }, [messages.length]);

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        const { setIsLoading } = useStore.getState();
        setIsLoading(true);
        setReplying(true);
        try {
            const res = await fetch(`/api/support/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ message: replyText })
            });
            if (res.ok) {
                setReplyText("");
                fetchTicket();
            } else {
                toast.error("Failed to send reply");
            }
        } finally {
            setReplying(false);
            setIsLoading(false);
        }
    };

    if (loading) return <div style={{ padding: "4rem", textAlign: "center" }}>{t('common.loading')}</div>;
    if (!ticket) return null;

    const timeDiff = (dateStr: string) => {
        if (!dateStr) return "0";
        try {
            const diff = Math.abs(Date.now() - new Date(dateStr).getTime());
            const mins = Math.floor(diff / 60000);
            if (mins < 60) return `${mins}${lang === 'ar' ? 'د' : 'm'}`;
            const hrs = Math.floor(mins / 60);
            if (hrs < 24) return `${hrs}${lang === 'ar' ? 'س' : 'h'}`;
            return `${Math.floor(hrs / 24)}${lang === 'ar' ? 'ي' : 'd'}`;
        } catch { return "0"; }
    };

    const isOpen = ticket.status === "open" || ticket.status === "awaiting";

    return (
        <div style={{ padding: "4rem 0", background: "var(--bg)", minHeight: "100vh" }}>
            <style jsx>{`
                .chat-messages::-webkit-scrollbar { width: 6px; }
                .chat-messages::-webkit-scrollbar-track { background: transparent; }
                .chat-messages::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
                .chat-messages {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0,0,0,0.1) transparent;
                    background-color: var(--surface-2);
                    background-image: radial-gradient(circle at 2px 2px, rgba(0,0,0,0.015) 1px, transparent 0);
                    background-size: 20px 20px;
                }
            `}</style>
            <div className="container" style={{ maxWidth: "800px" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <Link href="/myaccount/support" className="btn btnOutline" style={{ padding: "0.8rem 1.25rem", fontSize: "1.3rem" }}>{isRTL ? "العودة للتذاكر ←" : "← Back to Tickets"}</Link>
                    <div style={{
                        background: ticket.status === "awaiting" ? "rgba(198, 40, 101, 0.1)" : (isOpen && ticket.admin_reply_count > 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(0,0,0,0.05)"),
                        color: ticket.status === "awaiting" ? "var(--primary)" : (isOpen && ticket.admin_reply_count > 0 ? "var(--success)" : "var(--text-muted)"),
                        padding: "8px 20px", borderRadius: "99px", fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", display: "flex", alignItems: "center", gap: "8px"
                    }}>
                        {ticket.status === "awaiting" ? (
                            <>
                                <span style={{ width: 8, height: 8, background: "var(--primary)", borderRadius: "50%" }}></span>
                                {lang === 'ar' ? "بانتظار ردك" : "Awaiting your Reply"}
                            </>
                        ) : isOpen ? (
                            <>
                                <span style={{ width: 8, height: 8, background: (ticket.admin_reply_count > 0 ? "var(--success)" : "var(--text-muted)"), borderRadius: "50%" }}></span>
                                {ticket.admin_reply_count > 0 ? (lang === 'ar' ? "بانتظار رد الإدارة" : "Awaiting Admin Reply") : (lang === 'ar' ? "قيد المراجعة" : "Under Review")}
                            </>
                        ) : (
                            lang === 'ar' ? "مغلقة" : "Closed"
                        )}
                    </div>
                </div>

                <div style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    height: "calc(100vh - 160px)",
                    minHeight: "650px",
                    maxHeight: "900px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
                }}>



                    {/* Header */}
                    <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)", background: "rgba(0,0,0,0.01)", textAlign: isRTL ? 'right' : 'left' }}>
                        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#3a3838ff", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "1px" }}>{lang === 'ar' ? "تذكرة رقم" : "Ticket #"} #{ticket.id}</div>
                        <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "1.75rem", fontFamily: "var(--ff-serif)" }}>{ticket.subject}</h1>
                        <div style={{ display: "flex", gap: "1rem", color: "#3a3838ff", fontSize: "1.4rem", fontWeight: 600, flexWrap: "wrap", marginTop: "1rem" }}>
                            <span style={{ textTransform: "capitalize" }}>{lang === 'ar' ? "الهدف" : "Target"}: {ticket.target === 'general' ? (lang === 'ar' ? "استفسار عام" : "General Inquiry") : ticket.target === 'order' ? (lang === 'ar' ? "مشكلة طلب" : "Order Issue") : ticket.target === 'product' ? (lang === 'ar' ? "سؤال منتج" : "Product Question") : (lang === 'ar' ? "آخر" : "Other")} {ticket.label ? `(${ticket.label})` : ""}</span>
                            <span>•</span>
                            <span>{lang === 'ar' ? "تاريخ الفتح" : "Opened"}: {ticket.created_at ? new Date(ticket.created_at).toLocaleString(lang === 'ar' ? "ar-SA" : "en-US") : "—"}</span>
                            {ticket.updated_at && (
                                <>
                                    <span>•</span>
                                    <span>{lang === 'ar' ? "آخر نشاط قبل" : "Last activity"}: {timeDiff(ticket.updated_at)} {lang === 'ar' ? "" : "ago"}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Conversation log - Scrollable Area */}
                    <div
                        ref={scrollContainerRef}
                        className="chat-messages"
                        style={{
                            padding: "1.5rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "2rem",
                            overflowY: "auto",
                            flex: 1
                        }}
                    >
                        {messages.length === 0 ? (
                            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "1.2rem" }}>
                                {t('support.no_messages')}
                            </div>
                        ) : messages.map((m, i) => {
                            const isAdmin = m.sender_type === "admin";
                            const isMe = !isAdmin;
                            return (
                                <div key={m.id} style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: isMe ? (isRTL ? "flex-start" : "flex-end") : (isRTL ? "flex-end" : "flex-start"),
                                    marginBottom: "1rem",
                                    flexShrink: 0
                                }}>
                                    <div style={{
                                        fontSize: "1.3rem",
                                        fontWeight: 700,
                                        color: "var(--text-muted)",
                                        marginBottom: "0.5rem",
                                        marginInline: "0.7rem",
                                        opacity: 1
                                    }}>
                                        {isAdmin ? t('support.admin_support') : t('support.you')} • {m.created_at ? new Date(m.created_at).toLocaleTimeString(lang === 'ar' ? "ar-SA" : "en-US", { hour: '2-digit', minute: '2-digit' }) : "—"}
                                    </div>
                                    <div style={{
                                        background: isAdmin ? "#fce4ec" : "var(--primary)",
                                        color: isAdmin ? "#c62865" : "#fff",
                                        padding: "1.2rem 1.9rem",
                                        borderRadius: "20px",
                                        borderBottomLeftRadius: isMe ? (isRTL ? "4px" : "20px") : (isRTL ? "20px" : "4px"),
                                        borderBottomRightRadius: isMe ? (isRTL ? "20px" : "4px") : (isRTL ? "4px" : "20px"),
                                        maxWidth: "85%",
                                        lineHeight: 1.5,
                                        fontSize: "1.9rem",
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                        overflowWrap: "anywhere",
                                        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                                        border: isAdmin ? "1px solid var(--border)" : "none",
                                        textAlign: isRTL ? 'right' : 'left'
                                    }}>
                                        {m.message}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Reply box - Pinned at bottom */}
                    <div style={{ padding: "1.5rem 2rem", borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
                        {isOpen ? (
                            <form onSubmit={handleReply} style={{ display: "flex", gap: "1rem", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                <textarea className="formInput" placeholder={t('support.reply_placeholder')} style={{ flex: 1, minHeight: "120px", resize: "vertical", fontSize: "1.3rem", textAlign: isRTL ? 'right' : 'left', padding: "1.2rem", lineHeight: "1.5" }} value={replyText} onChange={e => setReplyText(e.target.value)} required onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleReply(e as any);
                                    }
                                }} />
                                <button type="submit" className="btn btnPrimary" disabled={replying} style={{ alignSelf: "flex-end" }}>
                                    {replying ? "..." : t('support.send')}
                                </button>
                            </form>
                        ) : (
                            <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "1rem", fontWeight: 600, padding: "1rem" }}>
                                {t('support.ticket_closed')}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
