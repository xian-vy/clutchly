import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";

const sourceSans = Source_Sans_3({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://clutchly.vercel.app'),
  title: "Clutchly - Reptile Husbandry Management",
  description: "The digital toolkit for reptile enthusiasts and breeders. Easily manage records for breeding, health, feeding, finances and more.",
  keywords: ["reptile husbandry app", "reptile management app", "clutchly", "reptile data management", "reptile breeding management"],
  authors: [{ name: "Clutchly", url: "https://clutchly.vercel.app" }],
  creator: "Clutchly",
  openGraph: {
    title: "Clutchly - Reptile Husbandry Management",
    description: "The digital toolkit for reptile enthusiasts and breeders. Easily manage records for breeding, health, feeding, finances and more.",
    url: "https://clutchly.vercel.app",
    siteName: "Clutchly",
    images: [
      {
        url: "/clutchly.png",
        alt: "Clutchly",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clutchly - Reptile Husbandry Management",
    description: "The digital toolkit for reptile enthusiasts and breeders. Easily manage records for breeding, health, feeding, finances and more.",
    images: ["/clutchly.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://clutchly.vercel.app",
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sourceSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
