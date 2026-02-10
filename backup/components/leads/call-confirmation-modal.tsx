"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, X } from "lucide-react";

import { LeadsAPI } from "@/lib/api/leads";

interface CallConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerName: string;
    customerPhone: number;
    onConfirmCall: () => void;
    leadId: number;
}

export function CallConfirmationModal({
    isOpen,
    onClose,
    customerName,
    customerPhone,
    onConfirmCall,
    leadId
}: CallConfirmationModalProps) {
    const handleCallNow = async () => {
        // API Call is now handled by the parent component before opening this modal

        // Open phone app
        window.location.href = `tel:${customerPhone}`;

        // Log the activity / Trigger next step
        onConfirmCall();

        // Close modal
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-slate-600" />
                        Call Customer
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Customer Info */}
                    <div className="text-center space-y-2">
                        <p className="text-sm text-slate-500">Calling</p>
                        <p className="text-2xl font-bold text-slate-900">{customerName}</p>
                        <p className="text-3xl font-mono font-bold text-blue-600 tracking-wider">
                            {customerPhone}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 h-12 text-base"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCallNow}
                            className="flex-1 h-12 text-base bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Phone className="w-4 h-4 mr-2" />
                            Call Now
                        </Button>
                    </div>

                    <p className="text-xs text-center text-slate-400">
                        This call will be logged in the activity history
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
