import React from "react";
export default function TopPageTabs({ active, setActive }) {
  const base =
    "flex-1 text-center py-3 font-semibold transition border-b";
  const activeClass = "border-[#FF8855] border-b-4";
  const inactiveClass = "border-gray-300 hover:bg-gray-50";

  return (
    <div className="flex mb-6">
      <button
        className={`${base} ${active === "register" ? activeClass : inactiveClass}`}
        onClick={() => setActive("register")}
      >
        食材の登録
      </button>
      <button
        className={`${base} ${active === "select" ? activeClass : inactiveClass}`}
        onClick={() => setActive("select")}
      >
        食材の選択
      </button>
    </div>
  );
}