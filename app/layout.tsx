import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./components/providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "HealthRadar | Disease Management",
  description: "Comprehensive disease monitoring and management system for health workers",
  icons: {
    icon: [
      { url: '/assets/favicon/favicon.ico' },
      { url: '/assets/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/assets/favicon/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/assets/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/assets/favicon/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {/* <div className="flex w-full overflow-y-hidden md:overflow-y-hidden bg-[#DDEB9D] h-screen">
            <SideNavbar /> */}
          {children}
          {/* </div> */}
        </Providers>
      </body>
    </html>
  );
}
