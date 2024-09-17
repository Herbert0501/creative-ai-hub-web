import styles from "./sidebar.module.scss";

import ChatGPTIcon from "@/app/static/icons/chatgpt.svg";
import ChatIcon from "@/app/static/icons/chat.svg";
import RoleIcon from "@/app/static/icons/role.svg";
import MaxIcon from "@/app/static/icons/maximize.svg";
import MinIcon from "@/app/static/icons/minimize.svg";
import ExitIcon from "@/app/static/icons/exit.svg";
import ShopIcon from "@/app/static/icons/shop.svg";
import SidebarIcon from "@/app/static/icons/sidebar.svg";
import ProfileIcon from "@/app/static/icons/profile.svg";
import PublicIcon from "@/app/static/icons/public.svg";
import MyQrCode from "@/app/static/image/qrcode.png";

import { useNavigate } from "react-router-dom";
import { Path } from "@/app/constants";
import { IconButton } from "@/app/components/button/button";
import { useAppConfig } from "@/app/store/config";
import { useDialog } from "@/context/DialogContext";
import { useAccessStore } from "@/app/store/access";

export function Sidebar() {
  const navigate = useNavigate();
  const config = useAppConfig();
  const { toggleDialog } = useDialog(); // 使用 useDialog
  const access = useAccessStore();

  return (
    <div className={styles.sidebar}>
      <div className={styles["sidebar-header"]}>
        <ChatGPTIcon />
      </div>

      <div
        className={styles["sidebar-chat"]}
        onClick={() => {
          navigate(Path.Chat);
        }}
      >
        <ChatIcon />
      </div>

      <div
        className={styles["sidebar-role"]}
        onClick={() => {
          navigate(Path.Role);
        }}
      >
        <RoleIcon />
      </div>

      <div
        className={styles["sidebar-mall"]}
        onClick={() => {
          navigate(Path.Sale);
        }}
      >
        <ShopIcon />
      </div>

      <div
        className={styles["sidebar-profile"]}
        onClick={() => {
          navigate(Path.Profile);
        }}
      >
        <ProfileIcon />
      </div>

      <div className={styles["sidebar-public"]}>
        <a
          title="联系管理员"
          href={MyQrCode.src}
          target="_blank"
          rel="noopener noreferrer"
          className={styles["icon-link"]}
        >
          <PublicIcon />
        </a>
      </div>

      <div className={styles["action-button"]}>
        <IconButton
          icon={<ExitIcon />}
          onClick={() => {
            const confirmed = window.confirm("确定要退出登录吗？");
            if (confirmed) {
              access.goToLogin();
            }
          }}
        />
      </div>

      <div
        title="点击展开侧边栏"
        className={styles["sidebar-footer"]}
        onClick={toggleDialog}
      >
        <SidebarIcon />
      </div>
    </div>
  );
}
