"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";

const faqs = [
    {
        q: "How quickly can I get a professional?",
        a: "Our average response time is under 15 minutes. Once booked, a professional can be at your doorstep within the hour for emergency services."
    },
    {
        q: "Are your experts vetted?",
        a: "Absolutely. Every professional undergoes a rigorous background check, skill assessment, and verification process before joining our platform."
    },
    {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards, UPI, and digital wallets. Payment is held securely in escrow until the job is completed to your satisfaction."
    },
    {
        q: "Is there a warranty on the service?",
        a: "Yes! All jobs come with a 7-day satisfaction guarantee. If something isn't right, we'll fix it for free."
    }
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 px-6 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                {/* Visual Side */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    <div className="relative aspect-square max-w-lg mx-auto">
                        <Image
                            src="/images/landing/faq_illustration_1769921750017.png"
                            alt="FAQ Illustration"
                            fill
                            className="object-contain drop-shadow-2xl"
                        />
                    </div>
                </motion.div>

                {/* FAQ List */}
                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                    <h2 className="text-4xl font-black mb-10 tracking-tight">FREQUENTLY ASKED.</h2>

                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                    className="w-full flex items-center justify-between p-6 text-left"
                                >
                                    <span className="font-bold text-lg">{faq.q}</span>
                                    <span className={`transform transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}>
                                        ▼
                                    </span>
                                </button>
                                <AnimatePresence>
                                    {openIndex === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="p-6 pt-0 text-gray-500 leading-relaxed border-t border-gray-50">
                                                {faq.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
