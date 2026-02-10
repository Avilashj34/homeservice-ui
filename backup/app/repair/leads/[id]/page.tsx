'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { RepairAPI, RepairLead } from '@/lib/api/repair';
import {
    Phone, MapPin, Wrench, Shield, CheckCircle,
    ChevronRight, Clock, AlertCircle, Play, CheckSquare, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { toast } from 'sonner';
// Assuming sonner or use-toast is installed, otherwise standard alert for now if not. 
// User environment seems to have radix-ui from list_dir components, and toast.tsx.

export default function RepairLeadPage() {
    const params = useParams();
    const id = parseInt(params.id as string);

    // Data State
    const [lead, setLead] = useState<RepairLead | null>(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);

    // Verification State
    const [isVerifyOpen, setIsVerifyOpen] = useState(false);
    const [verifyStep, setVerifyStep] = useState<'PHONE' | 'OTP'>('PHONE');
    const [verifyPhone, setVerifyPhone] = useState('');
    const [verifyOtp, setVerifyOtp] = useState('');
    const [verifyLoading, setVerifyLoading] = useState(false);

    // Job Close State
    const [isCloseOpen, setIsCloseOpen] = useState(false);
    const [closeOtp, setCloseOtp] = useState('');
    const [closeLoading, setCloseLoading] = useState(false);

    // Job Start State
    const [startLoading, setStartLoading] = useState(false);

    useEffect(() => {
        // Check for stored token
        const storedToken = localStorage.getItem(`repair_token_${id}`) || localStorage.getItem('repair_token'); // Could be global or per lead? Let's use global for login, but maybe for specific lead access.
        // For simple repairman flow, let's assume one global login token.
        if (storedToken) setToken(storedToken);
    }, [id]);

    useEffect(() => {
        loadLead();
    }, [id, token]); // Reload if token changes

    const loadLead = async () => {
        setLoading(true);
        try {
            const data = await RepairAPI.getLead(id, token || undefined);
            setLead(data);
        } catch (error) {
            console.error(error);
            // toast.error("Failed to load lead details");
        } finally {
            setLoading(false);
        }
    };

    // --- Verification Flow ---
    const handleSendLoginOtp = async () => {
        if (verifyPhone.length !== 10) return alert("Enter valid 10-digit number"); // Simple validation
        setVerifyLoading(true);
        try {
            await RepairAPI.sendOtp(verifyPhone, 'login');
            setVerifyStep('OTP');
        } catch (err) {
            alert("Failed to send OTP. Check number.");
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleVerifyLogin = async () => {
        setVerifyLoading(true);
        try {
            const res = await RepairAPI.verifyOtp(verifyPhone, verifyOtp, 'login');
            if (res.success && res.token) {
                setToken(res.token);
                localStorage.setItem('repair_token', res.token);
                setIsVerifyOpen(false);
                // toast.success("Verified successfully!");
            } else {
                alert(res.message);
            }
        } catch (err) {
            alert("Verification failed");
        } finally {
            setVerifyLoading(false);
        }
    };

    // --- Job Management ---
    const handleStartJob = async () => {
        if (!token) return;
        setStartLoading(true);
        try {
            await RepairAPI.startJob(id, token);
            loadLead(); // Refresh state
            // toast.success("Job Started!");
        } catch (err) {
            alert("Failed to start job");
        } finally {
            setStartLoading(false);
        }
    };

    const handleSendCloseOtp = async () => {
        if (!lead || !token) return;
        setCloseLoading(true);
        try {
            // Need to verify CUSTOMER phone. 
            // In Close Flow, we send OTP to Customer Phone.
            // My API handles send-otp with type 'job_close' and lead_id. 
            // The API looks up lead->customer_phone.
            await RepairAPI.sendOtp(lead.customer_phone!, 'job_close', id); // Phone needed? API logic used lead_id for lookup in job_close type but request param has phone. 
            // Update API: sendOtp takes phone. We should pass lead.customer_phone if we have it?
            // Wait, if masked, we don't have it on frontend!
            // My backend send-otp logic: if type=job_close, requires lead_id. validates phone match if phone provided?
            // "if lead.customer_phone != request.phone_number: raise"
            // So I MUST provide the full phone number.
            // But if I am unmasked (which I must be to close job), I have the phone number in `lead` state.
            // Yes, `lead` state updates to unmasked once verified. So `lead.customer_phone` should be available.

            await RepairAPI.sendOtp(lead.customer_phone!, 'job_close', id);
        } catch (err) {
            alert("Failed to send OTP to customer");
        } finally {
            setCloseLoading(false);
        }
    };

    const handleVerifyClose = async () => {
        if (!lead || !token) return;
        setCloseLoading(true);
        try {
            const res = await RepairAPI.closeJob(id, closeOtp, token);
            setIsCloseOpen(false);
            loadLead();
            // toast.success("Job Closed!");
        } catch (err) {
            alert("Failed to verify customer OTP");
        } finally {
            setCloseLoading(false);
        }
    };


    if (loading) return <div className="p-8 flex justify-center text-slate-500">Loading details...</div>;
    if (!lead) return <div className="p-8 text-center text-red-500">Lead not found</div>;

    return (
        <div className="p-4 pb-20 space-y-4">

            {/* Verification Banner */}
            {lead.is_masked && (
                <Card className="bg-slate-900 text-white border-0 p-4">
                    <div className="flex items-start gap-3">
                        <Shield className="w-8 h-8 text-blue-400 shrink-0" />
                        <div className="space-y-2 flex-1">
                            <h2 className="font-bold text-lg">Verify Identity</h2>
                            <p className="text-sm text-slate-300">
                                Verify your phone number to reveal full customer details and manage this job.
                            </p>
                            <Button
                                onClick={() => setIsVerifyOpen(true)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 font-bold"
                            >
                                Restore Full Access
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Customer Details Card */}
            <Card className="p-4 border-slate-200 shadow-sm bg-white">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    Customer Details
                </h3>
                <div className="space-y-4">
                    <div>
                        <div className="font-bold text-xl text-slate-900">{lead.customer_name}</div>
                        <div className="flex items-center gap-2 text-slate-600 font-medium mt-1">
                            <Phone className="w-4 h-4" />
                            {lead.customer_phone}
                            {lead.is_masked && <span className="p-1 bg-slate-100 text-[10px] rounded border border-slate-200">MASKED</span>}
                        </div>
                    </div>

                    <div className="flex items-start gap-2 text-slate-600 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                        <span className="leading-snug">{lead.address}</span>
                    </div>

                    {lead.mobile_repair && (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-blue-50 p-2 rounded border border-blue-100">
                                <span className="block text-[10px] text-blue-500 uppercase font-bold">Device</span>
                                <span className="font-semibold text-blue-900">{lead.mobile_brand} {lead.mobile_model}</span>
                            </div>
                            <div className="bg-blue-50 p-2 rounded border border-blue-100">
                                <span className="block text-[10px] text-blue-500 uppercase font-bold">Issue</span>
                                <span className="font-semibold text-blue-900">{lead.mobile_issue}</span>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Service Issues */}
            <Card className="p-4 border-slate-200 shadow-sm bg-white">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    Requested Services
                </h3>
                <div className="space-y-3">
                    {lead.service_issues.map((issue, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100 h-full">
                            <span className="font-medium text-slate-700">{issue.issue_name}</span>
                            <span className="font-bold text-slate-900">₹{issue.price}</span>
                        </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200">
                        <span className="font-bold text-slate-500">Total</span>
                        <span className="font-black text-lg text-slate-900">
                            ₹{lead.service_issues.reduce((sum, item) => sum + item.price, 0)}
                        </span>
                    </div>
                </div>
            </Card>

            {/* Verification Dialog */}
            <Dialog open={isVerifyOpen} onOpenChange={setIsVerifyOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Repairman Verification</DialogTitle>
                        <DialogDescription>
                            Enter your registered mobile number to access lead details.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {verifyStep === 'PHONE' ? (
                            <div className="space-y-2">
                                <Label>Mobile Number</Label>
                                <Input
                                    placeholder="9876543210"
                                    maxLength={10}
                                    value={verifyPhone}
                                    onChange={(e) => setVerifyPhone(e.target.value.replace(/\D/g, ''))}
                                />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label>Enter OTP</Label>
                                <Input
                                    placeholder="XXXX"
                                    maxLength={4}
                                    className="text-center text-2xl tracking-widest"
                                    value={verifyOtp}
                                    onChange={(e) => setVerifyOtp(e.target.value)}
                                />
                                <p className="text-xs text-slate-500 text-center">OTP sent to +91 {verifyPhone}</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        {verifyStep === 'PHONE' ? (
                            <Button onClick={handleSendLoginOtp} disabled={verifyLoading} className="w-full">
                                {verifyLoading ? "Sending..." : "Send OTP"}
                            </Button>
                        ) : (
                            <Button onClick={handleVerifyLogin} disabled={verifyLoading} className="w-full">
                                {verifyLoading ? "Verifying..." : "Verify & Login"}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Close Job Dialog */}
            <Dialog open={isCloseOpen} onOpenChange={setIsCloseOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Close Job Verification</DialogTitle>
                        <DialogDescription>
                            Ask the customer for the OTP sent to their mobile number ({lead.customer_phone}).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="flex justify-center">
                            <Button variant="outline" size="sm" onClick={handleSendCloseOtp} disabled={closeLoading}>
                                {closeLoading ? "Sending..." : "Resend OTP to Customer"}
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <Label>Customer OTP</Label>
                            <Input
                                placeholder="XXXX"
                                maxLength={4}
                                className="text-center text-2xl tracking-widest"
                                value={closeOtp}
                                onChange={(e) => setCloseOtp(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={handleVerifyClose} disabled={closeLoading || closeOtp.length < 4} className="w-full bg-green-600 hover:bg-green-700">
                            {closeLoading ? "Verifying..." : "Verify & Close Job"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            {/* Fixed Bottom Action Bar */}
            {!lead.is_masked && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 max-w-md mx-auto">
                    {/* Status Display */}
                    <div className="mb-3 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase">Current Status</span>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${lead.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                lead.status === 'Work In Progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-slate-100 text-slate-800'
                            }`}>
                            {lead.status}
                        </div>
                    </div>

                    {lead.status !== 'Completed' && (
                        <div className="flex gap-3">
                            {lead.status !== 'Work In Progress' ? (
                                <Button
                                    className="flex-1 h-12 text-lg font-bold bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20"
                                    onClick={handleStartJob}
                                    disabled={startLoading}
                                >
                                    {startLoading ? <Clock className="w-5 h-5 animate-spin mr-2" /> : <Play className="w-5 h-5 mr-2 fill-current" />}
                                    Start Job
                                </Button>
                            ) : (
                                <Button
                                    className="flex-1 h-12 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20"
                                    onClick={() => {
                                        setIsCloseOpen(true);
                                        handleSendCloseOtp(); // Auto trigger OTP? Or let them click resend. User said "Ask for OTP (send the otp )" implies auto send or explicit send.
                                        // "Resend button have there." -> implied first send might be auto or manual. Let's auto-send for convenience.
                                    }}
                                >
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Close Job
                                </Button>
                            )}
                        </div>
                    )}
                    {lead.status === 'Completed' && (
                        <div className="flex items-center justify-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg border border-green-100 font-bold">
                            <CheckSquare className="w-5 h-5" />
                            Job Completed Successfully
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
