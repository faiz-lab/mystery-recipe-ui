import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import Header from "@/components/Header";
import TopPageTabs from "@/components/TopPageTabs";
import QuantityInput from "@/components/QuantityInput";
import InventoryRow from "@/components/InventoryRow";
import CookingTimePicker from "@/components/CookingTimePicker";
import SearchBar from "@/components/SearchBar";
import BackToTopButton from "@/components/BackToTopButton";
import ToastMessage from "@/components/ToastMessage";
import { Button } from "@/components/ui/button";
import { INGREDIENTS } from "@/data/ingredients";

const CATEGORIES = INGREDIENTS.reduce((acc, ing) => {
  (acc[ing.category] ||= []).push(ing);
  return acc;
}, {});

const ING_MAP = Object.fromEntries(INGREDIENTS.map((ing) => [ing.name, ing]));

export default function MainPage() {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get("user_id");

  const [page, setPage] = useState("register");

  const firstCat = Object.keys(CATEGORIES)[0] || "";
  const [activeTab, setActiveTab] = useState(firstCat);
  const refs = useRef({});
  const [itemStates, setItemStates] = useState({});
  const [resetKey, setResetKey] = useState(0);

  const [inventory, setInventory] = useState([]);
  const [useMap, setUseMap] = useState({});
  const [cookingTime, setCookingTime] = useState(5);

  const [toast, setToast] = useState("");
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const handleSearch = async (kw) => {
    if (!kw) return;
    let hit = INGREDIENTS.find((ing) => ing.name.includes(kw));
    if (!hit) {
      try {
        const res = await axios.post("/api/suggest", {
          keyword: kw,
          ingredients: INGREDIENTS.map((i) => i.name),
        });
        const suggestion = INGREDIENTS.find(i => res.data.suggestions.includes(i.name));
        if (suggestion) {
          showToast(`一致する項目が見つかりませんでした。もしかして: ${suggestion.name}`);
          setActiveTab(suggestion.category);
          setTimeout(() => {
            const el = refs.current[suggestion.name];
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
            el?.classList.add("ring-2", "ring-orange-400");
            setTimeout(() => el?.classList.remove("ring-2", "ring-orange-400"), 1200);
          }, 40);
        } else {
          showToast("一致する食材が見つかりませんでした");
        }
      } catch (err) {
        showToast("類似候補の取得に失敗しました");
      }
      return;
    }
    setActiveTab(hit.category);
    setTimeout(() => {
      const el = refs.current[hit.name];
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.classList.add("ring-2", "ring-orange-400");
      setTimeout(() => el?.classList.remove("ring-2", "ring-orange-400"), 1200);
    }, 40);
  };

  useEffect(() => {
    if (page !== "select" || !userId) return;
    (async () => {
      try {
        const { data } = await axios.get(`/ingredients?user_id=${encodeURIComponent(userId)}`);
        setInventory(data.filter((d) => d.amount > 0));
        setUseMap({});
      } catch {
        showToast("在庫の取得に失敗しました");
      }
    })();
  }, [page, userId]);

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
              amount,
              unit: (st.unit || ing.standard_unit).trim(),
            });
          }
        } else if (st?.checked) {
          payload.items.push({ name, unit: "arb" });
        }
      });

      try {
        await axios.post("/registration_submit", payload);
        showToast("登録しました！");
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
      await axios.post("/selection_submit", {
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
    <div className="flex flex-col min-h-[100dvh] bg-[#FAFAFA]">
      <Header />
      <main className="flex-1 flex flex-col items-center py-6 px-2">
        <div className="max-w-2xl w-full space-y-6">
          <TopPageTabs active={page} setActive={setPage} />

          {page === "register" && (
            <>
              <div className="text-center">
                <Button
                  disabled={!canRegister}
                  onClick={handleSubmit}
                  className={`rounded-full px-8 py-2 font-bold mb-2 transition
                    ${canRegister ? "bg-gradient-to-r from-[#FF8855] to-[#FF7043] text-white hover:scale-105" : "bg-gray-300 text-white cursor-not-allowed"}`}
                >
                  登録する
                </Button>
              </div>

              <SearchBar onSearch={handleSearch} />

              <div className="flex gap-2 overflow-x-auto pb-2">
                {Object.keys(CATEGORIES).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`whitespace-nowrap rounded-full px-4 py-1 text-sm transition
                      ${activeTab === cat ? "bg-[#FF7043] text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-md space-y-4 max-h-[60vh] overflow-y-auto">
                {(CATEGORIES[activeTab] || []).map((ing) => (
                  <div
                    key={`${ing.name}-${resetKey}`}
                    ref={(el) => (refs.current[ing.name] = el)}
                    className="flex items-center justify-between border-b last:border-none pb-2 gap-4"
                  >
                    <span className="flex-1">{ing.name}</span>

                    {ing.units?.length ? (
                      <div className="flex items-center gap-2">
                        <QuantityInput
                          value={itemStates[ing.name]?.count || 0}
                          onChange={(v) =>
                            setItemStates((s) => ({
                              ...s,
                              [ing.name]: {
                                ...s[ing.name],
                                count: v,
                                unit:
                                  s[ing.name]?.unit ||
                                  ing.standard_unit.trim(),
                              },
                            }))
                          }
                        />
                        <select
                          value={
                            itemStates[ing.name]?.unit ||
                            ing.standard_unit.trim()
                          }
                          onChange={(e) =>
                            setItemStates((s) => ({
                              ...s,
                              [ing.name]: {
                                ...s[ing.name],
                                unit: e.target.value,
                              },
                            }))
                          }
                          className="border rounded px-2 py-1 text-sm"
                        >
                          {ing.units.map((u) => {
                            const val = u.unit.trim();
                            return (
                              <option key={val} value={val}>
                                {val}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    ) : (
                      <input
                        type="checkbox"
                        checked={itemStates[ing.name]?.checked || false}
                        onChange={(e) =>
                          setItemStates((s) => ({
                            ...s,
                            [ing.name]: { checked: e.target.checked },
                          }))
                        }
                        className="w-5 h-5 accent-[#FF7043]"
                      />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {page === "select" && (
            <>
              <div className="flex flex-col items-center gap-1">
                <Button
                  disabled={!canCook}
                  onClick={handleSubmit}
                  className={`rounded-full px-10 py-2 font-bold transition
                    ${canCook ? "bg-gradient-to-r from-[#FF8855] to-[#FF7043] text-white hover:scale-105" : "bg-gray-300 text-white cursor-not-allowed"}`}
                >
                  料理を開始する
                </Button>
                <span className="text-xs text-gray-500">
                  タップするとLINEに戻ります
                </span>
              </div>

              <CookingTimePicker cookingTime={cookingTime} setCookingTime={setCookingTime} />

              <div className="bg-white rounded-3xl p-6 shadow-md max-h-[60vh] overflow-y-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-center border-b">
                      <th className="w-10"></th>
                      <th></th>
                      <th className="pr-4">在庫</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((it) => (
                      <InventoryRow
                        key={it.name}
                        name={it.name}
                        stock={`${it.amount}${it.unit ? ` ${it.unit}` : ""}`}
                        checked={!!useMap[it.name]}
                        onToggle={(n, c) => setUseMap({ ...useMap, [n]: c })}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
      <ToastMessage text={toast} show={!!toast} />
      <BackToTopButton />
    </div>
  );
}
