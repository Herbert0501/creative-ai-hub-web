import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";

import {
  Dialog,
  Message,
  MessageDirection,
  MessageRole,
  MessageType,
  SessionConfig,
} from "@/types/chat";
import { AIVersion } from "@/app/constants";
import { completions } from "@/apis";
import { useAccessStore } from "./access";

// 常量提取
const DEFAULT_AVATAR = "/role/chatgpt.png";
const DEFAULT_TITLE = "新的对话";
const DEFAULT_SUBTITLE = "请问有什么需要帮助的吗？";

// 类型定义
interface ChatStore {
  id: number;
  sessions: ChatSession[];
  currentSessionIndex: number;
  openSession: (dialog?: { avatar?: string; title?: string }) => ChatSession;
  selectSession: (index: number) => void;
  deleteSession: (index: number) => void;
  currentSession: () => ChatSession;
  onSendMessage: (newMessage: Message) => Promise<void>;
  updateCurrentSession: (updater: (session: ChatSession) => void) => void;
  onRetry: () => void;
  deleteMessage: (message: Message) => void;
  createNewMessage: (value: string) => Message;
  messageCompleted: boolean;
  messageCompletedOutput: () => void;
  interrupt: boolean;
  interruptOutput: () => void;
  resetState: () => void;
}

export interface ChatSession {
  id: number;
  dialog: Dialog;
  messages: Message[];
  config: SessionConfig;
  clearContextIndex?: number;
}

// 创建新的会话
function createChatSession(dialog?: {
  avatar?: string;
  title?: string;
}): ChatSession {
  return {
    id: 0,
    dialog: {
      avatar: dialog?.avatar || DEFAULT_AVATAR,
      title: dialog?.title || DEFAULT_TITLE,
      count: 0,
      subTitle: DEFAULT_SUBTITLE,
      timestamp: new Date().getTime(),
    },
    messages: [
      {
        avatar: dialog?.avatar || DEFAULT_AVATAR,
        content: DEFAULT_SUBTITLE,
        message_type: MessageType.Text,
        time: Date.now(),
        direction: MessageDirection.Receive,
        role: MessageRole.system,
        id: nanoid(),
      },
    ],
    clearContextIndex: undefined,
    config: {
      aiVersion: AIVersion.GLM_4_FLASH,
    },
  };
}

// 格式化消息
function formatMessages(messages: Message[]): Message[] {
  const latestMessages = messages.length > 5 ? messages.slice(-5) : messages;
  return latestMessages.map((message) => ({
    ...message,
    content: message.content,
    role: message.role,
  }));
}

// 创建新消息
export function createNewMessage(value: string, role?: MessageRole) {
  return {
    avatar: role !== MessageRole.user ? DEFAULT_AVATAR : "/role/user.png",
    content: value,
    time: Date.now(),
    role: role || MessageRole.user,
    id: nanoid(),
    streaming: false,
  } as Message;
}

