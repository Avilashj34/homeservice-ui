"use client";

import { useState, useEffect } from "react";
import { ServiceAPI } from "@/lib/api/services";
import { Service } from "@/types";
import { HeroSection } from "@/components/landing/HeroSection";
// import { ServiceGrid } from "@/components/landing/ServiceGrid"; // Hiding ServiceGrid in favor of AllServicesList as per intent
import { BrowseByCategory } from "@/components/landing/BrowseByCategory";
import { AllServicesList } from "@/components/landing/AllServicesList";
import { FAQ } from "@/components/landing/FAQ";

export default function Home() {
    const [services, setServices] = useState<Service[]>([]);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        ServiceAPI.getAll().then(setServices).catch(console.error);

        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <main className="min-h-screen bg-white text-black font-sans selection:bg-orange-500 selection:text-white">
            {/* Navbar: Transparent at top, White + Shadow on scroll */}
            <nav
                className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 py-2" : "bg-transparent py-6"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="text-3xl font-black tracking-tight text-gray-900 flex items-center">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Home</span>Service.
                    </div>
                </div>
            </nav>

            <HeroSection />
            <BrowseByCategory />

            {/* <ServiceGrid services={services} />  Replaced/Augmented by AllServicesList for cleaner "all services" view */}
            <AllServicesList services={services} />

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
