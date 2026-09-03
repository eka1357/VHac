import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SentinelFin | Financial Distress Early-Warning System",
  description: "Detecting financial distress months before defaults happen using explainable trend velocity scoring and AI diagnostics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#070b14] text-slate-100 selection:bg-indigo-500/30">
        {children}
      </body>
    </html>
  );
}
