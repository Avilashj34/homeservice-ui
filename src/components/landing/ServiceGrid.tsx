"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Service } from "@/types";

// Map service names to images and colors
const getServiceAssets = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('plumb')) return {
        img: '/images/landing/service_plumbing_1769921701745.png',
        color: 'from-blue-500/20 to-cyan-500/5',
        icon: '💧'
    };
    if (n.includes('electr')) return {
        img: '/images/landing/service_electrical_1769921718275.png',
        color: 'from-amber-500/20 to-yellow-500/5',
        icon: '⚡'
    };
    if (n.includes('carpen')) return {
        img: '/images/landing/service_carpentry_1769921733270.png',
        color: 'from-orange-700/20 to-amber-800/5',
        icon: '🪑'
    };
    return {
        img: '',
        color: 'from-gray-500/20 to-gray-500/5',
        icon: '🛠️'
    };
};

export function ServiceGrid({ services }: { services: Service[] }) {
    if (services.length === 0) return null;

    return (
        <section className="py-32 px-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black mb-4">OUR EXPERTISE</h2>
                    <p className="text-gray-500 text-lg">Curated professionals for every corner of your home.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {services.map((s, i) => {
                        const { img, color, icon } = getServiceAssets(s.name);
                        return (
                            <motion.div
                                key={s.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Link
                                    href={`/book?service_id=${s.id}`}
                                    className={`group relative block h-96 rounded-3xl overflow-hidden bg-white hover:shadow-2xl transition-all duration-500 border border-gray-100`}
                                >
                                    {/* Image Background */}
                                    {img && (
                                        <div
                                            className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-40 group-hover:scale-105 group-hover:opacity-60 transition-all duration-700"
                                            style={{ backgroundImage: `url('${img}')` }}
                                        />
                                    )}

                                    {/* Gradient Overlay */}
                                    <div className={`absolute inset-0 bg-gradient-to-b ${color}`} />

                                    <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-white via-white/80 to-transparent pt-32">
                                        <div className="text-4xl mb-4 transform group-hover:-translate-y-2 transition-transform duration-300">{icon}</div>
                                        <h3 className="text-3xl font-bold mb-2 group-hover:text-black transition-colors">{s.name}</h3>
                                        <p className="text-gray-500 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                            {s.description || "Professional service guaranteed."}
                                        </p>
                                    </div>

                                    <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transform rotate-45 group-hover:rotate-0 transition-all duration-300">
                                        →
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
