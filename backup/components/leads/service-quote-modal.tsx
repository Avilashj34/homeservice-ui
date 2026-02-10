"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Trash2, Tag, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { ServiceAPI, ServiceIssue } from "@/lib/api/services";
import { Lead, LeadServiceIssue } from "@/lib/api/leads";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface ServiceQuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead;
    onSave: (issues: ServiceIssue[], estimatedCost: number) => Promise<void>;
}

export function ServiceQuoteModal({ isOpen, onClose, lead, onSave }: ServiceQuoteModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 300);
    const [searchResults, setSearchResults] = useState<ServiceIssue[]>([]);
    const [selectedIssues, setSelectedIssues] = useState<ServiceIssue[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Initialize selected issues from lead when modal opens or lead changes
    useEffect(() => {
        if (isOpen && lead.service_issues) {
            const mappedIssues = lead.service_issues.map(i => ({
                id: i.service_issue_id || i.id, // Use catalog ID if available, else row ID
                name: i.issue_name,
                price: i.price,
                slug: "", // Placeholder
                description: "", // Placeholder
                is_custom: !i.service_issue_id // Flag to identify custom issues
            } as unknown as ServiceIssue));
            setSelectedIssues(mappedIssues);
        }
    }, [isOpen, lead.service_issues]);

    // Search effect
    useEffect(() => {
        const search = async () => {
            setIsLoading(true);
            try {
                const results = await ServiceAPI.searchIssues(debouncedSearch);
                setSearchResults(results);
            } catch (error) {
                console.error("Failed to search services", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (debouncedSearch) {
            search();
        } else {
            setSearchResults([]);
        }
    }, [debouncedSearch]);

    const handleAddIssue = (issue: ServiceIssue) => {
        if (!selectedIssues.some(i => i.id === issue.id)) {
            setSelectedIssues([...selectedIssues, issue]);
        }
    };

    const handleRemoveIssue = (id: number) => {
        setSelectedIssues(selectedIssues.filter(i => i.id !== id));
    };

    const totalCost = selectedIssues.reduce((sum, issue) => sum + (issue.price || 0), 0);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(selectedIssues, totalCost);
            onClose();
        } catch (error) {
            console.error("Failed to save quote", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl bg-white border-slate-200 text-slate-900 h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Tag className="w-5 h-5 text-slate-900" />
                        Modify Quote & Services
                    </DialogTitle>
                    <p className="text-sm text-slate-500 mt-1">
                        Search and add services to build a quote for <span className="font-bold text-slate-900">{lead.customer_name}</span>.
                    </p>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left: Search & Results */}
                    <div className="w-1/2 p-6 border-r border-slate-100 flex flex-col gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search services (name, tag, slug)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-slate-50 border-slate-200 focus:border-slate-900 focus:ring-slate-900"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto min-h-[300px]">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <p className="text-xs">Searching services...</p>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="space-y-2">
                                    {searchResults.map((issue) => {
                                        const isSelected = selectedIssues.some(i => i.id === issue.id);
                                        return (
                                            <div
                                                key={issue.id}
                                                className={cn(
                                                    "p-3 rounded-lg border flex justify-between items-center transition-all group",
                                                    isSelected
                                                        ? "bg-slate-100 border-slate-300"
                                                        : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm"
                                                )}
                                            >
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <div className="font-medium text-sm text-slate-900 truncate flex items-center gap-2">
                                                        {issue.name}
                                                        {issue.is_inspection_required && (
                                                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded border border-amber-200">
                                                                Inspection
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-500 truncate">{issue.description}</div>
                                                    <div className="text-xs font-mono text-slate-400 mt-0.5">{issue.slug}</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-slate-700 text-sm">₹{issue.price}</span>
                                                    <Button
                                                        size="sm"
                                                        variant={isSelected ? "secondary" : "default"}
                                                        className={cn(
                                                            "h-8 w-8 p-0 rounded-full",
                                                            isSelected ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-slate-900 hover:bg-black text-white"
                                                        )}
                                                        onClick={() => !isSelected && handleAddIssue(issue)}
                                                        disabled={isSelected}
                                                    >
                                                        {isSelected ? <Tag className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : searchQuery ? (
                                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                                    <Search className="w-8 h-8 mb-2 opacity-20" />
                                    <p className="text-sm">No services found.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                                    <Sparkles className="w-8 h-8 mb-2 opacity-20" />
                                    <p className="text-sm">Type to search services.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Selected & Summary */}
                    <div className="w-1/2 flex flex-col bg-slate-50/30">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                                Selected Services ({selectedIssues.length})
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {selectedIssues.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
                                    <AlertCircle className="w-8 h-8 mb-3 opacity-20" />
                                    <p className="text-sm font-medium text-slate-500">No services added yet</p>
                                    <p className="text-xs mt-1">Select services from the left to build your quote.</p>
                                </div>
                            ) : (
                                selectedIssues.map((issue) => (
                                    <div key={issue.id} className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm flex justify-between items-start group">
                                        <div className="flex-1 pr-3">
                                            <div className="font-bold text-sm text-slate-900">{issue.name}</div>
                                            <div className="text-xs text-slate-500">{issue.slug}</div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="font-bold text-slate-900 text-sm">₹{issue.price}</span>
                                            <button
                                                onClick={() => handleRemoveIssue(issue.id)}
                                                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Quote Summary Footer */}
                        <div className="p-6 bg-white border-t border-slate-200">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-500 font-medium">Total Estimated Cost</span>
                                <span className="text-2xl font-black text-slate-900">₹{totalCost.toLocaleString()}</span>
                            </div>
                            <Button
                                onClick={handleSave}
                                disabled={selectedIssues.length === 0 || isSaving}
                                className="w-full h-12 text-base font-bold bg-slate-900 hover:bg-black text-white shadow-lg shadow-slate-200"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving Quote...
                                    </>
                                ) : (
                                    <>
                                        Update Quote & Services
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
