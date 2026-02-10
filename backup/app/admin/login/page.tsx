"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Auth } from "@/lib/auth";
import axios from "axios";
import { toast } from "sonner"; // If sonner is not installed, we'll use a simple alert fallback or fix imports later. user seems to have sonner used elsewhere.
import { API_BASE_URL } from "@/lib/constants";

export default function LoginPage() {
    const router = useRouter();
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Basic validation
            if (!phone || !otp) {
                setError("Please enter both phone and OTP.");
                setLoading(false);
                return;
            }

            // Call API
            const response = await axios.post(`${API_BASE_URL}auth/login`, {
                phone: parseInt(phone),
                otp: otp
            });

            // Save user and redirect
            Auth.login(response.data);
            router.push("/admin");

        } catch (err: any) {
            console.error("Login failed", err);
            setError(err.response?.data?.detail || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-2xl shadow-slate-200 p-8 border border-slate-200">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Admin Login</h1>
                    <p className="text-slate-500 text-sm">Enter your registered phone number and the last 4 digits as OTP.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Phone Number</label>
                        <Input
                            type="tel"
                            placeholder="e.g. 9876543210"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className="h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 relative z-10 font-medium"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">OTP (Last 4 Digits)</label>
                        <Input
                            type="text"
                            placeholder="••••"
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                            className="h-12 bg-slate-50 border-slate-200 tracking-widest text-slate-900 placeholder:text-slate-400 focus:border-blue-500 relative z-10 font-medium"
                            maxLength={4}
                            required
                        />
                    </div>
                    {/* DEBUG: State values */}
                    <div className="text-xs text-slate-400 mt-2 opacity-0 hover:opacity-100 transition-opacity">
                        Phone: {phone} | OTP: {otp}
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 font-medium">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-slate-900 text-white hover:bg-black font-bold shadow-lg shadow-slate-200 mt-4"
                    >
                        {loading ? "Verifying..." : "Login to Dashboard"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
