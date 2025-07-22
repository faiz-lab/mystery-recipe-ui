import React from "react";

function InventoryItemRow({
                                             name,
                                             quantity,
                                             unit,
                                             unitOptions,
                                             onQuantityChange,
                                             onUnitChange,
                                             status // "saving" | "saved" | "error"
                                         }) {
    return (
        <div className="relative flex items-center justify-between border-b pb-3 w-full px-1">
            {/* ✅ 食材名（留出右边空间，避免被状态提示挡住） */}
            <span className="flex-1 truncate text-lg font-medium">{name}</span>

            {/* ✅ 数量控制 + 单位选择（响应式布局） */}
            <div className="flex justify-end items-center min-w-[150px] sm:min-w-[200px]">
                {/* 减号按钮 */}
                <button
                    onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
                    className="w-8 h-8 border rounded text-gray-600 hover:bg-gray-100 text-lg"
                >
                    -
                </button>

                {/* 输入框 */}
                <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => onQuantityChange(Number(e.target.value) || 0)}
                    className="w-12 h-8 text-center border rounded text-sm"
                />

                {/* 加号按钮 */}
                <button
                    onClick={() => onQuantityChange(quantity + 1)}
                    className="w-8 h-8 border rounded text-gray-600 hover:bg-gray-100 text-lg"
                >
                    +
                </button>

                {/* 单位选择 */}
                <select
                    value={unit}
                    onChange={(e) => onUnitChange(e.target.value)}
                    className="w-12 h-8 border rounded text-center text-sm"
                >
                    {unitOptions.map((u) => (
                        <option key={u} value={u}>
                            {u}
                        </option>
                    ))}
                </select>
            </div>

            {/* ✅ 浮动状态提示 */}
            {status === "saving" && (
                <span className="absolute right-2 top-1 text-gray-400 text-xs">保存中...</span>
            )}
            {status === "saved" && (
                <span className="absolute right-2 top-1 text-green-500 text-xs">✓ 保存</span>
            )}
            {status === "error" && (
                <span className="absolute right-2 top-1 text-red-500 text-xs">エラー</span>
            )}
        </div>
    );
}

export default React.memo(InventoryItemRow);