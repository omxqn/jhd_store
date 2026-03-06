import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import AnimationWrapper from "@/components/AnimationWrapper";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Jihad Store — Premium GCC Fashion",
  description: "Discover premium thobes, abayas and traditional GCC garments. Custom tailoring available.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div style={{
            background: "var(--primary)",
            color: "#fff",
            padding: "clamp(4px, 1.5vw, 10px) 0",
            overflow: "hidden",
            whiteSpace: "nowrap",
            fontSize: "clamp(0.6rem, 2vw, 0.9rem)",
            fontWeight: 700,
            fontFamily: "var(--ff-serif)",
            letterSpacing: "0.5px",
            textAlign: "center",
            position: "relative",
            zIndex: 1000,
            width: "100%"
          }}>
            <div style={{ display: "inline-block", animation: "marquee 25s linear infinite" }}>
              استخدم كود OMAN10 للحصول على خصم 10% على طلبك الأول! 🎁 &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; شحن مجاني لجميع دول الخليج للطلبات فوق 500 ريال
            </div>
          </div>
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
      </body>
    </html>
  );
}
