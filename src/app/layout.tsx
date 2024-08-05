import "./styles/globals.scss";
import { DialogProvider } from "@/context/DialogContext";

export const metadata = {
  title: "Creative AI-Kang Yao Coding",
  description: "您的 ChatAI 贴心助手！",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <DialogProvider>
          {children}
        </DialogProvider>
      </body>
    </html>
  );
}
