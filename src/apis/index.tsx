import { AIVersion } from "@/app/constants";
import { useAccessStore } from "@/app/store/access";
import { MessageRole } from "@/types/chat";

const host = "http://zn23m6.natappfree.cc";

export const getRoleList = () => {
  // 从本地 json 文件获取
  return fetch(`/prompts.json`).then((res) => res.json());
};

/**
 * Header 信息
 */
function getHeaders() {
  const accessState = useAccessStore.getState();

  const headers = {
    Authorization: accessState.token,
    "Content-Type": "application/json;charset=utf-8",
  };

  return headers;
}

/**
 * 流式应答接口
 * @param data
 */
export const completions = (data: {
  messages: { content: string; role: MessageRole }[];
  model: AIVersion;
}) => {
  return fetch(`${host}/api/v1/chatai/chat/completions`, {
    method: "post",
    headers: getHeaders(),
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
