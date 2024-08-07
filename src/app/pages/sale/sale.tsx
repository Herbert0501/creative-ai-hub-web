import styles from "./sale.module.scss";
import QRCode from "qrcode.react";
import { createPayOrder, queryProductList } from "@/apis";
import { useEffect, useState } from "react";
import { SaleProduct, SaleProductEnum } from "@/types/sale_product";
import { useAccessStore } from "@/app/store/access";
import { useNavigate } from "react-router-dom";
import WeChatPay from "@/app/static/icons/微信支付.svg";
import MyQrCode from "@/app/static/image/qrcode.png";
import Loader from "@/app/components/loader/loader";

export function Sale() {
  const [products, setProducts] = useState<SaleProduct[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [payUrl, setPayUrl] = useState("");
  const [loading, setLoading] = useState(true);

  // 编程式路由跳转
  const navigate = useNavigate();

  const handleButtonClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const queryProductListHandle = async () => {
    try {
      const res = await queryProductList();
      const { data, code } = await res.json();
      if (code === SaleProductEnum.NeedLogin) {
        useAccessStore.getState().goToLogin();
      }
      setLoading(false);
      setProducts(data);
    } catch (error) {
      console.error("Error fetching product list:", error);
    }
  };

  const payOrder = async (productId: number) => {
    try {
      const res = await createPayOrder(productId);
      const { data, code } = await res.json();
      if (code === SaleProductEnum.NeedLogin) {
        useAccessStore.getState().goToLogin();
      }
      if (code === SaleProductEnum.SUCCESS) {
        setPayUrl(data);
        handleButtonClick();
      }
    } catch (error) {
      console.error("Error creating pay order:", error);
    }
  };

  useEffect(() => {
    queryProductListHandle().then((r) => {});
  }, []);

  if (loading) {
    return <Loader />; // 使用 Loading 组件
  }

  return (
    <div className={styles["sale"]}>
      {products?.map((product) => (
        <div key={product.productId} className={styles["product"]}>
          <div className={styles["product-name"]}>{product.productName}</div>
          <div className={styles["product-token"]}>
            {product.quota}
            <span className={styles["product-token-subscript"]}>(条)</span>
          </div>
          <div className={styles["product-price"]}>
            <span style={{ color: "#af0000", fontSize: "20px" }}>
              ￥{product.price.toFixed(2)}
            </span>
          </div>
          <div
            className={styles["product-buy"]}
            onClick={() => payOrder(product.productId)}
          >
            立即购买
          </div>
          <div className={styles["product-desc"]}>
            <span>{product.productDesc}</span>
          </div>
        </div>
      ))}
      {showModal && (
        <div className={styles["product-pay"]}>
          <div className={styles["product-pay-weixin"]}>
            <WeChatPay />
            <p>微信支付</p>
          </div>
          <div className={styles["product-pay-url"]}>
            <QRCode value={payUrl} />
          </div>
          <div className={styles["product-pay-close"]}>
            <div onClick={handleCloseModal}>😁 支付完成，点击我关闭</div>
          </div>
          <div className={styles["product-pay-prompt"]}>
            <div>
              支付成功，自动充值。可直接点击→
              <span
                className={styles["product-pay-prompt-link"]}
                onClick={() => {
                  navigate(`/chat`);
                }}
              >
                对话
              </span>
            </div>
          </div>
          <footer className={styles["footer"]}>
            <div>
              温馨提示：一般实时到账。最多5分钟内到账！如果迟迟不到账，请在
              <a
                href={MyQrCode.src}
                target="_blank"
                style={{ color: "#2A9C49" }}
              >
                公众号联系管理员
              </a>
              ，管理员会在24小时内处理完成。感谢您的支持！
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
