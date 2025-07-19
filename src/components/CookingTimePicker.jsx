import React from "react";

export default function CookingTimePicker({ cookingTime, setCookingTime }) {
  const times = Array.from({ length: 12 }, (_, i) => (i + 1) * 5); // 5‑minute increments from 5 to 60

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium">⏰ 料理時間</label>
      <select
        size={4}                       
        value={cookingTime}
        onChange={(e) => setCookingTime(Number(e.target.value))}
        className="w-full h-24 border rounded-lg p-2 overflow-y-scroll
                   focus:outline-none focus:ring-2 focus:ring-[#FF8855]"
      >
        {times.map((t) => (
          <option key={t} value={t}>
            {t} 分
          </option>
        ))}
      </select>
    </div>
  );
}
