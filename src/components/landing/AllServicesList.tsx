"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Service } from "@/types";
import { useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

export function AllServicesList({ services }: { services: Service[] }) {
    const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id.toString() || "1");

    if (!services || services.length === 0) return null;

    const activeService = services.find(s => s.id.toString() === selectedServiceId) || services[0];

    return (
        <section className="py-10 bg-white" id="services">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter">
                        EXPLORE MENU.
                    </h2>
                    <p className="text-xl text-gray-500">Everything you need for your home.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Sidebar Tabs */}
                    <div className="lg:w-1/4 flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 no-scrollbar">
                        {services.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setSelectedServiceId(s.id.toString())}
                                className={clsx(
                                    "px-6 py-4 rounded-xl text-left font-bold transition-all whitespace-nowrap lg:whitespace-normal",
                                    selectedServiceId === s.id.toString()
                                        ? "bg-black text-white shadow-lg"
                                        : "bg-white text-gray-500 hover:bg-gray-100"
                                )}
                            >
                                {s.name}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="lg:w-3/4 min-h-[500px]">
                        <motion.div
                            key={activeService.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100"
                        >
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold mb-2">{activeService.name} Services</h3>
                                <p className="text-gray-500">{activeService.description}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                                {activeService.categories?.sort((a, b) => a.order - b.order).map((category) => (
                                    <div key={category.id}>
                                        <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 uppercase text-xs tracking-wider">
                                            {category.name}
                                        </h4>
                                        <ul className="space-y-4">
                                            {category.issues.map((issue) => (
                                                <li key={issue.id} className="group flex justify-between items-start">
                                                    <div>
                                                        <Link href={`/book?service_id=${activeService.id}`} className="font-medium text-gray-700 group-hover:text-black group-hover:underline decoration-1 underline-offset-4 transition-colors">
                                                            {issue.name}
                                                        </Link>
                                                        {issue.is_inspection_required && (
                                                            <span className="ml-2 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                                                                INSPECTION
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm font-bold text-gray-400 group-hover:text-black transition-colors">
                                                        {issue.is_inspection_required ? "—" : `₹${issue.price}`}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
