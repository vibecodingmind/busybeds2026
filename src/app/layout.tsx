import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ThemeProvider } from "next-themes";
import { Navbar } from "@/components/Navbar";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomTabBar } from "@/components/BottomTabBar";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BusyBeds — Premium Hotel Discount Coupons",
  description: "Get exclusive discount coupons for premium hotels across Africa. Subscribe and save up to 50% on your next stay in Tanzania, Kenya, Zanzibar and more.",
  keywords: ["hotel discounts", "Africa travel", "coupon codes", "Tanzania hotels", "Kenya hotels", "Zanzibar"],
  icons: { icon: "/logo.svg", apple: "/icon-192.png" },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BusyBeds",
  },
  formatDetection: {
    telephone: false,
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
                {/* Desktop Navbar (hidden on mobile) */}
                <Navbar />

                {/* Mobile Header (hidden on desktop) */}
                <MobileHeader />

                {/* Main content with bottom padding for tab bar */}
                <main className="flex-1 pb-16 lg:pb-0">{children}</main>

                {/* Footer (desktop only, hidden on mobile) */}
                <div className="hidden lg:block">
                  <Footer />
                </div>

                {/* Bottom Tab Bar (mobile only) */}
                <BottomTabBar />

                <Toaster richColors position="top-center" />
              </NotificationProvider>
            </CurrencyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
