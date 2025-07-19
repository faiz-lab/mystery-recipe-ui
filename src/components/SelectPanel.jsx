import React from "react";
import InventoryRow from "@/components/InventoryRow";
import CookingTimePicker from "@/components/CookingTimePicker";
import { Button } from "@/components/ui/button";

export default function SelectPanel({
  inventory,
  useMap,
  setUseMap,
  cookingTime,
  setCookingTime,
  isInfoVisible,
  setIsInfoVisible,
  canCook,
  onSubmit,
}) {
  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <Button
          disabled={!canCook}
          onClick={onSubmit}
          className={`rounded-full px-10 py-2 font-bold transition ${
            canCook
              ? "bg-gradient-to-r from-[#FF8855] to-[#FF7043] text-white hover:scale-105"
              : "bg-gray-300 text-white cursor-not-allowed"
          }`}
        >
          料理を開始する
        </Button>
        <span className="text-xs text-gray-500">タップするとLINEに戻ります</span>
      </div>
      <CookingTimePicker cookingTime={cookingTime} setCookingTime={setCookingTime} />
      <div className="flex items-center gap-2">
        <label className="font-medium">👨‍🍳料理に使う食材の選択</label>
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
          必ず使用したい食材にチェックを入れてね！<br />
          チェックしなかった食材は、使われる場合もあれば使われない場合もあるよ。
          たとえば、食材A・B・CのうちAのみにチェックを入れた場合、レシピは「A」「A・B」「A・C」「A・B・C」のいずれかの組み合わせでランダムに検索さるよ。<br />
          それから、レシピが見つかりやすくなるように、目安としては10種類以上の食材を登録しておくのがおすすめだよ！
        </p>
      )}
      <div className="bg-white rounded-3xl p-6 shadow-md max-h-[60vh] overflow-y-auto">
        <table className="w-full">
          <tbody>
            {inventory.map((it) => (
              <InventoryRow
                key={it.name}
                name={it.name}
                stock={`${it.amount}${it.unit ? ` ${it.unit}` : ""}`}
                checked={!!useMap[it.name]}
                onToggle={(n, c) => setUseMap({ ...useMap, [n]: c })}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
