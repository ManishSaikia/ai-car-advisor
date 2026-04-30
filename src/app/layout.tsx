import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Car Advisor",
  description: "AI-powered Car Advisor for the Indian market",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
