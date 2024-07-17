import "./styles/globals.scss";
import { DialogProvider } from "@/context/DialogContext";

export const metadata = {
  title: "ChatGPT - 赫伯特",
  description: "您的 ChatGPT 贴心助手！",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <DialogProvider>{children}</DialogProvider>
      </body>
    </html>
  );
}
