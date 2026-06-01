import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ThemeProvider } from "next-themes";
import { LayoutProvider } from "@/context/LayoutContext";
import { LayoutContentWrapper } from "@/components/LayoutContentWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BusyBeds — Premium Hotel Discount Coupons",
    template: "%s | BusyBeds",
  },
  description: "Get exclusive discount coupons for premium hotels across Africa. Subscribe and save up to 50% on your next stay in Tanzania, Kenya, Zanzibar and more.",
  keywords: ["hotel discounts", "Africa travel", "coupon codes", "Tanzania hotels", "Kenya hotels", "Zanzibar", "M-Pesa hotels", "busybeds"],
  icons: { icon: [{ url: "/favicon.ico", sizes: "48x48" }, { url: "/favicon.svg", type: "image/svg+xml" }], apple: "/apple-touch-icon.png" },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BusyBeds",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://busybeds.com",
    siteName: "BusyBeds",
    title: "BusyBeds — Premium Hotel Discount Coupons",
    description: "Save up to 50% on hotels across Africa. Get exclusive discount coupons for Tanzania, Kenya, Zanzibar and more.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "BusyBeds Hotel Discounts" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BusyBeds — Premium Hotel Discount Coupons",
    description: "Save up to 50% on hotels across Africa",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: {
    canonical: "https://busybeds.com",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0E5C3B" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1d27" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-dvh flex flex-col overflow-x-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <CurrencyProvider>
              <NotificationProvider>
                <LayoutProvider>
                  <LayoutContentWrapper>
                    {children}
                  </LayoutContentWrapper>
                  <Toaster richColors position="top-center" />
                </LayoutProvider>
              </NotificationProvider>
            </CurrencyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
