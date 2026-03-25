"use client";
import { motion } from "framer-motion";
import styles from "./contact.module.css";
import { useLanguage } from "@/context/LanguageContext";

export default function ContactPage() {
    const { lang } = useLanguage();
    return (
        <div className={styles.container}>
            <motion.div
                className={styles.hero}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <span className={styles.badge} style={{ fontSize: "1.1rem", padding: "0.4rem 1rem" }}>{lang === 'ar' ? "تواصل معنا" : "Contact Us"}</span>
                <h1 className={styles.title} style={{ fontSize: "3rem" }}>{lang === 'ar' ? "نحن هنا لخدمتك" : "We are here to serve you"}</h1>
                <p className={styles.subtitle} style={{ fontSize: "1.2rem" }}>{lang === 'ar' ? "يسعدنا الرد على استفساراتكم واقتراحاتكم في أي وقت" : "We are happy to answer your inquiries and suggestions at any time"}</p>
            </motion.div>

            <div className={styles.grid}>
                <motion.div
                    className={styles.contactInfo}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className={styles.infoCard} style={{ fontSize: "1.2rem" }}>
                        <div className={styles.icon} style={{ fontSize: "2rem" }}>📍</div>
                        <h3 style={{ fontSize: "1.5rem" }}>{lang === 'ar' ? "موقعنا" : "Location"}</h3>
                        <p>{lang === 'ar' ? "المملكة العربية السعودية، الرياض" : "Riyadh, Saudi Arabia"}</p>
                    </div>
                    <div className={styles.infoCard} style={{ fontSize: "1.2rem" }}>
                        <div className={styles.icon} style={{ fontSize: "2rem" }}>📞</div>
                        <h3 style={{ fontSize: "1.5rem" }}>{lang === 'ar' ? "رقم التواصل" : "Contact Number"}</h3>
                        <p dir="ltr">+966 55 XXX XXXX</p>
                    </div>
                    <div className={styles.infoCard} style={{ fontSize: "1.2rem" }}>
                        <div className={styles.icon} style={{ fontSize: "2rem" }}>✉️</div>
                        <h3 style={{ fontSize: "1.5rem" }}>{lang === 'ar' ? "البريد الإلكتروني" : "Email"}</h3>
                        <p>support@jhdline.com</p>
                    </div>
                    <div className={styles.infoCard} style={{ fontSize: "1.2rem" }}>
                        <div className={styles.icon} style={{ fontSize: "2rem" }}>🕒</div>
                        <h3 style={{ fontSize: "1.5rem" }}>{lang === 'ar' ? "ساعات العمل" : "Working Hours"}</h3>
                        <p>{lang === 'ar' ? "السبت - الخميس: 9:00 ص - 10:00 م" : "Saturday - Thursday: 9:00 AM - 10:00 PM"}</p>
                    </div>
                </motion.div>

                <motion.div
                    className={styles.formContainer}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                        <div className={styles.inputGroup} style={{ fontSize: "1.1rem" }}>
                            <label>{lang === 'ar' ? "الاسم الكامل" : "Full Name"}</label>
                            <input type="text" placeholder={lang === 'ar' ? "أدخل اسمك هنا" : "Enter your name"} required style={{ fontSize: "1.2rem", padding: "1rem" }} />
                        </div>
                        <div className={styles.inputGroup} style={{ fontSize: "1.1rem" }}>
                            <label>{lang === 'ar' ? "البريد الإلكتروني" : "Email Address"}</label>
                            <input type="email" placeholder="example@mail.com" required style={{ fontSize: "1.2rem", padding: "1rem" }} />
                        </div>
                        <div className={styles.inputGroup} style={{ fontSize: "1.1rem" }}>
                            <label>{lang === 'ar' ? "الموضوع" : "Subject"}</label>
                            <input type="text" placeholder={lang === 'ar' ? "كيف يمكننا مساعدتك؟" : "How can we help?"} required style={{ fontSize: "1.2rem", padding: "1rem" }} />
                        </div>
                        <div className={styles.inputGroup} style={{ fontSize: "1.1rem" }}>
                            <label>{lang === 'ar' ? "الرسالة" : "Message"}</label>
                            <textarea rows={5} placeholder={lang === 'ar' ? "اكتب استفسارك هنا..." : "Type your inquiry here..."} required style={{ fontSize: "1.2rem", padding: "1rem" }}></textarea>
                        </div>
                        <motion.button
                            type="submit"
                            className={styles.submitBtn}
                            style={{ fontSize: "1.2rem", padding: "1rem 2rem" }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {lang === 'ar' ? "إرسال الرسالة" : "Send Message"}
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
                <div className={styles.mapPlaceholder} style={{ fontSize: "1.2rem" }}>
                    <span>{lang === 'ar' ? "خريطة تفاعلية (سيتم إضافتها قريباً)" : "Interactive Map (Coming soon)"}</span>
                </div>
            </motion.div>
        </div>
    );
}
