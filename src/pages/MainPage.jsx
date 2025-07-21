// MainPage.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";

import useInventory from "@/hooks/useInventory";

import Header from "@/components/Header";
import TopPageTabs from "@/components/TopPageTabs";
import RegisterPanel from "@/components/RegisterPanel";
import SelectPanel from "@/components/SelectPanel";
import ToastMessage from "@/components/ToastMessage";

import { INGREDIENTS } from "@/data/ingredients";
import { patchInventory } from "@/services/api";

const CATEGORIES = INGREDIENTS.reduce((acc, ing) => {
  (acc[ing.category] ||= []).push(ing);
  return acc;
}, {});

const ING_MAP = Object.fromEntries(INGREDIENTS.map((ing) => [ing.name, ing]));

window.INGREDIENTS = INGREDIENTS;
window.ING_MAP = ING_MAP;

export default function MainPage() {
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const params = new URLSearchParams(window.location.search);
  const userId = params.get("user_id") || import.meta.env.VITE_DEFAULT_USER_ID;

  const [page, setPage] = useState("register");
  const firstCat = Object.keys(CATEGORIES)[0] || "";
  const [activeTab, setActiveTab] = useState(firstCat);
  const refs = useRef({});
  const [itemStates, setItemStates] = useState({});
  const [resetKey, setResetKey] = useState(0);

  const { inventory, fetchInventory, registerInventory, sendRecommendation } =
    useInventory(userId);
  const [useMap, setUseMap] = useState({});
  const [cookingTime, setCookingTime] = useState(5);
  const [toast, setToast] = useState("");

  const scrollableRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const scrollToIngredient = (name) => {
    const ing = ING_MAP[name];
    if (!ing) return;
    setActiveTab(ing.category);
    setTimeout(() => {
      const el = refs.current[ing.name];
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.classList.add("ring-2", "ring-orange-400");
      setTimeout(() => el?.classList.remove("ring-2", "ring-orange-400"), 1200);
    }, 40);
  };

  const handleSearchResult = ({ type, name }) => {
    scrollToIngredient(name);
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
    return Object.entries(itemStates).some(([name, st]) => {
      const ing = ING_MAP[name];
      if (!ing) return false;
      if (ing.units?.length) {
        return Number(st?.count) > 0;
      }
      return !!st?.checked;
    });
  }, [itemStates]);

  const canCook = useMemo(() => Object.values(useMap).some(Boolean), [useMap]);

  const handleUpdate = async () => {
    if (page === "register") {
      if (!canRegister) return;

      // 1. 组装 items 列表
      const items = Object.entries(itemStates)
        .filter(([_, st]) => st.count > 0 || st.checked)
        .map(([name, st]) => {
          const ing = ING_MAP[name];
          return ing.units?.length
            ? {
                name,
                quantity: Number(st.count),
                unit: st.unit || ing.standard_unit.trim(),
              }
            : { name, unit: "arb" };
        });

      // 2. 如果没有有效食材，直接返回
      if (items.length === 0) {
        showToast("食材を入力してください");
        return;
      }

      // 3. 调用库存注册 API
      try {
        await registerInventory(items); // ✅ 由 useInventory 处理 URL + lineId
        showToast(
          "登録しました！\n次に「食材を選択」のタブから\n料理に使う食材を選んでね"
        );
      } catch (error) {
        console.error("登録エラー:", error);
        showToast("登録に失敗しました");
      } finally {
        // 4. 重置状态
        setItemStates({});
        setResetKey((k) => k + 1);
      }
      return;
    }
  };

  const handleCook = async () => {
    if (!canCook) return;

    // ✅ 用户勾选的必用食材
    const required = inventory.filter((it) => useMap[it.name]);
    const available = inventory; // 当前用户的全部库存

    try {
      const payload = {
        max_cooking_time: cookingTime, // 最大調理時間（分）
        required_ingredients: required.map((it) => it.name), // 后端目前只接收 name
        available_ingredients: available.map((it) => ({
          name: it.name,
          quantity: it.quantity || 0,
          unit: it.unit || "",
        })),
      };

      console.log("🔍 Sending recommendation request:", payload);

      await sendRecommendation(payload);

      // ✅ LINE に戻る
      window.location.replace("line://nv/chat");
    } catch (error) {
      console.error("送信エラー:", error);
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
              categories={CATEGORIES}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              itemStates={itemStates}
              setItemStates={setItemStates}
              resetKey={resetKey}
              refs={refs}
              scrollableRef={scrollableRef}
              onSearchResult={handleSearchResult}
              onSubmit={handleUpdate}
              canRegister={canRegister}
              userId={userId}
              patchInventory={patchInventory}
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
            />
          )}
        </div>
      </main>
      <ToastMessage text={toast} show={!!toast} />
    </div>
  );
}
