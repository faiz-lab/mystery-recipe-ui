import { useState, useCallback } from "react";
import {
  getInventory,
  patchInventory,
  requestRecipeRecommendation,
} from "@/services/api";

export default function useInventory(userId) {
  const [inventory, setInventory] = useState([]);

  /**
   * ✅ 获取库存并更新状态
   */
  const fetchInventory = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await getInventory(userId);
      setInventory(data.inventory || []); // ✅ 后端返回 inventory 字段
    } catch (error) {
      console.error("在庫取得エラー:", error);
      throw error;
    }
  }, [userId]);

  /**
   * ✅ 提交料理推荐请求
   */
  const sendRecommendation = useCallback(async (payload) => {
    try {
      await requestRecipeRecommendation(payload);
    } catch (error) {
      console.error("レシピ推薦エラー:", error);
      throw error;
    }
  }, []);

  return {
    inventory,
    setInventory,
    fetchInventory,
    patchInventory, // ✅ 暴露 PATCH
    sendRecommendation,
  };
}
