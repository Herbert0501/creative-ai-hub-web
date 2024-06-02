import { Button, Input } from "antd";
import Image from "next/image";

import styles from "./auth.module.scss";

import { useNavigate } from "react-router-dom";
import { useAccessStore } from "@/app/store/access";

import ChatAIIcon from "@/app/static/icons/chatgpt.svg";
import MyQrCode from "@/app/static/image/qrcode.png";

export function Auth() {
  const navigate = useNavigate();
  const access = useAccessStore();
  return (
    <div className={styles["auth-page"]}>
      <ChatAIIcon className={styles["auth-logo"]}/>
      <div className={styles["auth-title"]}>Creative AI Hub 🚀</div>
      <div className={styles["auth-sub-title"]}>
        学习AI开发、掌握AI部署、运用AI提效 💡
      </div>
      <Image src={MyQrCode} width={250} alt="QR Code" />
      <div className={styles["auth-tips"]}>
        扫码关注公众号【哈利Coding】📱，
        <a href={MyQrCode.src} target="_blank">
          回复【验证码】获取访问密码 🔐
        </a>
      </div>

      <Input
        className={styles["auth-input"]}
        type="password"
        placeholder="在此处填写访问码 🔑"
        value={access.accessCode}
        onChange={(e) => {
          access.updateCode(e.currentTarget.value);
        }}
        status={access.accessCodeErrorMsgs ? "error" : ""}
      />
      {access.accessCodeErrorMsgs ? (
        <span className={styles["auth-error"]}>
          {access.accessCodeErrorMsgs} ❌
        </span>
      ) : null}

      <div className={styles["auth-actions"]}>
        <Button type="primary" onClick={() => access.login()}>
          确认登录 ✅
        </Button>
        <Button type="text">稍后再说 ⏰</Button>
      </div>
      <span>
        说明：此平台主要以学习OpenAI为主，请合理、合法、合规的使用相关资料！📘
      </span>
    </div>
  );
}
