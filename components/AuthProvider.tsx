"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const { verifyAuth } = useStore();
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        const init = async () => {
            await verifyAuth();
            setInitializing(false);
        };
        init();
    }, []);

    if (initializing) {
        return (
            <div style={{
                height: "100vh",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f9f1c8",
                color: "#c62828",
                fontFamily: "var(--ff-serif)",
                fontSize: "1.2rem",
                fontWeight: 700
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>✧</div>
                    Initializing Boutique Session…
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
