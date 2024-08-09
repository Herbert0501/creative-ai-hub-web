import styles from "./dialog-message-item.module.scss";
import { Avatar, Space } from "antd";
import { Message, MessageRole } from "@/types/chat";
import { RefObject, useState } from "react"; // 添加 useState
import { Markdown } from "@/app/components/markdown/markdown";
import { CopyOutlined, DeleteOutlined, SyncOutlined } from "@ant-design/icons";
import { ChatAction } from "./dialog-message-actions";
import dayjs from "dayjs";
import { userChatStore } from "@/app/store/chat-store";
import { copyToClipboard } from "@/utils";

interface Props {
  message: Message;
  parentRef?: RefObject<HTMLDivElement>;
  isLastMessage: boolean; // 新增属性，用于判断是否是最后一条消息
}

export function DialogMessageItem(props: Props) {
  const { message, parentRef, isLastMessage } = props;
  const chatStore = userChatStore();
  const messageConpleted = chatStore.messageCompleted;
  const isUser = message.role === MessageRole.user;
  const date = message?.time
    ? dayjs(message.time).format("MM/DD HH:mm:ss")
    : "";
  const [copied, setCopied] = useState(false); // 添加状态变量 copied
  const [retry, setretry] = useState(false);
  const retryHandle = () => {
    chatStore.onRetry();
    setretry(true);
    setTimeout(() => {
      setretry(false);
    }, 2000);
  };
  const copyHandle = async () => {
    await copyToClipboard(message.content);
    setCopied(true); // 复制成功后设置 copied 为 true
    setTimeout(() => {
      setCopied(false); // 2秒后隐藏提示信息
    }, 2000);
  };
  const deleteHandle = async () => {
    chatStore.deleteMessage(message);
  };

  return (
    <div
      className={isUser ? styles["chat-message-user"] : styles["chat-message"]}
    >
      <div className={styles["chat-message-container"]}>
        <div
          className={
            isUser
              ? styles["chat-message-avatar-user"]
              : styles["chat-message-avatar-ai"]
          }
        >
          <Avatar src={message.avatar} size={35} />
          <div className={styles["chat-message-username"]}>
            {isUser ? "User" : "ChatAI"}
          </div>
          <div className={styles["date"]}>{date}</div>
        </div>
        <div className={styles["chat-message-item"]}>
          <Markdown
            content={message.content}
            fontSize={14}
            parentRef={parentRef}
            defaultShow={false}
            loading={message.content.length === 0 && !isUser}
            isUser={isUser} // 传递 isUser 属性
          />
        </div>
        <div className={styles["chat-message-header"]}>
          <div className={styles["chat-message-edit"]}>
            <Space>
              {!isUser && isLastMessage && messageConpleted && (
                <ChatAction
                  icon={<SyncOutlined />}
                  text="重试"
                  onClick={retryHandle}
                />
              )}
              <ChatAction
                icon={<CopyOutlined />}
                text="复制"
                onClick={copyHandle}
              />
              <ChatAction
                icon={<DeleteOutlined />}
                text="删除"
                onClick={deleteHandle}
              />
            </Space>
          </div>
        </div>
      </div>
      {copied && <div className={styles["copied-animation"]}>复制成功</div>}
      {retry && <div className={styles["copied-animation"]}>开始重试</div>}
    </div>
  );
}
