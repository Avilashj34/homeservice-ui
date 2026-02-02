"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ServiceAPI } from "@/lib/api/services";
import { Service } from "@/types";
import { motion } from "framer-motion";

export function BrowseByCategory() {
    const [services, setServices] = useState<Service[]>([]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        ServiceAPI.getAll().then(data => {
            setServices(data);
        });
    }, []);

    // Derived Top Issues
    const topIssues = services.flatMap(s =>
        s.categories?.flatMap(c =>
            c.issues.filter(i => i.is_top_issue).map(i => ({ ...i, serviceName: s.name, categoryName: c.name }))
        ) || []
    ).slice(0, 10); // Limit to top 10

    // Auto-scroll effect for mobile
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        let animationFrameId: number;
        let scrollAmount = 0;
        const speed = 0.5; // slow speed

        const animate = () => {
            if (container) {
                scrollAmount += speed;
                if (scrollAmount >= container.scrollWidth / 2) {
                    scrollAmount = 0;
                }
                container.scrollLeft = scrollAmount;
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        // Only animate on mobile
        if (window.innerWidth < 768) {
            // CSS animation is used instead for smoother marquee
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [topIssues]);

    return (
        <section className="py-10 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Browse by Category</h2>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">Explore our extensive catalog of home services.</p>
                </div>

                {/* Top Issues - Mobile Marquee / Desktop Grid */}
                {topIssues.length > 0 && (
                    <div className="mb-12">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-wider px-2">🔥 Popular Issues</h3>

                        {/* Mobile: Marquee Scroll */}
                        <div className="block md:hidden overflow-hidden relative w-full">
                            <div className="flex gap-4 animate-marquee whitespace-nowrap">
                                {[...topIssues, ...topIssues].map((issue, idx) => (
                                    <div key={`${issue.id}-${idx}`} className="inline-block w-64 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                        <div className="flex items-center gap-4">
                                            {issue.image_url ? (
                                                <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                    <Image
                                                        src={issue.image_url}
                                                        alt={issue.name}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0" />
                                            )}
                                            <div className="whitespace-normal">
                                                <div className="font-bold text-gray-900 text-sm">{issue.name}</div>
                                                <div className="text-xs text-gray-500 mt-1">₹{issue.price} • {issue.serviceName}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Desktop: Grid */}
                        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {topIssues.map(issue => (
                                <div key={issue.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                                    {issue.image_url ? (
                                        <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                            <Image
                                                src={issue.image_url}
                                                alt={issue.name}
                                                fill
                                                className="object-cover"
                                                unoptimized // Needed for external S3 URLs unless configured in next.config.js
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0" />
                                    )}
                                    <div>
                                        <div className="font-bold text-gray-900 text-sm">{issue.name}</div>
                                        <div className="text-xs text-gray-500 mt-1">₹{issue.price}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
