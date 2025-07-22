export default function InventoryItemRow({
                                           name,
                                           quantity,
                                           unit,
                                           unitOptions,
                                           onQuantityChange,
                                           onUnitChange
                                         }) {
  return (
      <div className="flex items-center justify-between border-b pb-2 w-full">
        <span className="flex-1 truncate">{name}</span>
        <div className="flex gap-2 justify-end items-center min-w-[200px]">
          <button
              onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
              className="w-9 h-9 border rounded text-gray-600 hover:bg-gray-100"
          >
            -
          </button>
          <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => onQuantityChange(Number(e.target.value) || 0)}
              className="w-14 h-9 text-center border rounded"
          />
          <button
              onClick={() => onQuantityChange(quantity + 1)}
              className="w-9 h-9 border rounded text-gray-600 hover:bg-gray-100"
          >
            +
          </button>
          <select
              value={unit}
              onChange={(e) => onUnitChange(e.target.value)}
              className="w-16 h-9 border rounded text-center text-sm"
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
