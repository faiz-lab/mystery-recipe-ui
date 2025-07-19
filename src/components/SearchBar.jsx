import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";

const ALL_CATEGORIES = [
  "野菜",
  "肉",
  "魚介類",
  "卵・乳製品",
  "果物",
  "穀類・豆類",
  "加工食品",
  "ナッツ・種子類",
  "調味料・香辛料",
  "嗜好品・その他"
];

export default function SearchBar({ onResult }) {
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(["野菜"]);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    const kw = keyword.trim();

    const hit = window.INGREDIENTS.find((ing) => ing.name.includes(kw));
    if (hit) {
      setSuggestions([]);
      onResult({ type: "match", name: hit.name });
      return;
    }

    setSearching(true);
    try {
      const filteredIngredients = window.INGREDIENTS.filter((i) =>
        selectedCategories.includes(i.category)
      );

      const response = await axios.post("/api/suggest", {
        keyword: kw,
        filteredIngredients,
      });

      const content = response.data.suggestions;
      const names = content
        .split(/[\n,、・\-]/)
        .map((n) => n.replace(/^[0-9.\s\-]+/, "").trim())
        .filter((n) => window.ING_MAP[n]);

      const fallback = filteredIngredients.slice(0, 10).map((i) => i.name);
      const result = [...new Set(names)];
      while (result.length < 3) {
        const next = fallback.find((x) => !result.includes(x));
        if (!next) break;
        result.push(next);
      }

      setSuggestions(result.slice(0, 3));
    } catch {
      setSuggestions(["エラーが発生しました"]);
    } finally {
      setSearching(false);
    }
  };

  const handleClose = () => setSuggestions([]);

  return (
    <div className="space-y-3">
      {/* チェックボックスと検索フォームをまとめて表示 */}
      <div className="p-4 bg-white border rounded-xl shadow-inner space-y-3">
        <div className="flex items-center gap-2">
  <label className="font-medium">検索フィルター</label>
  <button
    onClick={() => setIsInfoVisible((v) => !v)}
    className="w-5 h-5 flex items-center justify-center text-xs font-semibold text-gray-600 border border-gray-400 rounded-full hover:bg-gray-100"
    aria-label="情報"
  >
    i
  </button>
</div>

{isInfoVisible && (
  <p className="text-sm text-gray-600 mt-1 ml-1">
    選択したカテゴリーの中から、検索ワードに当てはまる食材を検索するよ！<br/>※選択項目は半分以下にしてね！多いとエラーが出ちゃうよ
  </p>
)}
        {/* カテゴリチェックボックス */}
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {ALL_CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="accent-[#FF7043] w-4 h-4"
              />
              {cat}
            </label>
          ))}
        </div>

        {/* 検索フォーム */}
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="食材を検索..."
            className="flex-1 border rounded px-3 py-2"
          />
          <Button type="submit">検索</Button>
        </form>
      </div>

      {/* 検索中表示 */}
      {searching && (
        <div className="text-sm text-center text-gray-600">🔍 検索中...</div>
      )}

      {/* 検索結果 */}
      {!searching && suggestions.length > 0 && suggestions[0] !== "エラーが発生しました" && (
        <div className="relative bg-white border rounded-xl shadow-md p-4 space-y-2 text-center">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-sm"
          >
            ×
          </button>
          <p className="text-sm text-gray-700">
            一致する項目が見当たりませんでした。<br />
            もしかして、以下の食材をお探しですか？
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((sug) => (
              <button
                key={sug}
                onClick={() => {
                  onResult({ type: "suggest", name: sug });
                  setSuggestions([]);
                }}
                className="bg-orange-100 hover:bg-orange-200 px-3 py-1 rounded-full text-sm"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {!searching && suggestions[0] === "エラーが発生しました" && (
        <div className="relative text-center text-sm text-red-500 mt-2 bg-white border rounded-xl shadow-md px-4 py-3">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-sm"
          >
            ×
          </button>
          選択項目が多いみたい！<br/>減らしてからやり直してみてね
        </div>
      )}
    </div>
  );
}
