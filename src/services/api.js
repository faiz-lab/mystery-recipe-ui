// src/services/api.js
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
/**
 * ✅ 搜索建议
 */
export const postSuggest = (data) =>
  axios.post("/api/suggest", data);

/**
 * ✅ 获取用户库存
 * @param {string} lineId - LINE 用户 ID
 */
export const getInventory = (lineId) =>
  axios.get(`/users/${encodeURIComponent(lineId)}/inventory`);

/**
 * ✅ 更新用户库存
 * @param {string} lineId - LINE 用户 ID
 * @param {Array} items - 食材数组 [{ name, quantity, unit }]
 */
export const updateInventory = (lineId, items) =>
  axios.post(`/users/${encodeURIComponent(lineId)}/inventory`, { items });

/**
 * ✅ 提交食材选择（生成料理推荐）
 * @param {Object} payload - { time, required_ingredients, available_ingredients }
 */
export const requestRecipeRecommendation = (payload) =>
  axios.post("/recipes/recommendations", payload);
