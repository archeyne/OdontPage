import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { Montserrat } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["200", "400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dr. Esthetique | Advanced Dentistry",
  description: "Dedicated to the perfection of the smile. Merging advanced technology with clinical artistry to restore function and confidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${cormorant.variable} ${montserrat.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
