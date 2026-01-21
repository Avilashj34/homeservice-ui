"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ServiceAPI } from "@/lib/api/services";
import { Service } from "@/types";

export default function Home() {
    const [services, setServices] = useState<Service[]>([]);

    useEffect(() => {
        ServiceAPI.getAll().then(setServices).catch(console.error);
    }, []);

    return (
        <main className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="text-xl font-bold tracking-tight">CANYFIX.</div>

                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
                        FIX YOUR <br />
                        HOME <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-black">INSTANTLY.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mb-12 font-medium">
                        Premium home services at your fingertips. Electricians, Plumbers, and Carpenters ready to deploy.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {services.length > 0 ? (
                            services.map(s => {
                                const icon = s.name.toLowerCase().includes('electric') ? '⚡' :
                                    s.name.toLowerCase().includes('plumb') ? '💧' :
                                        s.name.toLowerCase().includes('carpenter') ? '🪑' : '🛠️';
                                return (
                                    <ServiceCard
                                        key={s.id}
                                        href={`/book?service_id=${s.id}`}
                                        title={s.name}
                                        desc={s.description || "Professional service at your doorstep."}
                                        icon={icon}
                                    />
                                );
                            })
                        ) : (
                            <div className="md:col-span-3 text-center text-gray-400 py-10">Loading services...</div>
                        )}
                    </div>
                </div>
            </section>

            {/* Trust/Stats Section */}
            <section className="py-20 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
                    <div>
                        <h3 className="text-4xl font-bold bg-black text-white inline-block px-2">500+</h3>
                        <p className="mt-2 text-gray-500 font-medium">Experts Ready</p>
                    </div>
                    <div>
                        <h3 className="text-4xl font-bold bg-black text-white inline-block px-2">15min</h3>
                        <p className="mt-2 text-gray-500 font-medium">Avg. Response</p>
                    </div>
                    <div>
                        <h3 className="text-4xl font-bold bg-black text-white inline-block px-2">4.9/5</h3>
                        <p className="mt-2 text-gray-500 font-medium">User Rating</p>
                    </div>
                </div>
            </section>
        </main>
    );
}

function ServiceCard({ href, title, desc, icon }: { href: string, title: string, desc: string, icon: string }) {
    return (
        <Link href={href} className="group relative block bg-gray-50 hover:bg-black hover:text-white transition-all duration-300 p-8 rounded-xl border border-transparent hover:border-black overflow-hidden">
            <div className="absolute top-4 right-4 text-2xl opacity-20 group-hover:opacity-100 transition-opacity">{icon}</div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                {title}
                <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">→</span>
            </h2>
            <p className="text-gray-500 group-hover:text-gray-300 font-medium leading-relaxed">
                {desc}
            </p>
        </Link>
    )
}
