import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Restaurant Finder",
  description: "Find nearby restaurants with map visualization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.23.0/maps/maps.css"
        />
        <script src="https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.23.0/maps/maps-web.min.js"></script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}