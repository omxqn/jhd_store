"use client";
import Link from "next/link";
import styles from "./Footer.module.css";
import { motion } from "framer-motion";

export function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.grid}`}>
                {/* Brand Column */}
                <div className={styles.brandCol}>
                    <Link href="/" className={styles.logo}>
                        <div className={styles.logoMark}>J</div>
                        <div className={styles.logoText}>JHD <span>LINE</span></div>
                    </Link>
                    <p className={styles.description}>
                        من الرسم إلى التطريز، نبدع بشغف لنضع الإبداع في كل تصميم. نحرص على أن يحمل بصمتكم الخاصة، وأن يعكس جمال التفاصيل ودقة التنفيذ.
                    </p>
                    <div className={styles.socials}>
                        <a href="#" className={styles.socialIcon}>Instagram</a>
                        <a href="#" className={styles.socialIcon}>Twitter</a>
                        <a href="#" className={styles.socialIcon}>TikTok</a>
                    </div>
                </div>

                {/* Links Columns */}
                <div className={styles.linksCol}>
                    <h3 className={styles.colTitle}>روابط سريعة</h3>
                    <ul className={styles.linksList}>
                        <li><Link href="/">الرئيسية</Link></li>
                        <li><Link href="/category/all">المتجر</Link></li>
                        <li><Link href="/about">عن جهاد</Link></li>
                    </ul>
                </div>

                <div className={styles.linksCol}>
                    <h3 className={styles.colTitle}>الدعم</h3>
                    <ul className={styles.linksList}>
                        <li><Link href="/contact">تواصل معنا</Link></li>
                        <li><Link href="/policy">سياسة الاستبدال</Link></li>
                        <li><Link href="/policy#privacy">سياسة الخصوصية</Link></li>
                    </ul>
                </div>

                {/* Newsletter Column */}
                <div className={styles.newsletterCol}>
                    <h3 className={styles.colTitle}>النشرة البريدية</h3>
                    <p className={styles.newsletterText}>اشترك لتصلك أحدث المجموعات والعروض الحصرية</p>
                    <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
                        <input type="email" placeholder="بريدك الإلكتروني" className={styles.input} />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={styles.submitBtn}
                        >
                            اشتراك
                        </motion.button>
                    </form>
                </div>
            </div>

            <div className={styles.bottomBar}>
                <div className="container">
                    <p>© {new Date().getFullYear()} JHD.LINE. جميع الحقوق محفوظة.</p>
                </div>
            </div>
        </footer>
    );
}
