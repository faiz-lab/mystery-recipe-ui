import React, { useEffect, useState } from "react";
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
    const [inventoryMap, setInventoryMap] = useState({}); // { "水": { quantity: 507, unit: "ml" }, ... }
    const [rowStatus, setRowStatus] = useState({}); // { "水": "saving", "酒": "saved" }

    // ✅ 加载用户库存
    useEffect(() => {
        if (!userId) return;
        const fetchInventory = async () => {
            try {
                const res = await getInventory(userId);
                const map = {};
                if (res.data.inventory) {
                    res.data.inventory.forEach((item) => {
                        map[item.name] = { quantity: item.quantity, unit: item.unit };
                    });
                }
                setInventoryMap(map);
            } catch (error) {
                console.error("在庫取得エラー:", error);
            }
        };
        fetchInventory();
    }, [userId]);

    const handleQuantityChange = (name, newQuantity, defaultUnit) => {
        const currentUnit = inventoryMap[name]?.unit || defaultUnit;
        // 更新 state
        setInventoryMap((prev) => ({
            ...prev,
            [name]: { quantity: newQuantity, unit: currentUnit }
        }));

        let updateItem = [];
        let removeItem = [];

        if (newQuantity > 0) {
            updateItem = [{ name, quantity: newQuantity, unit: currentUnit }];
        } else {
            removeItem = [name]; // ✅ 当数量=0，放到 remove 数组
        }

        console.log("📤 PATCH Payload:", { update: updateItem, remove: removeItem });

        setRowStatus((prev) => ({ ...prev, [name]: "saving" }));

        patchInventory(userId, updateItem, removeItem)
            .then(() => {
                setRowStatus((prev) => ({ ...prev, [name]: "saved" }));
                setTimeout(() => {
                    setRowStatus((prev) => ({ ...prev, [name]: "" }));
                }, 2000);
            })
            .catch(() => {
                setRowStatus((prev) => ({ ...prev, [name]: "error" }));
            });
    };

    const handleUnitChange = (name, newUnit) => {
        const currentQuantity = inventoryMap[name]?.quantity || 0;

        setInventoryMap((prev) => ({
            ...prev,
            [name]: { quantity: currentQuantity, unit: newUnit }
        }));

        const updateItem = [{ name, quantity: currentQuantity, unit: newUnit }];

        setRowStatus((prev) => ({ ...prev, [name]: "saving" }));

        patchInventory(userId, updateItem, [])
            .then(() => {
                setRowStatus((prev) => ({ ...prev, [name]: "saved" }));
                setTimeout(() => {
                    setRowStatus((prev) => ({ ...prev, [name]: "" }));
                }, 2000);
            })
            .catch(() => {
                setRowStatus((prev) => ({ ...prev, [name]: "error" }));
            });
    };


    // ✅ 防抖 PATCH (全量提交，但显示逐行状态)
    useDebouncedEffect(() => {
        if (!userId) return;

        const payload = Object.entries(inventoryMap)
            .filter(([_, val]) => val.quantity > 0)
            .map(([name, val]) => ({
                name,
                quantity: val.quantity,
                unit: val.unit
            }));

        if (payload.length === 0) return;

        patchInventory(userId, payload)
            .then(() => {
                // ✅ 所有食材状态更新为 saved
                payload.forEach((item) => {
                    setRowStatus((prev) => ({ ...prev, [item.name]: "saved" }));
                });
                // ✅ 2秒后隐藏
                setTimeout(() => {
                    payload.forEach((item) => {
                        setRowStatus((prev) => ({ ...prev, [item.name]: "" }));
                    });
                }, 2000);
            })
            .catch(() => {
                payload.forEach((item) => {
                    setRowStatus((prev) => ({ ...prev, [item.name]: "error" }));
                });
            });
    }, [inventoryMap], 800);

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
                            status={rowStatus[ing.name] || ""}
                            onQuantityChange={(val) => handleQuantityChange(ing.name, val, ing.standard_unit)}
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
        </>
    );
}
