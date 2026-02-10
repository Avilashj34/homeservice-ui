"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RepairmenAPI } from "@/lib/api/repairmen";
import { ServiceAPI, Service } from "@/lib/api/services";

interface AddRepairmanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddRepairmanModal({ isOpen, onClose, onSuccess }: AddRepairmanModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [availableServices, setAvailableServices] = useState<Service[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        phone_number: "",
        service_type: "",
        employee_type: "Full-time" // Default
    });

    useEffect(() => {
        if (isOpen) {
            loadServices();
        }
    }, [isOpen]);

    const loadServices = async () => {
        try {
            const data = await ServiceAPI.getAll();
            setAvailableServices(data);
        } catch (error) {
            console.error("Failed to load services", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation: Phone Number must be 10 digits
        const phoneDigits = formData.phone_number.replace(/\D/g, "");
        if (phoneDigits.length !== 10) {
            setError("Phone number must be exactly 10 digits.");
            return;
        }

        setLoading(true);

        try {
            await RepairmenAPI.create(formData);
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                name: "",
                phone_number: "",
                service_type: "",
                employee_type: "Full-time"
            });
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to add repairman");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add New Repairman"
            className="sm:max-w-[425px] bg-white text-black"
        >
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                        id="name"
                        name="name"
                        placeholder="e.g. John Doe"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="bg-white text-black" // Ensure input has white background and black text
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                        id="phone_number"
                        name="phone_number"
                        placeholder="e.g. 9876543210"
                        required
                        value={formData.phone_number}
                        onChange={handleChange}
                        className="bg-white text-black" // Ensure input has white background and black text
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="service_type">Service Type</Label>
                    <select
                        id="service_type"
                        name="service_type"
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white text-black px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        value={formData.service_type}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>Select Service Type</option>
                        {availableServices.length > 0 ? (
                            availableServices.map(service => (
                                <option key={service.id} value={service.name}>
                                    {service.name}
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>Loading services...</option>
                        )}
                        <option value="Mobile Repair">Mobile Repair</option> {/* Explicit option just in case */}
                    </select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="employee_type">Employee Type</Label>
                    <select
                        id="employee_type"
                        name="employee_type"
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white text-black px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        value={formData.employee_type}
                        onChange={handleChange}
                    >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                    </select>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-slate-900 text-white hover:bg-black">
                        {loading ? "Adding..." : "Add Repairman"}
                    </Button>
                </div>
            </form>
        </Modal>
    );

}
