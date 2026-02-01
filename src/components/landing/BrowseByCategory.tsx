"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

// Hardcoded top issues to feature (based on user request)
const TOP_ISSUES = [
    {
        name: "Switch / Socket Replacement",
        price: 199,
        img: "/images/issues/issue_switch_replacement_1769928166162.png",
        service_id: 1, // Assumed ID for Electrician
        color: "bg-blue-50 text-blue-600"
    },
    {
        name: "Tap Repair",
        price: 249,
        img: "/images/issues/issue_tap_repair_1769928182281.png",
        service_id: 2, // Assumed ID for Plumber
        color: "bg-cyan-50 text-cyan-600"
    },
    {
        name: "Door Hinge Repair",
        price: 349,
        img: "/images/issues/issue_door_hinge_1769928197715.png",
        service_id: 3, // Assumed ID for Carpenter
        color: "bg-amber-50 text-amber-600"
    },
    {
        name: "Wash Basin Installation",
        price: 899,
        img: "/images/issues/issue_basin_install_1769928231649.png",
        service_id: 2,
        color: "bg-indigo-50 text-indigo-600"
    }
];

export function BrowseByCategory() {
    return (
        <section className="py-24 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-black mb-4">POPULAR FIXES.</h2>
                    <p className="text-gray-500 text-lg">Common home issues we solve everyday.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {TOP_ISSUES.map((issue, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link href={`/book?service_id=${issue.service_id}`} className="group block">
                                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-gray-100">
                                    <Image
                                        src={issue.img}
                                        alt={issue.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <h3 className="font-bold text-lg mb-1 group-hover:text-black transition-colors">{issue.name}</h3>
                                <p className="text-gray-500 font-medium">Starts at ₹{issue.price}</p>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
