"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ServiceAPI } from "@/lib/api/services";
import { BookingCreate, Service } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
// Re-import MultiBookingAPI from bookings layout separate file
import { MultiBookingAPI as BookingClient } from "@/lib/api/bookings";

function BookingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preSelectedServiceId = searchParams.get("service_id");

    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submittedBooking, setSubmittedBooking] = useState<any | null>(null);

    // Form State
    const [newBooking, setNewBooking] = useState<BookingCreate>({
        customer_name: "",
        customer_phone: 0,
        service_id: preSelectedServiceId ? parseInt(preSelectedServiceId) : 0,
        address: "",
        media_ids: [],
        user_comment: "" // Mapped from "Comments" input
    } as any);

    useEffect(() => {
        fetchServices();
    }, []);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload: BookingCreate = {
                ...newBooking,
                status_id: 1, // Default Pending
                // user_comment is already in newBooking
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
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Service</span>
                            <span className="font-semibold">{services.find(s => s.id === submittedBooking.service_id)?.name || "Service"}</span>
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
            </main >
        );
    }

    return (
        <main className="min-h-screen bg-white text-black p-4 md:p-12 font-sans">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <Link href="/" className="text-sm font-bold text-gray-500 hover:text-black mb-4 block">← Back to Home</Link>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Book a Service</h1>
                    <p className="text-gray-500">Fill in the details below to schedule your appointment.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Service Selection */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">1. Select Service</h3>
                        <div className="flex overflow-x-auto pb-4 gap-3 -mx-4 px-4 scroll-smooth no-scrollbar">
                            {services.map((s) => {
                                const icon = s.name.toLowerCase().includes('electric') ? '⚡' :
                                    s.name.toLowerCase().includes('plumb') ? '💧' :
                                        s.name.toLowerCase().includes('carpenter') ? '🪑' : '🛠️';
                                return (
                                    <button
                                        type="button"
                                        key={s.id}
                                        onClick={() => setNewBooking({ ...newBooking, service_id: s.id })}
                                        className={`flex-shrink-0 w-28 md:w-32 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${newBooking.service_id === s.id
                                            ? "bg-black text-white border-black shadow-lg scale-105"
                                            : "bg-white text-gray-600 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                                            }`}
                                    >
                                        <span className="text-2xl mb-2">{icon}</span>
                                        <span className="text-sm font-bold text-center truncate w-full">{s.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {newBooking.service_id === 0 && <p className="text-red-500 text-xs mt-1">* Please select a service</p>}
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">2. Your Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">FULL NAME</label>
                                <Input
                                    required
                                    placeholder="e.g. John Doe"
                                    value={newBooking.customer_name}
                                    onChange={e => setNewBooking({ ...newBooking, customer_name: e.target.value })}
                                    className="bg-gray-50 border-gray-200 focus:bg-white h-11"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">PHONE NUMBER</label>
                                <Input
                                    required
                                    type="number"
                                    placeholder="e.g. 1234567890"
                                    value={newBooking.customer_phone || ''}
                                    onChange={e => setNewBooking({ ...newBooking, customer_phone: parseInt(e.target.value) || 0 })}
                                    className="bg-gray-50 border-gray-200 focus:bg-white h-11"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">3. Address</h3>
                        <div>
                            <label className="text-xs font-bold text-gray-500 mb-1 block">FULL ADDRESS</label>
                            <Input
                                required
                                placeholder="House No, Street, Landmark, City"
                                value={newBooking.address}
                                onChange={e => setNewBooking({ ...newBooking, address: e.target.value })}
                                className="bg-gray-50 border-gray-200 focus:bg-white h-11"
                            />
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">4. Additional Notes</h3>
                        <div>
                            <label className="text-xs font-bold text-gray-500 mb-1 block">USER COMMENTS</label>
                            <textarea
                                className="flex min-h-[100px] w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus:border-black focus:bg-white transition-colors"
                                placeholder="Any special instructions, gate codes, or details about the issue..."
                                value={newBooking.user_comment || ''}
                                onChange={e => setNewBooking({ ...newBooking, user_comment: e.target.value })}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={submitting || newBooking.service_id === 0}
                        className="w-full h-14 text-lg font-bold bg-black text-white hover:bg-gray-900 shadow-xl rounded-xl"
                    >
                        {submitting ? "Booking..." : "Confirm Booking"}
                    </Button>
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
