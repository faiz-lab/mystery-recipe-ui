import React from "react";
import InventoryRow from "@/components/InventoryRow";
import CookingTimePicker from "@/components/CookingTimePicker";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { patchInventory } from "@/services/api"; // ✅ 导入 API
import { Toaster } from "@/components/ui/sonner";

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
  userId,
  fetchInventory, // ✅ 父组件传入刷新库存的方法
}) {
  const handleDelete = async (name) => {
    try {
      // ✅ 调用删除 API
      await patchInventory(userId, [], [name]);

      // ✅ 刷新库存
      await fetchInventory();

      // ✅ 取消勾选
      const updatedUseMap = { ...useMap };
      delete updatedUseMap[name];
      setUseMap(updatedUseMap);

      // ✅ toast 提示
      toast.success("削除しました", {
        description: `${name} を在庫から削除しました`,
        icon: "🗑️",
        duration: 2500,
        position: "top-center",
      });
    } catch (error) {
      console.error("削除エラー:", error);
      toast.error("削除に失敗しました", {
        description: "もう一度お試しください",
      });
    }
  };

  return (
    <>
      {" "}
      <div className="space-y-6">
        {/* ✅ 开始按钮 */}
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
          <span className="text-xs text-gray-500">
            タップするとLINEに戻ります
          </span>
        </div>

        {/* ✅ 料理时间选择 */}
        <CookingTimePicker
          cookingTime={cookingTime}
          setCookingTime={setCookingTime}
        />

        {/* ✅ 标题 + 说明按钮 */}
        <div className="flex items-center gap-2">
          <label className="font-medium text-gray-700 text-base">
            👨‍🍳 料理に使う食材の選択
          </label>
          <button
            onClick={() => setIsInfoVisible((v) => !v)}
            className="w-5 h-5 flex items-center justify-center text-xs font-semibold text-gray-600 border border-gray-400 rounded-full hover:bg-gray-100"
            aria-label="情報"
          >
            i
          </button>
        </div>

        {/* ✅ 提示信息 */}
        {isInfoVisible && (
          <p className="text-sm text-gray-600 mt-1 ml-1 leading-relaxed">
            ✅ 必ず使用したい食材にチェックを入れてね！
            <br />
            チェックしなかった食材は、使われる場合もあれば使われない場合もあるよ。
            <br />
            例: A・B・C のうち A だけチェック →
            レシピは「A」「A・B」「A・C」「A・B・C」など。
            <br />
            レシピが見つかりやすくなるために、10種類以上の登録がおすすめ！
          </p>
        )}

        {/* ✅ 食材列表 */}
        <div className="bg-white rounded-3xl p-4 shadow-md max-h-[60vh] overflow-y-auto space-y-2">
          {inventory.map((it) => (
            <InventoryRow
              key={it.name}
              name={it.name}
              stock={it.quantity}
              unit={it.unit}
              checked={!!useMap[it.name]}
              onDelete={() => handleDelete(it.name)} // ✅ 删除
              onToggle={(n, c) => setUseMap({ ...useMap, [n]: c })}
            />
          ))}
        </div>
      </div>
      <Toaster />
    </>
  );
}
