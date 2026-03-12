"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { BrandLoader } from "@/components/BrandLoader";

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
        return <BrandLoader fullPage={true} />;
    }

    return <>{children}</>;
}
