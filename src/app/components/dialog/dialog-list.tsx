import styles from "./dialog-list.module.scss";
import AddIcon from "@/app/static/icons/add.svg";
import { DialogListItem } from "@/app/components/dialog/dialog-list-item";
import { DialogType } from "@/types/chat";
import { DialogResizeableSidebar } from "@/app/components/dialog/dialog-resizable-sidebar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * 对话框列表
 */
export function DialogList() {
  const [dialogs, setDialogs] = useState<DialogType[]>([]);
  const [selected, setSelected] = useState<DialogType | null>(null);
  const navigate = useNavigate();

  const createDialog = (type: number): DialogType => {
    const dialogData = [
      {
        avatar: "/role/bugstack.png",
        subTitle: "有什么可以帮你的吗？",
        title: "直接对话",
      },
      {
        avatar: "/role/interview.png",
        subTitle: "请回答一下Java的基础类型有哪些？",
        title: "面试官",
      },
      {
        avatar: "/role/psychological.png",
        subTitle: "吹灭别人的灯，不能照亮自己",
        title: "心里咨询",
      }
    ];

    const data = dialogData[type];
    return {
      ...data,
      dialogId: Math.floor(Math.random() * 900) + 100,
      read: true,
      timestamp: Date.now(),
      count: Math.floor(Math.random() * 90),
    };
  };

  const handleAddClick = () => {
    const idx = Math.floor(Math.random() * 3);
    const newDialog = createDialog(idx);

    setDialogs((prevDialogs) => [newDialog, ...prevDialogs]);
    setSelected(newDialog);
  };

  return (
    <DialogResizeableSidebar>
      {/*头部操作*/}
      <div className={styles["dialog-head"]}>
        <div className={styles["dialog-search-box"]}>
          <input type="text" placeholder="搜索" />
          <div className={styles["dialog-search-add"]} onClick={handleAddClick}>
            <AddIcon />
          </div>
        </div>
      </div>
      {/*对话列表*/}
      <div className={styles["dialog-list"]}>
        {dialogs.map((dialog) => (
          <DialogListItem
            key={dialog.dialogId}
            dialog={dialog}
            selected={selected?.dialogId === dialog.dialogId}
            onClick={() => {
              // 点击时跳转到对应的界面，并传递必要参数信息
              navigate(`/chat/${dialog.dialogId}`, {
                state: { title: dialog.title },
              });
              setSelected(dialog);
            }}
          />
        ))}
      </div>
    </DialogResizeableSidebar>
  );
}
