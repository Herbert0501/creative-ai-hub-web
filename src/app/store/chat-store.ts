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
  interrupt: boolean;
  interruptOutput: () => void;
}

export interface ChatSession {
  // 会话ID
  id: number;
  // 对话框体
  dialog: Dialog;
  // 对话消息
  messages: Message[];
  // 会话配置
  config: SessionConfig;
  // 清除会话的索引
  clearContextIndex?: number;
}

function createChatSession(dialog?: {
  avatar?: string;
  title?: string;
}): ChatSession {
  return {
    id: 0,
    dialog: {
      avatar: dialog?.avatar || "/role/chatgpt.png",
      title: dialog?.title || "新的对话",
      count: 0,
      subTitle: "请问有什么需要帮助的吗？",
      timestamp: new Date().getTime(),
    },
    messages: [
      {
        avatar: dialog?.avatar || "/role/chatgpt.png",
        content: "请问有什么需要帮助的吗？",
        message_type: MessageType.Text,
        time: Date.now(),
        direction: MessageDirection.Receive,
        role: MessageRole.system,
        id: nanoid(),
      },
    ],
    clearContextIndex: undefined,
    config: {
      aiVersion: AIVersion.GLM_3_5_TURBO,
    },
  };
}

function formatMessages(messages: Message[]) {
  // 如果历史消息超过5，只取最新的5个
  const latestMessages = messages.length > 5 ? messages.slice(-5) : messages;
  return latestMessages.map(({ content, role }) => ({
    content,
    role,
  }));
}

export function createNewMessage(value: string, role?: MessageRole) {
  return {
    avatar: role !== MessageRole.user ? "/role/chatgpt.png" : "/role/user.png",
    content: value,
    time: Date.now(),
    role: role || MessageRole.user,
    id: nanoid(),
    streaming: false,
  } as Message;
}

export const userChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // 属性赋值
      id: 0,
      sessions: [createChatSession()],
      currentSessionIndex: 0,
      messageCompleted: true,
      interrupt: false,

      // 显式中断方法的实现
      interruptOutput() {
        set({ interrupt: true });
      },
      // 开启会话
      openSession(dialog?: { avatar?: string; title?: string }) {
        const session = createChatSession(dialog);
        // 每开启一个会话，就对应设置一个对话ID
        set(() => ({ id: get().id + 1 }));
        session.id = get().id;
        session.dialog.title = (dialog?.title || "新的对话") + `${session.id}`;

        // 保存创建的会话，到 sessions 数组中
        set((state) => ({
          currentSessionIndex: 0,
          // 在数组头部插入数据
          sessions: [session].concat(state.sessions),
        }));

        return session;
      },

      // 选择会话
      selectSession(index: number) {
        set({
          currentSessionIndex: index,
        });
      },

      // 删除会话
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
        }));
      },

      // 当前会话
      currentSession() {
        let index = get().currentSessionIndex;
        const sessions = get().sessions;
        if (index < 0 || index >= sessions.length) {
          index = Math.min(sessions.length - 1, Math.max(0, index));
          set(() => ({ currentSessionIndex: index }));
        }
        return sessions[index];
      },

      // 发送消息
      async onSendMessage(newMessage: Message) {
        const session = get().currentSession();

        get().updateCurrentSession((session) => {
          session.messages = session.messages.concat(newMessage);
        });

        const activeMessages = session.messages?.slice(
          session.clearContextIndex || 0
        );
        const messages = formatMessages(activeMessages);

        const botMessage: Message = createNewMessage("", MessageRole.system);
        get().updateCurrentSession((session) => {
          session.messages = session.messages.concat(botMessage);
        });

        try {
          set({ messageCompleted: false });

          const { body } = await completions({
            messages,
            model: session.config.aiVersion,
          });

          const reader = body!.getReader();
          const decoder = new TextDecoder();

          await new ReadableStream({
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
                get().updateCurrentSession((session) => {
                  session.messages = session.messages.concat();
                });

                push();
              }

              await push();
            },
          });
        } catch (error) {
          set({ messageCompleted: true, interrupt: false });
          console.error("Error sending message:", error);
        }
      },

      // 更新当前会话
      updateCurrentSession(updater) {
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
        get().updateCurrentSession((session) => {
          session.messages = session.messages.concat(botMessage);
        });

        try {
          set({ messageCompleted: false });

          const { body } = await completions({
            messages,
            model: session.config.aiVersion,
          });

          const reader = body!.getReader();
          const decoder = new TextDecoder();

          await new ReadableStream({
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
                get().updateCurrentSession((session) => {
                  session.messages = session.messages.concat();
                });

                push();
              }

              await push();
            },
          });
        } catch (error) {
          set({ messageCompleted: true, interrupt: false });
          console.error("Error retrying message:", error);
        }
      },

      deleteMessage(message: Message) {
        get().updateCurrentSession((session) => {
          const index = session.messages.findIndex((m) => m.id === message.id);
          session.messages.splice(index, 1);
        });
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
