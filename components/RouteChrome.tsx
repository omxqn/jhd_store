"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export function RouteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");
  const useStoreChrome = !isHome && !isAdmin;

  useEffect(() => {
    document.body.classList.toggle("home-route", isHome);
    document.body.classList.toggle("inner-route", useStoreChrome);
    return () => {
      document.body.classList.remove("home-route");
      document.body.classList.remove("inner-route");
    };
  }, [isHome, useStoreChrome]);

  return (
    <>
      {useStoreChrome && <Header />}
      <main className={useStoreChrome ? "siteMain" : undefined} style={{ minHeight: isHome ? "100vh" : "calc(100vh - 72px)" }}>
        {useStoreChrome ? (
          <div className="siteShell">
            <div className="siteGarland siteGarlandTop" aria-hidden="true" />
            <div className="siteContent">{children}</div>
            <div className="siteGarland siteGarlandBottom" aria-hidden="true" />
          </div>
        ) : (
          children
        )}
      </main>
      {useStoreChrome && <Footer />}
    </>
  );
}
