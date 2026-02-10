"use client";

import { useState, useEffect } from "react";
import { ServiceIssue } from "@/types";
import { ServiceAPI } from "@/lib/api/services";
import { LeadServiceIssue } from "@/lib/api/leads";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Plus, X, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceIssueManagerProps {
    initialIssues?: LeadServiceIssue[];
    onIssuesChange: (issues: LeadServiceIssue[]) => void;
}

export function ServiceIssueManager({ initialIssues = [], onIssuesChange }: ServiceIssueManagerProps) {
    // Map initial issues to ensure they have the structure we need
    const [selectedIssues, setSelectedIssues] = useState<LeadServiceIssue[]>(initialIssues);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<ServiceIssue[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Sync if initialIssues changes externally (e.g. after save)
    useEffect(() => {
        setSelectedIssues(initialIssues);
    }, [initialIssues]);

    // Simple debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length > 1) {
                performSearch(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const performSearch = async (query: string) => {
        setIsSearching(true);
        try {
            const results = await ServiceAPI.searchIssues(query);
            // Filter out already selected issues (by ID match if linked, or name match if custom)
            const filtered = results.filter(
                (r) => !selectedIssues.some((s) => s.service_issue_id === r.id)
            );
            setSearchResults(filtered);
        } catch (error) {
            console.error("Failed to search issues", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddIssue = (issue: ServiceIssue) => {
        const newLeadIssue: LeadServiceIssue = {
            service_issue_id: issue.id,
            issue_name: issue.name,
            price: issue.price || 0
        };

        const newIssues = [...selectedIssues, newLeadIssue];
        setSelectedIssues(newIssues);
        onIssuesChange(newIssues);
        setSearchQuery(""); // Clear search after adding
    };

    const handleRemoveIssue = (index: number) => {
        const newIssues = selectedIssues.filter((_, i) => i !== index);
        setSelectedIssues(newIssues);
        onIssuesChange(newIssues);
    };

    const calculateTotal = () => {
        return selectedIssues.reduce((sum, issue) => sum + (issue.price || 0), 0);
    };

    return (
        <div className="space-y-4">
            {/* Search Section */}
            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search for issues (e.g. Broken Screen, Battery)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-slate-50 border-slate-200"
                />
            </div>

            {/* Results Dropdown (simulated) */}
            {searchQuery.length > 1 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm max-h-60 overflow-y-auto">
                    {isSearching ? (
                        <div className="p-4 text-center text-sm text-slate-500">Searching...</div>
                    ) : searchResults.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {searchResults.map((issue) => (
                                <div
                                    key={issue.id}
                                    className="p-3 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
                                    onClick={() => handleAddIssue(issue)}
                                >
                                    <div>
                                        <div className="font-medium text-slate-900 text-sm">{issue.name}</div>
                                        {issue.description && (
                                            <div className="text-xs text-slate-500 line-clamp-1">{issue.description}</div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="font-bold text-slate-900 text-sm">
                                                {issue.price ? `₹${issue.price}` : "Free"}
                                            </div>
                                            {issue.price_description && (
                                                <div className="text-[10px] text-slate-400">{issue.price_description}</div>
                                            )}
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-blue-600">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-sm text-slate-500">No issues found.</div>
                    )}
                </div>
            )}

            {/* Selected Issues List */}
            {selectedIssues.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <span>Selected Services</span>
                        <span>Total Est: <span className="text-slate-900">₹{calculateTotal()}</span></span>
                    </div>
                    <div className="space-y-2">
                        {selectedIssues.map((issue, index) => (
                            <Card key={index} className="p-3 flex items-center justify-between bg-blue-50/50 border-blue-100">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white p-1.5 rounded-full border border-blue-100 text-blue-600">
                                        <Tag className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900 text-sm">{issue.issue_name}</div>
                                        <div className="text-xs text-slate-500">
                                            Price: {issue.price ? `₹${issue.price}` : "TBD"}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleRemoveIssue(index)}
                                    className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
