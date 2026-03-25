"use client";
import { motion } from "framer-motion";
import styles from "./policy.module.css";
import { useLanguage } from "@/context/LanguageContext";

const POLICIES_AR = [
    {
        title: "سياسة الخصوصية",
        id: "privacy",
        content: "نحن في JHD.LINE ملتزمون بحماية خصوصيتك وبياناتك الشخصية. يتم استخدام المعلومات المقدمة فقط لتحسين تجربتك في التسوق ومعالجة طلباتك بأمان. نحن لا نشارك بياناتك مع أي جهات خارجية إلا فيما تقتضيه عملية التوصيل أو المتطلبات القانونية."
    },
    {
        title: "سياسة الشحن والتوصيل",
        id: "shipping",
        content: "نسعى جاهدين لتوصيل مشترياتك في أسرع وقت ممكن. عادة ما يستغرق الشحن داخل المملكة من 2-5 أيام عمل. يتم احتساب تكلفة الشحن بناءً على وزن الطلب والمنطقة المختارة وسيظهر لك التفصيل الكامل عند إتمام الطلب."
    },
    {
        title: "سياسة الاستبدال والاسترجاع",
        id: "returns",
        content: "يُرجى الملاحظة أن بعض المنتجات ذات الطبيعة الخاصة (مثل العطور المفتوحة أو المنتجات المصممة بناءً على الطلب) لا تخضع لسياسة الاسترجاع إلا في حال وجود عيب مصنعي. في الحالات الأخرى، يمكنك طلب الاسترجاع خلال 7 أيام من استلام الطلب بشرط أن يكون المنتج بحالته الأصلية."
    },
    {
        title: "الشروط والأحكام",
        id: "terms",
        content: "باستخدامك لموقعنا، فإنك توافق على الالتزام بكافة الشروط والأحكام المذكورة. نحن نحتفظ بالحق في تعديل هذه السياسات في أي وقت لضمان تقديم أفضل خدمة ممكنة لعملائنا."
    }
];

const POLICIES_EN = [
    {
        title: "Privacy Policy",
        id: "privacy",
        content: "At JHD.LINE, we are committed to protecting your privacy and personal data. Provided information is solely used to enhance your shopping experience and safely process your orders. We do not share your data with third parties except as required for delivery or legal obligations."
    },
    {
        title: "Shipping & Delivery Policy",
        id: "shipping",
        content: "We strive to deliver your purchases as quickly as possible. Shipping within the region usually takes 2-5 business days. Shipping costs are calculated based on the order's weight and selected region, and the full breakdown will be shown at checkout."
    },
    {
        title: "Exchange & Return Policy",
        id: "returns",
        content: "Please note that certain products with a special nature (like opened perfumes or custom-designed products) are not subject to the return policy unless there is a manufacturing defect. In other cases, you can request a return within 7 days of receiving the order, provided the product is in its original condition."
    },
    {
        title: "Terms & Conditions",
        id: "terms",
        content: "By using our website, you agree to abide by all the mentioned terms and conditions. We reserve the right to modify these policies at any time to ensure we provide the best possible service to our customers."
    }
];

export default function PolicyPage() {
    const { lang } = useLanguage();
    const POLICIES = lang === 'ar' ? POLICIES_AR : POLICIES_EN;
    return (
        <div className={styles.container}>
            <motion.div
                className={styles.sidebar}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h2 className={styles.sidebarTitle} style={{ fontSize: "1.8rem" }}>{lang === 'ar' ? "الأقسام" : "Sections"}</h2>
                <nav className={styles.nav}>
                    {POLICIES.map(p => (
                        <a key={p.id} href={`#${p.id}`} className={styles.navLink} style={{ fontSize: "1.2rem" }}>
                            <span className={styles.dot}>•</span>
                            {p.title}
                        </a>
                    ))}
                </nav>
            </motion.div>

            <div className={styles.content}>
                <motion.div
                    className={styles.header}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className={styles.title} style={{ fontSize: "3rem" }}>{lang === 'ar' ? "سياسات المتجر" : "Store Policies"}</h1>
                    <p className={styles.lastUpdate} style={{ fontSize: "1.1rem" }}>{lang === 'ar' ? "آخر تحديث: مارس 2026" : "Last Update: March 2026"}</p>
                </motion.div>

                <div className={styles.sections}>
                    {POLICIES.map((p, i) => (
                        <motion.section
                            key={p.id}
                            id={p.id}
                            className={styles.section}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <h2 className={styles.sectionTitle} style={{ fontSize: "2rem" }}>
                                <span style={{ color: "var(--primary)" }}>✦</span>
                                {p.title}
                            </h2>
                            <div className={styles.sectionBody} style={{ fontSize: "1.2rem", lineHeight: "1.8" }}>
                                {p.content}
                            </div>
                        </motion.section>
                    ))}
                </div>
            </div>
        </div>
    );
}
