import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { WebVitals } from "@/components/web-vitals";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_BASE_URL ?? "http://localhost:3000"),
  title: {
    default: "Group Order for Pokemon Cards",
    template: "%s | Group Order",
  },
  description:
    "Start a group order for Pokemon trading cards, invite up to two friends, build carts together, and check out as the host.",
  openGraph: {
    title: "Group Order for Pokemon Cards",
    description:
      "Invite friends, build carts together, and check out as the host.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <WebVitals />
        {children}
      </body>
    </html>
  );
}
