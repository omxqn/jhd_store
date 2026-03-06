"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ConfirmContent() {
    const params = useSearchParams();
    const orderId = params.get("id") ?? "00000";

    return (
        <div style={{ padding: "6rem 1.5rem", textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
            <div style={{ fontSize: "5rem", marginBottom: "1.5rem", animation: "bounce .6s ease" }}>🎉</div>
            <h1 style={{ fontFamily: "var(--ff-serif)", fontSize: "2.25rem", marginBottom: "1rem" }}>
                Order <span style={{ color: "var(--gold-500)" }}>Confirmed!</span>
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "1rem", marginBottom: ".75rem", lineHeight: 1.7 }}>
                Thank you for your purchase! Your order <strong style={{ color: "var(--gold-500)" }}>#{orderId}</strong> has been received and is being processed.
            </p>
            <p style={{ color: "var(--text-faint)", fontSize: ".875rem", marginBottom: "2.5rem" }}>
                A confirmation email will be sent to your email address with shipping details.
            </p>

            {/* Progress */}
            <div className="progressSteps" style={{ marginBottom: "3rem" }}>
                {[["✓", "Payment Done", "done"], ["⏳", "Processing", "active"], ["🚚", "Shipped", ""], ["📦", "Delivered", ""]].map(([icon, label, cls]) => (
                    <div key={label} className={`progressStep ${cls}`}>
                        <div className="stepDot">{icon}</div>
                        <div className="stepLabel">{label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/myaccount/my-orders" className="btn btnPrimary btnLg">📦 View My Orders</Link>
                <Link href="/" className="btn btnOutline btnLg">Continue Shopping</Link>
            </div>

            <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }`}</style>
        </div>
    );
}

export default function OrderConfirmedPage() {
    return <Suspense fallback={<div style={{ padding: "4rem", textAlign: "center" }}>Loading...</div>}><ConfirmContent /></Suspense>;
}
