import styles from "./dialog-list.module.scss";

import { DialogListItem } from "./dialog-list-item";
import { DialogResizeableSidebar } from "@/app/components/dialog/dialog-resizable-sidebar";
import { DialogHead } from "./dialog-head";

import { useNavigate } from "react-router-dom";
import { userChatStore } from "@/app/store/chat-store";
import React, { useEffect } from "react";
import { useDialog } from "@/context/DialogContext";

export function DialogList() {
  const navigate = useNavigate();
  const chatStore = userChatStore();
  const [sessions, currentSessionIndex, selectSession] = userChatStore(
    (state) => [state.sessions, state.currentSessionIndex, state.selectSession]
  );

  const { isDialogOpen } = useDialog();

  useEffect(() => {
    // console.log("Sessions: ", sessions);
    // console.log("Current Session Index: ", currentSessionIndex);

    if (sessions.length > 0) {
      if (currentSessionIndex < 0) {
        // console.log("No valid current session index. Setting to 0.");
        selectSession(0); // 设置第一个会话为默认选中
      } else {
        const session = sessions[currentSessionIndex];
        navigate(`/chat/${session.id}`, {
          state: { title: session.dialog.title },
        });
      }
    }
  }, [sessions, currentSessionIndex, selectSession, navigate]);

  return (
    <div
      className={styles["dialog-list-container"]}
      style={{ display: isDialogOpen ? "block" : "none" }}
    >
      <DialogResizeableSidebar>
        <DialogHead />
        <div className={styles["dialog-list"]}>
          {sessions.map((session, index) => (
            <DialogListItem
              key={session.id}
              session={session}
              selected={currentSessionIndex === index}
              onClick={() => {
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
