"use client";

import { useState, useEffect, useRef } from "react";
import { TeamAPI } from "@/lib/api/team";
import { TeamMember } from "@/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MentionInputProps {
    value: string;
    onChange: (value: string) => void;
    onMentionsChange: (ids: number[]) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function MentionInput({ value, onChange, onMentionsChange, placeholder, className, disabled }: MentionInputProps) {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [cursorPos, setCursorPos] = useState(0);
    const [query, setQuery] = useState("");
    const [mentionedIds, setMentionedIds] = useState<Set<number>>(new Set());

    // Position for the suggestion box
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const data = await TeamAPI.getAll();
                setTeam(data);
            } catch (e) {
                console.error("Failed to load team", e);
            }
        };
        fetchTeam();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const newPos = e.target.selectionStart;

        onChange(newValue);
        setCursorPos(newPos);

        // Check for @ mention trigger
        // Look backwards from cursor to find last @
        const textBeforeCursor = newValue.substring(0, newPos);
        const lastAt = textBeforeCursor.lastIndexOf("@");

        if (lastAt !== -1) {
            // Check if there's a space before @ or it's start of string
            const charBeforeAt = lastAt > 0 ? textBeforeCursor[lastAt - 1] : " ";
            if (charBeforeAt === " " || charBeforeAt === "\n") {
                const searchText = textBeforeCursor.substring(lastAt + 1);
                // If search text contains space, stop suggesting (unless we allow spaces in names, but usually mentions stop at space)
                // Let's allow spaces for names but limit length or check logic
                if (!searchText.includes("\n") && searchText.length < 20) {
                    setQuery(searchText.toLowerCase());
                    setShowSuggestions(true);
                    return;
                }
            }
        }

        setShowSuggestions(false);
    };

    const handleSelect = (member: TeamMember) => {
        const textBeforeCursor = value.substring(0, cursorPos);
        const lastAt = textBeforeCursor.lastIndexOf("@");

        if (lastAt !== -1) {
            const prefix = value.substring(0, lastAt);
            const suffix = value.substring(cursorPos);

            const newValue = `${prefix}@${member.name} ${suffix}`;

            onChange(newValue);

            // Add ID to mentions
            const newMentions = new Set(mentionedIds);
            newMentions.add(member.id);
            setMentionedIds(newMentions);
            onMentionsChange(Array.from(newMentions));

            setShowSuggestions(false);

            // Focus back
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    };

    const filteredTeam = team.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.role?.toLowerCase().includes(query)
    );

    return (
        <div className="relative w-full">
            <textarea
                ref={inputRef}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className={cn(
                    "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                disabled={disabled}
            />

            {showSuggestions && filteredTeam.length > 0 && (
                <div className="absolute bottom-full left-0 w-64 mb-2 bg-white rounded-md shadow-xl border border-slate-200 overflow-hidden z-50">
                    <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500">
                        Mention Team Member
                    </div>
                    <ul className="max-h-48 overflow-y-auto">
                        {filteredTeam.map(member => (
                            <li
                                key={member.id}
                                onClick={() => handleSelect(member)}
                                className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-sm transition-colors"
                            >
                                <span className="font-medium text-slate-900">{member.name}</span>
                                <div className="text-xs text-slate-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    {member.role}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
