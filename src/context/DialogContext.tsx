"use client";
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

interface DialogContextProps {
  isDialogOpen: boolean;
  toggleDialog: () => void;
}

const DialogContext = createContext<DialogContextProps | undefined>(undefined);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false); // 默认关闭对话框

  const toggleDialog = () => {
    setIsDialogOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsDialogOpen(true); // 当屏幕宽度大于等于1024px时，打开对话框
      } else {
        setIsDialogOpen(false); // 其他情况关闭对话框
      }
    };

    // 初始化时检查屏幕宽度
    handleResize();

    // 监听窗口大小变化
    window.addEventListener("resize", handleResize);

    // 组件卸载时移除事件监听
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <DialogContext.Provider value={{ isDialogOpen, toggleDialog }}>
      {children}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};
