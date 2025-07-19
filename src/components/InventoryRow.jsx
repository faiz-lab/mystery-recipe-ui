export default function InventoryRow({
  name,
  stock,
  unit,
  checked,
  onToggle,
}) {
  return (
    <tr className="border-b last:border-none">
      <td className="py-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onToggle(name, e.target.checked)}
          className="w-5 h-5 accent-[#FF8855]"
        />
      </td>
      <td className="py-2 flex-1 text-left">{name}</td>
      <td className="py-2 text-left pl-4">
        {stock} {unit}
      </td>
    </tr>
  );
}
