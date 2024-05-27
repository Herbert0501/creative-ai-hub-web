import styles from "./sidebar.module.scss";

import React from "react";

import ChatAiIcon from "./static/icons/chatgpt.svg";
import ChatIcon from "./static/icons/chat.svg";
import RoleIcon from "./static/icons/role.svg";

import { useNavigate } from "react-router-dom";
import { Path } from "@/app/constants";

export function Sidebar() {
  const navigate = useNavigate();
  return (
    <div className={styles.sidebar}>
      <div className={styles["sidebar-header"]}>
        <ChatAiIcon />
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
