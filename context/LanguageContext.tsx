"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { dictionary, Lang, Dictionary } from "@/lib/dictionary";

type LanguageContextType = {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: (path: string) => string;
    isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [lang, setLangState] = useState<Lang>("ar"); // Default to Arabic for Omani boutique
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const savedLang = localStorage.getItem("jhd-lang") as Lang;
        if (savedLang && (savedLang === "en" || savedLang === "ar")) {
            setLangState(savedLang);
        }
        setIsMounted(true);
    }, []);

    const setLang = (newLang: Lang) => {
        setLangState(newLang);
        localStorage.setItem("jhd-lang", newLang);
    };

    const isRTL = lang === "ar";

    useEffect(() => {
        if (isMounted) {
            document.documentElement.dir = isRTL ? "rtl" : "ltr";
            document.documentElement.lang = lang;
        }
    }, [lang, isRTL, isMounted]);

    const t = (path: string): string => {
        const keys = path.split(".");
        let result: any = dictionary[lang];
        for (const key of keys) {
            if (result && result[key]) {
                result = result[key];
            } else {
                // Fallback to English if key missing in Arabic
                if (lang === "ar") {
                    let fallback: any = dictionary["en"];
                    for (const fKey of keys) {
                        if (fallback && fallback[fKey]) fallback = fallback[fKey];
                        else break;
                    }
                    if (typeof fallback === "string") return fallback;
                }
                return path; // Return key itself as last resort
            }
        }
        return typeof result === "string" ? result : path;
    };

    if (!isMounted) return null; // Prevent hydration mismatch

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, isRTL }}>
            <div dir={isRTL ? "rtl" : "ltr"}>
                {children}
            </div>
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
    return context;
};
