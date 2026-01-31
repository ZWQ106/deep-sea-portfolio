import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // 1. 网页标题 (浏览器标签页上显示的)
  title: "Wenqian Zhang | Robotics & Embodied AI Portfolio",
  
  // 2. 网页描述 (Google 搜索结果里显示的)
  description: "Portfolio of Wenqian Zhang, a Computer Engineering student at UCR who are interested in Embodied AI and Robotics",
  
  // 3. 关键词 (有助于 SEO)
  keywords: ["Wenqian Zhang", "UCR", "Computer Engineering", "Robotics", "Embodied AI", "Three.js", "Portfolio"],
  
  // 4. 作者信息
  authors: [{ name: "Wenqian Zhang", url: "https://wenqianzhang.com" }],
  
  // 5. Open Graph (当你在微信、LinkedIn、Twitter 分享链接时显示的卡片信息)
  openGraph: {
    title: "Wenqian Zhang | CE & Robotics Portfolio",
    description: "Exploring the intersection of AI and the physical world through code.",
    url: "https://wenqianzhang.com",
    siteName: "Wenqian's Deep sea",
    locale: "en_US",
    type: "website",
  },
  
  // 6. 图标 (如果你有 favicon.ico 的话，没有也没关系，Next.js 会用默认的)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
