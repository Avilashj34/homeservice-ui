"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { Offer, OfferAPI } from "@/lib/api/offers";
import { ServiceAPI } from "@/lib/api/services";
import { Service } from "@/types";
import { useState, useEffect } from "react";

export function HeroSection() {
    const [exclusiveOffer, setExclusiveOffer] = useState<Offer | null>(null);
    const [services, setServices] = useState<Service[]>([]);

    useEffect(() => {
        OfferAPI.getAll().then(offers => {
            const firstBookingOffer = offers.find(o => o.is_new_user_exclusive);
            if (firstBookingOffer) setExclusiveOffer(firstBookingOffer);
        });

        ServiceAPI.getAll().then(data => {
            setServices(data || []);
        });
    }, []);

    return (
        <section className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden pt-32 bg-white">
            <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {exclusiveOffer && (
                        <div className="mb-6 inline-block">
                            <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-1.5 rounded-full text-sm md:text-base font-bold shadow-lg animate-pulse tracking-wide">
                                🎁 {exclusiveOffer.description} <span className="underline ml-1">Use Code: {exclusiveOffer.code}</span>
                            </span>
                        </div>
                    )}
                    <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-[1.0] text-gray-900">
                        FIX YOUR <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500">
                            HOME INSTANTLY.
                        </span>
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-lg md:text-2xl text-gray-500 max-w-2xl mx-auto mb-6 font-medium leading-relaxed tracking-tight"
                >
                    Premium home services at your fingertips. <br className="hidden md:block" />
                    <span className="text-gray-900 font-bold">Electricians</span>, <span className="text-gray-900 font-bold">Plumbers</span>, and <span className="text-gray-900 font-bold">Carpenters</span>.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-wrap gap-4 md:gap-6 justify-center items-center bg-gray-50 p-6 md:p-8 rounded-3xl border border-gray-100"
                >
                    {/* Dynamic Services from API */}
                    {services.map((s) => (
                        <Link key={s.id} href={`/book?service_id=${s.id}`}>
                            <div className="group w-32 h-36 md:w-44 md:h-48 bg-white border border-gray-100 rounded-3xl flex flex-col items-center justify-center gap-3 md:gap-4 hover:bg-white hover:scale-105 hover:shadow-xl hover:border-orange-100 transition-all duration-300 cursor-pointer shadow-sm">
                                <span className={`text-4xl md:text-6xl drop-shadow-sm group-hover:scale-110 transition-transform duration-300 ${s.color_theme || "text-gray-900"}`}>
                                    {s.icon || "🔧"}
                                </span>
                                <span className="text-gray-600 group-hover:text-black font-bold tracking-wider text-xs md:text-xs uppercase">{s.name}</span>
                            </div>
                        </Link>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
