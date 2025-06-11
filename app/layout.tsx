import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";
import { APP_DESCRIPTION, SITE_TITLE, APP_URL, APP_NAME } from "@/lib/constants/app";

const sourceSans = Source_Sans_3({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: APP_DESCRIPTION,
  keywords: ["reptile husbandry app", "reptile management app", "clutchly", "reptile data management", "reptile breeding management"],
  authors: [{ name: APP_NAME, url: APP_URL }],
  creator: APP_NAME,
  openGraph: {
    title: SITE_TITLE,
    description: APP_DESCRIPTION,
    url: APP_URL,
    siteName: APP_NAME,
    images: [
      {
        url: "/og.png",
        alt: APP_NAME,
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: APP_DESCRIPTION,
    images: [{
      url: "/og.png",
      alt: APP_NAME,
    }], 
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: APP_URL,
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
          defaultTheme="dark"
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
