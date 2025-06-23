import { ElectricityRateProvider } from "@/context/ElectricityRateContext";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Project",
  description: "Created with Next.js",
  generator: "Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white" suppressHydrationWarning>
        <ElectricityRateProvider>{children}</ElectricityRateProvider>
      </body>
    </html>
  );
}
