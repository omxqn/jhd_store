"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";

const GCC_COUNTRIES = [
    { code: "SA", name: "Saudi Arabia", nameAr: "المملكة العربية السعودية" },
    { code: "AE", name: "United Arab Emirates", nameAr: "الإمارات العربية المتحدة" },
    { code: "QA", name: "Qatar", nameAr: "قطر" },
    { code: "KW", name: "Kuwait", nameAr: "الكويت" },
    { code: "BH", name: "Bahrain", nameAr: "البحرين" }
];

export default function ShippingAdmin() {
    const { lang, t, isRTL } = useLanguage();
    const [rates, setRates] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/admin/shipping")
            .then(res => res.json())
            .then(data => {
                const loaded: Record<string, string> = {};
                GCC_COUNTRIES.forEach(c => {
                    loaded[c.code] = (data.rates?.[c.code] || 0).toString();
                });
                setRates(loaded);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const numericRates: Record<string, number> = {};
            for (const [k, v] of Object.entries(rates)) {
                numericRates[k] = parseFloat(v) || 0;
            }
            await fetch("/api/admin/shipping", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rates: numericRates })
            });
            toast.success(lang === 'ar' ? "تم تحديث أسعار الشحن!" : "Shipping rates updated!");
        } catch (e) {
            toast.error(lang === 'ar' ? "فشل تحديث الأسعار" : "Failed to update rates");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: "2rem", textAlign: isRTL ? 'right' : 'left' }}>{t('common.loading')}</div>;

    return (
        <div style={{ padding: "1.5rem", maxWidth: 1000, textAlign: isRTL ? 'right' : 'left' }}>
            <h1 style={{ fontSize: "3.125rem", marginBottom: "1.5rem", fontFamily: "var(--ff-serif)" }}>
                {lang === 'ar' ? "أسعار شحن دول مجلس التعاون (للكيلوغرام)" : "GCC Shipping Rates (Per KG)"}
            </h1>
            <p style={{ color: "var(--admin-text-muted)", marginBottom: "3rem", fontSize: "1.56rem", lineHeight: "1.5" }}>
                {lang === 'ar' 
                    ? "الشحن الأساسي داخل عُمان هو سعر ثابت 2 ر.ع. للدول الأخرى في مجلس التعاون، أدخل السعر لكل كيلوغرام أدناه."
                    : "Basic shipping within Oman is a flat 2 OMR. For other GCC countries, enter the rate per KG below."}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem", alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                {GCC_COUNTRIES.map(country => (
                    <div key={country.code} style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                        <label style={{ fontWeight: 700, fontSize: "1.5rem", color: "var(--admin-text)" }}>{lang === 'ar' ? country.nameAr : country.name}</label>
                        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                            <input
                                type="number"
                                step="0.1"
                                value={rates[country.code]}
                                onChange={e => setRates({ ...rates, [country.code]: e.target.value })}
                                style={{
                                    padding: "1.25rem 1.75rem",
                                    background: "var(--admin-surface)",
                                    border: "1px solid var(--admin-border)",
                                    borderRadius: "12px",
                                    color: "var(--admin-text)",
                                    width: "220px",
                                    fontSize: "1.5rem",
                                    fontWeight: 700,
                                    textAlign: isRTL ? 'right' : 'left'
                                }}
                            />
                            <span style={{ color: "var(--admin-text-muted)", fontSize: "1.4rem", fontWeight: 600 }}>{lang === 'ar' ? "ر.ع / كجم" : "OMR / KG"}</span>
                        </div>
                    </div>
                ))}

                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        padding: "1.5rem 3rem",
                        background: "var(--admin-primary)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "12px",
                        marginTop: "2rem",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: "1.5rem",
                        width: "fit-content"
                    }}
                >
                    {saving ? (lang === 'ar' ? "⌛ جاري الحفظ..." : "⌛ Saving…") : (lang === 'ar' ? "📦 حفظ الأسعار" : "📦 Save Rates")}
                </button>
            </div>
        </div>
    );
}
