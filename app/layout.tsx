import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";
import "@/styles/globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Траектория — безопасная подработка для подростков",
  description:
    "Сервис помогает подросткам находить реальные задачи, а работодателям — быстро публиковать их в удобном формате.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" data-theme="dark" className={manrope.variable} suppressHydrationWarning>
      <body className="font-sans">
        <Script id="trajectory-theme" strategy="beforeInteractive">
          {`(function(){try{var k='trajectory-theme',t=localStorage.getItem(k);document.documentElement.setAttribute('data-theme',t==='light'||t==='dark'?t:'dark');}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`}
        </Script>
        {children}
      </body>
    </html>
  );
}
