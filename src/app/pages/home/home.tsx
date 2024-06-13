"use client";

import styles from "./home.module.scss";
import { Sidebar } from "@/app/components/sidebar/sidebar";
import { DialogMessage } from "@/app/components/dialog/dialog-message";
import { useAppConfig } from "@/app/store/config";
import { RoleDetail } from "@/app/components/role/role-detail";
import { Path } from "@/app/constants";
import { useAccessStore } from "@/app/store/access";

import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import dynamic from "next/dynamic";

const Chat = dynamic(async () => (await import("../chat/chat")).Chat);
const Role = dynamic(async () => (await import("../role/role")).Role);
const Auth = dynamic(async () => (await import("../auth/auth")).Auth);
const Sale = dynamic(async () => (await import("../sale/sale")).Sale);

function Screen() {
  const config = useAppConfig();
  const access = useAccessStore();
  const location = useLocation();
  const isAuthPath = location.pathname === "/auth";
  const isAuthorized = access.isAuthorized();
  return (
    <div
      className={`${
        config.tightBorder ? styles["tight-container"] : styles.container
      }`}
    >
      {isAuthPath || !isAuthorized ? (
        <Auth />
      ) : (
        <>
          {/* 工具菜单 */}
          <Sidebar />

          {/* 路由地址 */}
          <div className={styles["window-content"]}>
            <Routes>
              <Route path={Path.Home} element={<Chat />} />
              <Route path={Path.Chat} element={<Chat />}>
                <Route path=":id" element={<DialogMessage />} />
              </Route>
              <Route path={Path.Role} element={<Role />}>
                <Route path=":id" element={<RoleDetail />} />
              </Route>
              <Route path={Path.Sale} element={<Sale/>}/>
            </Routes>
          </div>
        </>
      )}
    </div>
  );
}

export function Home() {
  return (
    <Router>
      <Screen />
    </Router>
  );
}
