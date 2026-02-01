import { Outfit } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/apple-icon.png",
    },
    title: {
        template: "%s | Home Service",
        default: "Home Service - Expert Electricians, Plumbers & Carpenters",
    },
    description: "Book trusted home services instantly. Expert electricians, plumbers, and carpenters available for switch replacement, tap repair, furniture assembly, and more.",
    keywords: [
        "home services", "electrician", "plumber", "carpenter", "switch replacement", "socket repair",
        "tap repair", "wash basin installation", "door hinge repair", "furniture assembly",
        "emergency home repair", "local handyman", "affordable home maintenance"
    ],
    openGraph: {
        title: "Home Service - Fix Your Home Instantly",
        description: "Premium home services at your fingertips. Book expert electricians, plumbers, and carpenters in under 15 minutes.",
        url: "https://homeservice.com", // Placeholder
        siteName: "Home Service",
        locale: "en_US",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={outfit.className}>{children}</body>
        </html>
    );
}
