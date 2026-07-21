import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Git 企业实战课｜从零到团队协作",
  description: "面向新手的五课 Git 企业开发互动教程，包含真实项目、命令复制、PR、冲突、救援与发布。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
