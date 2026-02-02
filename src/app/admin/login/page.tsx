"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Auth } from "@/lib/auth";
import axios from "axios";
import { toast } from "sonner"; // If sonner is not installed, we'll use a simple alert fallback or fix imports later. user seems to have sonner used elsewhere.

// Base URL handling - aligning with other API calls (assuming proxy or direct)
// admin page uses relative paths or imports API clients. We'll use axios directly for now or create an API method if preferred.
// Let's use direct axios with the same base URL logic as other files if possible, or relative `/api`.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black tracking-tight text-gray-900 mb-2">Admin Login</h1>
                    <p className="text-gray-500 text-sm">Enter your registered phone number and the last 4 digits as OTP.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Phone Number</label>
                        <Input
                            type="number"
                            placeholder="e.g. 9876543210"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className="h-12 bg-gray-50"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-700 uppercase block mb-1">OTP (Last 4 Digits)</label>
                        <Input
                            type="password"
                            placeholder="••••"
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                            className="h-12 bg-gray-50 tracking-widest"
                            maxLength={4}
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-black text-white hover:bg-gray-800 font-bold"
                    >
                        {loading ? "Verifying..." : "Login to Dashboard"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
