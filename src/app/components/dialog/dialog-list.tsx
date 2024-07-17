import styles from "./dialog-list.module.scss";

import { DialogListItem } from "./dialog-list-item";
import { DialogResizeableSidebar } from "@/app/components/dialog/dialog-resizable-sidebar";
import { DialogHead } from "./dialog-head";

import { useNavigate } from "react-router-dom";
import { userChatStore } from "@/app/store/chat-store";
import React, { useEffect } from "react";
import { useDialog } from "@/context/DialogContext"; // 引入 useDialog
import { visibilityValues } from "mermaid/dist/diagrams/class/classTypes.js";

/**
 * 对话框列表
 */
export function DialogList() {
  const navigate = useNavigate();
  const chatStore = userChatStore();
  const [sessions, currentSessionIndex, selectSession] = userChatStore(
    (state) => [state.sessions, state.currentSessionIndex, state.selectSession]
  );

  const { isDialogOpen } = useDialog(); // 使用 useDialog

  useEffect(() => {
    // 自动跳转到默认选中的会话
    if (sessions.length > 0 && currentSessionIndex === 0) {
      selectSession(0); // 设置第一个会话为默认选中
    }

    // 检查是否有默认选中的会话索引，并自动跳转
    if (currentSessionIndex === 0) {
      const session = sessions[currentSessionIndex];
      navigate(`/chat/${session.id}`, {
        state: { title: session.dialog.title },
      });
    }
  }, [sessions, currentSessionIndex, selectSession, navigate]);

  return (
    // DialogResizeableSidebar 用于调整对话栏的大小
    <div
      className={styles["dialog-list-container"]}
      style={{ display: isDialogOpen ? "block" : "none" }}
    >
      <DialogResizeableSidebar>
        {/*头部操作*/}
        <DialogHead />
        {/*对话列表*/}
        <div className={styles["dialog-list"]}>
          {sessions.map((session, index) => (
            <DialogListItem
              key={session.id}
              session={session}
              selected={currentSessionIndex === index}
              onClick={() => {
                // 点击时跳转到对应的界面，并传递必要参数信息
                selectSession(index);
                navigate(`/chat/${session.id}`, {
                  state: { title: session.dialog.title },
                });
              }}
              onClickDelete={() => {
                chatStore.deleteSession(index);
              }}
            />
          ))}
        </div>
      </DialogResizeableSidebar>
    </div>
  );
}
