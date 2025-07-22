import React from "react";

export default function SearchBar({ keyword, onKeywordChange }) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        placeholder="食材を検索..."
        className="flex-1 border rounded px-3 py-2 w-full"
      />
    </div>
  );
}
