"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MultiBookingAPI } from "@/lib/api/bookings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Booking, TeamMember } from "@/types";
import { TeamAPI } from "@/lib/api/team";

interface BookingDetail {
    id: number;
    customer_name: string;
    customer_phone: string;
    service_id: number;
    status_id: number;
    time_slot: string;
    address: string;
    latitude: number;
    longitude: number;
    quote_price: number;
    final_price: number;
    comments: string;
    created_at: string;
    tracking_id: string;
    user_comment: string;
}

export default function BookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedMedia, setUploadedMedia] = useState<{ id: number, url: string, type: string }[]>([]);

    // State for update form
    const [updateForm, setUpdateForm] = useState<Partial<Booking>>({});
    const [bookingDate, setBookingDate] = useState("");
    const [bookingTime, setBookingTime] = useState("");

    const [services, setServices] = useState<any[]>([]);
    const [statuses, setStatuses] = useState<any[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

    useEffect(() => {
        if (id) {
            fetchBooking();
            // Fetch services and statuses for dropdowns
            fetchMetadata();
        }
    }, [id]);

    useEffect(() => {
        if (booking) {
            setUpdateForm(booking);
            if (booking.time_slot) {
                const dateObj = new Date(booking.time_slot);
                setBookingDate(dateObj.toISOString().split('T')[0]);
                setBookingTime(dateObj.toTimeString().slice(0, 5));
            }
        }
    }, [booking]);

    const fetchMetadata = async () => {
        try {
            // We need to import API for services/status or pass them? 
            // For now let's import them or just hardcode if simpler, but user asked for dynamic.
            // I'll assume imports exist or I need to add them. 
            // Wait, I should add imports first.
        } catch (e) { }
    }

    const fetchBooking = async () => {
        try {
            const bookingData = await MultiBookingAPI.getById(Number(id));
            const [servicesData, statusesData, teamMembersData] = await Promise.all([
                // I need ServiceAPI and StatusAPI imports
                import("@/lib/api/services").then(m => m.ServiceAPI.getAll()),
                import("@/lib/api/status").then(m => m.StatusAPI.getAll()),
                TeamAPI.getAll()
            ]);
            setBooking(bookingData);
            setServices(servicesData);
            setStatuses(statusesData);
            setTeamMembers(teamMembersData);
        } catch (err) {
            console.error("Failed to load booking", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBooking = async () => {
        if (!booking) return;
        try {
            setIsSubmitting(true);

            let isoDate = booking.time_slot;
            if (bookingDate && bookingTime) {
                isoDate = new Date(`${bookingDate}T${bookingTime}`).toISOString();
            }

            const payload = {
                ...updateForm,
                time_slot: isoDate,
                // Media is handled via separate upload api usually, but for linking new ones:
                // If the user uploaded files in the modal, they are already linked via booking_id? 
                // Yes, if I pass booking_id to upload. 
                // But wait, if I upload in "New Booking" I send media_ids.
                // In "Update", user asked: "upload api will have the bookingid in it... store it".
                // So the upload itself links it. I don't need to send media_ids in Update payload necessarily, unless I need to explicitly link them if they weren't linked?
                // The upload backend change I made links them directly. So I just need to refresh booking after upload?
                // Actually the user said "If booking id is there store it".
                // I will just refetch booking after update.
            };

            await MultiBookingAPI.update(booking.id, payload);
            setIsUpdateModalOpen(false);
            setUploadedMedia([]);
            fetchBooking(); // Refresh data
        } catch (e) {
            alert("Failed to update booking");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0 && booking) {
            try {
                const file = e.target.files[0];
                const response = await MultiBookingAPI.upload(file, booking.id);
                setUploadedMedia([...uploadedMedia, response]);
                // Since it's linked automatically backend side, maybe I should just refresh the booking media list?
                // But for UI feedback I show it in "uploadedMedia" list temporarily.
                // The user logic implies "upload & link immediately".
                // So I should probably just simple refresh booking to show it in the main list?
                // Or just show it in the modal list.
            } catch (err) {
                console.error("Upload failed", err);
                alert("Upload failed");
            }
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Details...</div>;
    if (!booking) return <div className="p-8 text-center text-red-500">Booking not found</div>;

    return (
        <main className="min-h-screen bg-gray-50 p-4 md:p-12 text-black pb-32">
            <div className="max-w-4xl mx-auto">
                <Link href="/admin" className="text-sm text-gray-500 hover:text-black mb-6 block">← Back to Dashboard</Link>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-1">Booking #{booking.id}</h1>
                        <div className="flex flex-col gap-1">
                            <p className="text-sm md:text-base text-gray-500">Created on {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : "Unknown Date"}</p>
                            <span className="text-xs font-mono text-gray-400">Ref: {booking.tracking_id}</span>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <span className="px-4 py-2 bg-black text-white rounded-full text-sm font-bold w-full md:w-auto text-center block">
                            {booking.status?.name || "Unknown Status"}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {/* Left Column: Main Info */}
                    <div className="md:col-span-2 space-y-4 md:space-y-6">
                        <Card className="border-gray-200">
                            <CardHeader className="bg-gray-100/50 border-b border-gray-100 p-4 md:p-6">
                                <CardTitle className="text-base">Customer & Service</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Customer Name</label>
                                    <p className="text-base md:text-lg font-medium">{booking.customer_name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Phone Number</label>
                                    <p className="text-base md:text-lg font-medium">{booking.customer_phone}</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Service Required</label>
                                    <p className="text-base md:text-lg font-medium">{booking.service_name || `Service ID: ${booking.service_id}`}</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Appointment Time</label>
                                    <p className="text-base md:text-lg font-medium">{booking.time_slot ? new Date(booking.time_slot).toLocaleString() : "N/A"}</p>
                                </div>
                                <div className="sm:col-span-2 pt-4 border-t border-gray-100">
                                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Assigned Team Member</label>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                                            {booking.assigned_to ? booking.assigned_to.name.charAt(0) : "?"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{booking.assigned_to ? booking.assigned_to.name : "Unassigned"}</p>
                                            {booking.assigned_to && <p className="text-xs text-gray-500">{booking.assigned_to.email}</p>}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-200">
                            <CardHeader className="bg-gray-100/50 border-b border-gray-100 p-4 md:p-6">
                                <CardTitle className="text-base">Address & Location</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 md:p-6 space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Address</label>
                                    <p className="text-base">{booking.address}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Latitude</label>
                                        <p className="text-sm md:text-base font-mono bg-gray-50 p-2 rounded truncate">{booking.latitude}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Longitude</label>
                                        <p className="text-sm md:text-base font-mono bg-gray-50 p-2 rounded truncate">{booking.longitude}</p>
                                    </div>
                                </div>
                                <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                                    Map Placeholder
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Financials & Extras */}
                    <div className="space-y-4 md:space-y-6">
                        {/* Tracking Card */}
                        <Card className="border-gray-200 border-l-4 border-l-blue-900">
                            <CardHeader className="bg-gray-100/50 border-b border-gray-100 p-4 md:p-6">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <span>📡</span> Customer Tracking
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 md:p-6 space-y-3">
                                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                    <code className="text-sm font-bold text-blue-900 truncate mr-2 select-all">
                                        {booking.tracking_id}
                                    </code>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const link = `${window.location.origin}/track/${booking.tracking_id}`;
                                            navigator.clipboard.writeText(link);
                                            alert("Link copied: " + link);
                                        }}
                                        className="h-8 text-xs shrink-0 border-blue-200 hover:bg-blue-50 hover:text-blue-900 font-medium"
                                    >
                                        Copy Link
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Share this link with the customer. They can view status updates, share live location, and add comments without logging in.
                                </p>
                                <div className="mt-2 text-right">
                                    <Link href={`/track/${booking.tracking_id}`} target="_blank" className="text-xs font-bold text-blue-900 hover:underline flex items-center justify-end gap-1">
                                        Open Tracking Page →
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-200">
                            <CardHeader className="bg-gray-100/50 border-b border-gray-100 p-4 md:p-6">
                                <CardTitle className="text-base">Payment Details</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 md:p-6 space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Estimated Quote</label>
                                    <p className="text-2xl font-bold">${booking.quote_price || "0.00"}</p>
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Final Price</label>
                                    <p className="text-xl font-bold text-green-600">${booking.final_price || "0.00"}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-200">
                            <CardHeader className="bg-gray-100/50 border-b border-gray-100 p-4 md:p-6">
                                <CardTitle className="text-base">Media & Assets</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 md:p-6">
                                <div className="grid grid-cols-2 gap-2">
                                    {booking.media && booking.media.length > 0 ? (
                                        booking.media.map((item, index) => (
                                            <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="aspect-square bg-gray-100 rounded overflow-hidden relative border border-gray-200 block group hover:opacity-90">
                                                {item.media_type && item.media_type.includes("video") ? (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white text-xs">Video</div>
                                                ) : (
                                                    <img src={item.url} alt={`Media ${index + 1}`} className="w-full h-full object-cover" />
                                                )}
                                            </a>
                                        ))
                                    ) : (
                                        <div className="col-span-2 py-8 text-center text-gray-400 text-sm bg-gray-50 rounded-lg border-dashed border border-gray-200">
                                            No media uploaded
                                        </div>
                                    )}
                                </div>
                                <label className="w-full mt-4 flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                                    <span>Upload New Media</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*,video/*"
                                        onChange={async (e) => {
                                            if (e.target.files && e.target.files.length > 0 && booking) {
                                                try {
                                                    await MultiBookingAPI.upload(e.target.files[0], booking.id);
                                                    fetchBooking();
                                                } catch (err) {
                                                    alert("Upload failed");
                                                }
                                            }
                                        }}
                                    />
                                </label>
                            </CardContent>
                        </Card>

                        {booking.user_comment && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                                <strong className="block text-xs uppercase text-blue-400 mb-1">Customer Instructions:</strong>
                                {booking.user_comment}
                            </div>
                        )}

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                            <strong className="block text-xs uppercase text-yellow-600 mb-1">Internal Team Notes:</strong>
                            {booking.comments || "No internal notes."}
                        </div>
                    </div>
                </div>
            </div>


            {/* Sticky Update Button Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10 md:pl-72 md:left-0 transition-all duration-300">
                <div className="max-w-4xl mx-auto flex justify-end">
                    <Button onClick={() => setIsUpdateModalOpen(true)} className="w-full md:w-auto px-8 bg-[#001f3f] text-white hover:bg-[#00162e] h-12 text-lg shadow-lg">
                        Update Booking
                    </Button>
                </div>
            </div>

            {/* Update Booking Modal */}
            <Modal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} title="Update Booking Details">
                <div className="space-y-6 pt-2 h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Customer Info */}
                    <div className="space-y-4 rounded-xl bg-gray-50 p-4 border border-gray-100">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Customer Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">FULL NAME</label>
                                <Input
                                    value={updateForm.customer_name || ''}
                                    onChange={e => setUpdateForm({ ...updateForm, customer_name: e.target.value })}
                                    className="bg-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">PHONE NUMBER</label>
                                <Input
                                    type="number"
                                    value={updateForm.customer_phone || ''}
                                    onChange={e => setUpdateForm({ ...updateForm, customer_phone: parseInt(e.target.value) || 0 })}
                                    className="bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Service Info */}
                    <div className="space-y-4 rounded-xl bg-gray-50 p-4 border border-gray-100">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Service & Time</h4>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">SERVICE TYPE</label>
                            <div className="grid grid-cols-3 gap-2">
                                {services.map((s) => {
                                    const icon = s.name.toLowerCase().includes('electric') ? '⚡' :
                                        s.name.toLowerCase().includes('plumb') ? '💧' :
                                            s.name.toLowerCase().includes('carpenter') ? '🪑' : '🛠️';
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => setUpdateForm({ ...updateForm, service_id: s.id })}
                                            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${updateForm.service_id === s.id
                                                ? "bg-black text-white border-black shadow-md scale-[1.02]"
                                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            <span className="text-xl mb-1">{icon}</span>
                                            <span className="text-xs font-medium text-center">{s.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">DATE</label>
                                <Input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="bg-white" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">TIME</label>
                                <Input type="time" value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="bg-white" />
                            </div>
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="space-y-4 rounded-xl bg-gray-50 p-4 border border-gray-100">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Additional Notes</h4>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">COMMENTS</label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-white"
                                placeholder="Add any special instructions or notes..."
                                value={updateForm.comments || ''}
                                onChange={e => setUpdateForm({ ...updateForm, comments: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Location & Media */}
                    <div className="space-y-4 rounded-xl bg-gray-50 p-4 border border-gray-100">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Location & Assets</h4>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">FULL ADDRESS</label>
                            <Input value={updateForm.address || ''} onChange={e => setUpdateForm({ ...updateForm, address: e.target.value })} className="bg-white" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">PHOTOS / VIDEOS</label>
                            <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-white hover:bg-gray-50 cursor-pointer transition-colors relative">
                                <span className="text-2xl mb-2">📷</span>
                                <span className="text-xs text-gray-500">Click to upload (Auto-linked)</span>
                                <input type="file" className="hidden" multiple onChange={handleFileSelect} accept="image/*,video/*" />
                            </label>
                            {uploadedMedia.length > 0 && (
                                <div className="mt-2 grid grid-cols-4 gap-2">
                                    {uploadedMedia.map((m, i) => (
                                        <div key={i} className="aspect-square bg-gray-100 rounded overflow-hidden relative border border-gray-200">
                                            {m.type.includes("image") ? (
                                                <img src={m.url} alt="Uploaded" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-[10px] text-gray-500">Video</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status & Price */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">STATUS</label>
                                <select
                                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-black outline-none"
                                    value={updateForm.status_id}
                                    onChange={e => setUpdateForm({ ...updateForm, status_id: parseInt(e.target.value) })}
                                >
                                    {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">QUOTE PRICE ($)</label>
                                <Input
                                    type="number"
                                    className="bg-white font-mono"
                                    value={updateForm.quote_price || ''}
                                    onChange={e => setUpdateForm({ ...updateForm, quote_price: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">FINAL PRICE ($)</label>
                            <Input
                                type="number"
                                className="bg-white font-mono"
                                value={updateForm.final_price || ''}
                                onChange={e => setUpdateForm({ ...updateForm, final_price: parseFloat(e.target.value) })}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">ASSIGNED TEAME MEMBER</label>
                            <select
                                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-black outline-none"
                                value={updateForm.assigned_to_id || (booking?.assigned_to?.id) || ""}
                                onChange={e => setUpdateForm({ ...updateForm, assigned_to_id: e.target.value ? parseInt(e.target.value) : undefined })}
                            >
                                <option value="">Unassigned</option>
                                {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 sticky bottom-0 bg-white border-t border-gray-100">
                        <Button
                            onClick={handleUpdateBooking}
                            disabled={isSubmitting}
                            className={`w-full h-12 text-base font-semibold text-white shadow-lg transition-all ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-900 hover:shadow-xl"}`}
                        >
                            {isSubmitting ? "Updating..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </main>
    )
}
