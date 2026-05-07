import type { Metadata } from "next";
import "./globals.css";
import AnimationWrapper from "@/components/AnimationWrapper";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/AuthProvider";
import { GlobalLoader } from "@/components/GlobalLoader";
import { Suspense } from "react";
import { RouteChrome } from "@/components/RouteChrome";

export const metadata: Metadata = {
  title: "Jihad Store — Premium GCC Fashion",
  description: "Discover premium thobes, abayas and traditional GCC garments. Custom tailoring available.",
};

import { LanguageProvider } from "@/context/LanguageContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <AuthProvider>
            <Suspense fallback={null}>
              <GlobalLoader />
            </Suspense>
            <RouteChrome>
              <AnimationWrapper>{children}</AnimationWrapper>
            </RouteChrome>
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
