"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStore, formatPrice } from "@/lib/store";
import styles from "./page.module.css";
import { motion } from "framer-motion";

const STATUS_ORDER = ["paid", "processing", "shipped", "delivered"];
const STEPS = [
    { key: "paid", label: "تم الدفع", icon: "💳" },
    { key: "processing", label: "قيد التنفيذ", icon: "🧵" },
    { key: "shipped", label: "تم الشحن", icon: "🚚" },
    { key: "delivered", label: "تم التوصيل", icon: "🏠" },
];

function OrderDetailContent() {
    const params = useSearchParams();
    const { country } = useStore();
    const orderId = params.get("id");

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!orderId) { setError("لم يتم تقديم رقم الطلب"); setLoading(false); return; }
        fetch(`/api/orders/${orderId}`)
            .then(r => r.json())
            .then(d => {
                if (d.order) setOrder(d.order);
                else setError("الطلب غير موجود");
            })
            .catch(() => setError("فشل تحميل تفاصيل الطلب"))
            .finally(() => setLoading(false));
    }, [orderId]);

    if (loading) return (
        <div className={styles.loadingContainer}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className={styles.loader}
            />
            <p>جاري تحميل تفاصيل الطلب...</p>
        </div>
    );

    if (error || !order) return (
        <div className={styles.page}>
            <div className="container" style={{ textAlign: "center", paddingBlock: "8rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>⚠️</div>
                <h2 className={styles.title}>{error || "الطلب غير موجود"}</h2>
                <Link href="/myaccount/my-orders" className="btn btnPrimary">← العودة لطلباتي</Link>
            </div>
        </div>
    );

    const items: any[] = typeof order.items === "string" ? JSON.parse(order.items) : (order.items || []);
    const isRefunded = order.status === "refunded";
    const currentIdx = STATUS_ORDER.indexOf(order.status);

    const downloadInvoice = async () => {
        const { default: jsPDF } = await import("jspdf");
        const { default: autoTable } = await import("jspdf-autotable");
        const doc = new jsPDF();

        // 0. Use Standard Professional Font
        doc.setFont("helvetica", "normal");

        // Load Logo for PDF
        let logoBase64 = "";
        try {
            const logoRes = await fetch("/heart-logo.png");
            const logoBlob = await logoRes.blob();
            logoBase64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(logoBlob);
            });
        } catch (e) {
            console.error("Logo load failed:", e);
        }

        // 1. Background
        doc.setFillColor(253, 245, 206);
        doc.rect(0, 0, 210, 297, "F");

        // 2. Branding Header
        doc.setFillColor(198, 40, 101);
        doc.rect(0, 0, 210, 40, "F");

        if (logoBase64) {
            doc.addImage(logoBase64, "PNG", 14, 8, 24, 24);
        }

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont("helvetica", "bold");
        doc.text("JHD.LINE", logoBase64 ? 42 : 105, 25, { align: logoBase64 ? "left" : "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("PREMIUM BESPOKE FASHION", logoBase64 ? 42 : 105, 33, { align: logoBase64 ? "left" : "center" });

        // 3. Invoice Header
        doc.setTextColor(23, 35, 112);
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("OFFICIAL INVOICE", 14, 55);

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(`Order Number: #${order.id}`, 14, 65);

        // 4. Info Cards
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(14, 75, 85, 38, 3, 3, "F");
        doc.roundedRect(111, 75, 85, 38, 3, 3, "F");

        doc.setTextColor(23, 35, 112);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("ORDER SUMMARY", 18, 83);
        doc.text("BILL TO / CUSTOMER", 115, 83);

        doc.setTextColor(60, 60, 60);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Date of Issue: ${new Date(order.created_at).toLocaleDateString()}`, 18, 90);
        doc.text(`Payment: ${order.payment_method?.toUpperCase() || "CREDIT CARD"}`, 18, 96);
        doc.text(`Status: ${order.status?.toUpperCase()}`, 18, 102);

        doc.text(`${order.name || order.customer_name || "Customer"}`, 115, 90);
        doc.text(`${order.email || order.customer_email || ""}`, 115, 96);
        doc.text(`Phone: ${order.phone || order.customer_phone || "N/A"}`, 115, 102);
        doc.text(`Location: ${order.city || ""}`, 115, 108);

        // 5. Items Table
        autoTable(doc, {
            startY: 125,
            head: [['Item Name', 'Specs', 'Qty', 'Total']],
            body: items.map(item => [
                item.name,
                [item.fabric_type, item.neckline].filter(Boolean).join(" | "),
                item.quantity,
                `${country.currency} ${(item.price * item.quantity * country.rate).toFixed(2)}`
            ]),
            styles: { font: "helvetica", fontSize: 9, cellPadding: 4, textColor: [40, 40, 40] },
            headStyles: { fillColor: [23, 35, 112], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [250, 248, 240] },
            margin: { left: 14, right: 14 }
        });

        // 6. Calculations
        const finalY = (doc as any).lastAutoTable.finalY + 12;
        const subtotal = Number(order.subtotal) || 0;
        const discount = Number(order.discount) || 0;
        const shippingFee = Number(order.shipping_fee) || 0;
        const netAmount = Math.max(0, (subtotal + shippingFee) - discount);
        const vat = netAmount * 0.05;
        const grandTotal = netAmount + vat;

        doc.setTextColor(23, 35, 112);
        doc.setFontSize(10);
        const labelX = 14;
        const valueX = 75;

        doc.setFont("helvetica", "bold");
        doc.text("Gross Subtotal:", labelX, finalY);
        doc.text(`${country.currency} ${(subtotal * country.rate).toFixed(2)}`, valueX, finalY);

        doc.setDrawColor(220, 220, 220);
        let currentY = finalY + 4;
        if (discount > 0) {
            doc.line(labelX, currentY, valueX + 35, currentY);
            currentY += 6;
            doc.setTextColor(198, 40, 101); // Red
            doc.text(`Promo Discount (${order.voucher_code?.toUpperCase()}):`, labelX, currentY);
            doc.text(`- ${country.currency} ${(discount * country.rate).toFixed(2)}`, valueX, currentY);
            doc.setTextColor(23, 35, 112); // Reset to Blue
            currentY += 4;
            doc.line(labelX, currentY, valueX + 35, currentY);
            currentY += 6;
        } else {
            doc.line(labelX, currentY, valueX + 35, currentY);
            currentY += 6;
        }

        doc.text("VAT (5%):", labelX, currentY);
        doc.text(`${country.currency} ${(vat * country.rate).toFixed(2)}`, valueX, currentY);
        currentY += 4;
        doc.line(labelX, currentY, valueX + 35, currentY);
        currentY += 6;

        doc.text("Logistics / Shipping:", labelX, currentY);
        doc.text(`${country.currency} ${(shippingFee * country.rate).toFixed(2)}`, valueX, currentY);
        currentY += 12;

        // Total
        doc.setFillColor(198, 40, 101);
        doc.roundedRect(labelX - 2, currentY - 8, 85, 16, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text("TOTAL AMOUNT:", labelX + 2, currentY + 3);
        doc.text(`${country.currency} ${(grandTotal * country.rate).toFixed(2)}`, valueX + 2, currentY + 3);

        // 7. Footer
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("Thank you for choosing JHD.LINE", 105, 280, { align: "center" });
        doc.text("www.jhd-line.com", 105, 286, { align: "center" });

        doc.save(`JHD-LINE-INVOICE-${order.id}.pdf`);
    };

    return (
        <div className={styles.page}>
            <div className="container" style={{ maxWidth: 1000 }}>
                <Link href="/myaccount/my-orders" className={styles.backLink}>
                    ← العودة لقائمة الطلبات
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.header}
                >
                    <div className={styles.idBadge}>طلب رقم #{order.id}</div>
                    <h1 className={styles.title}>تفاصيل <span>الطلب</span></h1>
                    <button className={styles.invoiceBtn} onClick={downloadInvoice}>
                        📄 تحميل الفاتورة (PDF)
                    </button>
                </motion.div>

                {/* Tracking Icons */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>{isRefunded ? "حالة الطلب" : "تتبع الرحلة"}</h3>
                    {isRefunded ? (
                        <div style={{ padding: "2rem", background: "rgba(239, 68, 68, 0.05)", borderRadius: "12px", textAlign: "center", border: "1px dashed #EF4444" }}>
                            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>↩️</div>
                            <h4 style={{ color: "#EF4444", fontWeight: 700, marginBottom: "0.5rem" }}>تم استرداد هذا الطلب</h4>
                            <p style={{ color: "#666", fontSize: "0.9rem" }}>لقد تمت عملية استرداد المبلغ لهذا الطلب بنجاح. يمكنك رؤية تفاصيل المبلغ في ملخص الدفع.</p>
                        </div>
                    ) : (
                        <div className={styles.trackerGrid}>
                            {STEPS.map((step, i) => {
                                const stepIdx = STATUS_ORDER.indexOf(step.key);
                                const isDone = stepIdx <= currentIdx;
                                const isActive = stepIdx === currentIdx;
                                return (
                                    <div key={step.key} className={`${styles.trackerStep} ${isDone ? styles.stepDone : ""} ${isActive ? styles.stepActive : ""}`}>
                                        <div className={styles.iconBox}>{step.icon}</div>
                                        <div className={styles.stepLabel}>{step.label}</div>
                                        {isActive && <div className={styles.pulse} />}
                                        <div className={styles.connector} />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className={styles.mainGrid}>
                    {/* Items */}
                    <div className={styles.contentCol}>
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>المنتجات المختارة</h3>
                            <div className={styles.itemList}>
                                {items.map((item: any, i: number) => (
                                    <div key={i} className={styles.itemCard}>
                                        <div className={styles.itemImgWrap}>
                                            <img src={item.image || "/placeholder.png"} alt={item.name} />
                                        </div>
                                        <div className={styles.itemInfo}>
                                            <div className={styles.itemName}>{item.name}</div>
                                            <div className={styles.itemConfig}>
                                                <div className={styles.configRow}>
                                                    <span>القماش:</span> {item.fabric_type}
                                                </div>
                                                <div className={styles.configRow}>
                                                    <span>الياقة:</span> {item.neckline}
                                                </div>
                                                {item.fabric_length && (
                                                    <div className={styles.configRow}>
                                                        <span>الطول:</span> {item.fabric_length}
                                                    </div>
                                                )}
                                                {item.neck_size && (
                                                    <div className={styles.configRow}>
                                                        <span>مقاس الرقبة:</span> {item.neck_size}
                                                    </div>
                                                )}
                                                {item.stitch && <div className={styles.stitchBadge}>خياطة فاخرة</div>}
                                            </div>
                                        </div>
                                        <div className={styles.itemPriceSide}>
                                            <div className={styles.itemQty}>الكمية: {item.quantity}</div>
                                            <div className={styles.itemTotal}>{formatPrice(item.price * item.quantity, country)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className={styles.sideCol}>
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>ملخص الدفع</h3>
                            <div className={styles.summaryBox}>
                                <div className={styles.summaryRow}>
                                    <span>المجموع الفرعي</span>
                                    <span>{formatPrice(Number(order.subtotal) || (Number(order.total) - (Number(order.shipping_fee) || 0)) * 0.95, country)}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>ضريبة القيمة المضافة (5%)</span>
                                    <span>{formatPrice((Number(order.subtotal) ? Number(order.subtotal) * 0.0526 : (Number(order.total) - (Number(order.shipping_fee) || 0)) * 0.05), country)}</span>
                                </div>
                                {order.shipping_fee > 0 && (
                                    <div className={styles.summaryRow}>
                                        <span>رسوم الشحن</span>
                                        <span>{formatPrice(order.shipping_fee, country)}</span>
                                    </div>
                                )}
                                {order.discount > 0 && (
                                    <div className={styles.summaryRow} style={{ color: "var(--primary)" }}>
                                        <span>خصم {order.voucher_code && `(${order.voucher_code.toUpperCase()})`}</span>
                                        <span>-{formatPrice(order.discount, country)}</span>
                                    </div>
                                )}
                                {order.refunded_amount > 0 && (
                                    <div className={styles.summaryRow} style={{ color: "#ef4444" }}>
                                        <span>المبلغ المسترد</span>
                                        <span>-{formatPrice(order.refunded_amount, country)}</span>
                                    </div>
                                )}
                                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                                    <span>الإجمالي الكلي</span>
                                    <span>{formatPrice(order.total, country)}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>معلومات الشحن</h3>
                            <div className={styles.shippingBox}>
                                <p><strong>الاسم:</strong> {order.name || "—"}</p>
                                <p><strong>الهاتف:</strong> {order.phone || "—"}</p>
                                <p><strong>العنوان:</strong> {[order.address, order.city].filter(Boolean).join(", ") || "—"}</p>
                                <p><strong>طريقة الدفع:</strong> {order.payment_method === 'thawani' ? 'ثواني (دفع إلكتروني)' : (order.payment_method || "—")}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OrderDetailPage() {
    return (
        <Suspense fallback={<div className={styles.page}>Loading...</div>}>
            <OrderDetailContent />
        </Suspense>
    );
}
