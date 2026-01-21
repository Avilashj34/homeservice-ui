"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import Link from "next/link";

import { MultiBookingAPI } from "@/lib/api/bookings";
import { BookingCreate } from "@/types";

export default function BookingPage() {
    const params = useParams();
    const serviceName = typeof params.service === "string" ? params.service : "";

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        date: "",
        time: "",
        address: "",
        comments: "",
    });

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const calculateQuote = () => {
        // Simple client-side estimate
        const base = 50;
        const serviceMultiplier = serviceName === "electrician" ? 1.5 : serviceName === "plumber" ? 1.2 : 1.0;
        return base * serviceMultiplier;
    };

    // Map service name to ID (Mock logic for now, ideally fetch from backend)
    const getServiceId = (name: string) => {
        const map: { [key: string]: number } = { "electrician": 1, "plumber": 2, "carpenter": 3 };
        return map[name.toLowerCase()] || 1;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 2. Create Booking
            const quote = calculateQuote();
            const bookingPayload: BookingCreate = {
                customer_name: formData.name,
                customer_phone: formData.phone,
                service_id: getServiceId(serviceName),
                time_slot: new Date(formData.date + "T" + formData.time).toISOString(),
                address: formData.address,
                latitude: 0,
                longitude: 0,
                comments: "Web Booking",
                quote_price: quote
            };

            const data = await MultiBookingAPI.create(bookingPayload);
            console.log("Booking success:", data);
            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting booking:", error);
            alert("Failed to submit booking. Check console/backend.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-white text-black">
                <Card className="w-full max-w-md border-black">
                    <CardHeader>
                        <CardTitle className="text-black">Booking Confirmed!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Thank you, {formData.name}.</p>
                        <p>Your {serviceName} service has been booked.</p>
                        <div className="mt-4 p-4 border border-black rounded text-sm text-black">
                            Tracking Link: <a href="#" className="underline font-bold">track.canyfix.com/xyz123</a>
                        </div>
                        <div className="mt-6">
                            <Link href="/">
                                <Button className="w-full bg-black text-white hover:bg-gray-800">Back to Home</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </main>
        )
    }

    return (
        <main className="flex min-h-screen flex-col items-center p-4 md:p-24 bg-white text-black">
            <div className="z-10 w-full max-w-xl items-center justify-between font-mono text-sm">
                <Link href="/" className="mb-4 inline-block text-black hover:underline font-bold">&larr; Back</Link>
                <Card className="border-black">
                    <CardHeader>
                        <CardTitle className="capitalize">Book {serviceName}</CardTitle>
                        <p className="text-gray-500">Fill in the details to schedule a visit.</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <Input required name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} className="border-black placeholder:text-gray-400" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone Number</label>
                                <Input required name="phone" placeholder="123-456-7890" value={formData.phone} onChange={handleChange} className="border-black placeholder:text-gray-400" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date</label>
                                    <Input required name="date" type="date" value={formData.date} onChange={handleChange} className="border-black" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Time</label>
                                    <Input required name="time" type="time" value={formData.time} onChange={handleChange} className="border-black" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Address / Live Location</label>
                                <Input required name="address" placeholder="123 Main St, City" value={formData.address} onChange={handleChange} className="border-black placeholder:text-gray-400" />
                                <button type="button" className="text-xs text-black underline mt-1 font-semibold" onClick={() => alert("Geolocation mocked")}>Use Current Location</button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Photo/Video</label>
                                <Input type="file" multiple className="cursor-pointer border-black" />
                            </div>

                            <div className="p-4 border-2 border-black rounded-lg bg-gray-50">
                                <p className="text-sm font-semibold">Estimated Quote</p>
                                <p className="text-3xl font-bold mt-1">${calculateQuote()}</p>
                                <p className="text-xs text-gray-500 mt-1">Final price may vary based on inspection.</p>
                            </div>

                            <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={loading}>
                                {loading ? "Booking..." : "Confirm Booking"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
