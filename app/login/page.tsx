"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import toast from "react-hot-toast";
import styles from "../auth.module.css";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
    const router = useRouter();
    const { setAuthUser } = useStore();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"email" | "otp">("email");
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/auth/otp/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.error || "Failed to send code"); return; }
            toast.success("Security code sent to your email");
            setStep("otp");
        } catch (err) {
            toast.error("Network error");
        } finally { setLoading(false); }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/auth/otp/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.error || "Invalid or expired code"); return; }
            setAuthUser(data.user, data.token);
            toast.success(`Welcome back, ${data.user.name.split(' ')[0]}`);
            router.push(data.user.role === "admin" ? "/admin" : "/myaccount");
        } catch (err) {
            toast.error("Network error");
        } finally { setLoading(false); }
    };

    return (
        <div className={styles.page}>
            <div className={styles.authCard}>
                <div className={styles.header}>
                    <div className={styles.icon}>✧</div>
                    <h1 className={styles.title}>Store Access</h1>
                    <p className={styles.subtitle}>
                        {step === "email"
                            ? "Enter your electronic mail to receive a verification code"
                            : `We've sent a 6-digit code to ${email}`}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === "email" ? (
                        <motion.form
                            key="email-form"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleSendOTP}
                            className={styles.form}
                        >
                            <div className="formGroup">
                                <label className="formLabel">Electronic Mail</label>
                                <input
                                    className="formInput"
                                    type="email"
                                    placeholder="name@store.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btnPrimary btnBlock" style={{ marginTop: "1rem" }} disabled={loading}>
                                {loading ? "Sending Code…" : "Send Verification Code ○"}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="otp-form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleVerifyOTP}
                            className={styles.form}
                        >
                            <div className="formGroup">
                                <label className="formLabel">Verification Code</label>
                                <input
                                    className="formInput"
                                    type="text"
                                    maxLength={6}
                                    placeholder="••••••"
                                    style={{ textAlign: "center", letterSpacing: "8px", fontSize: "1.5rem" }}
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                    required
                                    autoFocus
                                />
                            </div>
                            <button type="submit" className="btn btnPrimary btnBlock" style={{ marginTop: "1rem" }} disabled={loading}>
                                {loading ? "Verifying…" : "Secure Login ○"}
                            </button>
                            <button
                                type="button"
                                className={styles.guestLink}
                                style={{ background: "none", border: "none", cursor: "pointer", marginTop: "1rem", width: "100%" }}
                                onClick={() => setStep("email")}
                            >
                                ← Use a different email
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className={styles.footer}>
                    <p>
                        Our system is now passwordless for your security.
                    </p>
                    <Link href="/checkout" className={styles.guestLink}>Proceed as guest explorer →</Link>
                </div>
            </div>
        </div>
    );
}
