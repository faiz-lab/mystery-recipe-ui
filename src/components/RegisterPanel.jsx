import React, { useEffect, useState, useRef } from "react";
import SearchBar from "@/components/SearchBar";
import InventoryItemRow from "@/components/InventoryItemRow";
import { fetchIngredients, patchInventory } from "@/services/api";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export default function RegisterPanel({ userId }) {
  const [inventoryMap, setInventoryMap] = useState({});
  const [rowStatus, setRowStatus] = useState({});
  const [activeTab, setActiveTab] = useState("");
  const [allCategories, setAllCategories] = useState({});
  const [filteredCategories, setFilteredCategories] = useState({});
  const [keyword, setKeyword] = useState("");

  // ✅ 存储防抖定时器
  const debounceTimers = useRef({});

  // ✅ 初次加载所有食材
  useEffect(() => {
    fetchIngredients({ group_by: "category" }).then((res) => {
      setAllCategories(res.data.data);
      setFilteredCategories(res.data.data);
      setActiveTab(Object.keys(res.data.data)[0]);
    });
  }, []);

  // ✅ 搜索逻辑（保持之前的防抖）
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!keyword.trim()) {
        setFilteredCategories(allCategories);
        setActiveTab(Object.keys(allCategories)[0] || "");
        return;
      }
      fetchIngredients({ search: keyword }).then((res) => {
        const grouped = {};
        res.data.results.forEach((item) => {
          if (!grouped[item.category]) grouped[item.category] = [];
          if (!grouped[item.category].some((i) => i.name === item.name)) {
            grouped[item.category].push(item);
          }
        });
        setFilteredCategories(grouped);
        setActiveTab(Object.keys(grouped)[0] || "");
      });
    }, 400);

    return () => clearTimeout(handler);
  }, [keyword, allCategories]);

  // ✅ 防抖更新库存 + toast 提示
  const schedulePatchUpdate = (name, updateItem, removeItem) => {
    if (debounceTimers.current[name]) {
      clearTimeout(debounceTimers.current[name]);
    }
    debounceTimers.current[name] = setTimeout(() => {
      setRowStatus((prev) => ({ ...prev, [name]: "saving" }));
      patchInventory(userId, updateItem, removeItem)
        .then(() => {
          setRowStatus((prev) => ({ ...prev, [name]: "saved" }));
          toast.success("保存成功", {
            description: `${name} を ${inventoryMap[name]?.quantity || 0}${
              inventoryMap[name]?.unit || ""
            } に更新しました`,
            icon: "✅",
            duration: 2000,
            position: "top-center",
          });

          setTimeout(() => {
            setRowStatus((prev) => ({ ...prev, [name]: "" }));
          }, 1500);
        })
        .catch(() => {
          setRowStatus((prev) => ({ ...prev, [name]: "error" }));
          toast.error(`❌ ${name} の保存に失敗しました`);
        });
    }, 800); // 防抖时间：800ms
  };

  // ✅ 数量变更
  const handleQuantityChange = (name, newQuantity, defaultUnit) => {
    const currentUnit = inventoryMap[name]?.unit || defaultUnit || "g";
    console.log(
      `Updating ${name}: quantity=${newQuantity}, unit=${currentUnit}`
    );

    setInventoryMap((prev) => ({
      ...prev,
      [name]: { quantity: newQuantity, unit: currentUnit },
    }));

    const updateItem =
      newQuantity > 0
        ? [{ name, quantity: newQuantity, unit: currentUnit }]
        : [];
    const removeItem = newQuantity === 0 ? [name] : [];

    schedulePatchUpdate(name, updateItem, removeItem);
  };

  // ✅ 单位变更
  const handleUnitChange = (name, newUnit) => {
    const currentQuantity = inventoryMap[name]?.quantity || 0;
    setInventoryMap((prev) => ({
      ...prev,
      [name]: { quantity: currentQuantity, unit: newUnit },
    }));

    const updateItem = [{ name, quantity: currentQuantity, unit: newUnit }];

    schedulePatchUpdate(name, updateItem, []);
  };

  return (
    <>
      <SearchBar keyword={keyword} onKeywordChange={setKeyword} />

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Object.keys(filteredCategories).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`whitespace-nowrap rounded-full px-4 py-1 text-sm ${
              activeTab === cat
                ? "bg-[#FF7043] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 食材表单 */}
      <div className="bg-white rounded-3xl p-6 shadow-md space-y-2 max-h-[60vh] overflow-y-auto">
        {Object.keys(filteredCategories).length === 0 ? (
          <p className="text-center text-gray-400">
            該当する食材が見つかりません
          </p>
        ) : (
          filteredCategories[activeTab]?.map((ing) => (
            <InventoryItemRow
              key={ing.name}
              name={ing.name}
              highlightKeyword={keyword}
              quantity={inventoryMap[ing.name]?.quantity || 0}
              unit={inventoryMap[ing.name]?.unit || ing.standard_unit}
              unitOptions={ing.units.map((u) => u.unit)}
              status={rowStatus[ing.name] || ""}
              onQuantityChange={(val) =>
                handleQuantityChange(ing.name, val, ing.standard_unit)
              }
              onUnitChange={(val) => handleUnitChange(ing.name, val)}
            />
          ))
        )}
      </div>
      <Toaster/>
    </>
  );
}
