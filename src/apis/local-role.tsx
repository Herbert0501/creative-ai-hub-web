export const getRoleList = () => {
  // 从本地 json 文件获取
  return fetch(`/prompts.json`).then((res) => res.json());
};
