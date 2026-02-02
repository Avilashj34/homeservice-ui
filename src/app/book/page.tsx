"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ServiceAPI } from "@/lib/api/services";
import { BookingCreate, Service, ServiceCategory, ServiceIssue } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { MultiBookingAPI as BookingClient } from "@/lib/api/bookings";
import { motion, AnimatePresence } from "framer-motion";

import axios from "axios";
import { toast } from "sonner"; // Assuming sonner is used, or use existing toast lib

function BookingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preSelectedServiceId = searchParams.get("service_id");

    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submittedBooking, setSubmittedBooking] = useState<any | null>(null);

    // Selection State
    const [selectedService, setSelectedService] = useState<Service | undefined>(undefined);
    const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | undefined>(undefined);
    const [selectedIssue, setSelectedIssue] = useState<ServiceIssue | undefined>(undefined);

    // Form State
    const [newBooking, setNewBooking] = useState<BookingCreate>({
        customer_name: "",
        customer_phone: 0,
        service_id: 0,
        address: "",
        media_ids: [],
        user_comment: ""
    } as any);

    const [bookingDate, setBookingDate] = useState("");
    const [bookingTime, setBookingTime] = useState("");
    const [uploadedMedia, setUploadedMedia] = useState<{ id: number, url: string, type: string }[]>([]);

    // Offer State
    const [couponCode, setCouponCode] = useState("");
    const [isEligibleForOffer, setIsEligibleForOffer] = useState(false);

    useEffect(() => {
        fetchServices();
    }, []);

    // Handle pre-selection
    useEffect(() => {
        if (services.length > 0 && preSelectedServiceId) {
            const s = services.find(s => s.id === parseInt(preSelectedServiceId));
            if (s) {
                setSelectedService(s);
                setNewBooking(prev => ({ ...prev, service_id: s.id }));

                // Auto-select first category
                if (s.categories && s.categories.length > 0) {
                    const sorted = [...s.categories].sort((a, b) => a.order - b.order);
                    setSelectedCategory(sorted[0]);
                }
            }
        }
    }, [services, preSelectedServiceId]);

    const fetchServices = async () => {
        try {
            const data = await ServiceAPI.getAll();
            setServices(data);
        } catch (err) {
            console.error("Failed to fetch services");
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            try {
                const file = e.target.files[0];
                const response = await BookingClient.upload(file);
                setUploadedMedia([...uploadedMedia, response]);
            } catch (err) {
                alert("File upload failed");
            }
        }
    };

    const handlePhoneBlur = async () => {
        if (newBooking.customer_phone && newBooking.customer_phone.toString().length >= 10) {
            try {
                // Check eligibility
                const res = await axios.get(`http://localhost:8000/bookings/check-eligibility?phone=${newBooking.customer_phone}`);
                if (res.data.is_new_user) {
                    setIsEligibleForOffer(true);
                    // Fetch offers to find the code
                    // Optimization: Could cache this or pass as prop
                    const offersRes = await axios.get(`http://localhost:8000/offers/`);
                    const exclusive = offersRes.data.find((o: any) => o.is_new_user_exclusive);
                    if (exclusive) {
                        setCouponCode(exclusive.code);
                        toast.success(`First booking offer '${exclusive.code}' applied!`);
                    }
                } else {
                    setIsEligibleForOffer(false);
                    if (couponCode === "BOOK50") { // specific check to only clear if it was the auto-applied one
                        setCouponCode("");
                        toast.info("Offer not applicable for existing users.");
                    }
                }
            } catch (err) {
                console.error("Eligibility check failed", err);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            let isoDate = undefined;
            if (bookingDate && bookingTime) {
                isoDate = new Date(`${bookingDate}T${bookingTime}`).toISOString();
            }

            // Append specific issue details to comments
            let fullComment = newBooking.user_comment || "";
            if (selectedCategory && selectedIssue) {
                fullComment = `[Issue: ${selectedCategory.name} - ${selectedIssue.name}] ` + fullComment;
            }

            const payload: BookingCreate = {
                ...newBooking,
                service_id: selectedService?.id || 0,
                time_slot: isoDate,
                media_ids: uploadedMedia.map(m => m.id),
                status_id: 1,
                user_comment: fullComment,
                quote_price: selectedIssue?.price || selectedService?.base_price // Pass selected price as quote
            };

            const created = await BookingClient.create(payload);
            setSubmittedBooking(created);
        } catch (err) {
            alert("Failed to create booking. Please try again.");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (submittedBooking) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-xl border-t-4 border-black">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">🎉</span>
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">Booking Confirmed!</CardTitle>
                        <p className="text-gray-500 text-sm">Your booking ID is #{submittedBooking.id}</p>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Service</span>
                                <span className="font-semibold">{selectedService?.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Issue</span>
                                <span className="font-semibold">{selectedIssue?.name || "General"}</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Link href={`/track/${submittedBooking.tracking_id}`}>
                                <Button className="w-full bg-black text-white hover:bg-gray-800 h-12 text-lg">
                                    Track Your Booking
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button variant="outline" className="w-full border-gray-300">Return Home</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white text-black p-4 md:p-12 font-sans pb-32">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link href="/" className="text-sm font-bold text-gray-500 hover:text-black mb-4 block">← Back to Home</Link>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Book a Service</h1>
                    <p className="text-gray-500">Customize your request and get an instant estimate.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12">

                    {/* 1. Service Selection */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">1. Select Trade</h3>
                        <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar -mx-4 px-4 md:flex-wrap md:overflow-visible md:pb-0 md:mx-0 md:px-0">
                            {services.map((s) => (
                                <button
                                    type="button"
                                    key={s.id}
                                    onClick={() => {
                                        setSelectedService(s);
                                        // Auto-select first category if available
                                        if (s.categories && s.categories.length > 0) {
                                            const sorted = [...s.categories].sort((a, b) => a.order - b.order);
                                            setSelectedCategory(sorted[0]);
                                        } else {
                                            setSelectedCategory(undefined);
                                        }
                                        setSelectedIssue(undefined);
                                    }}
                                    className={`px-6 py-4 rounded-xl border-2 transition-all font-bold whitespace-nowrap flex-shrink-0 ${selectedService?.id === s.id
                                        ? "bg-black text-white border-black shadow-lg"
                                        : "bg-white text-gray-600 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                                        }`}
                                >
                                    {s.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. Category & Issue Selection (Dependent) */}
                    <AnimatePresence>
                        {selectedService && selectedService.categories && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-6 overflow-hidden"
                            >
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">2. What's the problem?</h3>

                                {/* Category Tabs - Horizontal Scroll */}
                                <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                                    {selectedService.categories.sort((a, b) => a.order - b.order).map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedCategory(cat);
                                                setSelectedIssue(undefined); // Reset issue when category changes
                                            }}
                                            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${selectedCategory?.id === cat.id
                                                ? "bg-black text-white border-black shadow-md"
                                                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                                                }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>

                                {/* Issues List for Selected Category */}
                                <div className="min-h-[200px]">
                                    {selectedCategory ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedCategory.issues.map((issue) => (
                                                <div
                                                    key={issue.id}
                                                    onClick={() => {
                                                        setSelectedIssue(issue);
                                                    }}
                                                    className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center group ${selectedIssue?.id === issue.id
                                                        ? "bg-black text-white border-black shadow-md scale-[1.02]"
                                                        : "bg-white border-gray-100 hover:border-black hover:bg-gray-50"
                                                        }`}
                                                >
                                                    <div className="flex gap-4 items-center">
                                                        {/* Optional: Add image preview here if we want more visual pop */}
                                                        {issue.image_url && (
                                                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                                <img src={issue.image_url} alt={issue.name} className="w-full h-full object-cover" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-bold">{issue.name}</div>
                                                            {issue.is_inspection_required ? (
                                                                <div className={`text-xs ${selectedIssue?.id === issue.id ? "text-gray-300" : "text-blue-600"} font-medium`}>
                                                                    Inspection Required
                                                                </div>
                                                            ) : (
                                                                <div className={`text-xs ${selectedIssue?.id === issue.id ? "text-gray-300" : "text-gray-500"}`}>
                                                                    {issue.price_description ? (
                                                                        <span>starts from ₹{issue.price} {issue.price_description}</span>
                                                                    ) : (
                                                                        <span>₹{issue.price}</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {selectedIssue?.id === issue.id && (
                                                        <span className="bg-white text-black w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 text-center py-10 italic">Select a category above to view issues</div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 3. Details (Only show if issue selected) */}
                    <AnimatePresence>
                        {selectedIssue && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-12"
                            >
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">3. Your Info</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            required placeholder="Full Name"
                                            value={newBooking.customer_name}
                                            onChange={e => setNewBooking({ ...newBooking, customer_name: e.target.value })}
                                            className="bg-gray-50 h-12"
                                        />
                                        <Input
                                            required type="number" placeholder="Phone Number"
                                            value={newBooking.customer_phone || ''}
                                            onChange={e => setNewBooking({ ...newBooking, customer_phone: parseInt(e.target.value) || 0 })}
                                            onBlur={handlePhoneBlur}
                                            className="bg-gray-50 h-12"
                                        />
                                        <Input
                                            required placeholder="Address (House No, Street, City)"
                                            value={newBooking.address}
                                            onChange={e => setNewBooking({ ...newBooking, address: e.target.value })}
                                            className="bg-gray-50 h-12 md:col-span-2"
                                        />
                                        <div className="md:col-span-2 flex gap-2">
                                            <Input
                                                placeholder="Have a discount code?"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                className="bg-gray-50 h-12"
                                            />
                                            <Button type="button" variant="outline" className="h-12 border-gray-300" onClick={() => toast.info("Coupons are auto-applied if eligible!")}>Apply</Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">4. Schedule</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="bg-gray-50 h-12" />
                                        <Input type="time" value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="bg-gray-50 h-12" />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full h-16 text-xl font-bold bg-black text-white hover:bg-gray-900 shadow-xl rounded-xl"
                                >
                                    {submitting ? "Processing..." : `Book for ${selectedIssue.is_inspection_required ? "Inspection" : `₹${selectedIssue.price}${selectedIssue.price_description ? '+' : ''}`}`}
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </div>
        </main>
    );
}

export default function UnifiedBookingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <BookingContent />
        </Suspense>
    );
}
