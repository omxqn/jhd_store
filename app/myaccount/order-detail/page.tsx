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

        // Banner
        doc.setFillColor(26, 26, 26);
        doc.rect(0, 0, 210, 40, "F");
        doc.setTextColor(198, 40, 40); doc.setFontSize(26); doc.setFont("helvetica", "bold");
        doc.text("JHD.LINE", 14, 25);
        doc.setFontSize(10); doc.setTextColor(249, 241, 200);
        doc.text("Premium Bespoke Fashion | jhd-line.com", 14, 33);
        doc.setTextColor(198, 40, 40); doc.setFontSize(16);
        doc.text("INVOICE", 180, 25, { align: "right" });

        // Order Info
        doc.setTextColor(40, 40, 40); doc.setFontSize(10); doc.setFont("helvetica", "normal");
        doc.text(`Order: #${order.id}`, 14, 55);
        doc.text(`Date: ${new Date(order.created_at).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}`, 14, 62);
        doc.text(`Payment: ${order.payment_method?.toUpperCase() || "CREDIT CARD"}`, 14, 69);

        // Status Badge
        doc.setFillColor(198, 40, 40);
        doc.roundedRect(160, 50, 36, 10, 2, 2, "F");
        doc.setTextColor(255, 255, 255); doc.setFontSize(9); doc.setFont("helvetica", "bold");
        doc.text(order.status.toUpperCase(), 178, 56.5, { align: "center" });

        doc.setTextColor(40, 40, 40); doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.text("Customer Information:", 14, 90);
        doc.setFont("helvetica", "normal"); doc.setFontSize(10);
        doc.text(`${order.name}`, 14, 97);
        doc.text(`${order.email}`, 14, 104);
        doc.text(`Phone: ${order.phone || "-"}`, 14, 111);
        doc.text(`Shipping: ${order.address || "-"}, ${order.city || "-"}`, 14, 118);

        // Table
        autoTable(doc, {
            startY: 135,
            head: [["Item Description", "Specifications", "Price", "Qty", "Total"]],
            body: items.map(item => {
                const specs = [
                    item.fabric_type,
                    item.neckline,
                    item.fabric_length ? `L: ${item.fabric_length}` : null,
                    item.neck_size ? `N: ${item.neck_size}` : null,
                    item.stitch ? "Premium" : null
                ].filter(Boolean).join(" | ");
                return [
                    item.name,
                    specs,
                    `${country.currency} ${(item.price * country.rate).toFixed(2)}`,
                    String(item.quantity),
                    `${country.currency} ${(item.price * item.quantity * country.rate).toFixed(2)}`,
                ];
            }),
            styles: { fontSize: 8, textColor: [40, 40, 40], cellPadding: 3 },
            headStyles: { fillColor: [26, 26, 26], textColor: [198, 40, 40], fontStyle: "bold" },
            alternateRowStyles: { fillColor: [252, 250, 235] },
            columnStyles: {
                0: { cellWidth: 50 },
                1: { cellWidth: 65 },
                2: { halign: "right" },
                3: { halign: "center" },
                4: { halign: "right", cellWidth: 30 }
            }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 15;
        const subtotal = order.subtotal || (order.total / 1.05); // Estimate if subtotal not in object
        const vat = order.total - subtotal;
        const discount = order.discount || 0;

        doc.setFontSize(10); doc.setTextColor(80, 80, 80);
        doc.text("Subtotal:", 135, finalY);
        doc.text(`${country.currency} ${(subtotal * country.rate).toFixed(2)}`, 195, finalY, { align: "right" });

        if (discount > 0) {
            doc.text("Discount:", 135, finalY + 8);
            doc.text(`-${country.currency} ${(discount * country.rate).toFixed(2)}`, 195, finalY + 8, { align: "right" });
        }

        doc.text("VAT (5%):", 135, finalY + 16);
        doc.text(`${country.currency} ${(vat * country.rate).toFixed(2)}`, 195, finalY + 16, { align: "right" });

        doc.setDrawColor(198, 40, 40); doc.setLineWidth(0.5);
        doc.line(135, finalY + 20, 195, finalY + 20);

        doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(198, 40, 40);
        doc.text("TOTAL AMOUNT:", 135, finalY + 28);
        doc.text(`${country.currency} ${(order.total * country.rate).toFixed(2)}`, 195, finalY + 28, { align: "right" });

        // Footer Note
        doc.setFontSize(8); doc.setTextColor(150, 150, 150); doc.setFont("helvetica", "italic");
        doc.text("Thank you for choosing JHD.LINE. Your bespoke journey continues.", 105, 280, { align: "center" });

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
                                    <span>{formatPrice((order.total + (order.discount || 0) + (order.refunded_amount || 0)) * 0.95, country)}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>ضريبة القيمة المضافة (5%)</span>
                                    <span>{formatPrice((order.total + (order.discount || 0) + (order.refunded_amount || 0)) * 0.05, country)}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className={styles.summaryRow} style={{ color: "var(--primary)" }}>
                                        <span>خصم</span>
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
                                <p><strong>الاسم:</strong> {order.name}</p>
                                <p><strong>الهاتف:</strong> {order.phone || "—"}</p>
                                <p><strong>العنوان:</strong> {order.address}, {order.city}</p>
                                <p><strong>طريقة الدفع:</strong> {order.payment_method === 'thawani' ? 'ثواني (دفع إلكتروني)' : order.payment_method}</p>
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
