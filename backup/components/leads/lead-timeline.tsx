import { ActivityLog } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Phone, UserPlus, CheckCircle, Edit, MessageSquare, Clock } from "lucide-react";

interface LeadTimelineProps {
    logs: ActivityLog[];
}

export function LeadTimeline({ logs }: LeadTimelineProps) {
    if (!logs || logs.length === 0) {
        return <div className="text-center text-slate-500 py-4">No activity logged yet.</div>;
    }

    return (
        <div className="relative border-l border-slate-200 ml-3 space-y-6">
            {logs.map((log, index) => (
                <div key={log.id} className="mb-6 ml-6">
                    <span className={cn(
                        "absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ring-4 ring-white",
                        getIconStyle(log.action)
                    )}>
                        {getIcon(log.action)}
                    </span>
                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="text-sm font-semibold text-slate-900">{getLogTitle(log)}</h3>
                            <time className="text-xs text-slate-400 whitespace-nowrap ml-2">
                                {format(new Date(log.created_at), 'MMM d, h:mm a')}
                            </time>
                        </div>
                        <p className="text-xs text-slate-600">
                            {getLogDescription(log)}
                        </p>
                        {log.performed_by_name && (
                            <p className="text-[10px] text-slate-400 mt-1">by {log.performed_by_name}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function getIcon(action: string) {
    switch (action) {
        case "CREATED": return <UserPlus className="w-4 h-4 text-white" />;
        case "CALL_INITIATED": return <Phone className="w-4 h-4 text-white" />;
        case "CALL_LOG": return <Phone className="w-4 h-4 text-white" />; // Or a different icon if needed
        case "ASSIGNED": return <UserPlus className="w-4 h-4 text-white" />;
        case "UPDATED": return <Edit className="w-4 h-4 text-white" />;
        case "STATUS_CHANGE": return <CheckCircle className="w-4 h-4 text-white" />;
        case "COMMENT": return <MessageSquare className="w-4 h-4 text-white" />;
        default: return <Clock className="w-4 h-4 text-white" />;
    }
}

function getIconStyle(action: string) {
    switch (action) {
        case "CREATED": return "bg-blue-500";
        case "CALL_INITIATED": return "bg-purple-500";
        case "CALL_LOG": return "bg-green-500";
        case "ASSIGNED": return "bg-orange-500";
        case "STATUS_CHANGE": return "bg-indigo-500";
        case "COMMENT": return "bg-gray-500";
        default: return "bg-slate-400";
    }
}

function getLogTitle(log: ActivityLog) {
    switch (log.action) {
        case "CREATED": return "Lead Created";
        case "CALL_INITIATED": return "Call Attempted";
        case "CALL_LOG": return "Call Logged";
        case "ASSIGNED": return "Lead Assigned";
        case "STATUS_CHANGE": return "Status Updated";
        case "UPDATED":
            if (log.details?.old_status) return "Status Updated";
            if (log.details?.new_assignee) return "Reassigned";
            return "Lead Updated";
        case "COMMENT": return "Comment Added";
        default: return log.action.replace('_', ' ');
    }
}

function getLogDescription(log: ActivityLog) {
    const details = log.details || {};

    switch (log.action) {
        case "CREATED":
            return `Source: ${details.source || 'Unknown'}`;
        case "CALL_INITIATED":
            return "Agent clicked to call via phone/app.";
        case "CALL_LOG":
            return `Result: ${details.call_status} ${details.note ? `- ${details.note}` : ''}`;
        case "UPDATED":
            if (details.new_status) {
                // Fetch status name logic would ideally require mapping ID to Name, 
                // but usually backend sends full logs or we can just show ID for now.
                // Improvement: Backend should logging Status Name instead of ID for easier display.
                return `Status changed (ID: ${details.old_status} -> ${details.new_status})`;
            }
            if (details.new_assignee) {
                return `Assigned from ${details.old_assignee || 'Unassigned'} to ${details.new_assignee}`;
            }
            // Generic Fallback for other updates
            const changes = Object.keys(details).filter(k => k.startsWith('new_')).map(k => k.replace('new_', ''));
            if (changes.length > 0) return `Updated: ${changes.join(', ')}`;
            return "Lead details updated.";

        case "COMMENT":
            // Comments might be stored separately? Assuming mapped here for now
            return "New comment added.";

        default:
            return JSON.stringify(details);
    }
}
