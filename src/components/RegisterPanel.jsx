import React, { useEffect, useState, useRef } from "react";
import SearchBar from "@/components/SearchBar";
import BackToTopButton from "@/components/BackToTopButton";
import InventoryItemRow from "@/components/InventoryItemRow";
import useDebouncedEffect from "@/hooks/useDebouncedEffect";
import { getInventory, patchInventory } from "@/services/api";

export default function RegisterPanel({
                                          categories,
                                          activeTab,
                                          setActiveTab,
                                          scrollableRef,
                                          onSearchResult,
                                          userId
                                      }) {
    const [inventoryMap, setInventoryMap] = useState({}); // { "玉ねぎ": { quantity: 2, unit: "個" }, ... }
    const [status, setStatus] = useState(""); // "saving" | "saved" | "error"
    const pendingUpdate = useRef(false);

    // ✅ 加载用户库存
    useEffect(() => {
        if (!userId) return;
        const fetchInventory = async () => {
            try {
                const res = await getInventory(userId);
                const map = {};
                res.data.inventory.forEach((item) => {
                    map[item.name] = { quantity: item.quantity, unit: item.unit };
                });
                setInventoryMap(map);
            } catch (error) {
                console.error("在庫取得エラー:", error);
            }
        };
        fetchInventory();
    }, [userId]);

    // ✅ 更新 quantity
    const handleQuantityChange = (name, newQuantity) => {
        setInventoryMap((prev) => ({
            ...prev,
            [name]: { ...prev[name], quantity: newQuantity }
        }));
        pendingUpdate.current = true;
    };

    // ✅ 更新 unit
    const handleUnitChange = (name, newUnit) => {
        setInventoryMap((prev) => ({
            ...prev,
            [name]: { ...prev[name], unit: newUnit }
        }));
        pendingUpdate.current = true;
    };

    // ✅ 防抖 PATCH
    useDebouncedEffect(
        () => {
            if (!pendingUpdate.current) return;
            if (!userId) return;

            const payload = Object.entries(inventoryMap)
                .filter(([_, val]) => val.quantity > 0) // 排除数量为 0 的
                .map(([name, val]) => ({
                    name,
                    quantity: val.quantity,
                    unit: val.unit
                }));

            setStatus("saving");
            patchInventory(userId, payload)
                .then(() => {
                    setStatus("saved");
                    pendingUpdate.current = false;
                })
                .catch(() => setStatus("error"));
        },
        [inventoryMap],
        800 // 0.8秒防抖
    );

    return (
        <>
            {/* ✅ 搜索栏 */}
            <SearchBar onResult={onSearchResult} />

            {/* ✅ 分类 Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {Object.keys(categories).map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`whitespace-nowrap rounded-full px-4 py-1 text-sm transition ${
                            activeTab === cat
                                ? "bg-[#FF7043] text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* ✅ 食材列表 */}
            <div
                className="bg-white rounded-3xl p-6 shadow-md space-y-2 max-h-[60vh] overflow-y-auto relative"
                ref={scrollableRef}
            >
                {categories[activeTab]?.length ? (
                    categories[activeTab].map((ing) => (
                        <InventoryItemRow
                            key={ing.name}
                            name={ing.name}
                            quantity={inventoryMap[ing.name]?.quantity || 0}
                            unit={inventoryMap[ing.name]?.unit || ing.standard_unit}
                            unitOptions={ing.units.map((u) => u.unit)}
                            onQuantityChange={(val) => handleQuantityChange(ing.name, val)}
                            onUnitChange={(val) => handleUnitChange(ing.name, val)}
                        />
                    ))
                ) : (
                    <p className="text-gray-400 text-center py-6">
                        このカテゴリーには食材がありません
                    </p>
                )}
                <BackToTopButton targetRef={scrollableRef} />
            </div>

            {/* ✅ 状态显示 */}
            <div className="text-center mt-2 text-sm">
                {status === "saving" && <span className="text-gray-400">保存中...</span>}
                {status === "saved" && <span className="text-green-500">✓ 保存</span>}
                {status === "error" && <span className="text-red-500">エラー</span>}
            </div>
        </>
    );
}
