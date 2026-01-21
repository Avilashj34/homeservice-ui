"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ServiceAPI } from "@/lib/api/services";
import { BookingCreate, Service } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
// Re-import MultiBookingAPI from bookings layout separate file
import { MultiBookingAPI as BookingClient } from "@/lib/api/bookings";

export default function UnifiedBookingPage() {
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

    const [bookingDate, setBookingDate] = useState("");
    const [bookingTime, setBookingTime] = useState("");
    const [uploadedMedia, setUploadedMedia] = useState<{ id: number, url: string, type: string }[]>([]);

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

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            try {
                const file = e.target.files[0];
                const response = await BookingClient.upload(file); // No booking ID yet
                setUploadedMedia([...uploadedMedia, response]);
            } catch (err) {
                alert("File upload failed");
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

            const payload: BookingCreate = {
                ...newBooking,
                time_slot: isoDate,
                media_ids: uploadedMedia.map(m => m.id),
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
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-100">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Service</span>
                                <span className="font-semibold">{services.find(s => s.id === submittedBooking.service_id)?.name || "Service"}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Date</span>
                                <span className="font-semibold">{new Date(submittedBooking.time_slot).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Time</span>
                                <span className="font-semibold">{new Date(submittedBooking.time_slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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

                    {/* Date & Time */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">3. Preferred Time</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">DATE</label>
                                <Input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="bg-gray-50 border-gray-200 h-11" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">TIME</label>
                                <Input type="time" value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="bg-gray-50 border-gray-200 h-11" />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">4. Address</h3>
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

                    {/* Media */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">5. Photos / Videos</h3>
                        <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-white cursor-pointer transition-colors relative group">
                            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📷</span>
                            <span className="text-sm font-bold text-gray-600">Click to upload photos/videos</span>
                            <span className="text-xs text-gray-400 mt-1">Help us understand the issue better</span>
                            <input type="file" className="hidden" multiple onChange={handleFileSelect} accept="image/*,video/*" />
                        </label>
                        {uploadedMedia.length > 0 && (
                            <div className="grid grid-cols-4 gap-2">
                                {uploadedMedia.map((m, i) => (
                                    <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative">
                                        {m.type.includes("image") ? (
                                            <img src={m.url} alt="Uploaded" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-[10px] text-gray-500 font-bold">VIDEO</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Comments */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">6. Additional Notes</h3>
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
