import styles from "./sidebar.module.scss";

import React from "react";

function ChatAiIcon() {
  return <img src={ChatAiIcon} alt="Chat AI Icon" />;
}

function ChatIcon() {
  return <img src={ChatIcon} alt="Chat Icon" />;
}

function RoleIcon() {
  return <img src={RoleIcon} alt="Role Icon" />;
}


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
