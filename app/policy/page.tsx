"use client";
import { motion } from "framer-motion";
import styles from "./policy.module.css";

const POLICIES = [
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

export default function PolicyPage() {
    return (
        <div className={styles.container}>
            <motion.div
                className={styles.sidebar}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h2 className={styles.sidebarTitle}>الأقسام</h2>
                <nav className={styles.nav}>
                    {POLICIES.map(p => (
                        <a key={p.id} href={`#${p.id}`} className={styles.navLink}>
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
                    <h1 className={styles.title}>سياسات المتجر</h1>
                    <p className={styles.lastUpdate}>آخر تحديث: مارس 2026</p>
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
                            <h2 className={styles.sectionTitle}>
                                <span style={{ color: "var(--primary)" }}>✦</span>
                                {p.title}
                            </h2>
                            <div className={styles.sectionBody}>
                                {p.content}
                            </div>
                        </motion.section>
                    ))}
                </div>
            </div>
        </div>
    );
}
