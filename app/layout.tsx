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
  keywords: ["reptile husbandry app", "reptile management app", "clutchly", "reptile data management"],
  authors: [{ name: "Clutchly Team" }],
  creator: APP_NAME,
  publisher: APP_NAME,
  metadataBase: new URL(APP_URL), 
  alternates: {
    canonical: "/",
    languages: {
      'en-US': "/en-us",
    },
  },
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
    images: [`${APP_URL}/og.png`], 
    creator: "@clutchly", 
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'google-site-verification': 'vVikk-GsXog3O1npUfmjcRoob951D1XWIJ4gOLsBjOQ',
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
