import { useState, useEffect } from "react";
import styles from "./dialog-message-input.module.scss";
import { Button, Input } from "antd";
import { SendOutlined, CloseOutlined } from "@ant-design/icons";
import { userChatStore } from "@/app/store/chat-store";
import DialogMessagesActions from "./dialog-message-actions";
import { useLocation } from "react-router-dom";

interface Props {
  onEnter: (value: any) => void;
}

/**
 * 对话消息输入
 * @constructor
 */
export function DialogMessageInput(props: Props) {
  const { onEnter } = props;
  const chatStore = userChatStore();
  const messageCompleted = chatStore.messageCompleted;
  const [value, setValue] = useState<string>("");
  const currentSession = chatStore.currentSession();

  const onSend = (value: string) => {
    if (!value || value.trim().length === 0) {
      return;
    }
    onEnter(value);
    setValue("");

    setTimeout(() => {
      chatStore.resetState();
    }, 60000); // 60000毫秒即1分钟
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === "Enter") {
      onSend(value);
    }
  };

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.actionsContainer}>
          <DialogMessagesActions config={currentSession.config} />
        </div>
        <div className={styles.textareaContainer}>
          <Input.TextArea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={styles.textarea}
            placeholder={"请输入消息（按Ctrl+Enter发送）"}
            autoFocus
            autoSize={{ minRows: 1, maxRows: 6 }}
            onKeyDown={handleKeyDown}
          />
          <Button
            type="primary"
            className={styles.btn}
            onClick={() => {
              if (!messageCompleted) {
                chatStore.interruptOutput(); // 中断输出流
              } else {
                onSend(value); // 发送消息
              }
            }}
          >
            {messageCompleted ? (
              <SendOutlined className={styles.icon} />
            ) : (
              <CloseOutlined className={styles.icon} />
            )}
          </Button>
        </div>
      </div>
      <div className={styles.notice}>对话信息由AI生成，请核查重要信息</div>
    </>
  );
}
