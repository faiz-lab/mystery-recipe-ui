import React from "react";

export default function InventoryItemRow({
    name,
    quantity,
    unit,
    unitOptions,
    onQuantityChange,
    onUnitChange,
    highlightKeyword
}) {
    const getHighlightedName = () => {
        if (!highlightKeyword || !highlightKeyword.trim()) return name;
        const regex = new RegExp(`(${highlightKeyword})`, "gi");
        return name.replace(regex, `<mark class="bg-yellow-200">$1</mark>`);
    };

    return (
        <div className="relative flex items-center justify-between border-b pb-3 w-full px-1">
            {/* ✅ 食材名（保持布局，增加高亮） */}
            <span
                className="flex-1 truncate text-lg font-medium"
                dangerouslySetInnerHTML={{ __html: getHighlightedName() }}
            />

            {/* ✅ 数量控制 + 单位选择 */}
            <div className="flex justify-end items-center min-w-[150px] sm:min-w-[200px]">
                <button
                    onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
                    className="w-8 h-8 border rounded text-gray-600 hover:bg-gray-100 text-lg"
                >
                    -
                </button>

                <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => onQuantityChange(Number(e.target.value) || 0)}
                    className="w-12 h-8 text-center border rounded text-sm"
                />

                <button
                    onClick={() => onQuantityChange(quantity + 1)}
                    className="w-8 h-8 border rounded text-gray-600 hover:bg-gray-100 text-lg"
                >
                    +
                </button>

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
        </div>
    );
}
