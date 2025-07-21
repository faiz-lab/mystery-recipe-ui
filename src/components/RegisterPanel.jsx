import React from "react";
import SearchBar from "@/components/SearchBar";
import BackToTopButton from "@/components/BackToTopButton";
import InventoryItemRow from "@/components/InventoryItemRow";

export default function RegisterPanel({
  categories,
  activeTab,
  setActiveTab,
  scrollableRef,
  onSearchResult,
  userId,
  inventoryMap, // ✅ { 食材名: { quantity, unit } }
  patchInventory
}) {
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
              initialQuantity={0}
              initialUnit={ing.standard_unit}
              unitOptions={ing.units.map((u) => u.unit)}
              userId={userId}
              onPatch={patchInventory}
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
