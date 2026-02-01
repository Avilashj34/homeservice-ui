"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
    return (
        <section className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden pt-32">
            {/* Background Image with Light Gradient Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/images/landing/hero_bg_1769921683199.png')" }}
            >
                {/* White gradient fade for light theme */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/90" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
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
                    className="text-lg md:text-2xl text-gray-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed tracking-tight"
                >
                    Premium home services at your fingertips. <br className="hidden md:block" />
                    <span className="text-gray-900 font-bold">Electricians</span>, <span className="text-gray-900 font-bold">Plumbers</span>, and <span className="text-gray-900 font-bold">Carpenters</span> ready to deploy.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-wrap gap-4 md:gap-6 justify-center items-center"
                >
                    {[
                        { id: 1, name: "Electrician", icon: "⚡", color: "text-amber-500" },
                        { id: 2, name: "Plumber", icon: "💧", color: "text-blue-500" },
                        { id: 3, name: "Carpenter", icon: "🪑", color: "text-orange-700" }
                    ].map((s) => (
                        <Link key={s.id} href={`/book?service_id=${s.id}`}>
                            <div className="group w-32 h-36 md:w-44 md:h-48 bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl flex flex-col items-center justify-center gap-3 md:gap-4 hover:bg-white hover:scale-105 hover:shadow-2xl hover:border-orange-100 transition-all duration-300 cursor-pointer shadow-sm">
                                <span className={`text-4xl md:text-6xl drop-shadow-sm group-hover:scale-110 transition-transform duration-300 ${s.color}`}>{s.icon}</span>
                                <span className="text-gray-600 group-hover:text-black font-bold tracking-wider text-xs md:text-xs uppercase">{s.name}</span>
                            </div>
                        </Link>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-16"
                >
                    <p className="text-sm text-gray-400 font-bold tracking-widest uppercase text-[10px]">Or browse all <Link href="/services" className="underline hover:text-black transition-colors">services</Link></p>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-400"
            >
                <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center pt-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                </div>
            </motion.div>
        </section>
    );
}
