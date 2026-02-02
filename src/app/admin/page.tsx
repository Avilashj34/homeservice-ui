"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Phone, MessageCircle, Calendar, MapPin, RefreshCw, Trash } from "lucide-react";
import Link from "next/link";
import { MultiBookingAPI } from "@/lib/api/bookings";
import { ServiceAPI } from "@/lib/api/services";
import { StatusAPI } from "@/lib/api/status";
import { TeamAPI } from "@/lib/api/team";
import { Booking, Status, Service, BookingCreate, TeamMember } from "@/types";
import { STAFF_NOTIFICATIONS } from "@/lib/constants";

export default function AdminPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("1");
    const [dateFilter, setDateFilter] = useState("");
    const [serviceFilter, setServiceFilter] = useState("");
    const [assignedToFilter, setAssignedToFilter] = useState("");

    // Modals
    // Modals
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isViewStatusModalOpen, setIsViewStatusModalOpen] = useState(false);

    // Form Data
    const [newStatus, setNewStatus] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedMedia, setUploadedMedia] = useState<{ id: number, url: string, type: string }[]>([]);

    const [newBooking, setNewBooking] = useState<BookingCreate>({
        customer_name: "",
        customer_phone: 0,
        service_id: null,
        time_slot: "",
        address: "",
        status_id: null,
        media_ids: []
    } as any);

    // UI Local State for split Date/Time
    const [bookingDate, setBookingDate] = useState("");
    const [bookingTime, setBookingTime] = useState("");

    // Debounce search to avoid too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, statusFilter, dateFilter, serviceFilter, assignedToFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [bookingsData, statusesData, servicesData, teamMembersData] = await Promise.all([
                MultiBookingAPI.getAll({
                    search: search || undefined,
                    status_id: statusFilter ? Number(statusFilter) : undefined,
                    date: dateFilter || undefined,
                    service_id: serviceFilter ? Number(serviceFilter) : undefined,
                    assigned_to_id: assignedToFilter ? Number(assignedToFilter) : undefined
                }),
                StatusAPI.getAll(),
                ServiceAPI.getAll(),
                TeamAPI.getAll()
            ]);
            setBookings(bookingsData);
            setStatuses(statusesData);
            setServices(servicesData);
            setTeamMembers(teamMembersData);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStatus = async () => {
        try {
            await StatusAPI.create({ name: newStatus });
            setNewStatus("");
            setIsStatusModalOpen(false);
            fetchData(); // Refresh
        } catch (e) {
            alert("Failed to create status");
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            try {
                const file = e.target.files[0];
                // Optimistic UI or loading state for upload can go here
                const response = await MultiBookingAPI.upload(file);
                setUploadedMedia([...uploadedMedia, response]);
            } catch (err) {
                console.error("Upload failed", err);
                alert("Failed to upload file");
            }
        }
    };

    const handleCreateBooking = async () => {
        if (isSubmitting) return;

        // Basic validation: Phone is usually required to identify customer, but user said 'name' is optional. 
        // Let's assume phone is still needed or check if user implied ALL are optional.
        // User said "date, time, address name media is optional". Phone wasn't explicitly mentioned as optional, 
        // but let's be safe and allow it to just send what we have, relying on backend validation (phone is nullable=False in my recent edit? No, I kept phone non-nullable in model).

        try {
            setIsSubmitting(true);

            let isoDate = undefined;
            if (bookingDate && bookingTime) {
                isoDate = new Date(`${bookingDate}T${bookingTime}`).toISOString();
            } else if (bookingDate) {
                isoDate = new Date(bookingDate).toISOString();
            }

            const payload: any = { // Using any to bypass strict checks for now as type definition updates propagate
                customer_name: newBooking.customer_name || undefined,
                customer_phone: newBooking.customer_phone,
                service_id: newBooking.service_id,
                status_id: newBooking.status_id,
                time_slot: isoDate,
                address: newBooking.address || undefined,
                quote_price: newBooking.quote_price,
                media_ids: uploadedMedia.map(m => m.id),
                assigned_to_id: newBooking.assigned_to_id,
                latitude: undefined, // Send undefined to let backend handle it as null
                longitude: undefined
            };

            const created = await MultiBookingAPI.create(payload);
            setIsBookingModalOpen(false);

            // reset form
            setUploadedMedia([]);
            setNewBooking({ ...newBooking, customer_name: "", customer_phone: 0, address: "", quote_price: 0 });
            setBookingDate("");
            setBookingTime("");

            // Redirect to detail page
            window.location.href = `/admin/bookings/${created.id}`;
        } catch (e) {
            console.error(e);
            alert("Failed to create booking");
            setIsSubmitting(false); // Re-enable on error
        }
    };

    const getStatusName = (id: number) => {
        const status = statuses.find(s => s.id === id);
        return status?.name || "Unknown";
    };

    const getServiceName = (id: number) => {
        const servicesMap: { [key: number]: string } = { 1: "Electrician", 2: "Plumber", 3: "Carpenter" };
        const found = services.find(s => s.id === id);
        return found ? found.name : servicesMap[id] || "Service";
    }


    // Let me refine the ReplacementContent to match exactly what is there + my changes.

    return (
        <main className="flex min-h-screen flex-col p-4 md:p-8 bg-white text-black">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold">Team Dashboard</h1>
                <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <div className="flex space-x-2 whitespace-nowrap">
                        <Button onClick={() => setIsViewStatusModalOpen(true)} variant="outline" className="text-black border-black hover:bg-gray-100 flex-shrink-0">
                            View Statuses
                        </Button>
                        <Button onClick={() => setIsStatusModalOpen(true)} variant="outline" className="text-black border-black hover:bg-gray-100 flex-shrink-0">
                            + New Status
                        </Button>
                        <Link href="/admin/team">
                            <Button variant="outline" className="text-black border-black hover:bg-gray-100 flex-shrink-0">
                                Manage Team
                            </Button>
                        </Link>
                        <Button onClick={() => setIsBookingModalOpen(true)} className="bg-black text-white hover:bg-gray-800 flex-shrink-0">
                            + New Booking
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-8 flex flex-col md:flex-row gap-4 items-center bg-white p-1">
                <div className="flex w-full md:w-auto md:flex-1 gap-2 items-center">
                    <div className="relative flex-1 w-full">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        <Input
                            placeholder="Search by Customer Name or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 border-gray-200 bg-gray-50 focus:bg-white transition-colors h-11"
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={fetchData}
                        className="h-11 w-11 p-0 rounded-full border-gray-200 hover:bg-gray-100 flex-shrink-0"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <Input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-auto h-11 border-gray-200 bg-gray-50"
                    />
                    <select
                        className="h-11 rounded-md border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-black transition-colors min-w-[140px]"
                        value={serviceFilter}
                        onChange={(e) => setServiceFilter(e.target.value)}
                    >
                        <option value="">All Services</option>
                        {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select
                        className="h-11 rounded-md border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-black transition-colors min-w-[140px]"
                        value={assignedToFilter}
                        onChange={(e) => setAssignedToFilter(e.target.value)}
                    >
                        <option value="">All Team</option>
                        {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <Button
                        onClick={() => { setSearch(""); setStatusFilter("1"); setDateFilter(""); setServiceFilter(""); setAssignedToFilter(""); }}
                        variant="outline"
                        className="h-11 border-gray-200 hover:bg-gray-100 hover:text-black"
                    >
                        Clear
                    </Button>
                </div>
            </div>

            {/* Status Filter Pills */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar">

                {statuses.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => setStatusFilter(s.id.toString())}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border transition-all ${statusFilter === s.id.toString()
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                            }`}
                    >
                        {s.name}
                    </button>
                ))}
            </div>


            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-12 text-gray-500">Loading bookings...</div>
                ) : bookings.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">No bookings found matching your filters.</div>
                ) : (
                    bookings.map((booking) => (
                        <div
                            key={booking.id}
                            onClick={() => window.location.href = `/admin/bookings/${booking.id}`}
                            className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden flex flex-col h-full relative"
                        >
                            {/* Card Header: Service & Status */}
                            <div className="p-5 pb-2 flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-xl shadow-sm border border-gray-100">
                                        {getServiceName(booking.service_id) === "Electrician" ? "⚡" :
                                            getServiceName(booking.service_id) === "Plumber" ? "💧" : "🪑"}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">#{booking.id}</p>
                                        <h3 className="font-bold text-gray-900 leading-tight">{getServiceName(booking.service_id)}</h3>
                                    </div>
                                </div>
                                <span className={`max-w-[120px] truncate px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${booking.status_id === 1 ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                    booking.status_id === 2 ? "bg-blue-50 text-blue-700 border-blue-200" :
                                        booking.status_id === 3 ? "bg-green-50 text-green-700 border-green-200" :
                                            "bg-gray-50 text-gray-600 border-gray-200"
                                    }`}>
                                    {getStatusName(booking.status_id)}
                                </span>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 py-2 flex-grow space-y-3">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 truncate">{booking.customer_name}</h2>
                                    <p className="text-sm text-gray-500 font-medium truncate tracking-wide">{booking.customer_phone}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="truncate">
                                            {new Date(booking.time_slot).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(booking.time_slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    {booking.address && (
                                        <div className="flex items-start gap-2 text-sm text-gray-600">
                                            <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <span className="truncate line-clamp-1">{booking.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card Footer: Price & Actions */}
                            <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between mt-auto">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Total</span>
                                    <span className="text-lg font-black text-gray-900">
                                        ₹{(booking.final_price || booking.quote_price || 0).toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <a
                                        href={`tel:${booking.customer_phone}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="h-9 w-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors shadow-sm"
                                    >
                                        <Phone className="w-4 h-4" />
                                    </a>
                                    <a
                                        href={`https://wa.me/${booking.customer_phone}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="h-9 w-9 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:brightness-90 transition-all shadow-sm"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                    </a>
                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if (confirm("Are you sure you want to delete this booking? This action cannot be undone.")) {
                                                try {
                                                    await MultiBookingAPI.delete(booking.id);
                                                    fetchData();
                                                } catch (err) {
                                                    console.error("Failed to delete", err);
                                                    alert("Failed to delete booking");
                                                }
                                            }
                                        }}
                                        className="h-9 w-9 rounded-full bg-red-50 border border-red-100 text-red-500 flex items-center justify-center hover:bg-red-100 hover:text-red-700 transition-all shadow-sm"
                                        title="Delete Booking"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Status Modal */}
            <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title="Create New Status">
                <div className="space-y-4 pt-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Status Name</label>
                        <Input value={newStatus} onChange={(e) => setNewStatus(e.target.value)} placeholder="e.g. In Progress" className="h-11" />
                    </div>
                    <Button onClick={handleCreateStatus} className="w-full h-11 bg-black text-white hover:bg-gray-900">Create Status</Button>
                </div>
            </Modal>

            {/* View Statuses Modal */}
            <Modal isOpen={isViewStatusModalOpen} onClose={() => setIsViewStatusModalOpen(false)} title="All Statuses">
                <div className="max-h-[60vh] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100 sticky top-0">
                            <tr>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statuses.map(s => (
                                <tr key={s.id} className="border-b border-gray-50">
                                    <td className="px-4 py-3">{s.id}</td>
                                    <td className="px-4 py-3 font-medium text-black">{s.name}</td>
                                    <td className="px-4 py-3 text-gray-500">{s.description || "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {statuses.length === 0 && <p className="text-center text-gray-500 py-4">No statuses found.</p>}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <Button onClick={() => { setIsViewStatusModalOpen(false); setIsStatusModalOpen(true); }} className="w-full h-11 border border-black bg-white text-black hover:bg-gray-50">
                        + Add New Status
                    </Button>
                </div>
            </Modal>

            {/* Create Booking Modal - ENHANCED */}
            <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title="Create New Booking">
                <div className="space-y-6 pt-2 h-[70vh] overflow-y-auto pr-2 custom-scrollbar">

                    {/* Customer Info */}
                    <div className="space-y-4 rounded-xl bg-gray-50 p-4 border border-gray-100">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Customer Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">FULL NAME</label>
                                <Input
                                    placeholder="e.g. John Doe"
                                    value={newBooking.customer_name}
                                    onChange={e => setNewBooking({ ...newBooking, customer_name: e.target.value })}
                                    className="bg-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">PHONE NUMBER</label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 1234567890"
                                    value={newBooking.customer_phone || ''}
                                    onChange={e => setNewBooking({ ...newBooking, customer_phone: parseInt(e.target.value) || 0 })}
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
                                            onClick={() => setNewBooking({ ...newBooking, service_id: s.id })}
                                            className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${newBooking.service_id === s.id
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
                                value={newBooking.comments || ''}
                                onChange={e => setNewBooking({ ...newBooking, comments: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Location & Media */}
                    <div className="space-y-4 rounded-xl bg-gray-50 p-4 border border-gray-100">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Location & Assets</h4>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">FULL ADDRESS</label>
                            <Input placeholder="House No, Street, City" value={newBooking.address} onChange={e => setNewBooking({ ...newBooking, address: e.target.value })} className="bg-white" />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block flex justify-between">
                                <span>LIVE LOCATION (Lat/Lng)</span>
                                <button onClick={() => alert("Fetching live location...")} className="text-blue-600 hover:underline">Fetch Current</button>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="Latitude" type="number" className="bg-white" />
                                <Input placeholder="Longitude" type="number" className="bg-white" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">PHOTOS / VIDEOS</label>
                            <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-white hover:bg-gray-50 cursor-pointer transition-colors relative">
                                <span className="text-2xl mb-2">📷</span>
                                <span className="text-xs text-gray-500">Click to upload</span>
                                <input type="file" className="hidden" multiple onChange={handleFileSelect} accept="image/*,video/*" />
                            </label>
                            {/* Uploaded Previews */}
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

                    {/* Quote & Status */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">INITIAL STATUS</label>
                                <select
                                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-black outline-none"
                                    value={newBooking.status_id}
                                    onChange={e => setNewBooking({ ...newBooking, status_id: parseInt(e.target.value) })}
                                >
                                    {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">ESTIMATED QUOTE ($)</label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="bg-white font-mono"
                                    value={newBooking.quote_price || ''}
                                    onChange={e => setNewBooking({ ...newBooking, quote_price: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">ASSIGN TO TEAM MEMBER</label>
                            <select
                                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-black outline-none"
                                value={newBooking.assigned_to_id || ""}
                                onChange={e => setNewBooking({ ...newBooking, assigned_to_id: e.target.value ? parseInt(e.target.value) : undefined })}
                            >
                                <option value="">Unassigned</option>
                                {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                            </select>
                        </div>

                        {/* Notifications */}
                        <div className="mt-4 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                            <label className="text-xs font-bold text-blue-800 mb-2 block flex items-center gap-1">
                                <span>🔔 SEND NOTIFICATIONS</span>
                            </label>
                            <div className="flex gap-4">
                                {STAFF_NOTIFICATIONS.map((person) => (
                                    <label key={person.name} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-black focus:ring-black"
                                            onChange={(e) => {
                                                const current = newBooking.notify_phones || [];
                                                if (e.target.checked) {
                                                    setNewBooking({ ...newBooking, notify_phones: [...current, person.phone] });
                                                } else {
                                                    setNewBooking({ ...newBooking, notify_phones: current.filter(p => p !== person.phone) });
                                                }
                                            }}
                                            checked={(newBooking.notify_phones || []).includes(person.phone)}
                                        />
                                        <span className="text-sm font-medium text-gray-700">{person.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 sticky bottom-0 bg-white border-t border-gray-100">
                        <Button
                            onClick={handleCreateBooking}
                            disabled={isSubmitting}
                            className={`w-full h-12 text-base font-semibold text-white shadow-lg transition-all ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-900 hover:shadow-xl"}`}
                        >
                            {isSubmitting ? "Creating Booking..." : "Confirm Booking"}
                        </Button>
                    </div>
                </div>
            </Modal>


        </main >
    );
}
