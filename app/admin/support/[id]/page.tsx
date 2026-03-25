"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminTicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { authUser, token } = useStore();
    const { lang, t, isRTL } = useLanguage();
    const id = params.id as string;

    const [ticket, setTicket] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [replying, setReplying] = useState(false);
    const [closing, setClosing] = useState(false);
    const [replyText, setReplyText] = useState("");
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const replyTextRef = useRef("");

    useEffect(() => {
        replyTextRef.current = replyText;
    }, [replyText]);

    const fetchTicket = async (isBackground = false) => {
        if (!token) {
            if (!isBackground) setLoading(false);
            return;
        }

        if (!isBackground) setLoading(true);

        const timeout = setTimeout(() => {
            if (loading && !isBackground) setLoading(false);
        }, 10000);

        try {
            const res = await fetch(`/api/admin/support/${id}`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
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
                if (res.status !== 401 && !isBackground) {
                    toast.error(data.error || (lang === 'ar' ? "فشل تحميل التذكرة" : "Failed to load ticket"));
                }
                if (res.status === 404 || res.status === 401) {
                    router.push("/admin/support");
                }
            }
        } catch {
            if (!isBackground) toast.error(lang === 'ar' ? "فشل تحميل التذكرة" : "Failed to load ticket");
        } finally {
            clearTimeout(timeout);
            if (!isBackground) setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket();
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

    const handleAction = async (action: "reply" | "close") => {
        if (action === "reply" && !replyText.trim()) return;

        const { setIsLoading } = useStore.getState();
        setIsLoading(true);
        const setter = action === "reply" ? setReplying : setClosing;
        setter(true);
        try {
            const res = await fetch(`/api/admin/support/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: action === "reply" ? replyText : "",
                    status: action === "close" ? "closed" : (action === "reply" ? "awaiting" : ticket.status)
                })
            });
            if (res.ok) {
                if (action === "reply") { toast.success(lang === 'ar' ? "تم إرسال الرد وإخطار العميل" : "Reply sent & user notified"); setReplyText(""); }
                else { toast.success(lang === 'ar' ? "تم إغلاق التذكرة" : "Ticket closed"); }
                fetchTicket();
            } else {
                toast.error(lang === 'ar' ? "فشل الإجراء" : "Action failed");
            }
        } finally {
            setter(false);
            setIsLoading(false);
        }
    };

    if (loading) return <div style={{ padding: "4rem", textAlign: "center", color: "var(--admin-text-muted)" }}>{t('common.loading')}</div>;
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
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: isRTL ? 'right' : 'left', paddingBottom: "2rem" }}>
            <style jsx>{`
                .detail-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                .meta-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 2rem;
                    margin-top: 1.5rem;
                    padding: 1.5rem;
                    background: rgba(0,0,0,0.02);
                    border-radius: 12px;
                    border: 1px solid var(--admin-border);
                    font-size: 1.4rem;
                }
                .msg-bubble {
                    max-width: 85%;
                }
                .chat-messages::-webkit-scrollbar { width: 6px; }
                .chat-messages::-webkit-scrollbar-track { background: transparent; }
                .chat-messages::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
                .chat-messages {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0,0,0,0.1) transparent;
                    background-color: var(--admin-bg);
                    background-image: radial-gradient(circle at 2px 2px, rgba(0,0,0,0.02) 1px, transparent 0);
                    background-size: 24px 24px;
                }
                @media (max-width: 900px) {
                    .detail-header {
                        flex-direction: column-reverse;
                        align-items: stretch;
                        gap: 1.5rem;
                    }
                    .meta-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                    .msg-bubble {
                        max-width: 95%;
                    }
                }
            `}</style>
            <div className="detail-header" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <Link href="/admin/support" className="btn btnOutline" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>{lang === 'ar' ? "← العودة للدعم" : "← Back to Support"}</Link>
                {ticket.status === "awaiting" ? (
                    <div style={{ padding: "8px 20px", background: "rgba(198, 40, 101, 0.1)", color: "var(--admin-primary)", borderRadius: "8px", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <span style={{ width: 8, height: 8, background: "var(--admin-primary)", borderRadius: "50%" }}></span>
                        {lang === 'ar' ? "بانتظار رد العميل" : "Awaiting Customer Reply"}
                    </div>
                ) : isOpen ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                        <div style={{ padding: "8px 20px", background: "rgba(16, 185, 129, 0.1)", color: "var(--success)", borderRadius: "8px", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                            <span style={{ width: 8, height: 8, background: "var(--success)", borderRadius: "50%" }}></span>
                            {lang === 'ar' ? "بانتظار رد المسؤول" : "Awaiting Admin Reply"}
                        </div>
                        <button onClick={() => handleAction("close")} disabled={closing} style={{ background: "rgba(239, 68, 68, 0.05)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "8px 20px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", fontSize: "1rem" }}>
                            {closing ? "..." : (lang === 'ar' ? "إغلاق التذكرة 🔒" : "Close Ticket 🔒")}
                        </button>
                    </div>
                ) : (
                    <div style={{ padding: "8px 20px", background: "rgba(107, 114, 128, 0.1)", color: "var(--admin-text-muted)", borderRadius: "8px", fontWeight: 700, fontSize: "1rem" }}>{lang === 'ar' ? "مغلقة 🔒" : "Closed 🔒"}</div>
                )}
            </div>

            <div style={{
                background: "var(--admin-surface)",
                border: "1px solid var(--admin-border)",
                borderRadius: "16px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                height: "calc(100vh - 160px)",
                minHeight: "650px",
                maxHeight: "1000px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
            }}>



                {/* Header */}
                <div style={{ padding: "2rem", borderBottom: "1px solid var(--admin-border)", textAlign: isRTL ? 'right' : 'left' }}>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--admin-primary)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "2px" }}>{lang === 'ar' ? "تذكرة #" : "Ticket #"} {ticket.id}</div>
                    <h1 style={{ margin: "0 0 1rem 0", fontSize: "2.5rem", color: "var(--admin-text)", fontFamily: "var(--ff-serif)" }}>{ticket.subject}</h1>

                    <div className="meta-grid" style={{ fontSize: "1.6rem" }}>
                        <div>
                            <div style={{ color: "var(--admin-text-muted)", marginBottom: "0.5rem", fontWeight: 700, fontSize: "1.3rem" }}>{lang === 'ar' ? "العميل" : "Customer"}</div>
                            <div style={{ color: "var(--admin-text)" }}>{ticket.user_name} ({ticket.user_email})</div>
                        </div>
                        <div>
                            <div style={{ color: "var(--admin-text-muted)", marginBottom: "0.5rem", fontWeight: 700, fontSize: "1.3rem" }}>{lang === 'ar' ? "المرجع" : "Reference"}</div>
                            <div style={{ color: "var(--admin-text)", textTransform: "capitalize" }}>
                                {lang === 'ar' ? "المستهدف:" : "Target:"} {lang === 'ar' ? (ticket.target === 'product' ? "منتج" : ticket.target === 'order' ? "طلب" : ticket.target === 'general' ? "استفسار عام" : "آخر") : ticket.target}
                                {ticket.label ? ` — ${ticket.label}` : ""}
                            </div>
                        </div>
                        <div>
                            <div style={{ color: "var(--admin-text-muted)", marginBottom: "0.5rem", fontWeight: 700, fontSize: "1.3rem" }}>{lang === 'ar' ? "فتحت في" : "Opened"}</div>
                            <div style={{ color: "var(--admin-text)" }}>{ticket.created_at ? new Date(ticket.created_at).toLocaleString(lang === 'ar' ? "ar-SA" : "en-GB") : "—"}</div>
                        </div>
                        {ticket.updated_at && (
                            <div>
                                <div style={{ color: "var(--admin-text-muted)", marginBottom: "0.5rem", fontWeight: 700, fontSize: "1.3rem" }}>{lang === 'ar' ? "آخر نشاط" : "Last Activity"}</div>
                                <div style={{ color: "var(--admin-text)" }}>{timeDiff(ticket.updated_at)} {lang === 'ar' ? "" : "ago"}</div>
                            </div>
                        )}
                    </div>
                </div>

                <div
                    ref={scrollContainerRef}
                    className="chat-messages"
                    style={{
                        padding: "1.5rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.5rem",
                        overflowY: "auto",
                        flex: 1
                    }}
                >
                    {messages.map((m, i) => {
                        const isMe = m.sender_type === "admin";
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
                                    color: "var(--admin-text-muted)",
                                    marginBottom: "0.5rem",
                                    marginInline: "0.7rem",
                                    opacity: 1
                                }}>
                                    {isMe ? t('support.you') : t('support.customer')} • {m.created_at ? new Date(m.created_at).toLocaleString(lang === 'ar' ? "ar-SA" : "en-GB") : "—"}
                                </div>
                                <div style={{
                                    background: isMe ? "var(--primary)" : "#fce4ec",
                                    color: isMe ? "#fff" : "#c62865",
                                    border: isMe ? "none" : "1px solid var(--admin-border)",
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
                                    textAlign: isRTL ? 'right' : 'left'
                                }}>
                                    {m.message}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                <div style={{ padding: "1.5rem 2rem", borderTop: "1px solid var(--admin-border)", background: "var(--admin-surface)" }}>
                    {isOpen ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <textarea
                                placeholder={t('support.reply_placeholder')}
                                style={{
                                    width: "100%", minHeight: "150px", resize: "vertical",
                                    padding: "1.2rem", borderRadius: "8px", border: "1px solid var(--admin-border)",
                                    background: "rgba(0,0,0,0.02)", color: "var(--admin-text)", fontSize: "1.3rem", fontFamily: "inherit", outline: "none",
                                    textAlign: isRTL ? 'right' : 'left', lineHeight: "1.5"
                                }}
                                value={replyText} onChange={e => setReplyText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAction("reply");
                                    }
                                }}
                            />
                            <div style={{ display: "flex", justifyContent: isRTL ? "flex-start" : "flex-end" }}>
                                <button onClick={() => handleAction("reply")} disabled={replying || !replyText.trim()} style={{
                                    background: "var(--admin-primary)", color: "#fff", border: "none",
                                    padding: "0.75rem 2rem", borderRadius: "8px", fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s"
                                }}>
                                    {replying ? t('common.loading') : t('support.send')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", color: "var(--admin-text-muted)", fontSize: "1.2rem", fontWeight: 600 }}>
                            {t('support.ticket_closed')}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
