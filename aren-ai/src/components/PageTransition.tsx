import React, { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PageTransitionProps {
    children: ReactNode;
    variant?: 'default' | 'fade';
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, variant = 'default' }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: variant === 'fade' ? 0 : 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ width: "100%", height: "100%" }}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
