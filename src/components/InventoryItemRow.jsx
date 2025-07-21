import React, { useState, useRef } from "react";
import useDebouncedEffect from "@/hooks/useDebouncedEffect";

export default function InventoryItemRow({
  name,
  initialQuantity,
  initialUnit,
  unitOptions,
  userId,
  onPatch
}) {
  const [quantity, setQuantity] = useState(initialQuantity || 0);
  const [unit, setUnit] = useState(initialUnit || unitOptions[0]);
  const [status, setStatus] = useState(""); // "saving" | "saved" | "error"

  const isFirstRun = useRef(true);

  // ✅ 防抖 PATCH，跳过初次挂载
  useDebouncedEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return; // ✅ 初次渲染不触发 PATCH
    }

    if (!userId || typeof onPatch !== "function") return;

    console.log(`🔍 Trigger PATCH for ${name}: quantity=${quantity}, unit=${unit}`);
    setStatus("saving");

    const action =
      quantity > 0
        ? onPatch(userId, [{ name, quantity, unit }], [])
        : onPatch(userId, [], [{ name }]); // 数量归零 → 删除

    action
      .then(() => setStatus("saved"))
      .catch(() => setStatus("error"));
  }, [quantity, unit], 800);

  return (
    <div className="flex items-center justify-between border-b pb-2 w-full">
      {/* ✅ 食材名 */}
      <span className="flex-1 truncate">{name}</span>

      {/* ✅ 数量控制 + 单位选择 */}
      <div className="flex gap-2 justify-end items-center min-w-[200px]">
        {/* 减号按钮 */}
        <button
          onClick={() => setQuantity((q) => Math.max(0, q - 1))}
          className="w-9 h-9 border rounded text-gray-600 hover:bg-gray-100"
        >
          -
        </button>

        {/* 输入框 */}
        <input
          type="number"
          min="0"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value) || 0)}
          className="w-14 h-9 text-center border rounded"
        />

        {/* 加号按钮 */}
        <button
          onClick={() => setQuantity((q) => q + 1)}
          className="w-9 h-9 border rounded text-gray-600 hover:bg-gray-100"
        >
          +
        </button>

        {/* 单位选择 */}
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="w-16 h-9 border rounded text-center text-sm"
        >
          {unitOptions.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ 状态提示 */}
      <div className="w-14 text-xs text-center">
        {status === "saving" && <span className="text-gray-400">保存中...</span>}
        {status === "saved" && <span className="text-green-500">✓ 保存</span>}
        {status === "error" && <span className="text-red-500">エラー</span>}
      </div>
    </div>
  );
}