// 处理发送消息的通用函数
async function handleSendMessage(
  messages: Message[],
  model: AIVersion,
  botMessage: Message,
  set: any,
  get: any
) {
  try {
    set({ messageCompleted: false });

    const { body } = await completions({
      messages,
      model,
    });

    const reader = body!.getReader();
    const decoder = new TextDecoder();

    new ReadableStream({
      async start(controller) {
        async function push() {
          const { done, value } = await reader.read();
          if (done || get().interrupt) {
            controller.close();
            set({ messageCompleted: true, interrupt: false });
            return;
          }

          controller.enqueue(value);
          const text = decoder.decode(value);

          if (text === "0003") {
            controller.close();
            useAccessStore.getState().goToLogin();
          }

          botMessage.content += text;
          get().updateCurrentSession((session: ChatSession) => {
            session.messages = session.messages.concat();
          });

          await push();
        }

        await push();
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    set({ messageCompleted: true, interrupt: false });
  }
}

export const userChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      id: 0,
      sessions: [createChatSession()],
      currentSessionIndex: 0,
      messageCompleted: true,
      interrupt: false,

      messageCompletedOutput() {
        set({ messageCompleted: true });
      },

      interruptOutput() {
        set({ interrupt: true });
      },

      resetState() {
        set({
          messageCompleted: true,
          interrupt: false,
        });
      },

      openSession(dialog?: { avatar?: string; title?: string }) {
        const session = createChatSession(dialog);
        set(() => ({ id: get().id + 1 }));
        session.id = get().id;
        session.dialog.title =
          (dialog?.title || DEFAULT_TITLE) + `${session.id}`;

        set((state) => ({
          currentSessionIndex: 0,
          sessions: [session].concat(state.sessions),
        }));

        return session;
      },

      selectSession(index: number) {
        set({
          currentSessionIndex: index,
        });
      },

      deleteSession(index: number) {
        const count = get().sessions.length;
        const deleteSession = get().sessions.at(index);

        if (!deleteSession) return;

        const sessions = get().sessions.slice();
        sessions.splice(index, 1);

        const currentIndex = get().currentSessionIndex;
        let nextIndex = Math.min(
          currentIndex - Number(index < currentIndex),
          sessions.length - 1
        );

        if (count === 1) {
          nextIndex = 0;
          sessions.push(createChatSession());
        }

        set(() => ({
          currentSessionIndex: nextIndex,
          sessions,
          messageCompleted: true,
          interrupt: false,
        }));
      },

      currentSession() {
        let index = get().currentSessionIndex;
        const sessions = get().sessions;
        if (index < 0 || index >= sessions.length) {
          index = Math.min(sessions.length - 1, Math.max(0, index));
          set(() => ({ currentSessionIndex: index }));
        }
        return sessions[index];
      },

      async onSendMessage(newMessage: Message) {
        const session = get().currentSession();

        get().updateCurrentSession((session: ChatSession) => {
          session.messages = session.messages.concat(newMessage);
        });

        const activeMessages = session.messages?.slice(
          session.clearContextIndex || 0
        );
        const messages = formatMessages(activeMessages);

        const botMessage: Message = createNewMessage("", MessageRole.system);
        get().updateCurrentSession((session: ChatSession) => {
          session.messages = session.messages.concat(botMessage);
        });

        await handleSendMessage(
          messages,
          session.config.aiVersion,
          botMessage,
          set,
          get
        );
      },

      updateCurrentSession(updater: (session: ChatSession) => void) {
        const sessions = get().sessions;
        const index = get().currentSessionIndex;
        updater(sessions[index]);
        set(() => ({ sessions }));
      },

      onRetry: async () => {
        const session = get().currentSession();
        const lastMessageIndex = session.messages.length - 1;
        const lastMessage = session.messages[lastMessageIndex];

        const activeMessages = session.messages?.slice(
          session.clearContextIndex || 0,
          lastMessageIndex
        );

        if (activeMessages.length === 0) {
          alert("消息为空不能重试！");
          return;
        }

        const messages = formatMessages(activeMessages);

        get().deleteMessage(lastMessage);

        const botMessage: Message = createNewMessage("", MessageRole.system);
        get().updateCurrentSession((session: ChatSession) => {
          session.messages = session.messages.concat(botMessage);
        });

        await handleSendMessage(
          messages,
          session.config.aiVersion,
          botMessage,
          set,
          get
        );
      },

      deleteMessage(message: Message) {
        get().updateCurrentSession((session: ChatSession) => {
          const index = session.messages.findIndex((m) => m.id === message.id);
          session.messages.splice(index, 1);
        });
        set({ messageCompleted: true, interrupt: false });
      },

      createNewMessage(value: string, role?: MessageRole) {
        return {
          avatar: "/role/user.png",
          content: value,
          time: Date.now(),
          role: MessageRole.user,
          id: nanoid(),
        } as Message;
      },
    }),
    {
      name: "chat-store",
    }
  )
);
