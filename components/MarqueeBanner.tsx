"use client";
import React from "react";
import { useLanguage } from "@/context/LanguageContext";

export function MarqueeBanner() {
    const { t } = useLanguage();
    
    return (
        <div style={{
            background: "var(--primary)",
            color: "#fff",
            padding: "clamp(4px, 1.5vw, 10px) 0",
            overflow: "hidden",
            whiteSpace: "nowrap",
            fontSize: "clamp(0.9rem, 2.5vw, 1.2rem)",
            fontWeight: 700,
            fontFamily: "var(--ff-serif)",
            letterSpacing: "0.5px",
            textAlign: "center",
            position: "relative",
            zIndex: 1000,
            width: "100%"
        }}>
            <div style={{ display: "inline-block", animation: "marquee 25s linear infinite" }}>
                {t('promotions.marquee_discount')} &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {t('promotions.marquee_shipping')}
            </div>
        </div>
    );
}
