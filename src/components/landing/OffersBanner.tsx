"use client";

import { useState, useEffect } from "react";
import { OfferAPI, Offer } from "@/lib/api/offers";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export function OffersBanner() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        OfferAPI.getAll().then(setOffers);
    }, []);

    useEffect(() => {
        if (offers.length > 1) {
            const interval = setInterval(() => {
                setCurrentOfferIndex((prev) => (prev + 1) % offers.length);
            }, 5000); // Rotate every 5 seconds
            return () => clearInterval(interval);
        }
    }, [offers]);

    if (!isVisible || offers.length === 0) return null;

    const offer = offers[currentOfferIndex];

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`relative z-[60] ${offer.bg_color} ${offer.text_color} overflow-hidden shadow-md`}
        >
            <div className="max-w-7xl mx-auto px-6 py-2 md:py-3 flex justify-between items-center text-xs md:text-sm font-bold tracking-wide">
                <div className="flex-1 text-center md:text-left flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                    <span className="bg-white/20 px-2 py-0.5 rounded uppercase text-[10px] md:text-xs">
                        {offer.title}
                    </span>
                    <span>
                        {offer.description}
                        {offer.code && (
                            <span className="ml-2 bg-white text-black px-2 py-0.5 rounded border border-black/10 shadow-sm font-mono">
                                Code: {offer.code}
                            </span>
                        )}
                    </span>
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="ml-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </motion.div>
    );
}
