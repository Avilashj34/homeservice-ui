"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LeadsAPI } from "@/lib/api/leads";
import { ServiceAPI, Service } from "@/lib/api/services";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LeadForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [source, setSource] = useState("call");
    const [serviceInterest, setServiceInterest] = useState<string>("");
    const [serviceLevel, setServiceLevel] = useState<string>("");

    // Mobile Specifics
    const [mobileBrand, setMobileBrand] = useState("");
    const [mobileModel, setMobileModel] = useState("");
    const [mobileIssue, setMobileIssue] = useState("");

    // Details/Notes
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [serviceType, setServiceType] = useState("home"); // home, store, pickup

    // Data
    const [availableServices, setAvailableServices] = useState<Service[]>([]);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await ServiceAPI.getAll();
                setAvailableServices(data);
            } catch (error) {
                console.error("Failed to fetch services", error);
            }
        };
        fetchServices();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: Phone Number must be 10 digits
        const phoneDigits = customerPhone.replace(/\D/g, "");
        if (phoneDigits.length !== 10) {
            alert("Phone number must be exactly 10 digits.");
            return;
        }

        setLoading(true);

        const isMobile = serviceInterest === "Mobile Repair Service";

        // Construct Payload
        const payload: any = {
            customer_name: customerName,
            customer_phone: parseInt(phoneDigits), // Send cleaned number
            source,
            services: [serviceInterest], // High level category
            service_level: isMobile ? "Mobile Repair" : serviceLevel,
            is_mobile_repair: isMobile,
            notes: description,
            address: address,
            details: {
                description: description,
                service_type: serviceType
            }
        };

        if (isMobile) {
            payload.mobile_brand = mobileBrand;
            payload.mobile_model = mobileModel;
            payload.mobile_issue = mobileIssue;
            // Also add to details for backward compatibility if needed, 
            // though backend model has specific columns now.
            payload.details = {
                ...payload.details,
                model: mobileModel,
                issue: mobileIssue
            };
        }

        try {
            await LeadsAPI.create(payload);
            router.push("/admin/leads");
        } catch (error) {
            console.error(error);
            alert("Failed to create lead");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-100">

            {/* Header within form for better encapsulation if needed, or just clean fields */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Name</label>
                        <Input
                            required
                            value={customerName}
                            onChange={e => setCustomerName(e.target.value)}
                            placeholder="e.g. Rahul Kumar"
                            className="h-12 bg-slate-50 border-slate-200 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                        <Input
                            required
                            type="tel"
                            value={customerPhone}
                            onChange={e => setCustomerPhone(e.target.value)}
                            placeholder="e.g. 9876543210"
                            className="h-12 bg-slate-50 border-slate-200 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-black uppercase tracking-wider">
                        Lead Source
                    </label>
                    <Select value={source} onValueChange={setSource}>
                        <SelectTrigger className="h-12 bg-white border border-slate-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900">
                            <SelectValue placeholder="Select Source" className="text-black" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-slate-300 rounded-md text-black">
                            <SelectItem value="call" className="text-black">Incoming Call</SelectItem>
                            <SelectItem value="whatsapp" className="text-black">WhatsApp</SelectItem>
                            <SelectItem value="instagram" className="text-black">Instagram</SelectItem>
                            <SelectItem value="website" className="text-black">Website</SelectItem>
                            <SelectItem value="other" className="text-black">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>


                <div className="space-y-2">
                    <label className="text-xs font-bold text-black uppercase tracking-wider">
                        Service Interest
                    </label>
                    <Select value={serviceInterest} onValueChange={setServiceInterest}>
                        <SelectTrigger className="h-12 bg-white border border-slate-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900">
                            <SelectValue placeholder="Select Service Interest" className="text-black" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-slate-300 rounded-md text-black">
                            <SelectItem value="Mobile Repair Service" className="text-black">
                                Mobile Repair Service
                            </SelectItem>
                            <SelectItem value="Home Service" className="text-black">
                                Home Service
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>


                {serviceInterest === "Home Service" && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Service</label>
                        <Select value={serviceLevel} onValueChange={setServiceLevel}>
                            <SelectTrigger className="h-12 bg-slate-50 border-slate-200 text-slate-900">
                                <SelectValue placeholder="Select Specific Service" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableServices.map(service => (
                                    <SelectItem key={service.id} value={service.name}>
                                        {service.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {serviceInterest === "Mobile Repair Service" && (
                <div className="p-6 bg-slate-50 rounded-xl space-y-6 border border-slate-200">
                    <div className="flex items-center gap-2 text-blue-600">
                        <span className="text-xl">📱</span>
                        <h3 className="font-bold text-lg text-slate-900">Device Details</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Device Brand</label>
                            <Input
                                value={mobileBrand}
                                onChange={e => setMobileBrand(e.target.value)}
                                placeholder="e.g. Apple"
                                className="h-11 bg-white border-slate-200 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Device Model</label>
                            <Input
                                value={mobileModel}
                                onChange={e => setMobileModel(e.target.value)}
                                placeholder="e.g. iPhone 13 Pro"
                                className="h-11 bg-white border-slate-200 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                            />
                        </div>
                        <div className="col-span-full space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Issue Description</label>
                            <Input
                                value={mobileIssue}
                                onChange={e => setMobileIssue(e.target.value)}
                                placeholder="e.g. Broken Screen"
                                className="h-11 bg-white border-slate-200 focus:border-blue-500 text-slate-900 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase">Service Preference</label>
                        <div className="flex gap-3">
                            {['home', 'store', 'pickup'].map(mode => (
                                <label key={mode} className={`
                                    flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-lg border transition-all
                                    ${serviceType === mode
                                        ? "bg-blue-600 text-white border-blue-600 shadow-md font-bold"
                                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700"}
                                `}>
                                    <input
                                        type="radio"
                                        name="service_type"
                                        value={mode}
                                        checked={serviceType === mode}
                                        onChange={e => setServiceType(e.target.value)}
                                        className="hidden" // hidden radio, styling handled by label
                                    />
                                    <span className="capitalize text-sm">{mode}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6 pt-2">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Additional Notes</label>
                    <textarea
                        className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Any specific requirements or details..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address</label>
                    <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="Full address (House No, Street, Landmark...)"
                    />
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1 h-14 text-base font-bold text-slate-500 bg-white border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all rounded-xl"
                >
                    Cancel
                </Button>
                <Button
                    disabled={loading}
                    className="flex-[2] h-14 text-lg font-bold bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200 transition-all rounded-xl"
                >
                    <span className="">
                        {loading ? "Creating Lead..." : "Create New Lead"}
                    </span>
                </Button>
            </div>
        </form>
    );
}
