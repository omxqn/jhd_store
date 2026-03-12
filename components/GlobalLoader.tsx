"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { BrandLoader } from "./BrandLoader";

export function GlobalLoader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { isLoading, setIsLoading } = useStore();

    // Effect to hide loader when route changes are complete
    useEffect(() => {
        setIsLoading(false);
    }, [pathname, searchParams, setIsLoading]);

    // Safety timeout: Never stay stuck for more than 8 seconds
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isLoading) {
            timer = setTimeout(() => {
                setIsLoading(false);
            }, 8000); // 8 second safety net
        }
        return () => clearTimeout(timer);
    }, [isLoading, setIsLoading]);

    // Handle global clicks on links to show loader early
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            // Respect preventDefault from other components (like Quick View)
            if (e.defaultPrevented) return;

            const target = e.target as HTMLElement;
            const link = target.closest("a");
            
            if (
                link && 
                link.href && 
                !link.hasAttribute("data-no-loader") &&
                link.href.startsWith(window.location.origin) &&
                !link.href.includes("#") &&
                link.target !== "_blank" &&
                !e.ctrlKey &&
                !e.metaKey &&
                !e.shiftKey
            ) {
                // Determine if it's a different internal page
                try {
                    const currentUrl = new URL(window.location.href);
                    const targetUrl = new URL(link.href);
                    
                    if (currentUrl.pathname !== targetUrl.pathname || currentUrl.search !== targetUrl.search) {
                        setIsLoading(true);
                    }
                } catch (err) {
                    // Fallback
                }
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsLoading(false);
        };

        window.addEventListener("click", handleClick);
        window.addEventListener("keydown", handleEscape);
        window.addEventListener("pageshow", () => setIsLoading(false)); // Hide on back/forward
        
        return () => {
            window.removeEventListener("click", handleClick);
            window.removeEventListener("keydown", handleEscape);
            window.removeEventListener("pageshow", () => setIsLoading(false));
        };
    }, [setIsLoading]);

    if (!isLoading) return null;

    return <BrandLoader fullPage={true} />;
}
