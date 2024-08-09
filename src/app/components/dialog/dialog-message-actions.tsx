import { ClearOutlined } from "@ant-design/icons";
import styles from "@/app/components/dialog/dialog-message-action.module.scss";
import { Select } from "antd";
import { userChatStore } from "@/app/store/chat-store";
import { AIVersion } from "@/app/constants";
import { SessionConfig } from "@/types/chat";
import { CSSProperties, useRef, useState, useEffect, useCallback } from "react";

export function Action(props: {
  icon: JSX.Element;
  onClick?: () => void;
  styles?: CSSProperties;
}) {
  const { styles: sty } = props;
  return (
    <div className={styles["chat-input-action"]} onClick={props.onClick}>
      <div className={styles["icon"]}>{props.icon}</div>
    </div>
  );
}

export function ChatAction(props: {
  text?: string;
  icon: JSX.Element;
  onClick: () => void;
}) {
  const iconRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState({
    full: 16,
    icon: 16,
  });

  const updateWidth = useCallback(() => {
    if (!iconRef.current || !textRef.current) return;
    const getWidth = (dom: HTMLDivElement) => dom.getBoundingClientRect().width;
    const textWidth = getWidth(textRef.current);
    const iconWidth = getWidth(iconRef.current);
    setWidth({
      full: textWidth + iconWidth,
      icon: iconWidth,
    });
  }, []);

  useEffect(() => {
    updateWidth();
  }, [updateWidth]);

  return (
    <div
      className={styles["chat-input-action"]}
      onClick={() => {
        props.onClick();
        setTimeout(updateWidth, 1);
      }}
      onMouseEnter={updateWidth}
      onTouchStart={updateWidth}
      style={
        {
          "--icon-width": `${width.icon}px`,
          "--full-width": `${width.full}px`,
        } as CSSProperties
      }
    >
      <div ref={iconRef} className={styles["icon"]}>
        {props.icon}
      </div>
      {props.text && <div className={styles["tooltip"]}>{props.text}</div>}
    </div>
  );
}

export default function DialogMessagesActions(props: {
  config: SessionConfig;
}) {
  const chatStore = userChatStore();
  const { config } = props;
  return (
    <div className={styles["chat-input-action-wrapper"]}>
      <div className={styles["clear-outlined-button"]}>
        <ChatAction
          text="清除聊天"
          icon={<ClearOutlined />}
          onClick={() => {
            chatStore.updateCurrentSession((session) => {
              if (session.clearContextIndex === session.messages.length) {
                session.clearContextIndex = undefined;
              } else {
                session.clearContextIndex = session.messages.length;
              }
            });
          }}
        />
      </div>
      <div className={styles["select-container"]}>
        <Select
          value={config?.aiVersion ?? AIVersion.GPT_3_5_TURBO}
          style={{ width: 160 }}
          options={[
            { value: AIVersion.GLM_3_5_TURBO, label: AIVersion.GLM_3_5_TURBO },
            { value: AIVersion.GLM_4, label: AIVersion.GLM_4 },
            {
              value: AIVersion.GLM_4_AIR,
              label: AIVersion.GLM_4_AIR + "(推荐)",
            },
            { value: AIVersion.GPT_3_5_TURBO, label: AIVersion.GPT_3_5_TURBO },
            {
              value: AIVersion.GPT_3_5_TURBO_16K,
              label: AIVersion.GPT_3_5_TURBO_16K,
            },
            {
              value: AIVersion.GPT_4O_MINI,
              label: AIVersion.GPT_4O_MINI + "(推荐)",
            },
            { value: AIVersion.GPT_4O, label: AIVersion.GPT_4O },
            { value: AIVersion.GPT_4, label: AIVersion.GPT_4 },
            // { value: AIVersion.GLM_4V, label: AIVersion.GLM_4V },
            // { value: AIVersion.COGVIEW_3, label: AIVersion.COGVIEW_3 + "(图片生成)"},
            // { value: AIVersion.DALL_E_3, label: AIVersion.DALL_E_3 },
            // { value: AIVersion.WHISPER_1, label: AIVersion.WHISPER_1 },
          ]}
          onChange={(value) => {
            chatStore.updateCurrentSession((session) => {
              session.config = {
                ...session.config,
                aiVersion: value,
              };
            });
          }}
        />
      </div>
    </div>
  );
}
