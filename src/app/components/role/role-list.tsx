import React, { useContext, useEffect } from "react";
import styles from "./role-list.module.scss";
import { useNavigate } from "react-router-dom";
import { DialogResizeableSidebar } from "@/app/components/dialog/dialog-resizable-sidebar";
import { Avatar, Spin } from "antd";
import { DialogHead } from "@/app/components/dialog/dialog-head";
import { useDialog } from '@/context/DialogContext'; // 引入 useDialog
import { Role } from "@/types/role";

export interface RoleContextType {
  roles: Role[];
  selected: number;
  setSelected: (id: number) => void;
}

export const RoleContext = React.createContext<RoleContextType>({
  roles: [],
  selected: -1,
  setSelected: (id: number) => {},
});

export function RoleList() {
  const navigate = useNavigate();
  const { roles, selected, setSelected } = useContext(RoleContext);
  const { isDialogOpen } = useDialog(); // 使用 useDialog

  useEffect(() => {
    // 默认选中第一个角色
    if (roles.length > 0 && selected === -1) {
      setSelected(roles[0].id);
      navigate(`/role/${roles[0].id}`);
    }
  }, [roles, selected, setSelected, navigate]);

  useEffect(() => {
    // 如果对话框关闭，重新设置为默认选中第一个角色
    if (!isDialogOpen) {
      setSelected(-1);
    }
  }, [isDialogOpen, setSelected]);

  // if (!isDialogOpen) {
  //   return (
  //     <div style={{ display: "none", margin: 0, padding: 0 }}> {/* 设置 display: none */}
  //       {/* 这里可以放置一些占位内容或者空元素 */}
  //     </div>
  //   );
  // }

  return (
    <div className={styles["role-list-container"]} style={{ display: isDialogOpen ? 'flex' : 'none' }}>
      <DialogResizeableSidebar>
        {/*头部操作*/}
        <DialogHead />
        {/*角色列表*/}
        <div className={styles["role-list"]}>
          {!roles ? (
            <Spin spinning style={{ margin: "24px auto", width: "100%" }} />
          ) : null}

          {roles?.map((role) => (
            <div
              className={`${styles["role-item"]} ${
                selected === role.id ? styles["selected"] : ""
              }`}
              key={role.id}
              onClick={() => {
                setSelected(role.id);
                navigate(`/role/${role.id}`);
              }}
            >
              <Avatar shape="square" size={38} src={role.avatar} />
              <div className={styles["name"]}>{role.role_name}</div>
            </div>
          ))}
        </div>
      </DialogResizeableSidebar>
    </div>
  );
}
