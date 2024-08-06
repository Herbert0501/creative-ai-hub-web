import React, { useEffect, useState, ReactElement } from "react";
import Image from "next/image";
import style from "./profile.module.scss";
import { queryProfile } from "@/apis";
import { useAccessStore } from "@/app/store/access";
import {
  CreditCardTwoTone,
  DollarTwoTone,
  DatabaseTwoTone,
  CheckCircleTwoTone,
  TagsTwoTone,
  ContactsTwoTone,
} from "@ant-design/icons";
import { SaleProductEnum } from "@/types/sale_product";
import Loader from "@/app/components/loader/loader";

interface ProfileCardProps {
  icon: ReactElement;
  title: string;
  value: string | number;
  color: string;
  onClick?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  icon,
  title,
  value,
  color,
  onClick,
}) => (
  <div
    className={`${style.card} ${title === "UUID" ? style.uuidCard : ""}`}
    onClick={onClick}
  >
    {React.cloneElement(icon, { twoToneColor: color, className: style.icon })}
    <div className={style.cardTitle}>{title}</div>
    {title !== "UUID" && <div className={style.cardValue}>{value}</div>}
    {title === "UUID" && (
      <>
        <div className={style.uuidValue}>{value}</div>
        <div className={style.clickToCopy}>(点击复制)</div>
      </>
    )}
  </div>
);

interface UserProfile {
  openid: string;
  totalQuota: number;
  surplusQuota: number;
  modelTypes: string;
  status: number;
  isWhitelist: number;
  avatar: string; // 如果没有头像字段，可以去掉这个字段
}

export function Profile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const res = await queryProfile();
      const { data, code } = await res.json();
      if (code === SaleProductEnum.NeedLogin) {
        useAccessStore.getState().goToLogin();
      }
      setUserProfile({
        openid: data.openid,
        totalQuota: data.totalQuota,
        surplusQuota: data.surplusQuota,
        modelTypes: data.modelTypes,
        status: data.status,
        isWhitelist: data.isWhitelist,
        avatar: "/role/user.png",
      });
    };

    fetchUserProfile();
  }, []);

  const handleCopy = () => {
    if (userProfile) {
      navigator.clipboard.writeText(userProfile.openid).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (!userProfile) {
    return <Loader />;
  }

  const statusText = userProfile.status === 0 ? "正常" : "冻结";
  const isWhitelistText = userProfile.isWhitelist === 1 ? "是" : "否";
  const modelTypes = userProfile.modelTypes
    .split(",")
    .map((type) => type.toUpperCase())
    .join(", ");

  return (
    <div className={style.dashboard}>
      {copied && <div className={style.copyMessage}>复制成功!</div>}
      <div className={style.profileHeader}>
        <Image
          src={userProfile.avatar}
          alt="头像"
          width={100}
          height={100}
          className={style.avatar}
        />
        <h1 className={style.title}>个人信息</h1>
      </div>
      <ProfileCard
        icon={<ContactsTwoTone />}
        title="UUID"
        value={userProfile.openid}
        color="#1890ff"
        onClick={handleCopy}
      />
      <div className={style.row}>
        <ProfileCard
          icon={<CreditCardTwoTone />}
          title="总额度"
          value={userProfile.totalQuota}
          color="#52c41a"
        />
        <ProfileCard
          icon={<DollarTwoTone />}
          title="剩余额度"
          value={userProfile.surplusQuota}
          color="#52c41a"
        />
      </div>
      <div className={style.row}>
        <ProfileCard
          icon={<DatabaseTwoTone />}
          title="可用模型"
          value={modelTypes}
          color="#1890ff"
        />
      </div>
      <div className={style.row}>
        <ProfileCard
          icon={<CheckCircleTwoTone />}
          title="账户状态"
          value={statusText}
          color="#ff4d4f"
        />
        <ProfileCard
          icon={<TagsTwoTone />}
          title="SVIP"
          value={isWhitelistText}
          color="#52c41a"
        />
      </div>
    </div>
  );
}
