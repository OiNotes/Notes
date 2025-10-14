import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { themeInitScript } from "@/lib/theme-script";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Oi/Notes — личные заметки в формате видео + текст",
  description:
    "Oi/Notes — высокополированный блог: тема, видео в рамке, полный текст и курация идей.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript() }}
          suppressHydrationWarning
        />
      </head>
      <body className={`${inter.variable} ${fraunces.variable}`}>
        <ThemeProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
