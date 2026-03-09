import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Digibus - Next-Gen Bus Journey Management",
  description:
    "Real-time bus tracking, analytics, and journey management platform. Track your bus with PNR, manage fleets, and optimize operations.",
  keywords: ["bus tracking", "PNR", "journey management", "fleet management", "real-time tracking"],
  openGraph: {
    title: "Digibus - Next-Gen Bus Journey Management",
    description: "Real-time bus tracking and journey management platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body
        className={`${inter.variable} ${robotoMono.variable} font-sans antialiased`}
      >
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
