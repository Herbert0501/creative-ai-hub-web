import { useEffect, useState } from "react";
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
  const [isWechatBrowser, setIsWechatBrowser] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false); // 按钮是否禁用
  const buttonCooldown = 3000; // 冷却时间，单位为毫秒（例如3秒）

  useEffect(() => {
    if (isWechat()) {
      setIsWechatBrowser(true);
    }
    const handleEnterPress = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        access.login();
      }
    };

    // 绑定按键事件
    window.addEventListener("keydown", handleEnterPress);

    // 清理函数，组件卸载时移除事件监听
    return () => {
      window.removeEventListener("keydown", handleEnterPress);
    };
  }, [access]);

  const handleLogin = () => {
    if (isButtonDisabled) return; // 如果按钮被禁用，不允许点击

    access.login();
    setIsButtonDisabled(true); // 点击后禁用按钮

    // 启动一个定时器，在冷却时间后重新启用按钮
    setTimeout(() => {
      setIsButtonDisabled(false);
    }, buttonCooldown);
  };

  const isWechat = () => {
    return /MicroMessenger/i.test(window.navigator.userAgent);
  };

  const openInBrowser = () => {
    const currentUrl = window.location.href;
    alert(
      `请复制以下链接，并在浏览器中打开。\n链接： ${currentUrl}\n或点击右上角↗，选择在🌍浏览器打开`
    );
    return;
  };

  const handleRedirect = () => {
    window.open("https://blog.kangyaocoding.top", "_blank");
  };

  return (
    <div className={styles["auth-page"]}>
      {isWechatBrowser && (
        <div className={styles["custom-alert"]}>
          <div className={styles["alert-content"]}>
            <h2>💡检测到微信浏览器</h2>
            <p>为了更好的体验，请在浏览器中打开本网站。</p>
            <Button type="primary" onClick={openInBrowser}>
              在浏览器中打开
            </Button>
          </div>
        </div>
      )}
      <div className={styles["auth-container"]}>
        <ChatAIIcon className={styles["auth-logo"]} />
        <div className={styles["auth-title"]}>Creative AI Hub 🚀</div>
        <div className={styles["auth-sub-title"]}>
          学习AI开发、掌握AI部署、运用AI提效 💡
        </div>
        <Image
          src={MyQrCode}
          width={250}
          alt="QR Code"
          className={styles["auth-qrcode"]}
        />
        <div className={styles["auth-tips"]}>
          扫码关注公众号【哈利Coding】📱，
          <a href={MyQrCode.src} target="_blank">
            回复【验证码】获取访问密码 🔐
          </a>
        </div>
        <Input
          className={styles["auth-input"]}
          type="text"
          placeholder="在此处填写验证码 🔑"
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
          <Button
            type="primary"
            onClick={handleLogin}
            disabled={isButtonDisabled} // 控制按钮是否禁用
          >
            {isButtonDisabled ? "请稍候..." : "确认登录 ✅"}
          </Button>
          <Button type="text" onClick={handleRedirect}>
            返回主页 ⏰
          </Button>
        </div>
        <div className={styles["auth-footer"]}>
          <span>
            说明：此平台主要以学习OpenAI为主，请合理、合法、合规的使用相关资料！📘
          </span>
        </div>
      </div>
    </div>
  );
}
