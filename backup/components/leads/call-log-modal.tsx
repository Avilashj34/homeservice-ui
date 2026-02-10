import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone } from "lucide-react";
import { Modal } from "@/components/ui/modal";

import { LeadsAPI } from "@/lib/api/leads";

interface CallLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { call_status: string; lead_status_id?: number; note: string }) => void;
    customerName: string;
    customerPhone: number;
    leadId?: number;
}

export function CallLogModal({ isOpen, onClose, onSubmit, customerName, customerPhone, leadId }: CallLogModalProps) {
    const [callStatus, setCallStatus] = useState("pickup");
    const [leadStatus, setLeadStatus] = useState<string>("");
    const [note, setNote] = useState("");

    const handleSubmit = () => {
        onSubmit({
            call_status: callStatus,
            lead_status_id: leadStatus ? parseInt(leadStatus) : undefined,
            note
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Call Customer & Log Result" className="bg-white border-slate-200 text-slate-900 sm:max-w-md">
            <div className="space-y-6 py-4">
                {/* Customer Details & Call Action */}
                <div className="bg-slate-50 p-4 rounded-lg flex flex-col items-center gap-3 border border-slate-100">
                    <div className="text-center">
                        <div className="text-sm text-slate-500 mb-1">Calling</div>
                        <div className="font-bold text-slate-900 text-lg">{customerName}</div>
                        <div className="font-mono text-2xl font-bold text-slate-900 tracking-wider my-1">
                            {customerPhone}
                        </div>
                    </div>
                    <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 text-base shadow-sm"
                        onClick={async () => {
                            if (leadId) {
                                try {
                                    await LeadsAPI.initiateCall(leadId);
                                } catch (error) {
                                    console.error("Failed to log call initiation", error);
                                }
                            }
                            window.location.href = `tel:${customerPhone}`;
                        }}
                    >
                        <Phone className="w-5 h-5 mr-2" />
                        Call Now
                    </Button>
                    <p className="text-[10px] text-slate-400 text-center">
                        Clicking "Call Now" will open your phone app.
                    </p>
                </div>

                <div className="space-y-4">
                    <Label className="text-slate-500 font-bold uppercase text-xs">Call Status</Label>
                    <div className="flex gap-4">
                        {['pickup', 'not_pickup', 'wrong_number'].map(status => (
                            <label key={status} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-100 transition-colors">
                                <input
                                    type="radio"
                                    name="call_status"
                                    value={status}
                                    checked={callStatus === status}
                                    onChange={e => setCallStatus(e.target.value)}
                                    className="w-4 h-4 accent-slate-900"
                                />
                                <span className="capitalize text-slate-700 text-sm">{status.replace('_', ' ')}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-500 font-bold uppercase text-xs">Update Lead Status (Optional)</Label>
                    <select
                        className="flex h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
                        value={leadStatus}
                        onChange={e => setLeadStatus(e.target.value)}
                    >
                        <option value="" className="bg-white text-slate-600">Keep Current Status</option>
                        <option value="2" className="bg-white text-slate-900">Interested</option>
                        <option value="3" className="bg-white text-slate-900">Confirmed</option>
                        <option value="4" className="bg-white text-slate-900">Not Interested</option>
                        <option value="5" className="bg-white text-slate-900">By Mistake</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-500 font-bold uppercase text-xs">Note</Label>
                    <Textarea
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        placeholder="Result of the conversation..."
                        className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 min-h-[100px]"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-2">
                    <Button variant="outline" onClick={onClose} className="bg-transparent border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900">Cancel</Button>
                    <Button onClick={handleSubmit} className="bg-slate-900 text-white hover:bg-black font-bold">Save Log</Button>
                </div>
            </div>
        </Modal>
    );
}
