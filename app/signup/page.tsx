"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import toast from "react-hot-toast";
import styles from "../auth.module.css";
import { motion, AnimatePresence } from "framer-motion";

export default function SignupPage() {
    const router = useRouter();
    const { setAuthUser } = useStore();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"details" | "otp">("details");
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Check if email already exists (optional, but good UX)
            const checkRes = await fetch("/api/auth/otp/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name }), // Pass name so it's used if auto-registering
            });
            const data = await checkRes.json();
            if (!checkRes.ok) { toast.error(data.error || "Failed to send code"); return; }
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

            // If user was just created, update their name if it was just a fallback
            setAuthUser(data.user);
            toast.success("Welcome to the Boutique! Your account is ready.");
            router.push("/myaccount");
        } catch (err) {
            toast.error("Network error");
        } finally { setLoading(false); }
    };

    return (
        <div className={styles.page}>
            <div className={styles.authCard}>
                <div className={styles.header}>
                    <div className={styles.icon}>✧</div>
                    <h1 className={styles.title}>Join the Boutique</h1>
                    <p className={styles.subtitle}>
                        {step === "details"
                            ? "Create your Jihad Store account for a bespoke experience"
                            : `A verification code has been sent to ${email}`}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === "details" ? (
                        <motion.form
                            key="details-form"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleSendOTP}
                            className={styles.form}
                        >
                            <div className="formGroup">
                                <label className="formLabel">Full Name</label>
                                <input className="formInput" placeholder="Mohammed Al-Rashidi" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div className="formGroup">
                                <label className="formLabel">Electronic Mail</label>
                                <input className="formInput" type="email" placeholder="name@boutique.com" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btnPrimary btnBlock" style={{ marginTop: "1rem" }} disabled={loading}>
                                {loading ? "Communicating with Boutique…" : "Register & Send Code ○"}
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
                                <label className="formLabel">Enter 6-Digit Code</label>
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
                                {loading ? "Finalizing…" : "Complete Registration ○"}
                            </button>
                            <button
                                type="button"
                                className={styles.guestLink}
                                style={{ background: "none", border: "none", cursor: "pointer", marginTop: "1rem", width: "100%" }}
                                onClick={() => setStep("details")}
                            >
                                ← Go back
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className={styles.footer}>
                    <p>
                        Already registered?
                        <Link href="/login" className={styles.link}>Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
