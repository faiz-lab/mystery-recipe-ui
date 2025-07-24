// MainPage.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";

import useInventory from "@/hooks/useInventory";

import Header from "@/components/Header";
import TopPageTabs from "@/components/TopPageTabs";
import RegisterPanel from "@/components/RegisterPanel";
import SelectPanel from "@/components/SelectPanel";
import ToastMessage from "@/components/ToastMessage";

export default function MainPage() {
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const params = new URLSearchParams(window.location.search);
  const userId = params.get("user_id") || import.meta.env.VITE_DEFAULT_USER_ID;
  const [page, setPage] = useState("register");
  const refs = useRef({});
  const [itemStates, setItemStates] = useState({});
  const [resetKey, setResetKey] = useState(0);

  const { inventory, fetchInventory, sendRecommendation } =
    useInventory(userId);

  const [useMap, setUseMap] = useState({});
  const [cookingTime, setCookingTime] = useState(5);
  const [toast, setToast] = useState("");

  const scrollableRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    if (page !== "select" || !userId) return;
    (async () => {
      try {
        await fetchInventory();
        setUseMap({});
      } catch {
        showToast("在庫の取得に失敗しました");
      }
    })();
  }, [page, userId, fetchInventory]);

  const canRegister = useMemo(() => {
    return Object.entries(itemStates).some(([_, st]) => {
      if (st?.count) return Number(st.count) > 0;
      return !!st?.checked;
    });
  }, [itemStates]);

  const canCook = useMemo(() => Object.values(useMap).some(Boolean), [useMap]);

  const handleCook = async () => {
    if (!canCook) return;

    const required = inventory
        .filter((it) => useMap[it.name])
        .map((it) => ({
          name: it.name,
          amount: it.quantity
        }));

    try {
      await sendRecommendation({
        max_cooking_time: cookingTime,
        required_ingredients: required,
        available_ingredients: inventory,
      });
      // ✅ 新增：通知 LINE Bot 推送 "登録完了"
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/line/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, message: "登録完了" })
      });

      // ✅ LINE 聊天页面跳转
      window.location.replace("line://nv/chat");
    } catch {
      showToast("送信に失敗しました");
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#FAFAFA] relative">
      <Header />
      <main className="flex-1 flex flex-col items-center py-6 px-2">
        <div className="max-w-2xl w-full space-y-6">
          <TopPageTabs active={page} setActive={setPage} />
          {page === "register" && (
            <RegisterPanel
                userId={userId}
              itemStates={itemStates}
              setItemStates={setItemStates}
              resetKey={resetKey}
              refs={refs}
              scrollableRef={scrollableRef}
              canRegister={canRegister}
            />
          )}

          {page === "select" && (
            <SelectPanel
              inventory={inventory}
              useMap={useMap}
              setUseMap={setUseMap}
              cookingTime={cookingTime}
              setCookingTime={setCookingTime}
              isInfoVisible={isInfoVisible}
              setIsInfoVisible={setIsInfoVisible}
              canCook={canCook}
              onSubmit={handleCook}
              userId={userId}
              fetchInventory={fetchInventory} // ✅ 刷新库存方法
            />
          )}
        </div>
      </main>
      <ToastMessage text={toast} show={!!toast} />
    </div>
  );
}
