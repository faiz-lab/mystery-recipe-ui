// MainPage.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";

import useInventory from "@/hooks/useInventory";

import Header from "@/components/Header";
import TopPageTabs from "@/components/TopPageTabs";
import RegisterPanel from "@/components/RegisterPanel";
import SelectPanel from "@/components/SelectPanel";
import ToastMessage from "@/components/ToastMessage";
import { Button } from "@/components/ui/button";

import { INGREDIENTS } from "@/data/ingredients";

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
  const userId = params.get("user_id");

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

  const handleSubmit = async () => {
    if (page === "register") {
      if (!canRegister || !userId) return;
      const payload = {
        user_id: userId,
        items: [],
      };
      Object.entries(itemStates).forEach(([name, st]) => {
        const ing = ING_MAP[name];
        if (!ing) return;
        if (ing.units?.length) {
          const amount = Number(st?.count || 0);
          if (amount > 0) {
            payload.items.push({
              name,
              quantity,
              unit: (st.unit || ing.standard_unit).trim(),
            });
          }
        } else if (st?.checked) {
          payload.items.push({ name, unit: "arb" });
        }
      });
      try {
        await registerInventory(payload);
        showToast("登録しました！\n次に「食材を選択」のタブから\n料理に使う食材を選んでね");
      } catch {
        showToast("登録に失敗しました");
      } finally {
        setItemStates({});
        setResetKey((k) => k + 1);
      }
      return;
    }

    if (!canCook || !userId) return;

    const required = inventory.filter((it) => useMap[it.name]);
    const available = inventory.filter((it) => !useMap[it.name]);

    try {
      await sendRecommendation({
        user_id: userId,
        time: cookingTime,
        required_ingredients: required,
        available_ingredients: available,
      });
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
              categories={CATEGORIES}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              itemStates={itemStates}
              setItemStates={setItemStates}
              resetKey={resetKey}
              refs={refs}
              scrollableRef={scrollableRef}
              onSearchResult={handleSearchResult}
              onSubmit={handleSubmit}
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
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </main>
      <ToastMessage text={toast} show={!!toast} />
    </div>
  );
}
