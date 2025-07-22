import React from "react";
import { Trash2 } from "lucide-react"; // 如果使用 lucide-react 图标库

export default function InventoryRow({ name, stock, unit, checked, onToggle, onDelete }) {
  return (
    <div className="flex items-center justify-between py-3 px-2 border-b last:border-none hover:bg-orange-50 transition rounded-lg">
      {/* 左：复选框 + 食材名 */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onToggle(name, e.target.checked)}
          className="w-5 h-5 accent-[#FF7043]"
        />
        <span className="text-gray-800 font-medium">{name}</span>
      </label>

      {/* 右：库存 + 删除按钮 */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-gray-700 font-semibold">
          {stock}
          <span className="ml-1 text-gray-500">{unit}</span>
        </div>
        <button
          onClick={() => onDelete(name)}
          className="p-2 rounded-full hover:bg-red-100 text-red-500 transition"
          title="削除"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
