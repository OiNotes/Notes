import type { Metadata } from "next";
import { themeInitScript } from "@/lib/theme-script";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "@/styles/globals.css";

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@100..900&family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript() }}
          suppressHydrationWarning
        />
      </head>
      <body>
        <ThemeProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
