import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";

const sourceSans = Source_Sans_3({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "Clutchly - Reptile Data Management Platform",
  description: "Clutchly simplifies reptile data management, allowing you to effortlessly maintain accurate breeding records, monitor health and growth, and optimize husbandry practices.",
  other: {
    'google-site-verification': 'vVikk-GsXog3O1npUfmjcRoob951D1XWIJ4gOLsBjOQ',
  },
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
