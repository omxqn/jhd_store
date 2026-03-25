import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import AnimationWrapper from "@/components/AnimationWrapper";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/AuthProvider";
import { GlobalLoader } from "@/components/GlobalLoader";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Jihad Store — Premium GCC Fashion",
  description: "Discover premium thobes, abayas and traditional GCC garments. Custom tailoring available.",
};

import { LanguageProvider } from "@/context/LanguageContext";
import { MarqueeBanner } from "@/components/MarqueeBanner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <AuthProvider>
            <Suspense fallback={null}>
              <GlobalLoader />
            </Suspense>
            <MarqueeBanner />
            <Header />
            <main style={{ minHeight: "calc(100vh - 72px)" }}>
              <AnimationWrapper>{children}</AnimationWrapper>
            </main>
            <Footer />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "var(--surface)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  borderRadius: ".75rem",
                  boxShadow: "var(--shadow-md)"
                },
              }}
            />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
