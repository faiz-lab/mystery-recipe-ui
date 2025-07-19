import React from "react";
import { X } from "lucide-react"; // 閉じるボタン用のアイコン

export default function ToastMessage({ show, text, onClose }) {
  return (
    <div
      className={
        "fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 " +
        "text-white text-sm rounded-lg px-4 py-2 shadow transition-opacity duration-300 " +
        "break-words w-[250px] " +
        (show ? "opacity-100" : "opacity-0 pointer-events-none")
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div className="whitespace-pre-wrap">{text}</div>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
