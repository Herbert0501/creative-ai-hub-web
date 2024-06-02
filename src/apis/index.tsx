import { AIVersion } from "@/app/constants";
import { useAccessStore } from "@/app/store/access";
import { MessageRole } from "@/types/chat";

const host = "http://localhost:8090";

export const getRoleList = () => {
  // 从本地 json 文件获取
  return fetch(`/prompts.json`).then((res) => res.json());
};

export const completions = (data: {
  messages: { content: string; role: MessageRole }[];
  model: AIVersion;
}) => {
  return fetch("http://localhost:8090/api/v1/chat/completions", {
    method: "post",
    headers: {
      Authorization: "b8b6",
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(data),
  });
};

/**
 * 登录鉴权
 * @param token
 */
export const login = (token: string) => {
  const accessState = useAccessStore.getState();
  return fetch(`${host}/api/v1/auth/login`, {
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `code=${accessState.accessCode}`,
  });
};
