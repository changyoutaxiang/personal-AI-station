import type { Metadata } from "next";
import { Geist, Geist_Mono, Pacifico } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pacifico = Pacifico({
  variable: "--font-pacifico",
  subsets: ["latin"],
  weight: "400",
});

// Temporarily removed Dancing_Script due to Turbopack compatibility issue

export const metadata: Metadata = {
  title: "你好 唱游 - 个人知识管理系统",
  description: "从信息捕获到洞察生成的完整闭环",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pacifico.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
