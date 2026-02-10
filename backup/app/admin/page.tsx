"use client";

import { useEffect, useState } from "react";
import { LeadsAPI } from "@/lib/api/leads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Users, Clock, CalendarDays } from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        today_leads: 0,
        today_calls: 0,
        active_leads: 0,
        all_leads: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await LeadsAPI.getStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        {
            title: "Today's Leads",
            value: stats.today_leads,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            title: "Calls Details", // "how many called happen"
            value: stats.today_calls,
            icon: Phone,
            color: "text-green-600",
            bg: "bg-green-50"
        },
        {
            title: "Active Follow-ups", // "how many followup"
            value: stats.active_leads,
            icon: Clock,
            color: "text-orange-600",
            bg: "bg-orange-50"
        },
        {
            title: "Total Leads",
            value: stats.all_leads,
            icon: CalendarDays,
            color: "text-purple-600",
            bg: "bg-purple-50"
        }
    ];

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading dashboard data...</div>;
    }

    return (
        <div className="p-6 md:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-2">Overview of lead activity and performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Card key={card.title} className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">
                                    {card.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${card.bg}`}>
                                    <Icon className={`h-4 w-4 ${card.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {card.title.includes("Today") ? "Updated just now" : "All time"}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Placeholder for future charts or lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400">
                    Lead Trend Chart (Coming Soon)
                </div>
                <div className="h-64 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400">
                    Recent Activity Log (Coming Soon)
                </div>
            </div>
        </div>
    );
}
