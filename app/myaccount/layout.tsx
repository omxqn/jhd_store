"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import toast from "react-hot-toast";
import { useLanguage } from "@/context/LanguageContext";
import { BrandLoader } from "@/components/BrandLoader";

export default function MyAccountLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { authUser, verifyAuth, token } = useStore();
    const { lang } = useLanguage();
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        const check = async () => {
            await verifyAuth();
            setVerifying(false);
        };
        check();
    }, [verifyAuth]);

    useEffect(() => {
        if (!verifying) {
            if (!authUser) {
                toast.error(lang === 'ar' ? "الرجاء تسجيل الدخول أولاً" : "Please sign in first");
                router.replace("/login");
            }
        }
    }, [authUser, verifying, router, lang]);

    if (verifying) {
        return (
            <div style={{ background: "var(--bg)", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BrandLoader fullPage={true} />
            </div>
        );
    }

    if (!authUser) return null;

    return <>{children}</>;
}
