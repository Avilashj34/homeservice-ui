'use client';

import { useState, useRef, useEffect } from 'react';

type Message = {
    role: 'user' | 'agent';
    content: string;
    data?: any;
};

export default function AskAgentPage() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'agent', content: 'Hello! I am the Canyfix Pricing Agent. Ask me about repair prices for any mobile model (e.g., "iPhone 11 screen price").' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch('/api/pricing/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMsg }),
            });

            if (!res.ok) throw new Error('Failed to fetch');

            const data = await res.json();
            setMessages(prev => [...prev, {
                role: 'agent',
                content: data.response || "Here is what I found.",
                data: data.data
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'agent', content: 'Sorry, I encountered an error connecting to the server.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex flex-col h-screen bg-gray-100 max-w-4xl mx-auto shadow-xl">
            <header className="bg-slate-900 text-white p-4 shadow-md">
                <h1 className="text-xl font-bold">Canyfix Pricing Agent</h1>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user'
                            ? 'bg-slate-900 text-white'
                            : 'bg-white text-gray-800 shadow'
                            }`}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>

                            {/* Render Structured Data if available */}
                            {msg.data && msg.data.model && (
                                <div className="mt-3 text-sm bg-gray-50 p-2 rounded border border-gray-200 text-gray-700">
                                    <p><strong>Model:</strong> {msg.data.model}</p>
                                    <p><strong>Issue:</strong> {msg.data.issue}</p>

                                    {/* Catalog Price */}
                                    {msg.data.catalog_price && (
                                        <div className="mt-1">
                                            <span className="font-semibold text-green-600">Catalog Price:</span> ₹{msg.data.catalog_price}
                                        </div>
                                    )}

                                    {/* Vendor Price */}
                                    {msg.data.vendor_price && msg.data.vendor_price.best_options && (
                                        <div className="mt-2 text-xs">
                                            <p className="font-semibold text-gray-600 mb-1">Vendor Estimates:</p>
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-200">
                                                        <th className="p-1 border">Quality</th>
                                                        <th className="p-1 border">Est. Price</th>
                                                        <th className="p-1 border">Source</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {msg.data.vendor_price.best_options.map((opt: any, i: number) => (
                                                        <tr key={i} className="border-b">
                                                            <td className="p-1 border">{opt.quality}</td>
                                                            <td className="p-1 border font-medium">₹{opt.estimated_price}</td>
                                                            <td className="p-1 border text-gray-500">{opt.best_version}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* Historical Price */}
                                    {msg.data.historical_price && (
                                        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                                            <p>Historical Avg: ₹{msg.data.historical_price.avg} (Based on {msg.data.historical_price.count} repairs)</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-500 rounded-lg p-3 animate-pulse">Thinking...</div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-800 disabled:opacity-50"
                    disabled={loading}
                >
                    Send
                </button>
            </form>
        </main>
    );
}
