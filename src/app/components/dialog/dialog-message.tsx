import { useLocation, useParams } from "react-router-dom";
import styles from "./dialog-message.module.scss";
import { DialogMessageItem } from "@/app/components/dialog/dialog-message-item";
import { MessageRole } from "@/types/chat";
import { DialogMessageInput } from "@/app/components/dialog/dialog-message-input";
import { createNewMessage, userChatStore } from "@/app/store/chat-store";
import userScrollToBottom from "@/app/hooks/useScrollToBottom";
import { useEffect, useState } from "react";

interface Props {
  id: string;
  title: string;
}

/**
 * 聊天面板
 * @constructor
 */
export function DialogMessage() {
  const { id } = useParams();
  const chatStore = userChatStore();
  const currentSession = chatStore.currentSession();
  const location = useLocation();
  const { scrollRef, setAutoScroll, scrollToBottom } = userScrollToBottom();
  const title = location.state?.title || "新的对话";

  const [prevPathname, setPrevPathname] = useState(location.pathname);
  // 路径变化时重置store
  useEffect(() => {
    const currentPathname = location.pathname;

    if (/chat/.test(currentPathname) && currentPathname !== prevPathname) {
      console.info("chatStore.resetState");
      chatStore.resetState();
      setPrevPathname(currentPathname);
    }
  }, [location.pathname, chatStore, prevPathname]);

  // 输入事件
  const onEnter = async (value: string) => {
    const newMessage = createNewMessage(value, MessageRole.user);
    await chatStore.onSendMessage(newMessage);
  };

  const clearContextIndex =
    (currentSession.clearContextIndex ?? -1) >= 0
      ? currentSession.clearContextIndex!
      : -1;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>{title}</div>
      <div className={styles.scroll} ref={scrollRef}>
        {currentSession.messages?.map((message, index) => {
          const isLastMessage = index === currentSession.messages.length - 1;
          const shouldShowClearContextDivider = index === clearContextIndex - 1;
          return (
            <>
              <DialogMessageItem
                message={message}
                key={index}
                parentRef={scrollRef}
                isLastMessage={isLastMessage} // 传递 isLastMessage 属性
              />
              {shouldShowClearContextDivider && <ClearContextDivider />}
            </>
          );
        })}
      </div>
      <DialogMessageInput onEnter={onEnter} />
    </div>
  );
}

/**
 * 清除上下文对话信息
 * @constructor
 */
function ClearContextDivider() {
  const chatStore = userChatStore();

  return (
    <div
      className={styles["clear-context"]}
      onClick={() =>
        chatStore.updateCurrentSession(
          (session) => (session.clearContextIndex = undefined)
        )
      }
    >
      <div className={styles["clear-context-tips"]}>上下文已清除</div>
    </div>
  );
}
