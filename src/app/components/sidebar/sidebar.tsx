import styles from "./sidebar.module.scss";

import ChatGPTIcon from "@/app/static/icons/chatgpt.svg";
import ChatIcon from "@/app/static/icons/chat.svg";
import RoleIcon from "@/app/static/icons/role.svg";
import MaxIcon from "@/app/static/icons/maximize.svg";
import MinIcon from "@/app/static/icons/minimize.svg";
import ExitIcon from "@/app/static/icons/exit.svg";

import { useNavigate } from "react-router-dom";
import { Path } from "@/app/constants";
import { IconButton } from "@/app/components/button/button";
import { useAppConfig } from "@/app/store/config";

export function Sidebar() {
  const navigate = useNavigate();
  const config = useAppConfig();

  return (
    <div className={styles.sidebar}>
      <div className={styles["action-button"]}>
        <IconButton
          icon={<ExitIcon />}
          backgroundColor={"#ff4e4e"}
          onClick={() => {
            alert("尚未实现");
          }}
        />
        <IconButton
          icon={<MinIcon />}
          backgroundColor={"#f3c910"}
          onClick={() => {
            config.update((config) => (config.tightBorder = false));
          }}
        />
        <IconButton
          icon={<MaxIcon />}
          backgroundColor={"#04c204"}
          onClick={() => {
            config.update((config) => (config.tightBorder = true));
          }}
        />
      </div>

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
    </div>
  );
}
