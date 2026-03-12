"use client";
import { motion } from "framer-motion";
import styles from "./BrandLoader.module.css";

export function BrandLoader({ fullPage = true }: { fullPage?: boolean }) {
    return (
        <div className={`${styles.loaderContainer} ${fullPage ? styles.fullPage : ""}`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                    opacity: [0.4, 1, 0.4],
                    scale: [0.95, 1.05, 0.95],
                }}
                transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                }}
                className={styles.logoWrapper}
            >
                <img src="/heart-logo.png" alt="Loading..." className={styles.logo} />
            </motion.div>
        </div>
    );
}
