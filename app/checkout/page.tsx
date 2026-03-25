"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore, formatPrice } from "@/lib/store";
import toast from "react-hot-toast";
import styles from "./page.module.css";
import { useLanguage } from "@/context/LanguageContext";

const VOUCHERS: Record<string, number> = {}; // Removed hardcoded vouchers

type Step = "details" | "verify-otp" | "payment" | "placing";

export default function CheckoutPage() {
    const { cart, country, authUser, setAuthUser, clearCart } = useStore();
    const { lang, t, isRTL } = useLanguage();
    const router = useRouter();

    const [step, setStep] = useState<Step>("details");
    const [form, setForm] = useState({ name: authUser?.name || "", email: authUser?.email || "", phone: authUser?.phone || "", address: authUser?.address || "", city: "" });
    const [paymentMethod, setPaymentMethod] = useState<"thawani" | "card">("thawani");
    const [voucherCode, setVoucherCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [otpCode, setOtpCode] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [shippingRates, setShippingRates] = useState<Record<string, number>>({});

    useEffect(() => {
        fetch("/api/admin/shipping").then(r => r.json()).then(d => setShippingRates(d.rates || {}));
    }, []);

    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const totalWeight = cart.reduce((s, i) => s + (i.weight || 0.5) * i.quantity, 0);
    const rawRate = country.code === "OM" ? 2 : (shippingRates[country.code] || 0);
    const shippingTotal = cart.length > 0 
        ? (country.code === "OM" ? 2 : rawRate * totalWeight) 
        : 0;
    const total = Math.max(0, subtotal - discount + shippingTotal);

    const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(p => ({ ...p, [k]: e.target.value }));

    const applyVoucher = async () => {
        if (!voucherCode) return;
        setLoading(true);
        try {
            const res = await fetch("/api/vouchers/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: voucherCode, subtotal, email: form.email }),
            });
            const data = await res.json();
            if (res.ok) {
                setDiscount(data.appliedDiscount);
                toast.success(`Voucher applied! −${formatPrice(data.appliedDiscount, country)}`);
            } else {
                toast.error(data.error || "Invalid voucher code");
                setDiscount(0);
            }
        } catch (err) {
            toast.error("Voucher validation failed");
        } finally {
            setLoading(false);
        }
    };

    const sendOTP = async () => {
        if (!form.email) { toast.error("Enter your email first"); return; }
        setLoading(true);
        const res = await fetch("/api/otp/send", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.email }),
        });
        setLoading(false);
        if (res.ok) { setOtpSent(true); toast.success("OTP sent to your email 📧"); }
        else toast.error("Failed to send OTP");
    };

    const verifyOTP = async () => {
        setLoading(true);
        const res = await fetch("/api/otp/verify", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: form.email,
                code: otpCode,
                name: form.name,
                phone: form.phone,
                address: form.address,
            }),
        });
        const data = await res.json();
        setLoading(false);

        if (res.ok) {
            if (data.user) setAuthUser(data.user, data.token);
            setStep("payment");
            toast.success("Email verified & Account logged in ✅");
        } else {
            toast.error(data.error || "Invalid code");
        }
    };

    const handleDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.phone || !form.city || !form.address) {
            toast.error("Please fill all required fields, including phone and address");
            return;
        }
        if (authUser) { setStep("payment"); }
        else { setStep("verify-otp"); }
    };

    const handlePlaceOrder = async () => {
        const token = useStore.getState().token;
        setStep("placing");
        setLoading(true);
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    items: cart, subtotal, discount, total,
                    name: form.name, email: form.email, phone: form.phone,
                    address: form.address, city: form.city,
                    paymentMethod,
                    voucherCode,
                    shippingTotal,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                clearCart();
                router.push(`/order-confirmed?id=${data.orderId}`);
            } else {
                toast.error(data.error || "Failed to place order");
                setStep("payment");
            }
        } finally { setLoading(false); }
    };

    if (cart.length === 0 && step !== "placing") {
        return (
            <div className={styles.page}>
                <div className="container" style={{ textAlign: "center", paddingBlock: "8rem" }}>
                    <div style={{ fontSize: "5rem", marginBottom: "1.5rem", opacity: .2 }}>💼</div>
                    <h2 style={{ fontFamily: "var(--ff-serif)", fontSize: "2.5rem", marginBottom: "1rem" }}>{t('cart.empty')}</h2>
                    <p style={{ color: "var(--text-muted)", marginBottom: "3rem", fontSize: "1.2rem" }}>{lang === 'ar' ? "لم تضف أي شيء للدفع بعد." : "You haven't added anything to checkout yet."}</p>
                    <Link href="/" className="btn btnPrimary btnLg" style={{ fontSize: "1.2rem", padding: "1rem 2.5rem" }}>{t('home.shop_now')}</Link>
                </div>
            </div>
        );
    }

    const checkoutSteps = (["details", "verify-otp", "payment"] as Step[]).filter(s => authUser ? s !== "verify-otp" : true);
    const currentStepIdx = checkoutSteps.indexOf(step);

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.layout}>
                    {/* Left Side: Forms */}
                    <div>
                        {/* Step indicator */}
                        <div className={styles.steps}>
                            {checkoutSteps.map((s, i) => {
                                let statusCls = styles.stepIconPending;
                                let labelCls = styles.stepLabelPending;
                                if (step === s) { statusCls = styles.stepIconActive; labelCls = styles.stepLabelActive; }
                                else if (currentStepIdx > i) { statusCls = styles.stepIconComplete; labelCls = styles.stepLabelComplete; }

                                return (
                                    <div key={s} className={styles.step}>
                                        <div className={`${styles.stepIcon} ${statusCls}`} style={{ fontSize: "1.2rem", width: "36px", height: "36px" }}>
                                            {currentStepIdx > i ? "✓" : i + 1}
                                        </div>
                                        <span className={`${styles.stepLabel} ${labelCls}`} style={{ fontSize: "1.1rem" }}>
                                            {s === "verify-otp" ? t('checkout.auth' as any) || (lang === 'ar' ? "التحقق" : "Authentication") : s === "details" ? t('checkout.info' as any) || (lang === 'ar' ? "المعلومات" : "Information") : t(`checkout.${s}` as any) || s}
                                        </span>
                                        {i < checkoutSteps.length - 1 && <div className={styles.stepLine} />}
                                    </div>
                                );
                            })}
                        </div>

                        {/* STEP 1 — Information */}
                        {step === "details" && (
                            <form onSubmit={handleDetailsSubmit}>
                                <div className={styles.sectionCard}>
                                    <h2 className={styles.sectionTitle} style={{ fontSize: "1.6rem" }}>{t('checkout.shipping_address')}</h2>
                                    <div className={styles.formGrid}>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.inputLabel} style={{ fontSize: "1rem" }}>{t('checkout.full_name')} *</label>
                                            <input className="formInput" style={{ fontSize: "1.1rem", padding: "0.8rem" }} value={form.name} onChange={f("name")} required placeholder="John Doe" />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.inputLabel} style={{ fontSize: "1rem" }}>{t('checkout.email')} *</label>
                                            <input className="formInput" style={{ fontSize: "1.1rem", padding: "0.8rem" }} type="email" value={form.email} onChange={f("email")} required placeholder="john@example.com" />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.inputLabel} style={{ fontSize: "1rem" }}>{t('checkout.phone')} *</label>
                                            <input className="formInput" style={{ fontSize: "1.1rem", padding: "0.8rem" }} value={form.phone} onChange={f("phone")} required placeholder="+968 1234 5678" />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label className={styles.inputLabel} style={{ fontSize: "1rem" }}>{t('checkout.city')} *</label>
                                            <input className="formInput" style={{ fontSize: "1.1rem", padding: "0.8rem" }} value={form.city} onChange={f("city")} required placeholder="Muscat" />
                                        </div>
                                        <div className={`${styles.inputGroup} ${styles.formFull}`}>
                                            <label className={styles.inputLabel} style={{ fontSize: "1rem" }}>{t('checkout.address')} *</label>
                                            <input className="formInput" style={{ fontSize: "1.1rem", padding: "0.8rem" }} value={form.address} onChange={f("address")} required placeholder="Bldg/Street/Area" />
                                        </div>
                                    </div>
                                    {!authUser && (
                                        <div className={styles.guestNote}>
                                            ○ {lang === 'ar' ? 'طلب ضيف. سنتحقق من بريدك عبر رمز آمن.' : 'Checking out as a guest. We will verify your email with a secure code.'}
                                            &nbsp;<Link href="/login">{lang === 'ar' ? 'تسجيل الدخول' : 'Sign in'}</Link> {lang === 'ar' ? 'لتخطي التحقق واستخدام العناوين المحفوظة.' : 'to skip verification and use saved addresses.'}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                                    <Link href="/cart" className="btn btnOutline">{lang === 'ar' ? '← العودة للسلة' : '← Back to Bag'}</Link>
                                    <button type="submit" className="btn btnPrimary btnLg">
                                        {authUser ? `${t('checkout.payment_method')} ○` : `${lang === 'ar' ? 'متابعة للتحقق' : 'Continue to Authentication'} ○`}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* STEP 2 — Authentication (guests only) */}
                        {step === "verify-otp" && (
                            <div className={styles.sectionCard} style={{ padding: "0" }}>
                                <div className={styles.otpCard}>
                                    <div className={styles.otpIcon} style={{ fontSize: "3rem" }}>🔒</div>
                                    <h2 className={styles.sectionTitle} style={{ fontSize: "1.6rem" }}>{lang === 'ar' ? 'تحقق لمرة واحدة' : 'One-Time Verification'}</h2>
                                    <p className={styles.otpDesc}>
                                        We've sent a 6-digit verification code to <strong style={{ color: "var(--secondary)" }}>{form.email}</strong>
                                    </p>

                                    {!otpSent ? (
                                        <button className="btn btnPrimary btnLg" onClick={sendOTP} disabled={loading}>
                                            {loading ? "Sending..." : "Send Verification Code"}
                                        </button>
                                    ) : (
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <input className={`formInput ${styles.otpInput}`}
                                                style={{ fontSize: "1.5rem", letterSpacing: "8px" }}
                                                placeholder="000000" maxLength={6} value={otpCode} onChange={e => setOtpCode(e.target.value)} />
                                            <button className="btn btnPrimary btnLg btnBlock" onClick={verifyOTP} disabled={loading || otpCode.length < 6} style={{ maxWidth: "300px", fontSize: "1.1rem" }}>
                                                {loading ? (lang === 'ar' ? "جاري التحقق..." : "Verifying...") : (lang === 'ar' ? "تأكيد ومتابعة" : "Verify & Continue")}
                                            </button>
                                            <button onClick={sendOTP} disabled={loading} style={{ background: "none", border: "none", color: "var(--text-faint)", fontSize: "1rem", cursor: "pointer", textDecoration: "underline", marginTop: "1.5rem" }}>
                                                {lang === 'ar' ? 'إعادة إرسال الرمز' : 'Resend dynamic code'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div style={{ padding: "1.5rem 2.5rem", borderTop: "1px solid var(--border-soft)" }}>
                                    <button className="btn btnGhost" onClick={() => setStep("details")}>← Modify Information</button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3 — Payment */}
                        {step === "payment" && (
                            <div>
                                <div className={styles.sectionCard}>
                                    <h2 className={styles.sectionTitle}>{t('checkout.payment_method')}</h2>
                                    <div className={styles.paymentGrid}>
                                        {(["thawani", "card"] as const).map((v) => (
                                            <label key={v} className={`${styles.paymentOption} ${paymentMethod === v ? styles.paymentOptionSelected : ""}`}>
                                                <input type="radio" name="payment" value={v} checked={paymentMethod === v} onChange={() => setPaymentMethod(v)} style={{ display: "none" }} />
                                                <div style={{ fontSize: "2rem" }}>{v === "thawani" ? "🏦" : "💳"}</div>
                                                <span className={styles.paymentLabel}>{v === "thawani" ? "Thawani Pay" : (lang === 'ar' ? "بطاقة دفع" : "Credit / Debit Card")}</span>
                                            </label>
                                        ))}
                                    </div>

                                    <div className={styles.inputGroup} style={{ maxWidth: "400px" }}>
                                        <label className={styles.inputLabel}>{t('checkout.voucher_code')}</label>
                                        {discount > 0 ? (
                                            <div style={{ 
                                                display: "flex", 
                                                justifyContent: "space-between", 
                                                alignItems: "center",
                                                padding: "0.75rem 1.25rem",
                                                background: "rgba(215, 79, 144, 0.05)",
                                                border: "1px dashed var(--admin-primary, var(--secondary))",
                                                borderRadius: "12px",
                                                color: "var(--admin-primary, var(--secondary))"
                                            }}>
                                                <div style={{ fontWeight: 800, letterSpacing: "1px" }}>
                                                    {lang === 'ar' ? 'تم التطبيق' : 'APPLIED'}: {voucherCode.toUpperCase()}
                                                </div>
                                                <button 
                                                    onClick={() => { setDiscount(0); setVoucherCode(""); }}
                                                    style={{ 
                                                        background: "none", 
                                                        border: "none", 
                                                        color: "var(--text-faint)", 
                                                        cursor: "pointer", 
                                                        fontSize: "0.75rem",
                                                        textDecoration: "underline" 
                                                    }}
                                                >
                                                    {lang === 'ar' ? 'إزالة' : 'Remove'}
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: "flex", gap: "1rem" }}>
                                                <input className="formInput" placeholder={lang === 'ar' ? "كود الخصم" : "Enter Code"} value={voucherCode} onChange={e => setVoucherCode(e.target.value)} />
                                                <button type="button" className="btn btnOutline" onClick={applyVoucher} disabled={loading}>{t('checkout.apply')}</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "2rem" }}>
                                    <button className="btn btnOutline" style={{ fontSize: "1.1rem" }} onClick={() => setStep(authUser ? "details" : "verify-otp")}>{lang === 'ar' ? "← تعديل البيانات" : "← Modify Details"}</button>
                                    <button className="btn btnPrimary btnLg" style={{ fontSize: "1.2rem", padding: "1rem 2rem" }} onClick={handlePlaceOrder} disabled={loading}>
                                        {loading ? t('checkout.processing') : `${t('checkout.place_order')} — ${formatPrice(total, country)}`}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === "placing" && (
                            <div className={styles.sectionCard} style={{ textAlign: "center", padding: "6rem" }}>
                                <div style={{ fontSize: "4rem", marginBottom: "1.5rem", animation: "spin 2s linear infinite" }}>⏳</div>
                                <h2 className={styles.sectionTitle}>{lang === 'ar' ? "جاري إنهاء طلبك" : "Finalizing Your Purchase"}</h2>
                                <p style={{ color: "var(--text-muted)" }}>{lang === 'ar' ? "الرجاء الانتظار بينما نؤمن طلبك." : "Please wait while we secure your order."}</p>
                                <style>{`@keyframes spin { from {transform:rotate(0deg)} to {transform:rotate(360deg)} }`}</style>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Order Summary */}
                    <div className={styles.summarySidebar}>
                        <h3 className={styles.sectionTitle} style={{ fontSize: "1.25rem" }}>{t('checkout.order_summary')}</h3>
                        <div style={{ maxHeight: "400px", overflowY: "auto", marginInline: "-0.5rem", paddingInline: "0.5rem" }}>
                            {cart.map((item, i) => (
                                <div key={i} className={styles.summaryItem}>
                                    <img src={item.image} alt={item.name} className={styles.itemThumb} style={{ width: "80px", height: "100px" }} />
                                    <div style={{ textAlign: isRTL ? 'right' : 'left', flex: 1 }}>
                                        <div className={styles.itemName} style={{ fontSize: "1.2rem", fontWeight: 700 }}>{item.name}</div>
                                        <div className={styles.itemMeta} style={{ fontSize: "1rem" }}>
                                            {t('product.qty')}: {item.quantity}  
                                            {item.size && ` · ${t('product.size')}: ${item.size}`}
                                            {item.color && ` · ${t('product.color')}: ${item.color}`}
                                            {item.selectedOptions && Object.entries(item.selectedOptions).map(([k, v]) => ` · ${k}: ${v}`)}
                                            {!item.fabricType.includes("N/A") && ` · ${item.fabricType}`}
                                        </div>
                                    </div>
                                    <div className={styles.itemPrice}>{formatPrice(item.price * item.quantity, country)}</div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.totals}>
                            <div className={styles.totalRow}>
                                <span className={styles.totalLabel}>{t('cart.subtotal')}</span>
                                <span className={styles.totalVal}>{formatPrice(subtotal, country)}</span>
                            </div>
                            {discount > 0 && (
                                <div className={styles.totalRow}>
                                    <span className={styles.totalLabel} style={{ color: "#2E7D32" }}>{lang === 'ar' ? 'خصم خاص' : 'Privilege Discount'}</span>
                                    <span className={styles.totalVal} style={{ color: "#2E7D32" }}>−{formatPrice(discount, country)}</span>
                                </div>
                            )}
                            <div className={styles.totalRow} style={{ fontSize: "1.2rem" }}>
                                <span className={styles.totalLabel}>{t('checkout.shipping_cost')}</span>
                                <span className={styles.totalVal} style={{ color: "var(--success)" }}>{formatPrice(shippingTotal, country)}</span>
                            </div>

                            <div className={styles.grandTotal} style={{ fontSize: "1.6rem", marginTop: "1rem" }}>
                                <span className={styles.grandTotalLabel}>{t('cart.total')}</span>
                                <span className={styles.grandTotalVal}>{formatPrice(total, country)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
