"use client";

import { useState, useEffect } from "react";
import { ServiceAPI } from "@/lib/api/services";
import { Service } from "@/types";
import { HeroSection } from "@/components/landing/HeroSection";
import { ServiceGrid } from "@/components/landing/ServiceGrid";
import { FAQ } from "@/components/landing/FAQ";

export default function Home() {
    const [services, setServices] = useState<Service[]>([]);

    useEffect(() => {
        ServiceAPI.getAll().then(setServices).catch(console.error);
    }, []);

    return (
        <main className="min-h-screen bg-white text-black font-sans selection:bg-orange-500 selection:text-white">
            {/* Navbar (Kept Simple for Overlay) */}
            <nav className="fixed top-0 w-full z-50 transition-all duration-300 pointer-events-none">
                <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between pointer-events-auto">
                    <div className="text-2xl font-black tracking-tighter mix-blend-difference text-white">
                        CANYFIX.
                    </div>
                    {/* Add menu items here if needed later */}
                </div>
            </nav>

            <HeroSection />
            <ServiceGrid services={services} />
            <FAQ />

            {/* Footer */}
            <footer className="bg-black text-white py-12 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>© 2024 CanyFix Inc. All rights reserved.</p>
                    <p className="mt-4 md:mt-0">Made with ❤️ for Home.</p>
                </div>
            </footer>
        </main>
    );
}
