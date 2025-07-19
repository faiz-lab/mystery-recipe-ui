// src/hooks/useInventory.js
import { useState, useCallback } from "react";
import {
  getInventory,
  updateInventory,
  requestRecipeRecommendation,
} from "@/services/api";

export default function useInventory(lineId) {
  const [inventory, setInventory] = useState([]);

  /**
   * ✅ 获取库存并更新状态
   */
  const fetchInventory = useCallback(async () => {
    if (!lineId) return;
    try {
      const { data } = await getInventory(lineId);
      // 过滤掉数量为 0 的项
      setInventory(data.filter((item) => item.quantity > 0));
    } catch (error) {
      console.error("在庫取得エラー:", error);
      throw error;
    }
  }, [lineId]);

  /**
   * ✅ 注册库存（更新库存）
   * @param {Array} items - 要注册的食材 [{ name, quantity, unit }]
   */
  const registerInventory = useCallback(
    async (items) => {
      if (!lineId) throw new Error("LINE ID 不存在");
      try {
        await updateInventory(lineId, items);
      } catch (error) {
        console.error("在庫更新エラー:", error);
        throw error;
      }
    },
    [lineId]
  );

  /**
   * ✅ 提交料理推荐请求
   * @param {Object} payload - { time, required_ingredients, available_ingredients }
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
    registerInventory,
    sendRecommendation,
  };
}
