"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { MultiBookingAPI } from "@/lib/api/bookings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Booking } from "@/types";
import { MapPin, Navigation } from "lucide-react";

export default function TrackingPage() {
    const params = useParams();
    const trackingId = params.id as string;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Update Form State
    const [address, setAddress] = useState("");
    const [userComment, setUserComment] = useState("");
    const [locationStatus, setLocationStatus] = useState<"idle" | "getting" | "success" | "error">("idle");
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (trackingId) {
            loadBooking();
        }
    }, [trackingId]);

    const loadBooking = async () => {
        try {
            setLoading(true);
            const data = await MultiBookingAPI.track(trackingId);
            setBooking(data);
            // Prefill update fields
            setAddress(data.address || "");
            setUserComment(data.user_comment || "");
            if (data.latitude && data.longitude) {
                setCoords({ lat: data.latitude, lng: data.longitude });
                setLocationStatus("success");
            }
        } catch (err) {
            setError("Invalid Tracking ID or Booking not found.");
        } finally {
            setLoading(false);
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        setLocationStatus("getting");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setLocationStatus("success");
            },
            () => {
                setLocationStatus("error");
                alert("Unable to retrieve your location");
            }
        );
    };

    const handleUpdate = async () => {
        if (!booking) return;
        try {
            setIsUpdating(true);
            await MultiBookingAPI.update(booking.id, {
                address: address,
                user_comment: userComment,
                latitude: coords?.lat,
                longitude: coords?.lng
            });
            alert("Details updated successfully!");
        } catch (err) {
            alert("Failed to update details.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
    if (error || !booking) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">{error}</div>;

    return (
        <main className="min-h-screen bg-white p-4 text-black font-sans">
            <div className="max-w-lg mx-auto space-y-6">

                {/* Header */}
                <div className="text-center py-6">
                    <h1 className="text-2xl font-bold mb-2">Booking Status</h1>
                    <p className="text-sm text-gray-500">Tracking ID: {booking.tracking_id}</p>
                </div>

                {/* Booking Summary Card */}
                <Card className="border-gray-100 shadow-sm bg-gray-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Booking #{booking.id}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                            <span className="text-gray-500 text-sm font-medium">Customer</span>
                            <span className="font-semibold">{booking.customer_name}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                            <span className="text-gray-500 text-sm font-medium">Contact</span>
                            <span className="font-semibold">{booking.customer_phone}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                            <span className="text-gray-500 text-sm font-medium">Quote Price</span>
                            <span className="font-bold text-lg">${booking.quote_price || "0.00"}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-gray-500 text-sm font-medium">Current Status</span>
                            <span className="px-3 py-1 bg-black text-white text-xs font-bold rounded-full uppercase tracking-wider">
                                {booking.status?.name || "Unknown"}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions Section */}
                <div className="space-y-6 pt-4">
                    <h2 className="text-lg font-bold border-l-4 border-yellow-400 pl-3">Update Your Details</h2>

                    {/* Address Update */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Current Address</label>
                        <Input
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            placeholder="Enter your full address"
                        />
                    </div>

                    {/* Live Location */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Location Pin</label>
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleGetLocation}
                                variant={locationStatus === 'success' ? "default" : "outline"}
                                className={`w-full ${locationStatus === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                            >
                                <Navigation className={`w-4 h-4 mr-2 ${locationStatus === 'getting' ? 'animate-spin' : ''}`} />
                                {locationStatus === 'success' ? 'Location Updated' : 'Share Live Location'}
                            </Button>
                        </div>
                        {locationStatus === 'success' && (
                            <p className="text-xs text-green-600 flex items-center mt-1">
                                <MapPin className="w-3 h-3 mr-1" />
                                Coordinates: {coords?.lat.toFixed(6)}, {coords?.lng.toFixed(6)}
                            </p>
                        )}
                    </div>

                    {/* Customer Comment */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Special Instructions / Comments</label>
                        <textarea
                            value={userComment}
                            onChange={(e) => setUserComment(e.target.value)}
                            className="flex min-h-[100px] w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus:bg-white focus:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="e.g. Please call before arriving, Gate code is 1234..."
                        />
                    </div>

                    <Button
                        onClick={handleUpdate}
                        disabled={isUpdating}
                        className="w-full h-12 text-lg bg-[#001f3f] hover:bg-[#00162e] text-white shadow-lg"
                    >
                        {isUpdating ? "Updating..." : "Update Details"}
                    </Button>
                </div>

            </div>
        </main>
    );
}
