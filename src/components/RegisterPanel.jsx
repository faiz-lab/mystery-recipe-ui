import React from "react";
import SearchBar from "@/components/SearchBar";
import QuantityInput from "@/components/QuantityInput";
import BackToTopButton from "@/components/BackToTopButton";
import { Button } from "@/components/ui/button";

export default function RegisterPanel({
  categories,
  activeTab,
  setActiveTab,
  itemStates,
  setItemStates,
  resetKey,
  refs,
  scrollableRef,
  onSearchResult,
  onSubmit,
  canRegister,
}) {
  return (
    <>
      <div className="text-center">
        <Button
          disabled={!canRegister}
          onClick={onSubmit}
          className={`rounded-full px-8 py-2 font-bold mb-2 transition ${
            canRegister
              ? "bg-gradient-to-r from-[#FF8855] to-[#FF7043] text-white hover:scale-105"
              : "bg-gray-300 text-white cursor-not-allowed"
          }`}
        >
          保存する
        </Button>
      </div>

      <SearchBar onResult={onSearchResult} />

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

      <div
        className="bg-white rounded-3xl p-6 shadow-md space-y-4 max-h-[60vh] overflow-y-auto relative"
        ref={scrollableRef}
      >
        {(categories[activeTab] || []).map((ing) => (
          <div
            key={`${ing.name}-${resetKey}`}
            ref={(el) => (refs.current[ing.name] = el)}
            className="flex items-center justify-between border-b last:border-none pb-2 gap-4"
          >
            <span className="flex-1">{ing.name}</span>
            {ing.units?.length ? (
              <div className="flex items-center gap-4">
                <QuantityInput
                  value={itemStates[ing.name]?.count || 0}
                  onChange={(v) =>
                    setItemStates((s) => ({
                      ...s,
                      [ing.name]: {
                        ...s[ing.name],
                        count: v,
                        unit: s[ing.name]?.unit || ing.standard_unit.trim(),
                      },
                    }))
                  }
                />
                <select
                  value={itemStates[ing.name]?.unit || ing.standard_unit.trim()}
                  onChange={(e) =>
                    setItemStates((s) => ({
                      ...s,
                      [ing.name]: {
                        ...s[ing.name],
                        unit: e.target.value,
                      },
                    }))
                  }
                  className="border rounded px-2 py-1 text-sm h-9 w-15"
                >
                  {ing.units.map((u) => (
                    <option key={u.unit} value={u.unit.trim()}>
                      {u.unit.trim()}
                    </option>
                  ))}
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
        <BackToTopButton targetRef={scrollableRef} />
      </div>
    </>
  );
}
