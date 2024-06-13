import { AIVersion } from "@/app/constants";
import { useAccessStore } from "@/app/store/access";
import { MessageRole } from "@/types/chat";

const apiHostUrl = "http://localhost:8090";

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
  return fetch(`${apiHostUrl}/api/v1/chatai/chat/completions`, {
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
  return fetch(`${apiHostUrl}/api/v1/auth/login`, {
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `code=${accessState.accessCode}`,
  });
};

/**
 * 商品列表查询
 */
export const queryProductList = () => {
  return fetch(`${apiHostUrl}/api/v1/sale/query_product_list`, {
    method: "get",
    headers: getHeaders(),
  });
};

/**
 * 用户商品下单，获得支付地址 url
 */
export const createPayOrder = (productId: number) => {
  return fetch(`${apiHostUrl}/api/v1/sale/create_pay_order`, {
    method: "post",
    headers: {
      ...getHeaders(),
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    body: `productId=${productId}`,
  });
};
