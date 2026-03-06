"use client";
import { motion } from "framer-motion";
import styles from "./contact.module.css";

export default function ContactPage() {
    return (
        <div className={styles.container}>
            <motion.div
                className={styles.hero}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <span className={styles.badge}>تواصل معنا</span>
                <h1 className={styles.title}>نحن هنا لخدمتك</h1>
                <p className={styles.subtitle}>يسعدنا الرد على استفساراتكم واقتراحاتكم في أي وقت</p>
            </motion.div>

            <div className={styles.grid}>
                <motion.div
                    className={styles.contactInfo}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className={styles.infoCard}>
                        <div className={styles.icon}>📍</div>
                        <h3>موقعنا</h3>
                        <p>المملكة العربية السعودية، الرياض</p>
                    </div>
                    <div className={styles.infoCard}>
                        <div className={styles.icon}>📞</div>
                        <h3>رقم التواصل</h3>
                        <p dir="ltr">+966 55 XXX XXXX</p>
                    </div>
                    <div className={styles.infoCard}>
                        <div className={styles.icon}>✉️</div>
                        <h3>البريد الإلكتروني</h3>
                        <p>support@jhdline.com</p>
                    </div>
                    <div className={styles.infoCard}>
                        <div className={styles.icon}>🕒</div>
                        <h3>ساعات العمل</h3>
                        <p>السبت - الخميس: 9:00 ص - 10:00 م</p>
                    </div>
                </motion.div>

                <motion.div
                    className={styles.formContainer}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                        <div className={styles.inputGroup}>
                            <label>الاسم الكامل</label>
                            <input type="text" placeholder="أدخل اسمك هنا" required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>البريد الإلكتروني</label>
                            <input type="email" placeholder="example@mail.com" required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>الموضوع</label>
                            <input type="text" placeholder="كيف يمكننا مساعدتك؟" required />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>الرسالة</label>
                            <textarea rows={5} placeholder="اكتب استفسارك هنا..." required></textarea>
                        </div>
                        <motion.button
                            type="submit"
                            className={styles.submitBtn}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            إرسال الرسالة
                        </motion.button>
                    </form>
                </motion.div>
            </div>

            <motion.div
                className={styles.mapContainer}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
            >
                <div className={styles.mapPlaceholder}>
                    <span>خريطة تفاعلية (سيتم إضافتها قريباً)</span>
                </div>
            </motion.div>
        </div>
    );
}
